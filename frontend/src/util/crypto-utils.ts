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