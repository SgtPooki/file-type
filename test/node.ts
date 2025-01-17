/* eslint-env mocha */

// import process from 'node:process';
// import { Buffer } from 'node:buffer'
import fs from 'node:fs'
// import path from 'node:path'
// import stream from 'node:stream'
// import { fileURLToPath } from 'node:url'
// import test from 'ava'
import { expect } from 'aegir/chai'
import { Parser as ReadmeParser } from 'commonmark'
// import { readableNoopStream } from 'noop-stream'
import {
  // fileTypeFromBuffer,
  // fileTypeFromStream,
  // fileTypeFromFile,
  // fileTypeFromBlob,
  // FileTypeParser,
  // fileTypeStream,
  supportedExtensions,
  supportedMimeTypes
} from '../src/index.js'

import './file-type.spec.js'
// import loadFixture from 'aegir/fixtures'

it('validate the repo has all extensions and mimes in sync', () => {
  // File: core.js (base truth)
  function readIndexJS (): { exts: Set<string>, mimes: Set<string> } {
    const core = fs.readFileSync('dist/src/core.js', { encoding: 'utf8' })

    const extArray = core.match(/(?<=ext:\s')(.*)(?=',)/g)
    const mimeArray = core.match(/(?<=mime:\s')(.*)(?=')/g)
    const exts = new Set(extArray)
    const mimes = new Set(mimeArray)

    return {
      exts,
      mimes
    }
  }

  // File: package.json
  function readPackageJSON (): string[] {
    const packageJson = fs.readFileSync('package.json', { encoding: 'utf8' })
    const { keywords } = JSON.parse(packageJson)

    const allowedExtras = new Set([
      'mime',
      'file',
      'type',
      'magic',
      'archive',
      'image',
      'img',
      'pic',
      'picture',
      'flash',
      'photo',
      'video',
      'detect',
      'check',
      'is',
      'exif',
      'binary',
      'buffer',
      'uint8array',
      'webassembly'
    ])

    const extArray = keywords.filter(keyword => !allowedExtras.has(keyword))
    return extArray
  }

  // File: readme.md
  function readReadmeMD (): string[] {
    const index = fs.readFileSync('readme.md', { encoding: 'utf8' })
    const extArray = index.match(/(?<=-\s\[`)(.*)(?=`)/g)

    return extArray ?? []
  }

  // Helpers
  // Find extensions/mimes that are defined twice in a file
  function findDuplicates (input): string[] {
    // TODO: Fix this.
    return input.reduce((accumulator, element, index, array) => {
      if (array.indexOf(element) !== index && accumulator.includes(element) === false) {
        accumulator.push(element)
      }

      return accumulator
    }, [])
  }

  // Find extensions/mimes that are in another file but not in `core.js`
  function findExtras (array, set): string[] {
    return array.filter(element => set.has(element) === false)
  }

  // Find extensions/mimes that are in `core.js` but missing from another file
  function findMissing (array: string[], set): string[] {
    const missing: string[] = []
    const other = new Set(array)
    for (const element of set) {
      if (!other.has(element)) {
        missing.push(element)
      }
    }

    return missing
  }

  // Test runner
  function validate (found, baseTruth, fileName, extOrMime): void {
    const duplicates = findDuplicates(found)
    const extras = findExtras(found, baseTruth)
    const missing = findMissing(found, baseTruth)
    // t.is(duplicates.length, 0, `Found duplicate ${extOrMime}: ${duplicates} in ${fileName}.`)
    // t.is(extras.length, 0, `Extra ${extOrMime}: ${extras} in ${fileName}.`)
    // t.is(missing.length, 0, `Missing ${extOrMime}: ${missing} in ${fileName}.`)
    expect(duplicates).to.have.length(0, `Found duplicate ${extOrMime}: ${duplicates} in ${fileName}.`)
    expect(extras).to.have.length(0, `Extra ${extOrMime}: ${extras} in ${fileName}.`)
    expect(missing).to.have.length(0, `Missing ${extOrMime}: ${missing} in ${fileName}.`)
  }

  // Get the base truth of extensions and mimes supported from core.js
  const { exts, mimes } = readIndexJS()

  // Validate all extensions
  const filesWithExtensions = {
    'supported.js': [...supportedExtensions],
    'package.json': readPackageJSON(),
    'readme.md': readReadmeMD()
  }

  for (const fileName in filesWithExtensions) {
    if (filesWithExtensions[fileName] != null) {
      const foundExtensions = filesWithExtensions[fileName]
      validate(foundExtensions, exts, fileName, 'extensions')
    }
  }

  // Validate all mimes
  const filesWithMimeTypes = {
    'supported.js': [...supportedMimeTypes]
  }

  for (const fileName in filesWithMimeTypes) {
    if (filesWithMimeTypes[fileName] != null) {
      const foundMimeTypes = filesWithMimeTypes[fileName]
      validate(foundMimeTypes, mimes, fileName, 'mimes')
    }
  }
})

it('supported files types are listed alphabetically', async () => {
  const readme = await fs.promises.readFile('readme.md', { encoding: 'utf8' })
  let currentNode = new ReadmeParser().parse(readme).firstChild

  while (currentNode != null) {
    if (currentNode.type === 'heading' && currentNode.firstChild.literal === 'Supported file types') {
      // Header → List → First list item
      currentNode = currentNode.next.firstChild
      break
    }

    currentNode = currentNode.next
  }

  let previousFileType

  while (currentNode != null) {
    // List item → Paragraph → Link → Inline code → Text
    const currentFileType = currentNode.firstChild.firstChild.firstChild.literal

    if (previousFileType != null) {
      // t.true(currentFileType > previousFileType, `${currentFileType} should be listed before ${previousFileType}`)
      expect(currentFileType > previousFileType).to.be.true(`${currentFileType} should be listed before ${previousFileType}`)
    }

    previousFileType = currentFileType
    currentNode = currentNode.next
  }
})
