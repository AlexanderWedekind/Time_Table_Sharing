const vscode =  require("vscode");
const childProcess = require("child_process");
const rpc = require("vscode-jsonrpc");
const path = require("path");

let myOutputs;
let text = "";
let newText = "";



async function getCurrentText() {
    const currentText = await vscode.window.activeTextEditor.document.getText();
    return currentText;
}

class snippet {
    constructor(start, text, end){
        this.start = start;
        this.text = text;
        this.end = end;
    }   
}

let activationCount = 1;


async function doCompletions() {
    text = await getCurrentText();
    let codeSnippets = [];
    let snippetSearchCompleted = false;
    let preSnippetBoundaryStringIndex = 0;
    let postSnippetBoundaryStringIndex = 0;
    
    do{
        preSnippetBoundaryStringIndex = text.indexOf("\"\"\"\"", preSnippetBoundaryStringIndex);
        postSnippetBoundaryStringIndex = text.indexOf("\"\"\"\"", preSnippetBoundaryStringIndex + 1);
        if(preSnippetBoundaryStringIndex > -1 && postSnippetBoundaryStringIndex > -1){
            codeSnippets.push(new snippet(preSnippetBoundaryStringIndex + 1, text.substring(preSnippetBoundaryStringIndex + 4, postSnippetBoundaryStringIndex), postSnippetBoundaryStringIndex));
            preSnippetBoundaryStringIndex = postSnippetBoundaryStringIndex + 1;
        }else{
            snippetSearchCompleted = true;
        }
    }while(snippetSearchCompleted == false);

    codeSnippets.forEach((snippet, index) => {myOutputs.appendLine(`\n-- Snippet ${index + 1} --\nStart index: ${snippet.start}\n-----\nText:\n-----\n${snippet.text}\n-----\nEnd index (exclusive): ${snippet.end}\n-----`);});
    myOutputs.appendLine(`-- count: ${activationCount} --`);
    activationCount++;
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

    doCompletions();
    //text = vscode.window.activeTextEditor.document.getText();
    vscode.workspace.onDidChangeTextDocument(() => {
        (async() => {
            newText = await getCurrentText();
            if(newText != text){
                try{
                doCompletions();
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
    
    

    
    context.subscriptions.push(vscode.commands.registerCommand(startUpCommand, runOnStartupCommand));
    
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};