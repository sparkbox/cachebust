#!/usr/bin/env node

const finger = require('fingerprinting');
const fs = require('fs-extra');
const path = require('path');
const replace = require('replace-in-file');

// List your files you want fingerprinted here..
let files = [];

// This is where the replacement will happen.
let templateFiles = [];

const args = process.argv.slice(2);
let errors = false;

// Loading from params
sourceKey = 'source=';
targetKey = 'target=';

if (args.length > 0) {
  args.forEach(a => {
    if (a.indexOf(sourceKey, 0)) {
      files = extractParam(a, sourceKey);
    }
    if (a.indexOf(targetKey, 0)) {
      templateFiles = extractParam(a, targetKey);
    }
  });
}

function extractParam(string, key) {
  let arr = string.split('=')[1];
  return arr.split(',');
}

let config = {};

if (files.length < 1 || templateFiles.length < 1) {
  if (fs.existsSync('.cachebust.json')) {
    config = require('./.cachebust.json');
  }

  if (files.length < 1) {
    files = config.source || [];
  }

  if (templateFiles.length < 1) {
    templateFiles = config.target || [];
  }
}

if (files.length < 1 || templateFiles.length < 1) {
  if (fs.existsSync('package.json')) {
    config = require('./package.json');
  }

  if (files.length < 1) {
    files = config.cachebust.source || [];
  }

  if (templateFiles.length < 1) {
    templateFiles = config.cachebust.target || [];
  }
}

// Finally

if (files.length < 1) {
  console.log('Please specify asset files.');
  errors = true;
}

if (templateFiles.length < 1) {
  console.log('Please specify files.');
  errors = true;
}

console.log('source', files);
console.log('target', templateFiles);
process.exit();

if (errors) {
  process.exit();
}

// Check for previous cache bust. This should only be run once
// on a staging or prodution environment.
let cached = false;
for (let file of templateFiles) {
  const backup = `${file}.cache-backup`;

  if (fs.existsSync(backup)) {
    cached = true;
    if (args[0] === 'restore') {
      restore(file, backup);
    } else {
      console.log(
        'previous cache detected',
        '\nrestore the backup file run: `node cachebust.js restore`'
      );
      process.exit();
    }
  } else {
    if (!cached) {
      fs.copy(file, backup, err => {
        if (err) return console.error(err);
      });
    }
  }
}

if (!cached) {
  cachebust(files);
}

async function restore(file, backup) {
  await fs.unlink(file);
  await fs.move(backup, file);
  console.log('Backup restored: ', file);
}

async function cachebust(files) {
  let sourceFiles = [];
  let targetFiles = [];

  for (let file of files) {
    const print = finger(file, { format: '{hash}.{ext}' });
    const target = `${path.dirname(file)}/${print.file}`;

    await fs.copy(file, target);

    console.log('fingerprinted:', file, target);

    sourceFiles.push(path.basename(file));
    targetFiles.push(path.basename(target));
  }

  if (targetFiles.length) {
    const changes = replace({
      files: templateFiles,
      from: sourceFiles,
      to: targetFiles
    });
  } else {
    console.log('Failed to write cache files');
    fs.unlink(backup);
    process.exit();
  }
}
