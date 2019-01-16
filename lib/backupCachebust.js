const fs = require('fs');
const replace = require('replace-in-file');

const backupFile = '.cachebust-manifest.json';

const create = (manifest) => {
  fs.writeFileSync(backupFile, JSON.stringify(manifest));
}

const restore = () => {
  if(check()) {
    const { targetFiles: files, to: from, from: to } = JSON.parse(fs.readFileSync(backupFile));
    replace({
      files,
      from,
      to
    });
    console.log(`${files.length} files restored.`);
    fs.unlinkSync(backupFile);
  } else {
    console.log('Must create a cachebust before restoring...');
    console.log('Run: `cachebust`.');
    process.exit();
  }
}

const check = () => {
  return fs.existsSync(backupFile);
}

module.exports = { create, check, restore };
