#!/usr/bin/node
import process from 'node:process';
import {readFile} from 'node:fs/promises';
import {fileTypeFromBuffer} from './index.js';

const [file] = process.argv.slice(2);

if (!file) {
	console.error('Expected path of the file to examine');
	process.exit();
}

const buffer = await readFile(file);

const fileType = await fileTypeFromBuffer(buffer);

if (fileType) {
	console.log(`MIME-type: ${fileType.mime}`);
	console.log(`Extension: ${fileType.ext}`);
} else {
	console.log('Could not determine file type');
}
