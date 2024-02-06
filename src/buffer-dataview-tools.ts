/**
 * Buffer.readUInt32LE, but via a DataView
 */
export function readUInt32LE (buffer: Uint8Array, offset: number): number {
  return new DataView(buffer.buffer).getUint32(offset, true)
}

/**
 * Buffer.readUInt16LE, but via a DataView
 */
export function readUInt16LE (buffer: Uint8Array, offset: number): number {
  return new DataView(buffer.buffer).getUint16(offset, true)
}

/**
 * Buffer.toString, but via a DataView
 */
export function bufferToString (buffer: Uint8Array, encoding: string, start: number, end: number): string {
  if (encoding === 'binary') {
    // textDecoder does not support binary encoding, so we don't set the encoding.
    return new TextDecoder().decode(buffer.slice(start, end))
  }
  return new TextDecoder(encoding).decode(buffer.slice(start, end))
}

/**
 * Buffer.readUIntBE, but via a DataView
 */

export function readUIntBE (buffer: Uint8Array, offset: number, byteLength: number): number {
  let value = 0
  for (let i = 0; i < byteLength; i++) {
    value += buffer[offset + i] * 2 ** (8 * (byteLength - i - 1))
  }
  return value
}

export function stringToBuffer (str: string, encoding?: string): Uint8Array {
  if (encoding === 'binary') {
    return new TextEncoder().encode(str)
  } else if (encoding === 'hex') {
    const matches = str.match(/.{1,2}/g)
    if (matches == null) {
      throw new Error('Invalid hex string')
    }

    return new Uint8Array(matches.map(byte => parseInt(byte, 16)))
  }
  return new TextEncoder().encode(str)
}

/**
 * Buffer.indexOf, but via a DataView
 */
export function bufferIndexOf (haystack: Uint8Array, needle: string | Uint8Array | number, offset: number, encoding?: string): number {
  if (typeof needle === 'string') {
    needle = stringToBuffer(needle, encoding)

    // needle = bufferToString(needle, encoding, 0, needle.length)
  }
  if (typeof needle === 'number') {
    // needle = new Uint8Array([needle])
    return haystack.indexOf(needle, offset)
  }
  if (needle instanceof Uint8Array) {
    for (let i = offset; i < haystack.length - needle.length; i++) {
      let found = true
      for (let j = 0; j < needle.length; j++) {
        if (haystack[i + j] !== needle[j]) {
          found = false
          break
        }
      }
      if (found) {
        return i
      }
    }
  }
  return -1
}

export function bufferIncludes (haystack: Uint8Array, needle: string | Uint8Array | number, offset: number, encoding?: string): boolean {
  return bufferIndexOf(haystack, needle, offset, encoding) !== -1
}
