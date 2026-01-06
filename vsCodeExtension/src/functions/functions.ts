import * as vscode from 'vscode';
import { vars, SnippetType, TextSnippet, SnippetRange, BoundaryString, BoundaryStringsArray } from '../vars/vars';
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

// function addCSharpSegment(range: vscode.Range){
//     let newSegment: TextSnippet = 
//     vars.documentSegmentList.addSegment()
// }

function createDocumentModelAtStartup(){
    let previousSnippetType: SnippetType = "cSharp";
    let snippetBoundariesFound = 0;
    let currentSnippetRange = new SnippetRange();
    refreshCurrentText();
    vars.currentText.forEach((textLine) => {
        if(textLine.isEmptyOrWhitespace == false){
            if(textLine.text.includes('""""')){
                let currentTextLineCharacterIndex = -1;
                let boundaryStrings: BoundaryStringsArray = [];
                while(textLine.text.includes('""""', currentTextLineCharacterIndex + 1)){
                    currentTextLineCharacterIndex = textLine.text.indexOf('""""', currentTextLineCharacterIndex + 1);
                    let range = new SnippetRange();
                    range.start.line = textLine.lineNumber;
                    range.end.line = textLine.lineNumber;
                    range.start.character = currentTextLineCharacterIndex;
                    range.end.character = currentTextLineCharacterIndex + 4;
                    boundaryStrings.push(new BoundaryString(range));    
                }
                for(let i = 0; i < boundaryStrings.length; i++){
                    snippetBoundariesFound ++;
                    let boundaryRange: SnippetRange = boundaryStrings[i].range;
                    switch(snippetBoundariesFound){
                        case 1:
                            currentSnippetRange = {
                                start: {
                                    line: 0,
                                    character: 0
                                },
                                end: {
                                    line: boundaryRange.end.line,
                                    character : boundaryRange.end.character
                                }
                            }
                            break;
                        case 2:
                            let textSnippetRange = new vscode.Range(
                                new vscode.Position(currentSnippetRange.start.line!, currentSnippetRange.start.character!),
                                new vscode.Position(currentSnippetRange.end.line!, currentSnippetRange.end.character!)
                            );
                            vars.documentSegmentList.addSegment(new TextSnippet(previousSnippetType, textSnippetRange));
                            currentSnippetRange.start.line = vars.documentSegmentList.getLastSegment()?.range.end.line;
                            currentSnippetRange.start.character = vars.documentSegmentList.getLastSegment()?.range.end.character;
                            currentSnippetRange.end.line = boundaryRange.start.line;
                            currentSnippetRange.end.character = boundaryRange.start.character;
                            textSnippetRange = new vscode.Range(
                                new vscode.Position(currentSnippetRange.start.line!, currentSnippetRange.start.character!),
                                new vscode.Position(currentSnippetRange.end.line!, currentSnippetRange.end.character!)
                            )
                            previousSnippetType = vars.snippetType.typescript;
                            vars.documentSegmentList.addSegment(new TextSnippet(previousSnippetType, textSnippetRange));
                            break;
                        case (() => {if(snippetBoundariesFound < 2){return 3}})():
                            if(previousSnippetType == vars.snippetType.typescript){
                                if((snippetBoundariesFound % 2) == 1){
                                    currentSnippetRange.start.line = vars.documentSegmentList.getLastSegment()?.range.end.line;
                                    currentSnippetRange.start.character = vars.documentSegmentList.getLastSegment()?.range.end.character;
                                    currentSnippetRange.end.line = boundaryRange.end.line;
                                    currentSnippetRange.end.character = boundaryRange.end.character;
                                };
                                if((snippetBoundariesFound % 2) == 0){
                                    previousSnippetType = vars.snippetType.cSharp;
                                    let textSnippetRange = new vscode.Range(
                                        new vscode.Position(currentSnippetRange.start.line!, currentSnippetRange.start.character!),
                                        new vscode.Position(currentSnippetRange.end.line!, currentSnippetRange.end.character!)
                                    );
                                    vars.documentSegmentList.addSegment(new TextSnippet(previousSnippetType, textSnippetRange));
                                    currentSnippetRange.start.line = vars.documentSegmentList.getLastSegment()?.range.end.line;
                                    currentSnippetRange.start.character = vars.documentSegmentList.getLastSegment()?.range.end.character;
                                    currentSnippetRange.end.line = boundaryRange.start.line;
                                    currentSnippetRange.end.character = boundaryRange.start.character;
                                    previousSnippetType = vars.snippetType.typescript;
                                    textSnippetRange = new vscode.Range(
                                        new vscode.Position(currentSnippetRange.start.line!, currentSnippetRange.start.character!),
                                        new vscode.Position(currentSnippetRange.end.line!, currentSnippetRange.end.character!)
                                    );
                                    vars.documentSegmentList.addSegment(new TextSnippet(previousSnippetType, textSnippetRange));
                                }
                            }
                            break;
                    }
                }
            }
        }
    });
    if(snippetBoundariesFound < 2){
        let currentSnippetRange = new SnippetRange();
        currentSnippetRange.start.line = 0;
        currentSnippetRange.start.character = 0;
        currentSnippetRange.end.line = vars.currentTargetDoc!.lineCount - 1;
        currentSnippetRange.end.character = vars.currentTargetDoc!.lineAt(vars.currentTargetDoc!.lineCount - 1).text.length;
        let textSnippetRange = new vscode.Range(
            new vscode.Position(currentSnippetRange.start.line!, currentSnippetRange.start.character!),
            new vscode.Position(currentSnippetRange.end.line!, currentSnippetRange.end.character!)
        );
        vars.documentSegmentList.addSegment(new TextSnippet(vars.snippetType.cSharp, textSnippetRange))
    }else{
        let currentSnippetRange = new SnippetRange();
        currentSnippetRange.start.line = vars.documentSegmentList.getLastSegment()!.range.end.line;
        currentSnippetRange.start.character = vars.documentSegmentList.getLastSegment()!.range.end.character;
        currentSnippetRange.end.line = vars.currentTargetDoc!.lineCount - 1;
        currentSnippetRange.end.character = vars.currentTargetDoc!.lineAt(vars.currentTargetDoc!.lineCount - 1).text.length;
        let textSnippetRange = new vscode.Range(
            new vscode.Position(currentSnippetRange.start.line!, currentSnippetRange.start.character!),
            new vscode.Position(currentSnippetRange.end.line!, currentSnippetRange.end.character!)
        );
        vars.documentSegmentList.addSegment(new TextSnippet(vars.snippetType.cSharp, textSnippetRange))
    }
}

function identifySnippets(){
    refreshCurrentText();
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
                    vars.documentSegmentList.head = new TextSnippet(vars.snippetType.cSharp, range);
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
    getTextFromRange,
    createDocumentModelAtStartup
}