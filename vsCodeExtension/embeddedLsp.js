const vscode =  require("vscode");
const childProcess = require("child_process");
const rpc = require("vscode-jsonrpc");
const path = require("path");

let myOutputs;
let currentText = [];
let newText = [];
let documentUri;



async function getCurrentText() {
    const currentText = (await vscode.window.activeTextEditor.document.getText()).split("\n");
    return currentText;
}


class DocumentSegmentList {
    constructor(){
        this.head = null;
        this.getSegment = (value) => {
            let currentSegmentNode = this.head;
            while(currentSegmentNode != null){
                if(currentSegmentNode.propertyEquals(value) == true){
                    return currentSegment;
                }else{
                    currentSegment = currentSegment.next;
                }
            };
            return null;
        };
        this.forEachSegmentNode = (doThis) => {
            let currentSegment = this.head;
            while(currentSegment != null){
                doThis(currentSegment);
                currentSegment = currentSegment.next;
            };
        };
        this.getLastSegment = () => {
            let currentSegment = this.head;
            if(currentSegment != null){
                while(currentSegment.next != null){
                    currentSegment = currentSegment.next;
                }
            }
            return currentSegment;
        }

    }
    
};


class Snippet {
    constructor(type, range){
        if(type == "typescript"){
            this.type = type;
            this.range = range;
            this.uri = (() => {
                let count = 0;
                documentSegmentList.forEachSegmentNode(
                    (segment) => {
                        if(segment.type == "typescript"){
                            count ++;
                        }
                    }
                );
                return `./${count}.ts`;
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
                        text = `${newText[lineIndex].subString(this.range.start.character, this.range.end.character + 1)}`;
                    }else if(lineIndex == this.range.start.line){
                        text = `${text}${newText[lineIndex].subString(this.range.start.character)}`;
                    }else if(lineIndex == this.range.end.line){
                        text = `${text}${newText[lineIndex].subString(0, this.range.end.character + 1)}`;
                    }else if(lineIndex > this.range.start.line && lineIndex < this.range.end.line){
                        text = `${text}${newText[lineIndex]}`;
                    }
                    lineIndex ++;
                }while(lineIndex != this.range.end.line + 1);
                return text;
            })();
            this.next = null;
            this.previous = null;
            this.sendDidOpen = () => {
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
            this.propertyEquals = (value) => {
                let property = [this.type, this.range, this.uri, this.didOpen, this.didChange, this.languageId, this.version, this.text, this.next, this.previous];
                property.forEach(
                    (element) => {
                        if(element == value){
                            return true;
                        }
                    }
                );
                return false;
            }
        }else if(type == "c-sharp"){
            this.type = type;
            this.range = range;
        }
    }
}

let documentSegmentList = new DocumentSegmentList();

async function refreshDocumentSegmentList(){
    newText = await getCurrentText();
    documentSegmentList = new DocumentSegmentList();
    let snippetSearchCompleted = false;
    let boundaryStringIndex = -1;
    let currentLineNumber = 0;
    let boundaryStringsFound = 0;
    let snippetRange = {
            start: {
                line: 0,
                character: 0
            },
            end: {
                line: 0,
                character: 0
            }
        };

    
    newText.forEach((thisLine) => {
        do{
            boundaryStringIndex ++;
            boundaryStringIndex = thisLine.indexOf("\"\"\"\"", boundaryStringIndex);
            if(boundaryStringIndex > -1){
                if(boundaryStringsFound == 0){
                    snippetRange.end.line = currentLineNumber;
                    snippetRange.end.character = boundaryStringIndex - 1;
                    boundaryStringsFound ++;
                    documentSegmentList.getLastSegment().next = new Snippet("c-sharp", snippetRange);
                }else if((boundaryStringsFound % 2) == 0){
                    snippetRange.start.line = snippetRange.end.line;
                    snippetRange.start.character = snippetRange.end.character + 1;
                    snippetRange.end.line = currentLineNumber;
                    snippetRange.end.character = boundaryStringIndex + 3;
                    documentSegmentList.getLastSegment().next = new Snippet("c-sharp", snippetRange);
                    snippetRange.start.line = currentLineNumber;
                    snippetRange.start.character = boundaryStringIndex + 4;
                    boundaryStringsFound ++;
                }else if((boundaryStringsFound % 2) == 1){
                    snippetRange.end.line = currentLineNumber;
                    snippetRange.end.character = boundaryStringIndex - 1;
                    documentSegmentList.getLastSegment().next = new Snippet("typescript", snippetRange);
                    boundaryStringsFound ++;
                }
            }else if(boundaryStringIndex == -1 && currentLineNumber == newText.length() - 1 && boundaryStringsFound > 1){
                snippetRange.start.line = snippetRange.end.line;
                snippetRange.start.character = snippetRange.end.character + 1;
                snippetRange.end.line = newText.length() - 1;
                snippetRange.end.character = newText[newText.length() -1].length() -1;
                documentSegmentList.getLastSegment().next = new Snippet("c-sharp", snippetRange);
                boundaryStringsFound ++;
                snippetSearchCompleted = true;
            }else{
                snippetSearchCompleted = true;
            }
        }while(snippetSearchCompleted == false);
        snippetSearchCompleted = false; 
        currentLineNumber ++;
    });
};

const textSnippets = [];

let activationCount = 0;

async function doCompletions() {
    activationCount += 1;
    myOutputs.appendLine(`\n-- 'DO-COMPLETIONS' ACTIVATED, count: ${activationCount} --`);
    
    textSnippets.forEach((arrayEntry) => {
        (async() => {
            if(arrayEntry.type == "typescript"){
                if(arrayEntry.snippet.didOpen == false){
                    connection.sendNotification("document/didOpen", JSON.stringify({textDocument: {uri: arrayEntry.snippet.uri, languageId: arrayEntry.snippet.languageId, version: arrayEntry.snippet.version, text: arrayEntry.snippet.text}}));
                    myOutputs.appendLine(`\n-- SNIPPET SENT TO SERVER: (didOpen) --\ndocument:\n${JSON.stringify(arrayEntry.snippet)}\n-- End --`);
                    arrayEntry.snippet.didOpen = true;
                }else{
                    arrayEntry.snippet.version += 1;
                    connection.sendNotification("document/didChange", JSON.stringify({textDocument: {uri: arrayEntry.snippet.uri, languageId: arrayEntry.snippet.languageId, version: arrayEntry.snippet.version, text: arrayEntry.snippet.text}}));
                    myOutputs.appendLine(`\n-- DOCUMENT UPDATE SENT TO SERVER: (didOpen) --\ndocument:\n${JSON.stringify(arrayEntry.snippet)}\n-- End --`);
                }
            }
            let response = await connection.sendRequest("request", snippet.text);
            myOutputs.appendLine(`\n-- SNIPPET SENT TO SERVER --\nRESPONSE:\n${JSON.stringify(response)}\n-- End --`);
        })();
    });

    // codeSnippets.forEach((snippet, index) => {myOutputs.appendLine(`\n-- Snippet ${index + 1} --\nStart index: ${snippet.start}\n-----\nText:\n-----\n${snippet.text}\n-----\nEnd index (exclusive): ${snippet.end}\n-----`);});
    // myOutputs.appendLine(`-- count: ${activationCount} --`);
    // activationCount++;
}


async function handleRequests(){

    myOutputs = vscode.window.createOutputChannel("embeddedLsp output");
    myOutputs.show();
    var extensionTerminal = vscode.window.createTerminal("extension terminal");
    extensionTerminal.show(true);
    vscode.window.showInformationMessage(`embeddedLsp terminal is called: ${extensionTerminal.name}`);

    myOutputs.appendLine(`-- process.cwd():\n${process.cwd()}\n`);
    myOutputs.appendLine(`-- vscode approot:\n${vscode.env.appRoot}\n`);
    myOutputs.appendLine(`-- __dirname:\n${__dirname}\n`);

    const serverPath = path.join(
        __dirname,
        "node_modules",
        "typescript-language-server",
        "lib",
        "cli.mjs"
    );

    //let testPath = `${__dirname}/node_modules/typescript/lib/tsserver.js`;

    myOutputs.appendLine(`-- serverpath:\n${serverPath}\n`);

    let languageServer;
    let connection;

    
    try {
        languageServer = childProcess.spawn("node", [serverPath, "--stdio"], {stdio: "pipe"});
        languageServer.on("exit", (code, signal) => {
            myOutputs.appendLine(`\n-- Tsserver exit:\ncode: ${code}\nsignal: ${signal}\n-- End --`);
        });
        languageServer.stderr.on("data", (data) => {
            myOutputs.appendLine(`\n-- Tsserver stderr:\ndata: ${data.toString()}\n-- End --`);
        });
        languageServer.stdout.on("data", (data) => {
            myOutputs.appendLine(`\n-- Tsserver stdout:\ndata: ${data.toString()}\n-- End --`);
        });
    }catch(error) {
        myOutputs.appendLine(`\n-- START LANGUAGE SERVER AS CHILD-PROCESS ERROR:\n${error.message}\n-- End --`);
    }

    try {
        myOutputs.appendLine(`\n-- RPC MESSAGE CONNECTION ABOUT TO RUN --`)
        connection = rpc.createMessageConnection(
            new rpc.StreamMessageReader(languageServer.stdout),
            new rpc.StreamMessageWriter(languageServer.stdin)
        );
        myOutputs.appendLine(`\n-- RPC CREATE MESSAGE CONNECTION RAN --`);

    }catch(error) {
        myOutputs.appendLine(`\n-- CREATE RPC MESSAGE CONNECTION ERROR:\n${error.message}\n-- End --`);
    }

    try {
        myOutputs.appendLine(`\n-- CONNECTION.LISTEN ABOUT TO RUN --`);
        connection.listen();
        myOutputs.appendLine(`\n-- CONNECTION.LISTEN RAN --`);
    }catch(error) {
        myOutputs.appendLine(`\n-- CONNECTION LISTEN ERROR:\n${error.message}\n-- End --`);
    }
    const languageSErverInitializationParams = {
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
    };

    let serverInitializeResponse;

    try {
        myOutputs.appendLine(`\n-- serverInitializeResponse:\n${serverInitializeResponse}\n-- SEND REQUEST 'INITIALIZE' ABOUT TO RUN --\n`)
        serverInitializeResponse = await connection.sendRequest("initialize", languageSErverInitializationParams);
        myOutputs.appendLine(`\n-- SEND REQUEST 'INITIALIZE' RAN --`);
    }catch(error) {
        myOutputs.appendLine(`\n-- SEND SERVER INITIALIZE MESSAGE ERROR:\nError: ${error}\nError message: ${error.message}\n-- End --`);
    }
    
    myOutputs.appendLine(`\n-- Server initialize response:\n"${JSON.stringify(serverInitializeResponse)}\n-- End of response --`);

    connection.onNotification("publishDiagnostics", (diagnostics) => {
        myOutputs.appendLine(`\n-- DIAGNOSTICS RECIEVED --\n${JSON.stringify(diagnostics)}\n-- End --`);
    });

    doCompletions();
    //text = vscode.window.activeTextEditor.document.getText();
    vscode.workspace.onDidChangeTextDocument((event) => {
        (async() => {
            newText = await getCurrentText();
            if(event.document.uri == documentUri){ 
                try{
                doCompletions();
                }catch(error){
                    myOutputs.appendLine(`\n-- 'doCompletions()' Error:\n${error.message}\n-- End --`);
                }
            }
            
        })();
    });
}

const targetNewDocumentCommand = "JsAndCssInCsharp.targetNewDocument";
const startUpCommand = "JsAndCssInCsharp.startEmbeddedLsp";

const targetNewTextDocument = () => {
    documentUri = vscode.window.activeTextEditor.document.uri;
}

const runOnStartupCommand = () => {
    let run = true;
    if(run){
        vscode.window.showInformationMessage("embeddedLsp [1.0.7] is running");
        targetNewTextDocument();
        handleRequests();
    }
    else
    {
        vscode.window.showInformationMessage("embeddedLsp will not run; no ' <EmbeddedLsp>true</EmbeddedLsp> ' field found in ' *.csproj '");
    }
    //""""
    // and the second code snippet
    //""""

};


function activate(context)
{
    // """"
    // the first code snippet
    // """"
    
    
    context.subscriptions.push(vscode.commands.registerCommand(targetNewDocumentCommand, targetNewTextDocument));
    
    context.subscriptions.push(vscode.commands.registerCommand(startUpCommand, runOnStartupCommand));
    
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};