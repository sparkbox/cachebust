const finger = require('fingerprinting');
const fs = require('fs');
const path = require('path');
const replace = require('replace-in-file');

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
    const print = finger(file, { format: '{hash}.{ext}' });
    const target = `${path.dirname(file)}/${print.file}`;

    await fs.copyFileSync(file, target);

    console.log('fingerprinted:', file, target);

    from.push(path.basename(file));
    to.push(path.basename(target));
  }

  if (from.length) {
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

module.exports = cachebust;
