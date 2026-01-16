import * as vscode from 'vscode';
import { vars,
    SnippetType,
    TextSnippet,
    SnippetRange,
    BoundaryString,
    BoundaryStringsArray,
    DocumentSegmentList,
    TargetedDoc
} from '../vars/vars';
import { write, output } from '../setupLogic/createTerminal';


// function targetCurrentDoc(): void{
//     let doc = vscode.window.activeTextEditor?.document;
//     if(doc != undefined){
//         vars.currentTargetDoc = doc;
//     } 
// };

// function giveCurrentDocUri(): string {
//     if(vars.currentTargetDoc != undefined){
//         return vars.currentTargetDoc.uri.toString();
//     }else{
//         return "undefined";
//     }
// };

function getCurrentText(doc: vscode.TextDocument): vscode.TextLine[] {
    let returnArray: vscode.TextLine[] = [];
    for(let i = 0; i < doc.lineCount; i++){
        returnArray.push(doc.lineAt(i))
    }
    return returnArray;
}

// function refreshCurrentText(): void{
//     let doc = vscode.window.activeTextEditor?.document;
//     if(doc == undefined){
//         write(output("PROBLEM -> 'refreshCurrentText()'",
//             `active document's doc is undefined\n
//             active editor: ${JSON.stringify(vscode.window.activeTextEditor)}\n
//             active doc: ${JSON.stringify(vscode.window.activeTextEditor?.document)}`
//         ))
//     }else if(giveCurrentDocUri() == "undefined"){
//         write(output("PROBLEM -> 'refreshCurrentText'",
//             `'vars.currentTargetDoc.uri' is undefined\n
//             active editor: ${JSON.stringify(vscode.window.activeTextEditor)}\n
//             active doc: ${JSON.stringify(vscode.window.activeTextEditor?.document)}`
//         ))
//     }else if(doc.uri.toString() != giveCurrentDocUri()){
//         write(output("INFO/PROBLEM -> 'refreshCurrentText'",
//             `active document's doc does not match the current target doc\n
//             active doc: ${JSON.stringify(vscode.window.activeTextEditor?.document)}\n
//             target doc uri: ${giveCurrentDocUri()}`
//         ))
//     }else if(doc.uri.toString() == giveCurrentDocUri()){
//         targetCurrentDoc();
//         let linecount = vars.currentTargetDoc?.lineCount;
//         vars.currentText = [];
//         for(let i: number = 0; i < linecount!; i ++){
//             vars.currentText.push(vars.currentTargetDoc!.lineAt(i))
//         }
//         write(output("INFO -> 'refreshCurrentText'",
//             `refreshed 'vars.currentText',\n
//             from: ${giveCurrentDocUri()}`
//         ))
//     }
// };

export function findWorkspaceTargetDocs(){
    vscode.workspace.textDocuments.forEach((textDocument) => {
        write(output(
            `${textDocument.fileName}`,
            `${textDocument.fileName.substring(textDocument.fileName.length - 3)}`
        ))
        if(textDocument.fileName.substring(textDocument.fileName.length - 3) == '.cs'){
            vars.workspaceTargetDocsCollection.push(new TargetedDoc(textDocument));
        };
        write(output(
            "workspaceTargetDocsCollection elements",
            `${(() => {
                let returnString: string = "";
                vars.workspaceTargetDocsCollection.forEach((doc: TargetedDoc) => {
                    if(returnString.length > 0){
                        returnString += `\n${doc.textDocument.fileName}`
                    }else{
                        returnString += `${doc.textDocument.fileName}`
                    }
                })
                return returnString
            })()}`
        ))
    });
}

function updateTargetDocText(doc: TargetedDoc){
    vars.workspaceTargetDocsCollection[doc.index].currentText = getCurrentText(doc.textDocument); 
}

function clearAllWorkspaceTargetDocs(){
    vars.workspaceTargetDocsCollection = []
}

export function getTextFromRange(doc: TargetedDoc, range: vscode.Range): string{
    let text = "";
    text = doc.textDocument.getText(range);
    return text;
}

function getDocRangeFromSnippetDiagnostic(snippetRange: vscode.Range, diagnosticRange: vscode.Range): vscode.Range{
    let returnRange = new SnippetRange();
    returnRange.start.line = snippetRange.start.line + diagnosticRange.start.line;
    if(diagnosticRange.start.line == 0){
        returnRange.start.character = snippetRange.start.character + diagnosticRange.start.character;
    }else{
        returnRange.start.character = diagnosticRange.start.character;
    }
    returnRange.end.line = snippetRange.start.line + diagnosticRange.end.line;
    if(diagnosticRange.end.line == 0){
        returnRange.end.character = snippetRange.start.character + diagnosticRange.end.character;
    }else{
        returnRange.end.character = diagnosticRange.end.character;
    }
    return new vscode.Range(
        new vscode.Position(returnRange.start.line, returnRange.start.character),
        new vscode.Position(returnRange.end.line, returnRange.end.character)
    );
}

function clearDocumentSegmentList(doc: TargetedDoc){
    vars.workspaceTargetDocsCollection[doc.index].documentSegmentList = new DocumentSegmentList();
}

function createModelForDoc(doc: TargetedDoc){
    let previousSnippetType: SnippetType = "cSharp";
    let snippetBoundariesFound = 0;
    let currentSnippetRange = new SnippetRange();
    //clearDocumentSegmentList();
    clearDocumentSegmentList(doc);
    //refreshCurrentText();
    updateTargetDocText(doc);
    //vars.currentText.forEach((textLine) => {
    vars.workspaceTargetDocsCollection[doc.index].currentText.forEach((textLine) => {
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
                            vars.workspaceTargetDocsCollection[doc.index].documentSegmentList.addSegment(new TextSnippet(doc, previousSnippetType, textSnippetRange));
                            currentSnippetRange.start.line = vars.workspaceTargetDocsCollection[doc.index].documentSegmentList.getLastSegment()?.range.end.line;
                            currentSnippetRange.start.character = vars.workspaceTargetDocsCollection[doc.index].documentSegmentList.getLastSegment()?.range.end.character;
                            currentSnippetRange.end.line = boundaryRange.start.line;
                            currentSnippetRange.end.character = boundaryRange.start.character;
                            textSnippetRange = new vscode.Range(
                                new vscode.Position(currentSnippetRange.start.line!, currentSnippetRange.start.character!),
                                new vscode.Position(currentSnippetRange.end.line!, currentSnippetRange.end.character!)
                            )
                            previousSnippetType = vars.snippetType.typescript;
                            vars.workspaceTargetDocsCollection[doc.index].documentSegmentList.addSegment(new TextSnippet(doc, previousSnippetType, textSnippetRange));
                            break;
                        default:
                            if(previousSnippetType == vars.snippetType.typescript){
                                if((snippetBoundariesFound % 2) == 1){
                                    currentSnippetRange.start.line = vars.workspaceTargetDocsCollection[doc.index].documentSegmentList.getLastSegment()?.range.end.line;
                                    currentSnippetRange.start.character = vars.workspaceTargetDocsCollection[doc.index].documentSegmentList.getLastSegment()?.range.end.character;
                                    currentSnippetRange.end.line = boundaryRange.end.line;
                                    currentSnippetRange.end.character = boundaryRange.end.character;
                                };
                                if((snippetBoundariesFound % 2) == 0){
                                    previousSnippetType = vars.snippetType.cSharp;
                                    let textSnippetRange = new vscode.Range(
                                        new vscode.Position(currentSnippetRange.start.line!, currentSnippetRange.start.character!),
                                        new vscode.Position(currentSnippetRange.end.line!, currentSnippetRange.end.character!)
                                    );
                                    vars.workspaceTargetDocsCollection[doc.index].documentSegmentList.addSegment(new TextSnippet(doc, previousSnippetType, textSnippetRange));
                                    currentSnippetRange.start.line = vars.workspaceTargetDocsCollection[doc.index].documentSegmentList.getLastSegment()?.range.end.line;
                                    currentSnippetRange.start.character = vars.workspaceTargetDocsCollection[doc.index].documentSegmentList.getLastSegment()?.range.end.character;
                                    currentSnippetRange.end.line = boundaryRange.start.line;
                                    currentSnippetRange.end.character = boundaryRange.start.character;
                                    previousSnippetType = vars.snippetType.typescript;
                                    textSnippetRange = new vscode.Range(
                                        new vscode.Position(currentSnippetRange.start.line!, currentSnippetRange.start.character!),
                                        new vscode.Position(currentSnippetRange.end.line!, currentSnippetRange.end.character!)
                                    );
                                    vars.workspaceTargetDocsCollection[doc.index].documentSegmentList.addSegment(new TextSnippet(doc, previousSnippetType, textSnippetRange));
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
        currentSnippetRange.end.line = vars.workspaceTargetDocsCollection[doc.index].textDocument.lineCount - 1;
        currentSnippetRange.end.character = vars.workspaceTargetDocsCollection[doc.index].textDocument.lineAt(vars.workspaceTargetDocsCollection[doc.index].textDocument.lineCount - 1).text.length;
        let textSnippetRange = new vscode.Range(
            new vscode.Position(currentSnippetRange.start.line!, currentSnippetRange.start.character!),
            new vscode.Position(currentSnippetRange.end.line!, currentSnippetRange.end.character!)
        );
        vars.workspaceTargetDocsCollection[doc.index].documentSegmentList.addSegment(new TextSnippet(doc, vars.snippetType.cSharp, textSnippetRange))
    }else{
        let currentSnippetRange = new SnippetRange();
        currentSnippetRange.start.line = vars.workspaceTargetDocsCollection[doc.index].documentSegmentList.getLastSegment()!.range.end.line;
        currentSnippetRange.start.character = vars.workspaceTargetDocsCollection[doc.index].documentSegmentList.getLastSegment()!.range.end.character;
        currentSnippetRange.end.line = vars.workspaceTargetDocsCollection[doc.index].textDocument.lineCount - 1;
        currentSnippetRange.end.character = vars.workspaceTargetDocsCollection[doc.index].textDocument.lineAt(vars.workspaceTargetDocsCollection[doc.index].textDocument.lineCount - 1).text.length;
        let textSnippetRange = new vscode.Range(
            new vscode.Position(currentSnippetRange.start.line!, currentSnippetRange.start.character!),
            new vscode.Position(currentSnippetRange.end.line!, currentSnippetRange.end.character!)
        );
        vars.workspaceTargetDocsCollection[doc.index].documentSegmentList.addSegment(new TextSnippet(doc, vars.snippetType.cSharp, textSnippetRange))
    }
}

function createModelForAllDocs(){
    vars.workspaceTargetDocsCollection.forEach((doc: TargetedDoc) => {
        createModelForDoc(doc);
    })    
}

function clearAllDocumentSegmentLists(){
    vars.workspaceTargetDocsCollection.forEach((doc: TargetedDoc) => {
        clearDocumentSegmentList(doc)
    })
}

function sendDidOpen(textSnippet: TextSnippet){
    vars.connection?.sendNotification("textDocument/didOpen", textSnippet.sendDidOpen())
}

function openAllTSServerDocs(){
    vars.workspaceTargetDocsCollection.forEach((doc: TargetedDoc) => {
        doc.documentSegmentList.forEachSegmentNode((textSnippet: TextSnippet) => {
            if(textSnippet.type == vars.snippetType.typescript){
                sendDidOpen(textSnippet)
            }
        })
    })
}

function openAllTargetDocTsServerDocs(doc: TargetedDoc){
    vars.workspaceTargetDocsCollection[doc.index].documentSegmentList.forEachSegmentNode((textSnippet: TextSnippet) => {
        if(textSnippet.type == vars.snippetType.typescript){
            sendDidOpen(textSnippet)
        }
    })
}

function openAllCsharpServerDocs(){
    vars.workspaceTargetDocsCollection.forEach((doc: TargetedDoc) => {
        vars.workspaceTargetDocsCollection[doc.index].documentSegmentList.forEachSegmentNode((textSnippet: TextSnippet) => {
            if(textSnippet.type == vars.snippetType.cSharp){
                // if choosing to implement, this will be like what 'sendDidOpen(textSnippet:TextSnippet)' is for ts snippets, but for c# snippets and a c# language server
            }
        })
    })
}

function closeServerDoc(textSnippet: TextSnippet){
    vars.connection?.sendNotification("textDocument/didClose", textSnippet.sendDidClose())
}

function closeAllTsServerDocs(){
    vars.workspaceTargetDocsCollection.forEach((doc: TargetedDoc) => {
        vars.workspaceTargetDocsCollection[doc.index].documentSegmentList.forEachSegmentNode((textSnippet: TextSnippet) => {
            if(textSnippet.type == vars.snippetType.typescript){
                closeServerDoc(textSnippet)
            }
        })
    })
}

function closeAllCsharpServerDocs(){
    vars.workspaceTargetDocsCollection.forEach((doc: TargetedDoc) => {
        vars.workspaceTargetDocsCollection[doc.index].documentSegmentList.forEachSegmentNode((textSnippet: TextSnippet) => {
            // if choosing to implement, this will be like what 'closeServerDoc(textSnippet: TextSnippet)' is for ts snippets, but for c# snippets and a c# language server
        })
    })
}

function closeTargetDocAllTsServerDocs(doc: TargetedDoc){
    vars.workspaceTargetDocsCollection[doc.index].documentSegmentList.forEachSegmentNode((textSnippet: TextSnippet) => {
        if(textSnippet.type == vars.snippetType.typescript){
            closeServerDoc(textSnippet)
        }
    })
}

function closeTargetDocAllCsharpServerDocs(doc: TargetedDoc){
    vars.workspaceTargetDocsCollection[doc.index].documentSegmentList.forEachSegmentNode((textSnippet: TextSnippet) => {
        if(textSnippet.type == vars.snippetType.cSharp){
            // if choosing to implement, this will be like what 'closeServerDoc(textSnippet: TextSnippet)' is for ts snippets, but for c# snippets and a c# language server
        }
    })
}

// function identifySnippets(){
//     refreshCurrentText();
//     vars.currentText.forEach(textLine => {
//         if(textLine.isEmptyOrWhitespace == false){
//             let text = textLine.text;
//             if(text.includes('""""')){
//                 write(output("Snippet Boundary Found",
//                     `line:\n
//                     ${text}\n
//                     lineNr:\n
//                     ${textLine.lineNumber}\n
//                     snippet boundary index:\n
//                     ${text.indexOf('""""')}\n
//                     boundary string:\n
//                     ${text.substring(text.indexOf('""""'), text.indexOf('""""') + 4)}`
//                 ));
//                 if(vars.documentSegmentList.head == null){
//                     let range = new vscode.Range(
//                         new vscode.Position(0, 0),
//                         new vscode.Position(textLine.lineNumber, text.indexOf('""""'))
//                     );
//                     vars.documentSegmentList.head = new TextSnippet(vars.snippetType.cSharp, range);
//                 }
//             }
//         }
//     });
// }



export function displayDiagnosticOnServerPublish(){
    // result:{
    //     "uri":"file:///0.ts",
    //     "diagnostics":[
    //         {
    //             "range":{
    //                 "start":{
    //                     "line":0,
    //                     "character":1
    //                 },
    //                 "end":{
    //                     "line":0,
    //                     "character":2
    //                 }
    //             },
    //             "message":"Unexpected keyword or identifier.",
    //             "severity":1,
    //             "code":1434,
    //             "source":"typescript"
    //         },
    //         {
    //             "range":{
    //                 "start":{
    //                     "line":0,
    //                     "character":1
    //                 },
    //                 "end":{
    //                     "line":0,
    //                     "character":2
    //                 }
    //             },
    //             "message":"Cannot find name 'a'.",
    //             "severity":1,
    //             "code":2304,
    //             "source":"typescript"
    //         },
    //         {
    //             "range":{
    //                 "start":{
    //                     "line":0,
    //                     "character":3
    //                 },
    //                 "end":{
    //                     "line":0,
    //                     "character":10
    //                 }
    //             },
    //             "message":"Cannot find name 'snippet'.",
    //             "severity":1,
    //             "code":2304,
    //             "source":"typescript"
    //         }
    //     ]
    // }
    
    vars.connection?.onNotification("textDocument/publishDiagnostics", (result) => {
        write(output(
            "connection.onNotification -> publishDiagnostics",
            `result:\n${JSON.stringify(result)}`
        ))
        let docUri: string = result.uri;
        let docIndex = Number.parseInt(docUri.substring(docUri.lastIndexOf('/') + 1, docUri.indexOf('-')));
        let snippetRange: vscode.Range = (() => {
            let returnRange: undefined | vscode.Range = undefined;
            let count = 0;
            vars.workspaceTargetDocsCollection[docIndex].documentSegmentList.forEachSegmentNode((segment: TextSnippet) => {
                count ++;
                write(output(`snippet: ${count}`,
                    `type: ${segment.type}
                    range: ${segment.range}
                    uri: ${segment.uri}
                    result uri: ${result.uri}
                    `
                ))
                if(segment.uri == result.uri){
                    write(output(
                        "--> Match! <--",
                        `returnRange: ${returnRange}
                        assigning returnRange...
                        ${(() => {
                            returnRange = segment.range;
                            return "done."
                        })()}
                        returnRange: ${returnRange}`
                    ))
                    
                }
            })
            if(returnRange == undefined){
                returnRange = new vscode.Range(new vscode.Position(0, 0), new vscode.Position(0, 0));
                write(output(
                    "Connection.onNotification -> find diagnostic parent snippet",
                    `unable to find Textsnippet with uri: '${result.uri}\nimproper range was set!`
                ))
            }
            return returnRange!;
        })();
        write(output(
            "snippetRange",
            `${JSON.stringify(snippetRange)}`
        ))
        let diagnostics: vscode.Diagnostic[] = [];
        result.diagnostics.forEach((diagnostic: vscode.Diagnostic) => {
                write(output("diag", `${JSON.stringify(diagnostic)}`));
                write(output("diagnostic range", `${JSON.stringify(diagnostic.range)}`));
                diagnostic.range = getDocRangeFromSnippetDiagnostic(snippetRange, diagnostic.range);
                write(output("recalculated range", `${JSON.stringify(diagnostic.range)}`));
                diagnostic.source = `Embedded ts in c#, snippet-uri: '${result.uri}`;
                write(output("new diag", `${JSON.stringify(diagnostic)}`));
                diagnostics.push(diagnostic);
            }
        );
        vars.diagnosticCollection?.set(vars.workspaceTargetDocsCollection[docIndex].textDocument.uri, diagnostics);
    })
}

export function renewDiagnosticsAtDocumentChange(){
    vscode.workspace.onDidChangeTextDocument((changeEvent: vscode.TextDocumentChangeEvent) => {
        vars.workspaceTargetDocsCollection.forEach((doc: TargetedDoc) => {
            if(changeEvent.document.uri == doc.textDocument.uri){
                closeTargetDocAllTsServerDocs(doc);
                clearDocumentSegmentList(doc);
                createModelForDoc(doc);
                openAllTargetDocTsServerDocs(doc)
            }
        })
    })
}

export function atStartupFirstDocFindSnippetExtractionDiagnosticPublishSequence(){
    findWorkspaceTargetDocs();
    createModelForAllDocs();
    openAllTSServerDocs();
}


