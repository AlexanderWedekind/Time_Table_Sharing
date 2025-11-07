const cp = require('child_process');
const version = require('../package.json').version;

cp.execSync('node test', {stdio: 'inherit'});


