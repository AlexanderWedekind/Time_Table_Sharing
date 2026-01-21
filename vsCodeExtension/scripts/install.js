const cp = require('child_process');
const v = require('../package.json').version;
const name = require('../package.json').name;

try{
    cp.execSync(`codium --install-extension ./dist/${name}-${v}.vsix`, {stdio: "inherit"});
}catch{
    cp.execSync(`code --install-extension ./dist/${name}-${v}.vsix`, {stdio: "inherit"});
}
