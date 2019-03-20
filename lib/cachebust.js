const finger = require('fingerprinting');
const fs = require('fs');
const path = require('path');
const replace = require('replace-in-file');
const backup = require('./backupCachebust');

const cachebust = async (sourceFiles, targetFiles, willBackup = true) => {
  let from = [];
  let to = [];
  let err = false;

  invalidSource = sourceFiles.filter( f => {
    return !fs.existsSync(f);
  });

  if(invalidSource.length) {
    console.log(invalidSource.join(','), ' source files do not exist!');
    err = true;
  }

  invalidTarget = targetFiles.filter( f => {
    return !fs.existsSync(f);
  });

  if(invalidTarget.length) {
    console.log(invalidTarget.join(','), ' target files do not exist!');
    err = true;
  }

  if(err) process.exit();

  // Sort the files and then reverse the order.
  sourceFiles.sort().reverse(); // Fixes issue #5

  for (let file of sourceFiles) {
    const fileName = path.parse(file).name;
    const print = finger(file, { format: `${fileName}-{hash}.{ext}` });
    const target = `${path.dirname(file)}/${print.file}`;

    await fs.copyFileSync(file, target);

    console.log('fingerprinted:', file, target);

    from.push(path.basename(file));
    to.push(path.basename(target));
  }

  if (from.length) {
    replace({
      files: targetFiles,
      from,
      to
    });

  if (willBackup) {
    backup.create(targetFiles, from, to);
  } else {
    console.log('No manifest generated! I hope you know what you are doing...');
  }
  console.log(`${targetFiles.length} target files updated`);

  } else {
    console.log('Failed to write cache files');
    backup.restore();
    process.exit();
  }
}

module.exports = cachebust;
