interface BasicOptions {
  offset?: number;
}

/**
 * Take a Uint8Array and a header and return whether or not the given Uint8Array contains the given header
 */
export async function basic(uint8Arr: Uint8Array, header: Uint8Array, options: BasicOptions = {}) {
  if (uint8Arr.length < header.length) {
    return false;
  }
  if (header.length === 0) {
    return false;
  }
  if (options.offset !== undefined && options.offset < 0) {
    throw new Error('The offset option must be a positive number');
  }
  const offset = options.offset ?? 0;
  if (offset > 0 && uint8Arr.length < offset + header.length) {
    return false;
  }
  for (let i = 0; i < header.length; i++) {
    if (header[i] !== uint8Arr[i + offset]) {
      return false;
    }
  }
  return true;
}
