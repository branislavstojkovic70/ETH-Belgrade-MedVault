import { decryptData, encryptData } from "../util/crypto-utils";
import axios from "axios";
import {PINATA_API_KEY, PINATA_API_SECRET} from "../config/pinata-config"


export async function encryptAndPinFile(file: File): Promise<{
	cid: string;
	symmetricKeyHex: string;
	ivHex: string;
}> {
	const plaintext = await file.arrayBuffer();
	const { encrypted, symmetricKeyHex, ivHex } = await encryptData(plaintext);

	const blob = new Blob([new Uint8Array(encrypted)], {
		type: "application/octet-stream",
	});

	const formData = new FormData();
	formData.append("file", blob, file.name);
	formData.append("pinataOptions", JSON.stringify({ cidVersion: 1 }));
	formData.append("pinataMetadata", JSON.stringify({ name: file.name }));

	const res = await axios.post(
		"https://api.pinata.cloud/pinning/pinFileToIPFS",
		formData,
		{
			maxBodyLength: Infinity,
			headers: {
				"Content-Type": "multipart/form-data",
				pinata_api_key: PINATA_API_KEY,
				pinata_secret_api_key: PINATA_API_SECRET,
			},
		}
	);

	const cid: string = res.data.IpfsHash;
	return { cid, symmetricKeyHex, ivHex };
}

export async function fetchAndDecryptFile(
	cid: string,
	symmetricKeyHex: string,
	ivHex: string
): Promise<Blob> {
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

	return new Blob([new Uint8Array(decryptedBuffer)], {
		type: "application/pdf",
	});
}