import * as vscode from 'vscode';
import { vars } from '../vars/vars';
import { write, output } from '../setupLogic/createTerminal';


function targetCurrentDoc(): void{
    vars.currentTargetDoc = vscode.window.activeTextEditor?.document;
};

function giveCurrentDocUri(): string {
    if(vars.currentTargetDoc != undefined){
        return vars.currentTargetDoc.uri.toString();
    }else{
        return "undefined";
    }
};

function refreshCurrentText(): void{
    let uri = vscode.window.activeTextEditor?.document.uri;
    if(uri == undefined){
        write(output("PROBLEM -> 'refreshCurrentText'",
            `active document's uri is undefined\n
            active editor: ${JSON.stringify(vscode.window.activeTextEditor)}\n
            active doc: ${JSON.stringify(vscode.window.activeTextEditor?.document)}`
        ))
    }else if(vars.currentDocUri == undefined){
        write(output("PROBLEM -> 'refreshCurrentText'",
            `'vars.currentDocUri' is undefined\n
            active editor: ${JSON.stringify(vscode.window.activeTextEditor)}\n
            active doc: ${JSON.stringify(vscode.window.activeTextEditor?.document)}`
        ))
    }else if(uri.toString() != vars.currentDocUri.toString()){
        write(output("INFO/PROBLEM -> 'refreshCurrentText'",
            `active document's uri does not match the current target uri\n
            active doc uri: ${JSON.stringify(vscode.window.activeTextEditor?.document)}\n
            target doc uri: ${vars.currentDocUri.toString()}`
        ))
    }else if(uri.toString() == vars.currentDocUri.toString()){
        vars.currentTargetDoc = vscode.window.activeTextEditor?.document;
        write(output("INFO -> 'refreshCurrentText'",
            `refreshed 'vars.currentText',\n
            from: ${vars.currentDocUri.toString()}`
        ))
    }
};


export{
    targetCurrentDoc,
    giveCurrentDocUri,
    refreshCurrentText
}