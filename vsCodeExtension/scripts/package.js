const path = require('path');
const stripAnsi = require('strip-ansi').default;
const cp = require('child_process');
const fs = require('fs');
const v = require('../package.json').version;
const name = require('../package.json').name;

const outputPath = path.resolve(__dirname, '../dist/');

if(fs.existsSync(outputPath) == false){
    fs.mkdir(outputPath, () => {
    });
}

const packageProcess = cp.spawn("vsce", ["package", "--out", "./dist"], {shell: true});

let consoleMessages = [];

const questionNoRepo = "A 'repository' field is missing from the 'package.json' manifest file.\nDo you want to continue? [y/N]";
const splitQuestionNoRepo = questionNoRepo.split(/\n/);

const questionNoLicense = "LICENSE.md, LICENSE.txt or LICENSE not found\nDo you want to continue? [y/N]";
const splitQuestionNoLicense = questionNoLicense.split(/\n/);

function autoAnswer(){
    let match = false;
    for(let i = 0; i < consoleMessages.length; i++){
        if(consoleMessages[i] == questionNoLicense || consoleMessages[i] == questionNoRepo){
            match = true;
        };
        if(i >= splitQuestionNoLicense.length -1 && consoleMessages[i] == splitQuestionNoLicense[splitQuestionNoLicense.length -1]){
            match = true;
            for(let j = 0; j < splitQuestionNoLicense.length; j++){
                if(consoleMessages[i - j] != splitQuestionNoLicense[(splitQuestionNoLicense.length -1) - j]){
                    match = false;
                }
            }
        };
        if(i >= splitQuestionNoRepo.length -1 && consoleMessages[i] == splitQuestionNoRepo[splitQuestionNoRepo.length -1]){
            match = true;
            for(let j = 0; j < splitQuestionNoRepo.length; j++){
                if(consoleMessages[i - j] != splitQuestionNoRepo[(splitQuestionNoRepo.length -1) - j]){
                    match = false;
                }
            }
        };
    }
    if(match == true){
        console.log("-- Auto-answered: 'y' --");
        packageProcess.stdin.write('y\n');
    }
};

packageProcess.stderr.on('data', (data) => {
    //console.log(data.toString());
    process.stderr.write(data + '\n');
    const message = stripAnsi(data.toString()).trim().split(/\r?\n/);
    for(const line of message){
        consoleMessages.push(line);
    };
    autoAnswer();
});

packageProcess.stdout.on('data', (data) => {
    // console.log(data.toString());
    process.stdout.write(data + '\n');
    const message = stripAnsi(data.toString()).trim().split(/\r?\n/);
    for(const line of message){
        consoleMessages.push(line);
    };
    autoAnswer();
});