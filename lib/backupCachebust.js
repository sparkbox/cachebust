const fs = require('fs');
const restore = require('./restore');

const backupCachebust = (targetFiles, shouldRestore) => {
  // Check for previous cache bust. This should only be run once
  // on a staging or prodution environment.
  let cached = false;
  for (let file of targetFiles) {
    const backup = `${file}.cache-backup`;

    if (fs.existsSync(backup)) {
      cached = true;
      if (shouldRestore) {
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
  return cached;
}

module.exports = backupCachebust;
