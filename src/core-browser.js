import { FileTypeParser } from './core.js'

export async function fileTypeFromBuffer (input) {
  return new FileTypeParser().fromBuffer(input)
}
