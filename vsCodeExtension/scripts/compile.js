const cp = require('child_process');

try{
    cp.execSync('tsc  --pretty', {stdio: 'inherit'});
}catch(err){
    console.warn('-- Type errors detected by TS; Continuing build process... --');
}


