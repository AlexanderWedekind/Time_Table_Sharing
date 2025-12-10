import * as vscode from 'vscode';
import * as path from 'path';
import { Type } from 'typescript';

//type DocumentSegmentList = new Type

type Range = {
    start: {
        line: number,
        char: number
    },
    end: {
        line: number,
        char: number
    }
}

type SnippetType = "typescript" | "cSharp";

type Vars = typeof vars;

type Segment = typeof vars.textSnippet;

type SegmentListNode = null | TextSnippet;

class TextSnippet {
        type: SnippetType
        range: Range
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

        constructor(type: SnippetType, range: Range){
            //if(type == "typescript"){
                this.type = type;
                this.range = range;
                this.uri = (() => {
                    let count = 0;
                    vars.documentSegmentList.forEachSegmentNode(
                        (segment: TextSnippet) => {
                            if(segment.type == "typescript"){
                                count ++;
                            }
                        }
                    );
                    return `file:///${count}.ts`;
                })();
                this.didOpen = false;
                this.didChange = false;
                this.languageId = "typescript";
                this.version = 1;
                this.text = (() => {
                    let text = "";
                    let lineIndex = this.range.start.line;
                    do{
                        if(this.range.start.line == this.range.end.line){
                            text = `${vars.currentText[lineIndex].text.substring(this.range.start.char, this.range.end.char)}`;
                        }else if(lineIndex == this.range.start.line){
                            text = `${text}${vars.currentText[lineIndex].text.substring(this.range.start.char)}`;
                        }else if(lineIndex == this.range.end.line){
                            text = `${text}${vars.currentText[lineIndex].text.substring(0, this.range.end.char)}`;
                        }else if(lineIndex > this.range.start.line && lineIndex < this.range.end.line){
                            text = `${text}${vars.currentText[lineIndex]}`;
                        }
                        lineIndex ++;
                    }while(lineIndex != this.range.end.line + 1); 
                    return text;
                })();
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
            // }else if(type == "cSharp"){
            //     this.type = type;
            //     this.range = range;
            // }
        }
    }

const vars = {

    currentTargetDoc: undefined as vscode.TextDocument | undefined,

    currentText: [] as vscode.TextLine[],
    
    tsServerPath: path.join(
        __dirname,
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

    snippetType: {
        typescript: "typescript",
        cSharp: "c-sharp"
    },
    
    documentSegmentList: {
        head: null as null | TextSnippet,
        addSegment: (newSegment: TextSnippet) => {
            let lastSegment = vars.documentSegmentList.getLastSegment();
            if(lastSegment != null){
                lastSegment.next = newSegment;
            }else{
                vars.documentSegmentList.head = newSegment;
            }
            
        },
        getSegments: (value: any) => {
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
            
        },
        forEachSegmentNode: (doThis: Function) => {
            let currentSegment = vars.documentSegmentList.head;
            while(currentSegment != null){
                doThis(currentSegment);
                currentSegment = currentSegment.next;
            };
        },
        getLastSegment: () => {
            let currentSegment = vars.documentSegmentList.head;
            if(currentSegment != null){
                while(currentSegment.next != null){
                    currentSegment = currentSegment.next;
                }
            }
            return currentSegment;
        }
    },

    textSnippet: TextSnippet, 

};



export {
    vars
}
    
