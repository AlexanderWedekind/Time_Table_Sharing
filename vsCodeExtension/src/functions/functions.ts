import * as vscode from 'vscode';
import { vars } from '../vars/vars';

//let currentDocUri: vscode.Uri | undefined;

//({currentDocUri} = vars.vars());

function targetCurrentDoc(){
    vars.currentDocUri = vscode.window.activeTextEditor?.document.uri;
};

function giveCurrentDocUri(): string {
    if(vars.currentDocUri != undefined){
        return vars.currentDocUri.toString();
    }else{
        return "undefined";
    }
};


// function giveCurrentDocUri(): vscode.Uri | undefined{
//     return vars.currentDocUri;
// }


export{
    targetCurrentDoc,
    giveCurrentDocUri
}