import { ethers } from "ethers";
import { vaultAbi, vaultAddress } from "../config/vault-config";
import { wrapEthereumProvider } from "@oasisprotocol/sapphire-paratime";

export function isMetaMaskInstalled(): boolean {
	return (
		typeof window !== "undefined" &&
		typeof (window as any).ethereum !== "undefined" &&
		(window as any).ethereum.isMetaMask
	);
}

export async function getSigner(): Promise<ethers.Signer | null> {
	if (!isMetaMaskInstalled()) {
		console.error("MetaMask is not installed.");
		return null;
	}

	const provider = new ethers.BrowserProvider((window as any).ethereum);
	await provider.send("eth_requestAccounts", []);

	return await provider.getSigner();
}

export async function getWalletAddress(): Promise<string | null> {
	if (!isMetaMaskInstalled()) {
		console.error("MetaMask is not installed.");
		return null;
	}

	const accounts = await (window as any).ethereum.request({
		method: "eth_requestAccounts",
	});
	return accounts[0] || null;
}

export async function getVaultContract(): Promise<ethers.Contract> {
	await (window as any).ethereum.request({ method: "eth_requestAccounts" });
	const raw = (window as any).ethereum;
	const wrapped = wrapEthereumProvider(raw);
	const provider = new ethers.BrowserProvider(wrapped);
	const signer = await provider.getSigner();
	return new ethers.Contract(vaultAddress, vaultAbi, signer);
}
