const fs = require('fs');
const path = require('path');
const { profileFolder } = require('./src/shared/folderPath');

//Loop over file directory and clean files in it
const files = fs.readdirSync(profileFolder);
for (const file of files) {
  fs.unlinkSync(path.join(profileFolder, file));
}
