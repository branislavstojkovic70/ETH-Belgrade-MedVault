import type { EncryptionResult } from "../domain/encryption-result";

export async function encryptData(
	data: ArrayBuffer
): Promise<EncryptionResult> {
	const symmetricKey = await window.crypto.subtle.generateKey(
		{ name: "AES-GCM", length: 256 },
		true,
		["encrypt", "decrypt"]
	);

	const iv = window.crypto.getRandomValues(new Uint8Array(12));

	const encrypted = await window.crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		symmetricKey,
		data
	);

	const rawKey = await window.crypto.subtle.exportKey("raw", symmetricKey);

	const symmetricKeyHex = Array.from(new Uint8Array(rawKey))
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	const ivHex = Array.from(iv)
		.map((b) => b.toString(16).padStart(2, "0"))
		.join("");

	return { encrypted, symmetricKeyHex, ivHex };
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
