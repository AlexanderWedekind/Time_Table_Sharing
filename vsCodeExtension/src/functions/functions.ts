import * as vscode from 'vscode';
import { vars } from '../vars/vars';


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

export{
    targetCurrentDoc,
    giveCurrentDocUri
}