import type { extensions, mimeTypes } from './supported.js'

export type FileExtension = (typeof extensions)[number]

export type MimeType = (typeof mimeTypes)[number]

export interface FileTypeResult {
  /**
  One of the supported [file types](https://github.com/sindresorhus/file-type#supported-file-types).
   */
  readonly ext: FileExtension

  /**
  The detected [MIME type](https://en.wikipedia.org/wiki/Internet_media_type).
   */
  readonly mime: MimeType
}

export type ReadableStreamWithFileType = ReadableStream & {
  readonly fileType?: FileTypeResult
}
