import type { IGetToken } from '@tokenizer/token'

/**
 * Based off of https://github.com/Borewit/strtok3#ireadchunkoptions
 */
interface ReadChunkOptions {
  length?: number
  mayBeLess?: boolean
  offset?: number
  position?: number
}

export class Token {

}

/**
 * A replacement for the strtok3 library that uses a DataView for tokenization
 */
export class DataViewTokenizer {
  private readonly buffer: ArrayBuffer
  // @ts-expect-error - unused for now
  private readonly view: DataView
  private position: number
  private readonly end: number
  constructor (buffer: ArrayBuffer) {
    this.buffer = buffer
    this.position = 0
    this.end = buffer.byteLength
    this.view = new DataView(buffer)
  }

  static fromBuffer (buffer: ArrayBuffer): DataViewTokenizer {
    if (buffer instanceof Uint8Array) {
      buffer = buffer.buffer
    }
    return new DataViewTokenizer(buffer)
  }

  get fileInfo () {
    return {
      size: this.end - this.position,
      position: this.position
    }
  }

  peekBuffer (bufferToWriteTo: Uint8Array, options?: ReadChunkOptions): void {
    const position = options?.position ?? this.position
    const length = options?.length ?? this.end - position
    const mayBeLess = options?.mayBeLess ?? false
    const offset = options?.offset ?? 0
    if (!mayBeLess && position + length > this.end) {
      throw new Error('Cannot read past the end of the buffer')
    }
    if (offset + length > bufferToWriteTo.byteLength) {
      throw new Error('Buffer is too small')
    }
    bufferToWriteTo.set(new Uint8Array(this.buffer, position, length), offset)
  }

  readBuffer (bufferToWriteTo: Uint8Array, options?: ReadChunkOptions): number {
    this.peekBuffer(bufferToWriteTo, options)
    this.position += options?.length ?? this.end - this.position
    return options?.length ?? this.end - this.position
  }

  ignore (length: number): void {
    this.position += length
  }

  readToken<T>(token: IGetToken<T>, position: number = this.position): T {
    const uint8Array = new Uint8Array(this.buffer, position, token.len)
    const len = this.readBuffer(uint8Array, { position })
    if (len < token.len) { throw new Error('Foobar') }

    return token.get(uint8Array, 0)
  }
}
