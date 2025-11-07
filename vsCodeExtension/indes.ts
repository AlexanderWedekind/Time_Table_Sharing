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

    const embeddedJsDiagnosticCollection = vscode.languages.createDiagnosticCollection("embedded-js-client");
    
    myOutputs.appendLine(`-- process.cwd():\n${process.cwd()}\n`);
    myOutputs.appendLine(`-- vscode approot:\n${vscode.env.appRoot}\n`);
    myOutputs.appendLine(`-- __dirname:\n${__dirname}\n`);

    const tsServerPath = path.join(
        __dirname,
        "node_modules",
        "typescript-language-server",
        "lib",
        "cli.mjs"
    );

    const cSharpServerPath = path.join(
        __dirname,
        "ms-dotnettools.csharp-2.84.19-win32-x64",
        ".roslyn",
        "Microsoft.CodeAnalysis.LanguageServer"
        //"C:\Users\awedw\.vscode\extensions\ms-dotnettools.csharp-2.84.19-win32-x64\.roslyn\Microsoft.CodeAnalysis.LanguageServer.exe"
    );

    //let testPath = `${__dirname}/node_modules/typescript/lib/tsserver.js`;

    myOutputs.appendLine(`-- serverpath:\n${tsServerPath}\n`);

    let languageServer;
    let connection;

    
    try {
        languageServer = childProcess.spawn("node", [tsServerPath, "--stdio"], {stdio: ["pipe","pipe", "pipe"]});
        languageServer.on("exit", (code, signal) => {
            myOutputs.appendLine(`\n-- Tsserver exit: --\ncode:\n${code}\nsignal:\n${signal}\n-- End --`);
        });
        languageServer.stderr.on("data", (data) => {
            myOutputs.appendLine(`\n-- Tsserver stderr: --\ndata:\n${data.toString()}\n-- End --`);
        });
        languageServer.stderr.on("error", (error) => {
            myOutputs.appendLine(`\n-- Tsserver stream-error: stderr --\nerror:\n${error}\n-- END --`);
        });
        // languageServer.stdout.on("data", (data) => {
        //     myOutputs.appendLine(`\n-- Tsserver stdout: --\ndata:\n${data.toString()}\n-- End --`);
        // });
        // languageServer.stdout.on("error", (error) => {
        //     myOutputs.appendLine(`-- Tsserver stream-error: stdout --\nerror:\n${error}\n-- END --`);
        // });
    }catch(error) {
        myOutputs.appendLine(`\n-- START LANGUAGE SERVER AS CHILD-PROCESS ERROR: --\n${error.message}\n-- End --`);
    }

    try {
        myOutputs.appendLine(`\n-- RPC MESSAGE CONNECTION ABOUT TO RUN --`);
        connection = rpc.createMessageConnection(
            new rpc.StreamMessageReader(languageServer.stdout),
            new rpc.StreamMessageWriter(languageServer.stdin),
            {
                log: (message) => {
                    myOutputs.appendLine(`\n-- CONNECTION-MESSAGE: LOG --\n${message}\n-- END --`);
                },
                info: (info) => {
                    myOutputs.appendLine(`\n-- CONNECTION-MESSAGE: INFO --\n${info}\n-- END --`);
                },
                warn: (warning) => {
                    myOutputs.appendLine(`\n-- CONNECTION-MESSAGE: WARNING --\n${warning}\n-- END --`);
                },
                error: (error) => {
                    myOutputs.appendLine(`\n-- CONNECTION-MESSAGE: ERROR --\n${error}\n-- END --`);
                }
            }
        );
        myOutputs.appendLine(`\n-- RPC CREATE MESSAGE CONNECTION RAN --`);
    }catch(error) {
        myOutputs.appendLine(`\n-- CREATE RPC MESSAGE CONNECTION ERROR:\n${error.message}\n-- End --`);
    }

    try{
        myOutputs.appendLine(`\n-- RPC-TRACE SETUP --`); 
        connection.trace(rpc.Trace.Verbose, {
            log: (msg) => myOutputs.appendLine(`\n-- RPC-TRACE: LOG --\n${msg}\n-- END --`)
        });
    }catch(error){
        myOutputs.appendLine(`\n-- ERROR RPC-TRACE SETUP --\n${error}\n-- END --`);
    }

    try{
        myOutputs.appendLine(`\n-- REGISTER onNotification-publishDiagnostics HANDLER --`); 

        connection.onNotification("textDocument/publishDiagnostics", (result) => { 
            myOutputs.appendLine(`\n-- RECIEVED DIAGNOSTICS in lsp-client: --\n${JSON.stringify(result)}\n-- END --`);
            let thisSegment = (() => {
                let returnSegment;
                documentSegmentList.forEachSegmentNode((segment) => {
                    if(result.uri == segment.uri){
                        returnSegment = segment; 
                    }
                });
                return returnSegment;
            })();
            myOutputs.appendLine(`\n-- thisSegment: --\ntext: -->|${thisSegment.text}|<--\n-- segment: --\n${JSON.stringify(thisSegment)}\n --END --`);
            let progressMarker = 0;

            // for(i = 0; i < result.diagnostics.length; i++){
            //     myOutputs.appendLine(`\n-- ELEMENT Nr.: ${i} --`);
            //     myOutputs.appendLine(`result.diagnostics[i].range.start.line: ${result.diagnostics[i].range.start.line}`);
            //     myOutputs.appendLine(`thisSegment.range.start.line: ${thisSegment.range.start.line}`);
            //     myOutputs.appendLine(`-- END --`);
            // }

            for(i = 0; i < result.diagnostics.length; i++){
                myOutputs.appendLine(`\n-- MODIFYING element nr.: ${i} --\n${JSON.stringify(result.diagnostics[i])}`);
                // myOutputs.appendLine(`Diagnostic source: ${JSON.stringify(result.diagnostics[i].source)}`);
                result.diagnostics[i].range.start.line = thisSegment.range.start.line + result.diagnostics[i].range.start.line;
                progressMarker = 1;
                myOutputs.appendLine(`- Got to here -> nr: ${progressMarker}`);
                myOutputs.appendLine(`- Modified Diagnostic:\n${JSON.stringify(result.diagnostics[i])}`);
                if(result.diagnostics[i].range.start.line == thisSegment.range.start.line){
                    //progressMarker = 2;
                    myOutputs.appendLine(`- Got to here -> nr: 2`);
                    myOutputs.appendLine(`- Modified Diagnostic:\n${JSON.stringify(result.diagnostics[i])}`);
                    result.diagnostics[i].range.start.character = thisSegment.range.start.character + result.diagnostics[i].range.start.character;
                    progressMarker = 3;
                    myOutputs.appendLine(`- Got to here -> nr: ${progressMarker}`);
                    myOutputs.appendLine(`- Modified Diagnostic:\n${JSON.stringify(result.diagnostics[i])}`);
                };
                result.diagnostics[i].range.end.line = thisSegment.range.start.line + result.diagnostics[i].range.end.line;
                progressMarker = 4;
                myOutputs.appendLine(`- Got to here -> nr: ${progressMarker}`);
                myOutputs.appendLine(`- Modified Diagnostic:\n${JSON.stringify(result.diagnostics[i])}`);
                let code = result.diagnostics[i].code;
                let source = "My-Ts-Client";
                result.diagnostics[i] = new vscode.Diagnostic(new vscode.Range(new vscode.Position(result.diagnostics[i].range.start.line,
                        result.diagnostics[i].range.start.character),
                        new vscode.Position(result.diagnostics[i].range.end.line,
                            result.diagnostics[i].range.end.character
                        )
                    ),
                    result.diagnostics[i].message,
                    result.diagnostics[i].severity,
                );
                result.diagnostics[i].code = code;
                result.diagnostics[i].source = source;
                progressMarker = 5;
                myOutputs.appendLine(`- Got to here -> nr: ${progressMarker}`);
                myOutputs.appendLine(`- Modified Diagnostic:\n${JSON.stringify(result.diagnostics[i])}`);
            };
            progressMarker = 6;
            myOutputs.appendLine(`- Got to here -> nr: ${progressMarker}`);
            myOutputs.appendLine(`-- Collection to be Set:\n${JSON.stringify(result.diagnostics)}`);
            embeddedJsDiagnosticCollection.set(vscode.Uri.parse(documentUri), result.diagnostics);
            progressMarker = 7;
            myOutputs.appendLine(`- Got to here -> nr: ${progressMarker}`);
            let displayCurrentCollection = embeddedJsDiagnosticCollection.get(vscode.Uri.parse(documentUri));
            if(typeof displayCurrentCollection != undefined){
                myOutputs.appendLine(`Diagnostics found!`)
            }else{
                myOutputs.appendLine(`No diagnostics found!`)
            }
            // myOutputs.appendLine(`-- Checking for diagnostics in Diagnostic collection: --\n${
            //     (() => {
            //         if(embeddedJsDiagnosticCollection.has(documentUri)){
            //             return `Contains Diagnostics:\n${JSON.stringify(embeddedJsDiagnosticCollection.get(documentUri))}`
            //         }else{
            //             return `No diagnostics found!`
            //         }
            //     })()
            // }`);
            //myOutputs.appendLine(`-- After .set actual diagnosticCollection:\n${embeddedJsDiagnosticCollection.get(documentUri)}`);
            myOutputs.appendLine("\n-- END --");

//0 aaaaaaaaaaaaaaaa
//1 aaaaaa
//2 aaa
//3 aaaaaaaaaaa bbbbbbb
//4 bbbbbb
//5 bbbbbbbbb
//6 bbbb cccccccc
//7 cccccccccc
//8 cccccc

            //myOutputs.appendLine(`\n-- DIAGNOSTICS RECIEVED --\n${JSON.stringify(result)}\n-- End --`);
        });
        myOutputs.appendLine(`\n-- HANDLER REGISTERED --`);
    }catch(error){
        myOutputs.appendLine(`\n-- ERROR REGISTERING HANDLER: --\nerror\n--${error}\n-- END --`);
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
        connection.sendNotification("initialized");
        myOutputs.appendLine(`\n-- serverInitializeResponse:\n${JSON.stringify(serverInitializeResponse)}\n-- SEND REQUEST 'INITIALIZE' RAN --`);
    }catch(error) {
        myOutputs.appendLine(`\n-- SEND SERVER INITIALIZE MESSAGE ERROR:\nError: ${error}\nError message: ${error.message}\n-- End --`);
    }
    
    
    

    let newText = [];
    myOutputs.appendLine(`\n-- THE FIRST 'NEW-TEXT' typeof: ${typeof newText} --\nNEW-TEXT: --\n${JSON.stringify(newText)}\n-- END --`);
    function getCurrentText() {
        const currentText = (vscode.window.activeTextEditor.document.getText()).split("\n");
        return currentText;
    }

    let documentUri = "no uri retrieved yet";
    const targetNewDocumentCommand = "JsAndCssInCsharp.targetNewDocument";
    const targetNewTextDocument = () => {
        embeddedJsDiagnosticCollection.clear();
        documentUri = vscode.window.activeTextEditor.document.uri.toString();
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
                connection.sendNotification("textDocument/didClose", document.sendDidClose())
            })
        }
    }
        
    function openAllServerDocuments(){
        let documents = documentSegmentList.getSegments(snippetType.typescript);
        if(documents.length > 0){
            documents.forEach((element) => {
                connection.sendNotification("textDocument/didOpen", element.sendDidOpen())
                myOutputs.appendLine(`\n-- SEND-NOTIFICATION: didOpen --\n${JSON.stringify(element.sendDidOpen())}\n-- END --`);
            })
        }
    }

    function updateServerDocument(segment){
        connection.sendNotification("textDocument/didChange", segment.sendDidChange());
    }

    function refreshServerState(){
        closeAllServerDocuments();
        refreshDocumentSegmentList();
        openAllServerDocuments();
    }

    let activationCount = 0;

    async function handleRequests(){   

        refreshServerState();

        vscode.workspace.onDidChangeTextDocument((event) => {
            (() => {
                if(event.document.uri == documentUri){ 
                    
                    
                    //myOutputs.appendLine(`\n-- CHANGE EVENT DOC URI: --\n${event.document.uri}\n-- DOCUMENT URI: --\n${documentUri}\n-- END --`);
                    newText = getCurrentText();
                    //myOutputs.appendLine(`\n-- NEW-TEXT value: --\n${JSON.stringify(newText)}\n-- NEW-TEXT type: --\n${typeof newText}\n--\n NEW-TEXT Length: ${newText.length} --\n-- END --`);
                    
                    // try{
                    //     refreshDocumentSegmentList();
                    //     myOutputs.appendLine(`\n-- DOCUMENT SEGMENT LIST: --\n${JSON.stringify(documentSegmentList)}\n-- END --`);
                    // }catch(error){
                    //     myOutputs.appendLine(`\n-- 'doCompletions()' Error:\n${error.message}\n-- End --`);
                    // }

                    refreshServerState(); 

                }
                
            })();
        });

        vscode.languages.onDidChangeDiagnostics((event) => {
            myOutputs.appendLine("\n-- Diagnostics CHANGED in vscode: --");
            //myOutputs.appendLine(`- Event:\n${JSON.stringify(event)}`);
            //let uris = [];
            for(i = 0; i < event.uris.length; i++){
                let diagnostics = vscode.languages.getDiagnostics(event.uris[i]);
                myOutputs.appendLine(`\n- There are Diagnostics for uri: ${JSON.stringify(event.uris[i])}`);
                for(j = 0; j < diagnostics.length; j++){
                    if(diagnostics[j].source == "My-Ts-Client") {
                        myOutputs.appendLine(`\n- source:\n${diagnostics[j].source}\n- message:\n${diagnostics[j].message}\n- full diagnostic object:\n${JSON.stringify(diagnostics[j])}`);
                    }
                }
            }

            // for(i = 0; i < event.uris.length; i++){
            //     uris.push(event.uris[i]);
            // };
            // myOutputs.appendLine(`\n- Uris:\n${JSON.stringify(uris)}`);
            // let diagnostics = [];
            // for(i = 0; i < uris.length; i++){
            //     diagnostics.push(vscode.languages.getDiagnostics(uris[i]));
            // }; 
            // myOutputs.appendLine(`\n- Diagnostics:\n${JSON.stringify(diagnostics)}`);
            // for(i = 0; i < diagnostics.length; i++){
            //     myOutputs.appendLine(`---\nuri: ${JSON.stringify(diagnostics[i].uri)}`);
            //     for(j = 0; j < diagnostics[i][j].length; j++){
            //         myOutputs.appendLine(`\nsource: ${JSON.stringify(diagnostics[i][j].source)}`);
            //         myOutputs.appendLine(`diagnostic:\n${JSON.stringify(diagnostics[i][j])}`);
            //     }
            // };
            myOutputs.appendLine("-- END --"); 
        });
    }

    
    const startUpCommand = "JsAndCssInCsharp.startEmbeddedLsp";
    const runOnStartupCommand = () => {
        (() => {
            let testDiagnosticCollection = vscode.languages.createDiagnosticCollection("test-diagnostic-collection");
            let testDiagnostic = {
                uri: documentUri,
                diagnostics: [
                    {
                        range: {
                            start: {
                                line: 1,
                                character: 1
                            },
                            end: {
                                line: 1,
                                character: 5
                            }
                        },
                        message: "Here!",
                        severity: 1,
                        source: "Test-Diagnostic"
                    }
                ]
            };
            let testDiagnosticArray = [];
            testDiagnosticArray[0] = new vscode.Diagnostic(
                new vscode.Range(
                    new vscode.Position(testDiagnostic.diagnostics[0].range.start.line, testDiagnostic.diagnostics[0].range.start.character),
                    new vscode.Position(testDiagnostic.diagnostics[0].range.end.line, testDiagnostic.diagnostics[0].range.end.character)
                ),
                testDiagnostic.diagnostics[0].message,
                testDiagnostic.diagnostics[0].severity
            );
            testDiagnosticArray[0].source = testDiagnostic.diagnostics[0].source;
            testDiagnosticCollection.set(vscode.Uri.parse(documentUri), testDiagnostic.diagnostics);
        })();
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