const fs = require('fs');

const restore = async (file, backup) => {
  await fs.unlinkSync(file);
  await fs.renameSync(backup, file);
  console.log('Backup restored: ', file);
}

module.exports = restore;
