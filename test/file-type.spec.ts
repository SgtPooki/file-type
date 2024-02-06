/* eslint-env mocha */
import { expect } from 'aegir/chai'
import { alloc } from 'uint8arrays/alloc'
import {
  fileTypeFromBuffer,
  FileTypeParser,
  supportedExtensions,
  supportedMimeTypes
} from '../src/index.js'
import { getFixtureDataUint8Array } from './get-fixture-data.js'

const missingTests = new Set([
  'mpc'
])

const types = [...supportedExtensions].filter(ext => !missingTests.has(ext))

// Define an entry here only if the fixture has a different
// name than `fixture` or if you want multiple fixtures
const names = {
  aac: [
    'fixture-adts-mpeg2',
    'fixture-adts-mpeg4',
    'fixture-adts-mpeg4-2',
    'fixture-id3v2'
  ],
  asar: [
    'fixture',
    'fixture2'
  ],
  arw: [
    'fixture-sony-zv-e10'
  ],
  cr3: [
    'fixture'
  ],
  dng: [
    'fixture-Leica-M10'
  ],
  epub: [
    'fixture',
    'fixture-crlf'
  ],
  nef: [
    'fixture',
    'fixture2',
    'fixture3',
    'fixture4'
  ],
  '3gp': [
    'fixture',
    'fixture2'
  ],
  woff2: [
    'fixture',
    'fixture-otto'
  ],
  woff: [
    'fixture',
    'fixture-otto'
  ],
  eot: [
    'fixture',
    'fixture-0x20001'
  ],
  mov: [
    'fixture',
    'fixture-mjpeg',
    'fixture-moov'
  ],
  mp2: [
    'fixture',
    'fixture-mpa'
  ],
  mp3: [
    'fixture',
    'fixture-mp2l3',
    'fixture-ffe3'
  ],
  mp4: [
    'fixture-imovie',
    'fixture-isom',
    'fixture-isomv2',
    'fixture-mp4v2',
    'fixture-dash'
  ],
  mts: [
    'fixture-raw',
    'fixture-bdav'
  ],
  tif: [
    'fixture-big-endian',
    'fixture-little-endian',
    'fixture-bali'
  ],
  gz: [
    'fixture.tar'
  ],
  xz: [
    'fixture.tar'
  ],
  lz: [
    'fixture.tar'
  ],
  Z: [
    'fixture.tar'
  ],
  zst: [
    'fixture.tar'
  ],
  mkv: [
    'fixture',
    'fixture2'
  ],
  mpg: [
    'fixture',
    'fixture2',
    'fixture.ps',
    'fixture.sub'
  ],
  heic: [
    'fixture-mif1',
    'fixture-msf1',
    'fixture-heic'
  ],
  ape: [
    'fixture-monkeysaudio'
  ],
  mpc: [
    'fixture-sv7',
    'fixture-sv8'
  ],
  pcap: [
    'fixture-big-endian',
    'fixture-little-endian'
  ],
  png: [
    'fixture',
    'fixture-itxt'
  ],
  tar: [
    'fixture',
    'fixture-v7',
    'fixture-spaces'
  ],
  mie: [
    'fixture-big-endian',
    'fixture-little-endian'
  ],
  m4a: [
    'fixture-babys-songbook.m4b' // Actually it's an `.m4b`
  ],
  m4v: [
    'fixture',
    'fixture-2' // Previously named as `fixture.mp4`
  ],
  flac: [
    'fixture',
    'fixture-id3v2' // FLAC prefixed with ID3v2 header
  ],
  docx: [
    'fixture',
    'fixture2',
    'fixture-office365'
  ],
  pptx: [
    'fixture',
    'fixture2',
    'fixture-office365'
  ],
  xlsx: [
    'fixture',
    'fixture2',
    'fixture-office365'
  ],
  ogx: [
    'fixture-unknown-ogg' // Manipulated fixture to unrecognized Ogg based file
  ],
  avif: [
    'fixture-yuv420-8bit', // Multiple bit-depths and/or subsamplings
    'fixture-sequence'
  ],
  eps: [
    'fixture',
    'fixture2'
  ],
  cfb: [
    'fixture.msi',
    'fixture.xls',
    'fixture.doc',
    'fixture.ppt',
    'fixture-2.doc'
  ],
  asf: [
    'fixture',
    'fixture.wma',
    'fixture.wmv'
  ],
  ai: [
    'fixture-normal', // Normal AI
    'fixture-without-pdf-compatibility' // AI without the PDF compatibility (cannot be opened by PDF viewers I guess)
  ],
  jxl: [
    'fixture', // Image data stored within JXL container
    'fixture2' // Bare image data with no container
  ],
  pdf: [
    'fixture',
    'fixture-adobe-illustrator', // PDF saved from Adobe Illustrator, using the default "[Illustrator Default]" preset
    'fixture-smallest', // PDF saved from Adobe Illustrator, using the preset "smallest PDF"
    'fixture-fast-web', // PDF saved from Adobe Illustrator, using the default "[Illustrator Default"] preset, but enabling "Optimize for Fast Web View"
    'fixture-printed', // PDF printed from Adobe Illustrator, but with a PDF printer.
    'fixture-minimal' // PDF written to be as small as the spec allows
  ],
  webm: [
    'fixture-null' // EBML DocType with trailing null character
  ],
  xml: [
    'fixture',
    'fixture-utf8-bom', // UTF-8 with BOM
    'fixture-utf16-be-bom', // UTF-16 little endian encoded XML, with BOM
    'fixture-utf16-le-bom' // UTF-16 big endian encoded XML, with BOM
  ],
  jls: [
    'fixture-normal',
    'fixture-hp1',
    'fixture-hp2',
    'fixture-hp3'
  ],
  pst: [
    'fixture-sample'
  ],
  dwg: [
    'fixture-line-weights'
  ],
  j2c: [
    'fixture'
  ],
  cpio: [
    'fixture-bin',
    'fixture-ascii'
  ]
}

// Define an entry here only if the file type has potential
// for false-positives
const falsePositives = {
  png: [
    'fixture-corrupt'
  ]
}

// Known failing fixture
const failingFixture = new Set([
  'fixture-password-protected'
])

async function checkBufferLike (type, bufferLike) {
  const { ext, mime } = await fileTypeFromBuffer(bufferLike) ?? {}
  expect(ext).to.equal(type)
  expect(typeof mime).to.equal('string')
}

// async function checkBlobLike(t, type, bufferLike) {
//   const blob = new Blob([bufferLike]);
//   const {ext, mime} = await fileTypeFromBlob(blob) ?? {};
//   t.is(ext, type);
//   t.is(typeof mime, 'string');
// }

// async function checkFile(t, type, filePath) {
//   const {ext, mime} = await fileTypeFromFile(filePath) ?? {};
//   t.is(ext, type);
//   t.is(typeof mime, 'string');
// }

// async function testFromFile(t, ext, name) {
//   const file = path.join(fixturePath, `${(name ?? 'fixture')}.${ext}`);
//   return checkFile(t, ext, file);
// }

async function testFromBuffer (ext: string, name?: string) {
  const fixtureName = `${(name ?? 'fixture')}.${ext}`
  const chunk = await getFixtureDataUint8Array(fixtureName)

  await checkBufferLike(ext, chunk)
  await checkBufferLike(ext, new Uint8Array(chunk))
  await checkBufferLike(ext, chunk.buffer.slice(chunk.byteOffset, chunk.byteOffset + chunk.byteLength))
}

// async function testFromBlob (t, ext, name) {
//   const fixtureName = `${(name ?? 'fixture')}.${ext}`

//   const file = path.join(fixturePath, fixtureName)
//   const chunk = fs.readFileSync(file)
//   await checkBlobLike(t, ext, chunk)
// }

async function testFalsePositive (ext, name) {
  const chunk = await getFixtureDataUint8Array(`${name}.${ext}`)

  await expect(fileTypeFromBuffer(chunk)).to.eventually.be(undefined)
  await expect(fileTypeFromBuffer(new Uint8Array(chunk))).to.eventually.be(undefined)
  await expect(fileTypeFromBuffer(chunk.buffer)).to.eventually.be(undefined)
}

// async function testFileFromStream (t, ext, name) {
//   const filename = `${(name ?? 'fixture')}.${ext}`
//   const file = path.join(fixturePath, filename)
//   const fileType = await fileTypeFromStream(fs.createReadStream(file))

//   t.truthy(fileType, `identify ${filename}`)
//   t.is(fileType.ext, ext, 'fileType.ext')
//   t.is(typeof fileType.mime, 'string', 'fileType.mime')
// }

// async function loadEntireFile (readable) {
//   const buffer = []
//   for await (const chunk of readable) {
//     buffer.push(Buffer.from(chunk))
//   }

//   return Buffer.concat(buffer)
// }

// async function testStream(t, ext, name) {
//   const fixtureName = `${(name ?? 'fixture')}.${ext}`;
//   const file = path.join(fixturePath, fixtureName);

//   const readableStream = await fileTypeStream(fs.createReadStream(file));
//   const fileStream = fs.createReadStream(file);

//   const [bufferA, bufferB] = await Promise.all([loadEntireFile(readableStream), loadEntireFile(fileStream)]);

//   t.true(bufferA.equals(bufferB));
// }

let i = 0
for (const type of types) {
  if (Object.prototype.hasOwnProperty.call(names, type)) {
    for (const name of names[type]) {
      const fixtureName = `${name}.${type}`
      // const _test = failingFixture.has(fixtureName) ? test.failing : test
      const _test = failingFixture.has(fixtureName) ? it.skip : it
      // _test(`${name}.${type} ${i++} .fileTypeFromFile() method - same fileType`, testFromFile, type, name);
      // _test(`${name}.${type} ${i++} .fileTypeFromBuffer() method - same fileType`, testFromBuffer, type, name)
      // describe(`${name}.${type} ${i++} .fileTypeFromBuffer() method - same fileType`, async () => {
      _test(`${name}.${type} ${i++} .fileTypeFromBuffer() method - same fileType`, async () => {
        await testFromBuffer(type, name)
      })
      // })
      // _test(`${name}.${type} ${i++} .fileTypeFromBlob() method - same fileType`, testFromBlob, type, name);
      // _test(`${name}.${type} ${i++} .fileTypeFromStream() method - same fileType`, testFileFromStream, type, name);
      // it(`${name}.${type} ${i++} .fileTypeStream() - identical streams`, testStream, type, name);
    }
  } else {
    const fixtureName = `fixture.${type}`
    // const _test = failingFixture.has(fixtureName) ? test.failing : test
    const _test = failingFixture.has(fixtureName) ? it.skip : it

    // _test(`${type} ${i++} .fileTypeFromFile()`, testFromFile, type);
    // _test(`${type} ${i++} .fileTypeFromBuffer()`, testFromBuffer, type)
    // describe(`${type} ${i++} .fileTypeFromBuffer()`, async () => {
    _test(`${type} ${i++} .fileTypeFromBuffer()`, async () => {
      await testFromBuffer(type)
    })
    // })
    // _test(`${type} ${i++} .fileTypeFromStream()`, testFileFromStream, type);
    // it(`${type} ${i++} .fileTypeStream() - identical streams`, testStream, type);
  }

  if (Object.prototype.hasOwnProperty.call(falsePositives, type)) {
    for (const falsePositiveFile of falsePositives[type]) {
      it(`false positive - ${type} ${i++}`, async () => {
        await testFalsePositive(type, falsePositiveFile)
      })
    }
  }
}

// it('.fileTypeStream() method - empty stream', async () => {
//   const newStream = await fileTypeStream(readableNoopStream());
//   t.is(newStream.fileType, undefined);
// });

// it('.fileTypeStream() method - short stream', async () => {
//   const bufferA = Buffer.from([0, 1, 0, 1]);
//   class MyStream extends stream.Readable {
//     _read() {
//       this.push(bufferA);
//       this.push(null);
//     }
//   }

//   // Test filetype detection
//   const shortStream = new MyStream();
//   const newStream = await fileTypeStream(shortStream);
//   t.is(newStream.fileType, undefined);

//   // Test usability of returned stream
//   const bufferB = await loadEntireFile(newStream);
//   t.deepEqual(bufferA, bufferB);
// });

// it('.fileTypeStream() method - no end-of-stream errors', async () => {
//   const file = path.join(fixturePath, 'fixture.ogm');
//   const stream = await fileTypeStream(fs.createReadStream(file), {sampleSize: 30});
//   t.is(stream.fileType, undefined);
// });

// it('.fileTypeStream() method - error event', async () => {
//   const errorMessage = 'Fixture';

//   const readableStream = new stream.Readable({
//     read() {
//       process.nextTick(() => {
//         this.emit('error', new Error(errorMessage));
//       });
//     },
//   });

//   await t.throwsAsync(fileTypeStream(readableStream), {message: errorMessage});
// });

// it('.fileTypeStream() method - sampleSize option', async () => {
//   const file = path.join(fixturePath, 'fixture.ogm');
//   let stream = await fileTypeStream(fs.createReadStream(file), {sampleSize: 30});
//   t.is(typeof (stream.fileType), 'undefined', 'file-type cannot be determined with a sampleSize of 30');

//   stream = await fileTypeStream(fs.createReadStream(file), {sampleSize: 4100});
//   t.is(typeof (stream.fileType), 'object', 'file-type can be determined with a sampleSize of 4100');
//   t.is(stream.fileType.mime, 'video/ogg');
// });

it('supportedExtensions.has', () => {
  expect(supportedExtensions.has('jpg')).to.be.true()
  // @ts-expect-error - purposefully invalid input
  expect(supportedExtensions.has('blah')).to.be.false()
})

it('supportedMimeTypes.has', () => {
  expect(supportedMimeTypes.has('video/mpeg')).to.be.true()
  // @ts-expect-error - purposefully invalid input
  expect(supportedMimeTypes.has('video/blah')).to.be.false()
})

it('validate the input argument type', async () => {
  await expect(fileTypeFromBuffer('x')).to.eventually.be.rejectedWith(/Expected the `input` argument to be of type `Uint8Array`/)

  // await t.notThrowsAsync(fileTypeFromBuffer(Buffer.from('x')))
  // await t.notThrowsAsync(fileTypeFromBuffer(new Uint8Array()))
  // await t.notThrowsAsync(fileTypeFromBuffer(new ArrayBuffer()))
  await expect(fileTypeFromBuffer(new Uint8Array())).to.eventually.not.be.rejected()
  await expect(fileTypeFromBuffer(new Uint8Array().buffer)).to.eventually.not.be.rejected()
  await expect(fileTypeFromBuffer(new ArrayBuffer(0))).to.eventually.not.be.rejected()
})

it('odd file sizes', async () => {
  const oddFileSizes = [1, 2, 3, 4, 5, 6, 7, 8, 10, 11, 12, 13, 255, 256, 257, 511, 512, 513]

  for (const size of oddFileSizes) {
    const buffer = alloc(size)
    // await t.notThrowsAsync(fileTypeFromBuffer(buffer), `fromBuffer: File size: ${size} bytes`)
    await expect(fileTypeFromBuffer(buffer)).to.eventually.not.be.rejected(`fromBuffer: File size: ${size} bytes`)
  }

  // for (const size of oddFileSizes) {
  //   const buffer = Buffer.alloc(size)
  //   const stream = new BufferedStream(buffer)
  //   await t.notThrowsAsync(fileTypeFromStream(stream), `fromStream: File size: ${size} bytes`);
  // }
})

it('corrupt MKV throws', async () => {
  const fileContent = await getFixtureDataUint8Array('fixture-corrupt.mkv')

  await expect(fileTypeFromBuffer(fileContent)).to.eventually.be.rejectedWith(/End-Of-Stream/)
})

// Create a custom detector for the just made up "unicorn" file type
const unicornDetector = async tokenizer => {
  const unicornHeader = [85, 78, 73, 67, 79, 82, 78] // "UNICORN" as decimal string
  const buffer = alloc(7)
  await tokenizer.peekBuffer(buffer, { length: unicornHeader.length, mayBeLess: true })
  if (unicornHeader.every((value, index) => value === buffer[index])) {
    return { ext: 'unicorn', mime: 'application/unicorn' }
  }

  return undefined
}

const mockPngDetector = _tokenizer => ({ ext: 'mockPng', mime: 'image/mockPng' })

// const tokenizerPositionChanger = tokenizer => {
//   const buffer = Buffer.alloc(1)
//   tokenizer.readBuffer(buffer, { length: 1, mayBeLess: true })
// }

it('fileTypeFromBlob should detect custom file type "unicorn" using custom detectors', async () => {
  // Set up the "unicorn" file content
  const header = 'UNICORN FILE\n'
  const blob = new Blob([header])

  const customDetectors = [unicornDetector]
  const parser = new FileTypeParser({ customDetectors })

  const result = await parser.fromBlob(blob)
  // t.deepEqual(result, { ext: 'unicorn', mime: 'application/unicorn' })
  expect(result).to.deep.equal({ ext: 'unicorn', mime: 'application/unicorn' })
})

it('fileTypeFromBlob should keep detecting default file types when no custom detector matches', async () => {
  const chunk = await getFixtureDataUint8Array('fixture.png')

  const blob = new Blob([chunk])

  const customDetectors = [unicornDetector]
  const parser = new FileTypeParser({ customDetectors })

  const result = await parser.fromBlob(blob)
  expect(result).to.deep.equal({ ext: 'png', mime: 'image/png' })
})

it('fileTypeFromBlob should allow overriding default file type detectors', async () => {
  const chunk = await getFixtureDataUint8Array('fixture.png')
  const blob = new Blob([chunk])

  const customDetectors = [mockPngDetector]
  const parser = new FileTypeParser({ customDetectors })

  const result = await parser.fromBlob(blob)
  expect(result).to.deep.equal({ ext: 'mockPng', mime: 'image/mockPng' })
})

it('fileTypeFromBuffer should detect custom file type "unicorn" using custom detectors', async () => {
  const header = 'UNICORN FILE\n'
  const uint8ArrayContent = new TextEncoder().encode(header)

  const customDetectors = [unicornDetector]
  const parser = new FileTypeParser({ customDetectors })

  const result = await parser.fromBuffer(uint8ArrayContent)
  expect(result).to.deep.equal({ ext: 'unicorn', mime: 'application/unicorn' })
})

it('fileTypeFromBuffer should keep detecting default file types when no custom detector matches', async () => {
  const uint8ArrayContent = await getFixtureDataUint8Array('fixture.png')

  const customDetectors = [unicornDetector]
  const parser = new FileTypeParser({ customDetectors })

  const result = await parser.fromBuffer(uint8ArrayContent)
  expect(result).to.deep.equal({ ext: 'png', mime: 'image/png' })
})

it('fileTypeFromBuffer should allow overriding default file type detectors', async () => {
  const uint8ArrayContent = await getFixtureDataUint8Array('fixture.png')

  const customDetectors = [mockPngDetector]
  const parser = new FileTypeParser({ customDetectors })

  const result = await parser.fromBuffer(uint8ArrayContent)
  expect(result).to.deep.equal({ ext: 'mockPng', mime: 'image/mockPng' })
})

// class CustomReadableStream extends stream.Readable {
//   _read (_size) {
//     this.push('UNICORN')
//   }
// }
// it('fileTypeFromStream should detect custom file type "unicorn" using custom detectors', async () => {
//   const readableStream = new CustomReadableStream();

//   const customDetectors = [unicornDetector];
//   const parser = new FileTypeParser({customDetectors});

//   const result = await parser.fromStream(readableStream);
//   t.deepEqual(result, {ext: 'unicorn', mime: 'application/unicorn'});
// });

// it('fileTypeFromStream should keep detecting default file types when no custom detector matches', async () => {
//   const file = path.join(fixturePath, 'fixture.png');
//   const readableStream = fs.createReadStream(file);

//   const customDetectors = [unicornDetector];
//   const parser = new FileTypeParser({customDetectors});

//   const result = await parser.fromStream(readableStream);
//   t.deepEqual(result, {ext: 'png', mime: 'image/png'});
// });

// it('fileTypeFromStream should allow overriding default file type detectors', async () => {
//   const file = path.join(fixturePath, 'fixture.png');
//   const readableStream = fs.createReadStream(file);

//   const customDetectors = [mockPngDetector];
//   const parser = new FileTypeParser({customDetectors});

//   const result = await parser.fromStream(readableStream);
//   t.deepEqual(result, {ext: 'mockPng', mime: 'image/mockPng'});
// });

// it('fileTypeFromFile should detect custom file type "unicorn" using custom detectors', async () => {
//   const file = path.join(fixturePath, 'fixture.unicorn');

//   const customDetectors = [unicornDetector];

//   const result = await fileTypeFromFile(file, {customDetectors});
//   t.deepEqual(result, {ext: 'unicorn', mime: 'application/unicorn'});
// });

// it('fileTypeFromFile should keep detecting default file types when no custom detector matches', async () => {
//   const file = path.join(fixturePath, 'fixture.png');

//   const customDetectors = [unicornDetector];

//   const result = await fileTypeFromFile(file, {customDetectors});
//   t.deepEqual(result, {ext: 'png', mime: 'image/png'});
// });

// it('fileTypeFromFile should allow overriding default file type detectors', async () => {
//   const file = path.join(fixturePath, 'fixture.png');

//   const customDetectors = [mockPngDetector];

//   const result = await fileTypeFromFile(file, {customDetectors});
//   t.deepEqual(result, {ext: 'mockPng', mime: 'image/mockPng'});
// });

// it('fileTypeFromTokenizer should return undefined when a custom detector changes the tokenizer position and does not return a file type', async () => {
//   const header = 'UNICORN FILE\n';
//   const uint8ArrayContent = new TextEncoder().encode(header);

//   // Include the unicormDetector here to verify it's not used after the tokenizer.position changed
//   const customDetectors = [tokenizerPositionChanger, unicornDetector];
//   const parser = new FileTypeParser({customDetectors});

//   const result = await parser.fromTokenizer(strtok3.fromBuffer(uint8ArrayContent));
//   t.is(result, undefined);
// });
