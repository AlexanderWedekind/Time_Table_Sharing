const fs = require('fs');
const path = require('path');
const name = require('../package.json').name;
const version = require('../package.json').version;

function message(description, thing){
    console.log(`\n-- ${description}: --\n  ${thing}\n-- end --`);
};

const distPath = path.resolve(__dirname, '../dist');
message('Dist path', distPath);

const distVersions = fs.readdirSync(distPath);
message('Dist directory contents', JSON.stringify(distVersions));

for(const file of distVersions){
    if(!file.includes(version)){

        try{
            fs.unlinkSync(path.resolve(distPath, file));
            message('Successful Dletion', file);
        }catch(error){
            message('Deletion Failed', error.toString());
        }
    }
}