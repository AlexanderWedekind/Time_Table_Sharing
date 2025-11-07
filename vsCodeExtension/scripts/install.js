const cp = require('child_process');
const v = require('../package.json').version;
const name = require('../package.json').name;

cp.execSync(`code --install-extension ./dist/${name}-${v}.vsix`, {stdio: "inherit"});