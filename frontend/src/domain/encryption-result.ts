export interface EncryptionResult {
	encrypted: ArrayBuffer;
	symmetricKeyHex: string;
	ivHex: string;
}