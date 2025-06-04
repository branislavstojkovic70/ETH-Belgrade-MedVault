import express, { Application, Request, Response } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import { ethers } from 'ethers';
import { FileInfo } from './file-info';
import axios from 'axios';
import vaultAbi from './vault.json';

//ENV
dotenv.config({ path: "./.env" });

//CONSTANTS
const RPC_URL = process.env.RPC_URL as string;
const PRIVATE_KEY = process.env.PRIVATE_KEY as string;
const CONTRACT_ADDRESS = process.env.CONTRACT_ADDRESS as string;
const PORT = process.env.PORT || 3000;

// APP
const app: Application = express();

// Blockchain setup
const provider = new ethers.JsonRpcProvider(RPC_URL);
const wallet = new ethers.Wallet(PRIVATE_KEY, provider);
const contract = new ethers.Contract(CONTRACT_ADDRESS, vaultAbi, wallet);

app.use(helmet());
app.use(cors({ origin: "*" }));
app.use(express.json());


export async function getVaultContract(): Promise<ethers.Contract> {
	return contract;
}

export async function accessFile(accessToken: string, authToken: string): Promise<FileInfo> {
	const vault = await getVaultContract();
	const rawFileInfo = await vault.accessFile(accessToken, authToken);

	const formattedFileInfo: FileInfo = {
		fileId: rawFileInfo.fileId.toString(),
		name: rawFileInfo.name,
		cid: rawFileInfo.cid,
		key: rawFileInfo.key,
		iv: rawFileInfo.iv,
	};

	return formattedFileInfo;
}


export async function decryptData(
	encrypted: ArrayBuffer | Uint8Array,
	symmetricKeyHex: string,
	ivHex: string
): Promise<ArrayBuffer> {
	const keyBytes = hexToBytes(symmetricKeyHex);
	const iv = hexToBytes(ivHex);
	const cryptoKey = await crypto.subtle.importKey(
		"raw",
		keyBytes,
		{ name: "AES-GCM" },
		false,
		["decrypt"]
	);
	return await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: new Uint8Array(iv) },
		cryptoKey,
		encrypted
	);
}

function hexToBytes(hex: string): Uint8Array {
	if (hex.startsWith("0x")) hex = hex.slice(2);
	const len = hex.length / 2;
	const out = new Uint8Array(len);
	for (let i = 0; i < len; i++) {
		out[i] = parseInt(hex.substr(2 * i, 2), 16);
	}
	return out;
}

export async function fetchAndDecryptFile(
	cid: string,
	symmetricKeyHex: string,
	ivHex: string
): Promise<Buffer> {
    console.log("Uso");
	const url = `https://gateway.pinata.cloud/ipfs/${cid}`;
	const response = await axios.get<ArrayBuffer>(url, {
		responseType: "arraybuffer",
		maxBodyLength: Infinity,
	});
	const encryptedBuffer = response.data;

	const decryptedBuffer = await decryptData(
		encryptedBuffer,
		symmetricKeyHex,
		ivHex
	);

	return Buffer.from(decryptedBuffer);
}


app.get('/health', (req: Request, res: Response) => {
	res.json({ status: 'ok' });
});

app.post('/api/files/access', async (req: Request, res: Response): Promise<void> => {
	const { accessToken, authToken } = req.body;
	if (!accessToken || !authToken) {
		res.status(400).json({ error: 'Missing accessToken or authToken' });
		return;
	}

	try {
		const fileInfo = await accessFile(accessToken, authToken);
		const decryptedPdf = await fetchAndDecryptFile(fileInfo.cid, fileInfo.key, fileInfo.iv);

		res.setHeader('Content-Type', 'application/pdf');
		res.setHeader('Content-Disposition', `attachment; filename="${fileInfo.name}"`);
		res.send(decryptedPdf);

	} catch (error) {
		console.error('Access file error:', error);
		res.status(500).json({ error: 'Failed to access file', details: error instanceof Error ? error.message : error });
	}
});

app.listen(PORT, () => {
	console.log(`ROFL app listening on port ${PORT}`);
});
