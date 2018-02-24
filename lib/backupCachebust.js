const fs = require('fs');
const restore = require('./restore');

const backupCachebust = (targetFiles, shouldRestore) => {
  // Check for previous cache bust. This should only be run once
  // on a staging or prodution environment.
  let cached = false;
  let backup = '.cache-backup';

  for (let file of targetFiles) {
    if (fs.existsSync(`${file}${backup}`)) {
      cached = true;
      if (shouldRestore) {
        restore(file, `${file}${backup}`);
      } else {
        console.log('Previous cache detected!');
        console.log('Restore the backup file(s) run: `cachebust --restore`');
        console.log('Backup files:', `${file}${backup}`);
        process.exit();
      }
    }
  }

  if (!cached && !shouldRestore) {
    for (let file of targetFiles) {
      if (!cached) {
        fs.copyFile(file, `${file}${backup}`, err => {
          if (err) return console.error(err);
        });
      }
    }
  }

  return cached;
}

module.exports = backupCachebust;
