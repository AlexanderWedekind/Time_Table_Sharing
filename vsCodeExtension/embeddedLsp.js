const vscode =  require("vscode");
const childProcess = require("child_process");
const rpc = require("vscode-jsonrpc");
const path = require("path");

async function activate(context)
{
    let myOutputs = vscode.window.createOutputChannel("embeddedLsp output");
    myOutputs.show(true);
        
    //targetNewTextDocument();
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
        myOutputs.appendLine(`\n-- RPC MESSAGE CONNECTION ABOUT TO RUN --`);
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
    const languageServerInitializationParams = {
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
        myOutputs.appendLine(`\n-- SEND REQUEST 'INITIALIZE' ABOUT TO RUN --\n`)
        serverInitializeResponse = await connection.sendRequest("initialize", languageServerInitializationParams);
        myOutputs.appendLine(`\n-- serverInitializeResponse:\n${serverInitializeResponse}\n-- SEND REQUEST 'INITIALIZE' RAN --`);
    }catch(error) {
        myOutputs.appendLine(`\n-- SEND SERVER INITIALIZE MESSAGE ERROR:\nError: ${error}\nError message: ${error.message}\n-- End --`);
    }
    
    myOutputs.appendLine(`\n-- Server initialize response:\n"${JSON.stringify(serverInitializeResponse)}\n-- End of response --`);

    connection.onNotification("publishDiagnostics", (diagnostics) => {
        myOutputs.appendLine(`\n-- DIAGNOSTICS RECIEVED --\n${JSON.stringify(diagnostics)}\n-- End --`);
    });

    let newText = [];
    myOutputs.appendLine(`\n-- THE FIRST 'NEW-TEXT' typeof: ${typeof newText} --\nNEW-TEXT: --\n${JSON.stringify(newText)}\n-- END --`);
    function getCurrentText() {
        const currentText = (vscode.window.activeTextEditor.document.getText()).split("\n");
        return currentText;
    }

    let documentUri = "no uri retrieved yet";
    const targetNewDocumentCommand = "JsAndCssInCsharp.targetNewDocument";
    const targetNewTextDocument = () => {
        documentUri = vscode.window.activeTextEditor.document.uri;
        myOutputs.appendLine(`\n-- NEW TARGET DOC URI: --\n${documentUri}\n-- END --`);
    };

    const snippetType = {
        typescript: "typescript",
        cSharp: "c-sharp"
    };

    class DocumentSegmentList {
        constructor(){
            this.head = null;
            this.getSegments = (value) => {
                let segments = [];
                let currentSegmentNode = this.head;
                while(currentSegmentNode != null){
                    if(currentSegmentNode.propertyEquals != undefined){
                        if(currentSegmentNode.propertyEquals(value) == true){
                        segments.push(currentSegmentNode);
                        }
                    }
                    currentSegmentNode = currentSegmentNode.next;
                };
                
                    return segments;
                
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

    let documentSegmentList = new DocumentSegmentList(); 

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
                            text = `${newText[lineIndex].substring(this.range.start.character, this.range.end.character)}`;
                        }else if(lineIndex == this.range.start.line){
                            text = `${text}${newText[lineIndex].substring(this.range.start.character)}`;
                        }else if(lineIndex == this.range.end.line){
                            text = `${text}${newText[lineIndex].substring(0, this.range.end.character)}`;
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
                this.propertyEquals = (value) => {
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
            }else if(type == "c-sharp"){
                this.type = type;
                this.range = range;
            }
        }
    }


    async function refreshDocumentSegmentList(){
        myOutputs.appendLine(`\n-- REFRESH-DOCUMENT-SEGMENTLIST ran --`)
        newText = getCurrentText();
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
            
            // myOutputs.appendLine(`\n-- LINENUMBER: ${currentLineNumber + 1} --`);
            // myOutputs.appendLine(`this Line:\n${thisLine}`);
            // myOutputs.appendLine(`line-length: ${thisLine.length}`);
            // myOutputs.appendLine(`nr of boundary strings found: ${boundaryStringsFound}`);
            boundaryStringIndex = -1;
            do{
                boundaryStringIndex ++;
                boundaryStringIndex = thisLine.indexOf("\"\"\"\"", boundaryStringIndex);
                if(boundaryStringIndex > -1){
                    boundaryStringsFound ++;
                    //myOutputs.appendLine(`boundary string index: ${boundaryStringIndex}`);
                    //myOutputs.appendLine(`string found: " ${thisLine.substring(boundaryStringIndex, boundaryStringIndex + 4)} "`);
                    if(boundaryStringsFound == 1){
                        snippetRange.start.line = 1; 
                        snippetRange.start.character = 0;
                        snippetRange.end.line = currentLineNumber;
                        snippetRange.end.character = boundaryStringIndex + 4;
                        documentSegmentList.head = new Snippet("c-sharp", snippetRange);
                    }else if(boundaryStringsFound % 2 == 1){
                        snippetRange.start.line = snippetRange.end.line;
                        snippetRange.start.character = snippetRange.end.character;
                        snippetRange.end.line = currentLineNumber;
                        snippetRange.end.character = boundaryStringIndex + 4;
                        documentSegmentList.getLastSegment().next = new Snippet("c-sharp", snippetRange);
                    }else if(boundaryStringsFound % 2 == 0){
                        snippetRange.start.line = snippetRange.end.line;
                        snippetRange.start.character = snippetRange.end.character;
                        snippetRange.end.line = currentLineNumber;
                        snippetRange.end.character = boundaryStringIndex;
                        documentSegmentList.getLastSegment().next = new Snippet("typescript", snippetRange);
                    }
                }else{
                    //myOutputs.appendLine("no additional boundary string found");
                    snippetSearchCompleted = true;
                    if(currentLineNumber == newText.length - 1 && boundaryStringsFound > 0){
                        snippetRange.start.line = snippetRange.end.line;
                        snippetRange.start.character = snippetRange.end.character;
                        snippetRange.end.line = currentLineNumber;
                        snippetRange.end.character = thisLine.length - 1;
                        documentSegmentList.getLastSegment() = new Snippet("c-sharp", snippetRange); 
                    }
                };
            }while(snippetSearchCompleted == false);
            snippetSearchCompleted = false;
            currentLineNumber ++;
            //myOutputs.appendLine(`-- END --`);
            
        });
    };

    function closeAllServerDocuments(){
        let documents = documentSegmentList.getSegments(snippetType.typescript);
        // documentSegmentList.forEachSegmentNode((segment) => {
        //     if(segment.type == snippetType.typescript){
        //         documents.push(element);
        //     }
        // });
        if(documents.length > 0){
            documents.forEach((document) => {
                connection.sendNotification("document/didClose", document.sendDidClose())
            })
        }
    }
        
    function openAllServerDocuments(){
        let documents = documentSegmentList.getSegments(snippetType.typescript);
        if(documents.length > 0){
            documents.forEach((element) => {
                connection.sendNotification("document/didOpen", element.sendDidOpen())
            })
        }
    }

    function updateServerDocument(segment){
        connection.sendNotification("document/didChange", segment.sendDidChange());
    }

    function refreshServerState(){
        closeAllServerDocuments();
        refreshDocumentSegmentList();
        openAllServerDocuments();
    }

    let activationCount = 0;

    async function handleRequests(){   

        

        vscode.workspace.onDidChangeTextDocument((event) => {
            (() => {
                if(event.document.uri == documentUri){ 
                    myOutputs.appendLine(`\n-- CHANGE EVENT DOC URI: --\n${event.document.uri}\n-- DOCUMENT URI: --\n${documentUri}\n-- END --`);
                    newText = getCurrentText();
                    myOutputs.appendLine(`\n-- NEW-TEXT value: --\n${JSON.stringify(newText)}\n-- NEW-TEXT type: --\n${typeof newText}\n--\n NEW-TEXT Length: ${newText.length} --\n-- END --`);
                
                    try{
                        refreshDocumentSegmentList();
                        myOutputs.appendLine(`\n-- DOCUMENT SEGMENT LIST: --\n${JSON.stringify(documentSegmentList)}\n-- END --`);
                    }catch(error){
                        myOutputs.appendLine(`\n-- 'doCompletions()' Error:\n${error.message}\n-- End --`);
                    }
                }
                
            })();
        });
    }

    
    const startUpCommand = "JsAndCssInCsharp.startEmbeddedLsp";
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


    // """"     """"
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