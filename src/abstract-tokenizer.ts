import { EndOfStreamError } from 'peek-readable';
import type { IGetToken, IToken } from '@tokenizer/token';
// import { Buffer } from 'node:buffer';
import { alloc } from 'uint8arrays/alloc'


export interface IFileInfo {
  /**
   * File size in bytes
   */
  size?: number;
  /**
   * MIME-type of file
   */
  mimeType?: string;

  /**
   * File path
   */
  path?: string;

  /**
   * File URL
   */
  url?: string;
}

export interface IReadChunkOptions {

  /**
   * The offset in the buffer to start writing at; default is 0
   */
  offset?: number;

  /**
   * Number of bytes to read.
   */
  length?: number;

  /**
   * Position where to begin reading from the file.
   * Default it is `tokenizer.position`.
   * Position may not be less then `tokenizer.position`.
   */
  position?: number;

  /**
   * If set, will not throw an EOF error if not all of the requested data could be read
   */
  mayBeLess?: boolean;
}

/**
 * The tokenizer allows us to read or peek from the tokenizer-stream.
 * The tokenizer-stream is an abstraction of a stream, file or Buffer.
 */
export interface ITokenizer {

  /**
   * Provide access to information of the underlying information stream or file.
   */
  fileInfo: IFileInfo;

  /**
   * Offset in bytes (= number of bytes read) since beginning of file or stream
   */
  position: number;

  /**
   * Peek (read ahead) buffer from tokenizer
   * @param buffer - Target buffer to fill with data peek from the tokenizer-stream
   * @param options - Read behaviour options
   * @returns Promise with number of bytes read
   */
  peekBuffer(buffer: Uint8Array, options?: IReadChunkOptions): Promise<number>;

  /**
   * Peek (read ahead) buffer from tokenizer
   * @param buffer - Target buffer to fill with data peeked from the tokenizer-stream
   * @param options - Additional read options
   * @returns Promise with number of bytes read
   */
  readBuffer(buffer: Uint8Array, options?: IReadChunkOptions): Promise<number>;

  /**
   * Peek a token from the tokenizer-stream.
   * @param token - Token to peek from the tokenizer-stream.
   * @param position - Offset where to begin reading within the file. If position is null, data will be read from the current file position.
   * @param maybeless - If set, will not throw an EOF error if the less then the requested length could be read.
   */
  peekToken<T>(token: IGetToken<T>, position?: number | null, maybeless?: boolean): Promise<T>;

  /**
   * Read a token from the tokenizer-stream.
   * @param token - Token to peek from the tokenizer-stream.
   * @param position - Offset where to begin reading within the file. If position is null, data will be read from the current file position.
   */
  readToken<T>(token: IGetToken<T>, position?: number): Promise<T>;

  /**
   * Peek a numeric token from the stream
   * @param token - Numeric token
   * @returns Promise with number
   */
  peekNumber(token: IGetToken<number>): Promise<number>;

  /**
   * Read a numeric token from the stream
   * @param token - Numeric token
   * @returns Promise with number
   */
  readNumber(token: IGetToken<number>): Promise<number>;

  /**
   * Ignore given number of bytes
   * @param length - Number of bytes ignored
   */
  ignore(length: number): Promise<number>;

  /**
   * Clean up resources.
   * It does not close the stream for StreamReader, but is does close the file-descriptor.
   */
  close(): Promise<void>;
}


interface INormalizedReadChunkOptions extends IReadChunkOptions {
  offset: number;
  length: number;
  position: number;
  mayBeLess?: boolean;
}

/**
 * Core tokenizer
 */
export abstract class AbstractTokenizer implements ITokenizer {

  public fileInfo: IFileInfo;

  protected constructor(fileInfo?: IFileInfo) {
    this.fileInfo = fileInfo ? fileInfo : {};
  }

  /**
   * Tokenizer-stream position
   */
  public position: number = 0;

  private numBuffer = new Uint8Array(8);

  /**
   * Read buffer from tokenizer
   * @param buffer - Target buffer to fill with data read from the tokenizer-stream
   * @param options - Additional read options
   * @returns Promise with number of bytes read
   */
  public abstract readBuffer(buffer: Uint8Array, options?: IReadChunkOptions): Promise<number>;

  /**
   * Peek (read ahead) buffer from tokenizer
   * @param uint8Array- Target buffer to fill with data peek from the tokenizer-stream
   * @param options - Peek behaviour options
   * @returns Promise with number of bytes read
   */
  public abstract peekBuffer(uint8Array: Uint8Array, options?: IReadChunkOptions): Promise<number>;

  /**
   * Read a token from the tokenizer-stream
   * @param token - The token to read
   * @param position - If provided, the desired position in the tokenizer-stream
   * @returns Promise with token data
   */
  public async readToken<Value>(token: IGetToken<Value>, position: number = this.position): Promise<Value> {
    const uint8Array = alloc(token.len);
    const len = await this.readBuffer(uint8Array, {position});
    if (len < token.len)
      throw new EndOfStreamError();
    return token.get(uint8Array, 0);
  }

  /**
   * Peek a token from the tokenizer-stream.
   * @param token - Token to peek from the tokenizer-stream.
   * @param position - Offset where to begin reading within the file. If position is null, data will be read from the current file position.
   * @returns Promise with token data
   */
  public async peekToken<Value>(token: IGetToken<Value>, position: number = this.position): Promise<Value> {
    const uint8Array = alloc(token.len);
    const len = await this.peekBuffer(uint8Array, {position});
    if (len < token.len)
      throw new EndOfStreamError();
    return token.get(uint8Array, 0);
  }

  /**
   * Read a numeric token from the stream
   * @param token - Numeric token
   * @returns Promise with number
   */
  public async readNumber(token: IToken<number>): Promise<number> {
    const len = await this.readBuffer(this.numBuffer, {length: token.len});
    if (len < token.len)
      throw new EndOfStreamError();
    return token.get(this.numBuffer, 0);
  }

  /**
   * Read a numeric token from the stream
   * @param token - Numeric token
   * @returns Promise with number
   */
  public async peekNumber(token: IToken<number>): Promise<number> {
    const len = await this.peekBuffer(this.numBuffer, {length: token.len});
    if (len < token.len)
      throw new EndOfStreamError();
    return token.get(this.numBuffer, 0);
  }

  /**
   * Ignore number of bytes, advances the pointer in under tokenizer-stream.
   * @param length - Number of bytes to ignore
   * @return resolves the number of bytes ignored, equals length if this available, otherwise the number of bytes available
   */
  public async ignore(length: number): Promise<number> {
    if (this.fileInfo.size !== undefined) {
      const bytesLeft = this.fileInfo.size - this.position;
      if (length > bytesLeft) {
        this.position += bytesLeft;
        return bytesLeft;
      }
    }
    this.position += length;
    return length;
  }

  public async close(): Promise<void> {
    // empty
  }

  protected normalizeOptions(uint8Array: Uint8Array, options?: IReadChunkOptions): INormalizedReadChunkOptions {

    if (options && options.position !== undefined && options.position < this.position) {
      throw new Error('`options.position` must be equal or greater than `tokenizer.position`');
    }

    if (options) {
      return {
        mayBeLess: options.mayBeLess === true,
        offset: options.offset ? options.offset : 0,
        length: options.length ? options.length : (uint8Array.length - (options.offset ? options.offset : 0)),
        position: options.position ? options.position : this.position
      };
    }

    return {
      mayBeLess: false,
      offset: 0,
      length: uint8Array.length,
      position: this.position
    };
  }
}
