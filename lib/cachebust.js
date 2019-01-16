const finger = require('fingerprinting');
const fs = require('fs');
const path = require('path');
const replace = require('replace-in-file');
const backup = require('./backupCachebust');

const cachebust = async (sourceFiles, targetFiles) => {
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

  const manifest = {
    targetFiles,
    sourceFiles,
    from,
    to
  };

  backup.create(manifest);

  } else {
    console.log('Failed to write cache files');
    backup.restore();
    process.exit();
  }
}

module.exports = cachebust;
