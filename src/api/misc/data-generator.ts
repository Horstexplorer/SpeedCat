export function generateRandomData(length: number): Uint8Array {
    const buffer = new Uint8Array(length)
    for (let i = 0; i < length; i += 65536) {
        crypto.getRandomValues(buffer.subarray(i, i + Math.min(length - i, 65536)))
    }
    return buffer
}