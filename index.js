#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const cachebust = require('./lib/cachebust');
const backup = require('./lib/backupCachebust');
const restore = require('./lib/restore');
const program = require('commander');

program
  .version('0.1.0')
  .option('-s, --source [files]', 'source file(s) to be fingerprinted; comma seperated file list')
  .option('-t, --target [files]', 'target file(s), template files that need the fingerprinted asset file names; comma seperated file list')
  .option('-r, --restore', 'copies the backup file(s) back to the original; backup file(s) are removed.')
  .parse(process.argv)

let sourceFiles = [];
let targetFiles = [];
const APPDIR = process.cwd() + '/';
let errors = false;

const extractParam = (string) => {
  return string.split(',');
}

const loadConfig = (file) => {
  let inc = APPDIR + file;

  if(fs.existsSync(inc)) {
    const config = require(inc);
    return config.cachebust || {};
  }

  return {};
}

if (program.source) {
  sourceFiles = extractParam(program.source);
}

if (program.target) {
  targetFiles = extractParam(program.target);
}

if (sourceFiles.length < 1 || targetFiles.length < 1) {
  cfg = loadConfig('.cachebust.config');
  pkg = loadConfig('package.json');

  if (sourceFiles.length < 1) {
    sourceFiles = pkg.source || cfg.source || [];
  }

  if (targetFiles.length < 1) {
    targetFiles = pkg.target || cfg.target || [];
  }
}

// Finally
if (sourceFiles.length < 1) {
  console.log('Please specify valid source files.');
  errors = true;
}

if (targetFiles.length < 1) {
  console.log('Please specify target files.');
  errors = true;
}

if (errors) {
  process.exit();
}

if(!backup(targetFiles, program.restore)) {
  if (!program.restore) {
    cachebust(sourceFiles, targetFiles);
  } else {
    console.log('No operations performed. No prior cachebust to restore.');
  }
}
