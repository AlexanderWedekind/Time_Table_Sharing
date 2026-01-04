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

function getTextLineRange(textLine: vscode.TextLine){
    return textLine.range
}

function getTextFromRange(range: vscode.Range): string{
    let text = "";
    if(vars.currentTargetDoc != undefined){
        text = vars.currentTargetDoc.getText(range);
    }
    return text;
}

function identifySnippets(){
    vars.currentText.forEach(textLine => {
        if(textLine.isEmptyOrWhitespace == false){
            let text = textLine.text;
            if(text.includes('""""')){
                write(output("Snippet Boundary Found",
                    `line:\n
                    ${text}\n
                    lineNr:\n
                    ${textLine.lineNumber}\n
                    snippet boundary index:\n
                    ${text.indexOf('""""')}\n
                    boundary string:\n
                    ${text.substring(text.indexOf('""""'), text.indexOf('""""') + 4)}`
                ));
                if(vars.documentSegmentList.head == null){
                    let range = new vscode.Range(
                        new vscode.Position(0, 0),
                        new vscode.Position(textLine.lineNumber, text.indexOf('""""'))
                    );
                    vars.documentSegmentList.head = new vars.textSnippet(vars.snippetType.cSharp, range);
                }
            }
        }
    });
}


export{
    getTextLineRange,
    targetCurrentDoc,
    giveCurrentDocUri,
    refreshCurrentText,
    identifySnippets,
    getTextFromRange
}