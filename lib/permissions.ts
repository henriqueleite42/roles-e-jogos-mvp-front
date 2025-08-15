export function isBitSet(base64Str: string, bitIndex: number) {
	// Decode Base64 to a byte array
	const binaryStr = atob(base64Str);
	const bytes = Uint8Array.from(binaryStr, c => c.charCodeAt(0));

	const byteIndex = Math.floor(bitIndex / 8);
	const bitPosition = 7 - (bitIndex % 8);

	return (bytes[byteIndex] & (1 << bitPosition)) !== 0;
}