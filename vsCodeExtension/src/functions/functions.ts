import * as vscode from 'vscode';
import { vars } from '../vars/vars';
import { write, output } from '../setupLogic/createTerminal';


function targetCurrentDoc(): void{
    let doc = vscode.window.activeTextEditor?.document;
    if(doc != undefined){
        vars.currentTargetDoc = doc;
    } 
};

function giveCurrentDocUri(): string {
    if(vars.currentTargetDoc != undefined){
        return vars.currentTargetDoc.uri.toString();
    }else{
        return "undefined";
    }
};

function refreshCurrentText(): void{
    let doc = vscode.window.activeTextEditor?.document;
    if(doc == undefined){
        write(output("PROBLEM -> 'refreshCurrentText()'",
            `active document's doc is undefined\n
            active editor: ${JSON.stringify(vscode.window.activeTextEditor)}\n
            active doc: ${JSON.stringify(vscode.window.activeTextEditor?.document)}`
        ))
    }else if(giveCurrentDocUri() == "undefined"){
        write(output("PROBLEM -> 'refreshCurrentText'",
            `'vars.currentTargetDoc.uri' is undefined\n
            active editor: ${JSON.stringify(vscode.window.activeTextEditor)}\n
            active doc: ${JSON.stringify(vscode.window.activeTextEditor?.document)}`
        ))
    }else if(doc.uri.toString() != giveCurrentDocUri()){
        write(output("INFO/PROBLEM -> 'refreshCurrentText'",
            `active document's doc does not match the current target doc\n
            active doc: ${JSON.stringify(vscode.window.activeTextEditor?.document)}\n
            target doc uri: ${giveCurrentDocUri()}`
        ))
    }else if(doc.uri.toString() == giveCurrentDocUri()){
        targetCurrentDoc();
        let linecount = vars.currentTargetDoc?.lineCount;
        vars.currentText = [];
        for(let i: number = 0; i < linecount!; i ++){
            vars.currentText.push(vars.currentTargetDoc!.lineAt(i))
        }
        write(output("INFO -> 'refreshCurrentText'",
            `refreshed 'vars.currentText',\n
            from: ${giveCurrentDocUri()}`
        ))
    }
};


export{
    targetCurrentDoc,
    giveCurrentDocUri,
    refreshCurrentText
}