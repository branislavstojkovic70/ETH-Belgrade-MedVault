import { ethers } from "ethers";
import {
	getVaultContract,
} from "../util/wallet-utils";
import type { FileInfo } from "../domain/file-info";


export async function registerFile(
	fileName: string,
	fileCid: string,
	key: string,
	iv: string
): Promise<string> {
	const vault = await getVaultContract();

	const tx = await vault.registerFile(fileName, fileCid, key, iv);
	console.log("Transaction sent:", tx.hash);

	const receipt = await tx.wait();
	let registeredName: string = "";

	for (const log of receipt.logs) {
		const parsed = vault.interface.parseLog(log);
		if (parsed!.name === "FileRegistered") {
			console.log(parsed);
			registeredName = parsed!.args[1] as string;
		}
	}

	return `File ${registeredName} successfully registered.`;
}

export async function fetchOwnerFiles(): Promise<FileInfo[]> {
	const vault = await getVaultContract();
	const raw: any[] = await vault.getOwnerFiles(localStorage.getItem("token"));

	return raw.map((f) => ({
		fileId: f.fileId,
		name: f.name,
		cid: f.cid,
		key: f.key,
		iv: f.iv,
	}));
}

export async function fetchOwnerFile(fileId: string): Promise<FileInfo | null> {
	const vault = await getVaultContract();
	const fileInfo: FileInfo = await vault.getOwnerFile(
		fileId,
		localStorage.getItem("token")
	);
	return fileInfo;
}

export async function grantAccess(
	doctorWallet: string,
	fileId: string,
	durationMin: number
): Promise<string> {
	const vault = await getVaultContract();
	const tx = await vault.grantAccess(
		ethers.getAddress(doctorWallet),
		fileId,
		durationMin
	);

	const receipt = await tx.wait();
	let accessToken: string = "";

	for (const log of receipt.logs) {
		const parsed = vault.interface.parseLog(log);
		if (parsed!.name === "AccessGranted") {
			console.log(parsed);
			accessToken = parsed!.args[0] as string;
		}
	}

	return accessToken;
}

export async function accessFile(accessToken: string): Promise<FileInfo> {
	const vault = await getVaultContract();
	const fileInfo: FileInfo = await vault.accessFile(
		accessToken,
		localStorage.getItem("token")
	);
	return fileInfo;
}
