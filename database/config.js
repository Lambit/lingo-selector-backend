const profiles = require('../config');

const dbConfigs = {};

//Exports all the config files and generates objects containing database files
Object.keys(profiles).forEach((profile) => {
  dbConfigs[profile] = { ...profiles[profile].database };
});

module.exports = dbConfigs;
