#!/usr/bin/env node

const finger = require('fingerprinting');
const fs = require('fs');
const path = require('path');
const replace = require('replace-in-file');

// List your files you want fingerprinted here..
let sourceFiles = [];

// This is where the replacement will happen.
let targetFiles = [];

const APPDIR = process.cwd() + '/';

const args = process.argv.slice(2);
let errors = false;

// Loading from params
sourceKey = 'source=';
targetKey = 'target=';

if (args.length > 0) {
  args.forEach(a => {
    if (a.indexOf(sourceKey) === 0) {
      sourceFiles = extractParam(a);
    }
    if (a.indexOf(targetKey) === 0) {
      targetFiles = extractParam(a);
    }
  });
}

function extractParam(string) {
  let arr = string.split('=')[1];
  return arr.split(',');
}

if (sourceFiles.length < 1 || targetFiles.length < 1) {
  if (fs.existsSync(APPDIR + 'package.json')) {
    config = JSON.parse(fs.readFileSync(APPDIR + './package.json', 'utf8'));
  }
  if (config.cachebust) {
    if (sourceFiles.length < 1) {
      sourceFiles = config.cachebust.source || [];
    }
    if (targetFiles.length < 1) {
      targetFiles = config.cachebust.target || [];
    }
  }
}

if (sourceFiles.length < 1 || targetFiles.length < 1) {
  let config = {};
  if (fs.existsSync(APPDIR + 'cachebust.config.json')) {
    config = JSON.parse(fs.readFileSync(APPDIR + 'cachebust.config.json', 'utf8'));
  }

  if (sourceFiles.length < 1) {
    sourceFiles = config.source || [];
  }

  if (targetFiles.length < 1) {
    targetFiles = config.target || [];
  }
}

// Finally
if (args[0] !== 'restore') {
  if (sourceFiles.length < 1) {
    console.log('Please specify source files.');
    errors = true;
  }

  if (targetFiles.length < 1) {
    console.log('Please specify target files.');
    errors = true;
  }

  if (errors) {
    process.exit();
  }
}

// Check for previous cache bust. This should only be run once
// on a staging or prodution environment.
let cached = false;
for (let file of targetFiles) {
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
      fs.copyFile(file, backup, err => {
        if (err) return console.error(err);
      });
    }
  }
}

if (!cached) {
  cachebust(sourceFiles);
}

async function restore(file, backup) {
  await fs.unlinkSync(file);
  await fs.renameSync(backup, file);
  console.log('Backup restored: ', file);
}

async function cachebust(files) {
  let from = [];
  let to = [];

  for (let file of files) {
    const print = finger(file, { format: '{hash}.{ext}' });
    const target = `${path.dirname(file)}/${print.file}`;

    await fs.copyFileSync(file, target);

    console.log('fingerprinted:', file, target);

    from.push(path.basename(file));
    to.push(path.basename(target));
  }

  if (targetFiles.length) {
    const changes = replace({
      files: targetFiles,
      from: from,
      to: to
    });
  } else {
    console.log('Failed to write cache files');
    fs.unlinkSync(backup);
    process.exit();
  }
}
