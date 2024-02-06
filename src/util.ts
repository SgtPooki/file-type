import { bufferToString } from './buffer-dataview-tools.js'

export function stringToBytes (string: string): number[] {
  return [...string].map((character) => character.charCodeAt(0))
}

/**
 * Checks whether the TAR checksum is valid.
 *
 * @param buffer - The TAR header `[offset ... offset + 512]`.
 * @param offset - TAR header offset.
 *
 * @returns `true` if the TAR checksum is valid, otherwise `false`.
 */
export function tarHeaderChecksumMatches (buffer: Uint8Array, offset: number = 0): boolean {
  const readSum = Number.parseInt(bufferToString(buffer, 'utf8', 148, 154).replace(/\0.*$/, '').trim(), 8) // Read sum in header
  if (Number.isNaN(readSum)) {
    return false
  }

  let sum = 8 * 0x20 // Initialize signed bit sum

  for (let index = offset; index < offset + 148; index++) {
    sum += buffer[index]
  }

  for (let index = offset + 156; index < offset + 512; index++) {
    sum += buffer[index]
  }

  return readSum === sum
}

/**
 * ID3 UINT32 sync-safe tokenizer token.
 * 28 bits (representing up to 256MB) integer, the msb is 0 to avoid "false syncsignals".
 */
export const uint32SyncSafeToken = {
  get: (buffer: Uint32Array, offset: number) => (buffer[offset + 3] & 0x7F) | ((buffer[offset + 2]) << 7) | ((buffer[offset + 1]) << 14) | ((buffer[offset]) << 21),
  len: 4
}
