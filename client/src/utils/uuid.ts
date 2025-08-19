/**
 * Generates a UUID v4 string with fallback for environments that don't support crypto.randomUUID
 * @returns A UUID v4 string
 */
export function generateUUID(): string {
    // Use crypto.randomUUID if available (modern browsers)
    if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID()
    }

    // Fallback implementation for older browsers
    if (typeof crypto !== 'undefined' && crypto.getRandomValues) {
        // Use crypto.getRandomValues for better randomness
        const array = new Uint8Array(16)
        crypto.getRandomValues(array)

        // Set version (4) and variant bits according to RFC 4122
        array[6] = (array[6] & 0x0f) | 0x40 // Version 4
        array[8] = (array[8] & 0x3f) | 0x80 // Variant 10

        // Convert to hex string with proper formatting
        const hex = []
        for (let i = 0; i < array.length; i++) {
            const hexByte = array[i].toString(16)
            hex.push(hexByte.length === 1 ? '0' + hexByte : hexByte)
        }
        const hexString = hex.join('')
        return `${hexString.slice(0, 8)}-${hexString.slice(8, 12)}-${hexString.slice(12, 16)}-${hexString.slice(16, 20)}-${hexString.slice(20, 32)}`
    }

    // Final fallback using Math.random (less secure but compatible)
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
        const r = Math.random() * 16 | 0
        const v = c === 'x' ? r : (r & 0x3 | 0x8)
        return v.toString(16)
    })
}
