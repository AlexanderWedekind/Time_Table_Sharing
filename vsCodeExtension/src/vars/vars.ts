import * as vscode from 'vscode';
import * as path from 'path';
import * as childProcess from 'child_process';
import * as jsonRpc from 'vscode-jsonrpc/node';
import * as functions from '../functions/functions';
import { Type } from 'typescript';
import { write, output } from '../setupLogic/createTerminal';

class SnippetRange {
    start: {
        line: number | undefined,
        character: number | undefined
    }
    end: {
        line: number | undefined,
        character: number | undefined
    }
    constructor(){
        this.start = {
            line: undefined,
            character: undefined
        };
        this.end = {
            line: undefined,
            character: undefined
        }
    }
}

class BoundaryString {
    range: SnippetRange
    constructor(range: SnippetRange){
        this.range = range;
    }
}

class TargetedDoc {
    textDocument: vscode.TextDocument
    index: number
    documentSegmentList: DocumentSegmentList
    currentText: vscode.TextLine[]
    constructor(doc: vscode.TextDocument){
        this.textDocument = doc;
        this.index = vars.workspaceTargetDocsCollection.length;
        this.currentText = [];
        this.documentSegmentList = new DocumentSegmentList()
    }
}

type BoundaryStringsArray = Array<BoundaryString>;

type SnippetType = "typescript" | "cSharp";

type Vars = typeof vars;

type Segment = typeof vars.textSnippet;

type SegmentListNode = null | TextSnippet;

class DocumentSegmentList {
    head: null | TextSnippet
    addSegment
    getSegments
    forEachSegmentNode
    getLastSegment
    constructor(){
        this.head = null as null | TextSnippet;
        this.addSegment = (newSegment: TextSnippet) => {
            let lastSegment = vars.documentSegmentList.getLastSegment();
            if(lastSegment != null){
                lastSegment.next = newSegment;
            }else{
                vars.documentSegmentList.head = newSegment;
            }
        };
        this.getSegments = (value: any) => {
            let segments = [];
            let currentSegmentNode = vars.documentSegmentList.head;
            while(currentSegmentNode != null){
                if(currentSegmentNode.propertyEquals != undefined){
                    if(currentSegmentNode.propertyEquals(value) == true){
                    segments.push(currentSegmentNode);
                    }
                }
                if(currentSegmentNode.next != null){
                    currentSegmentNode = currentSegmentNode.next
                }

            };
            return segments;
        };
        this.forEachSegmentNode = (doThis: Function) => {
            let currentSegment = vars.documentSegmentList.head;
            while(currentSegment != null){
                doThis(currentSegment);
                currentSegment = currentSegment.next;
            };
        };
        this.getLastSegment = () => {
            let currentSegment = vars.documentSegmentList.head;
            if(currentSegment != null){
                while(currentSegment.next != null){
                    currentSegment = currentSegment.next;
                }
            }
            return currentSegment;
        }
    }
    
}

class TextSnippet {
        type: SnippetType
        range: vscode.Range
        uri: string
        didOpen: boolean
        didChange: boolean
        languageId: string
        version: number
        text: string
        next: TextSnippet | null
        previous: TextSnippet | null
        sendDidOpen: Function
        sendDidChange: Function
        sendDidClose: Function
        propertyEquals: Function

        constructor(doc: TargetedDoc, type: SnippetType, range: vscode.Range){
            //if(type == "typescript"){
                this.type = type;
                this.range = range;
                this.uri = (() => {
                    let count = 0;
                    let extension = "";
                    if(this.type == vars.snippetType.cSharp){
                        extension = "cs";
                    }else{
                        extension = "ts";
                    }
                    vars.documentSegmentList.forEachSegmentNode(
                        (segment: TextSnippet) => {
                            count ++;
                        }
                    );
                    return `file:///${doc.index}-${count}.${extension}`;
                })();
                this.didOpen = false;
                this.didChange = false;
                this.languageId = (() => {
                    let returnString = "";
                    if(this.type == "typescript"){
                        returnString = "typescript";
                    }else{
                        returnString = "cSharp";
                    }
                    return returnString;
                })();
                this.version = 1;
                this.text = functions.getTextFromRange(doc, range)//(() => {
                //     let text = "";
                //     let lineIndex = this.range.start.line;
                //     do{
                //         if(this.range.start.line == this.range.end.line){
                //             text = `${vars.currentText[lineIndex].text.substring(this.range.start.char, this.range.end.char)}`;
                //         }else if(lineIndex == this.range.start.line){
                //             text = `${text}${vars.currentText[lineIndex].text.substring(this.range.start.char)}`;
                //         }else if(lineIndex == this.range.end.line){
                //             text = `${text}${vars.currentText[lineIndex].text.substring(0, this.range.end.char)}`;
                //         }else if(lineIndex > this.range.start.line && lineIndex < this.range.end.line){
                //             text = `${text}${vars.currentText[lineIndex]}`;
                //         }
                //         lineIndex ++;
                //     }while(lineIndex != this.range.end.line + 1); 
                //     return text;
                // })();
                this.next = null;
                this.previous = null;
                this.sendDidOpen = () => {
                    this.didOpen = true;
                    return {
                        textDocument: {
                            uri: this.uri,
                            languageId: this.languageId,
                            version: this.version,
                            text: this.text
                        }
                    };
                };
                this.sendDidChange = () => {
                    this.version += 1;
                    return {
                        textDocument: {
                            uri: this.uri,
                            version: this.version
                        },
                        contentChanges: [
                            {
                                text: this.text
                            }
                        ]
                    }
                };
                this.sendDidClose = () => {
                    return {
                        textDocument: {
                            uri: this.uri
                        }
                    };
                };
                this.propertyEquals = (value: any) => {
                    let property = [this.type, this.range, this.uri, this.didOpen, this.didChange, this.languageId, this.version, this.text, this.next, this.previous];
                    let propertyFound = false;
                    property.forEach(
                        (element) => {
                            if(element == value){
                                propertyFound = true;
                            }
                        }
                    );
                    return propertyFound;
                }
        }
    }

const vars = {

    languageServer: null as childProcess.ChildProcess | null,

    connection: null as jsonRpc.MessageConnection | null,

    //currentTargetDoc: undefined as vscode.TextDocument | undefined,

    workspaceTargetDocsCollection: [] as TargetedDoc[],

    //currentText: [] as vscode.TextLine[],
    
    tsLanguageServerPath: path.join(
        __dirname,
        "..",
        "..",
        "node_modules",
        "typescript-language-server",
        "lib",
        "cli.mjs"
    ),

    cSharpServerPath: path.join(
        __dirname,
        "ms-dotnettools.csharp-2.84.19-win32-x64",
        ".roslyn",
        "Microsoft.CodeAnalysis.LanguageServer"
    ),

    languageServerInitializationParams: {
        processId: process.pid,
        rootUri: null,
        capabilities: {
            textDocument: {
                publishDiagnostics: {},
                hover: {},
                completion: {
                    completionItem: {
                        snippetSupport: true
                    }
                },
                signatureHelp: {},
                documentHighlight: {},
                documentSymbol: {},
                formatting: {},
                onTypeFormatting: {},
                definition: {},
                references: {}
            }
        },
        initializationOptions: {},
        workspaceFolders: null,
        trace: "off"
    },

    diagnosticCollection: undefined as undefined | vscode.DiagnosticCollection,

    snippetType: {
        typescript: "typescript",
        cSharp: "cSharp"
    }as const,

    documentSegmentList: new DocumentSegmentList(),
    
    // documentSegmentList: {
    //     head: null as null | TextSnippet,
    //     addSegment: (newSegment: TextSnippet) => {
    //         let lastSegment = vars.documentSegmentList.getLastSegment();
    //         if(lastSegment != null){
    //             lastSegment.next = newSegment;
    //         }else{
    //             vars.documentSegmentList.head = newSegment;
    //         }
            
    //     },
    //     getSegments: (value: any) => {
    //         let segments = [];
    //         let currentSegmentNode = vars.documentSegmentList.head;
    //         while(currentSegmentNode != null){
    //             if(currentSegmentNode.propertyEquals != undefined){
    //                 if(currentSegmentNode.propertyEquals(value) == true){
    //                 segments.push(currentSegmentNode);
    //                 }
    //             }
    //             if(currentSegmentNode.next != null){
    //                 currentSegmentNode = currentSegmentNode.next
    //             }

    //         };
            
    //             return segments;
            
    //     },
    //     forEachSegmentNode: (doThis: Function) => {
    //         let currentSegment = vars.documentSegmentList.head;
    //         while(currentSegment != null){
    //             doThis(currentSegment);
    //             currentSegment = currentSegment.next;
    //         };
    //     },
    //     getLastSegment: () => {
    //         let currentSegment = vars.documentSegmentList.head;
    //         if(currentSegment != null){
    //             while(currentSegment.next != null){
    //                 currentSegment = currentSegment.next;
    //             }
    //         }
    //         return currentSegment;
    //     }
    // },

    textSnippet: TextSnippet, 

};



export {
    vars,
    SnippetType,
    TextSnippet,
    SnippetRange,
    BoundaryString,
    BoundaryStringsArray,
    DocumentSegmentList,
    TargetedDoc
}
    
