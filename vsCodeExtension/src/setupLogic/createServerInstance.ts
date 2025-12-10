import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as jsonRpc from 'vscode-jsonrpc/node';

import { vars } from '../vars/vars';
import { write, output } from './createTerminal';

const languageServer = childProcess.spawn("node", [vars.tsServerPath, "--stdio"], {stdio: ["pipe","pipe", "pipe"]});
languageServer.on("exit", (code, signal) => {
    write(output("Tsserver exit", `code:\n${code}\nsignal:\n${signal}`));
});
languageServer.stderr.on("data", (data) => {
    write(output("Tsserver stderr", `data:\n${data.toString()}`));
});
languageServer.stderr.on("error", (error) => {
    write(output("Tsserver stream-error, stderr", `error:\n${error}`));
});

const connection = jsonRpc.createMessageConnection(
    new jsonRpc.StreamMessageReader(languageServer.stdout),
    new jsonRpc.StreamMessageWriter(languageServer.stdin),
    {
        log: (message) => {
            write(output("CONNECTION-MESSAGE: LOG", `${message}`));
        },
        info: (info) => {
            write(output("CONNECTION-MESSAGE: INFO", `${info}`));
        },
        warn: (warning) => {
            write(output("CONNECTION-MESSAGE: WARNING", `${warning}`));
        },
        error: (error) => {
            write(output("CONNECTION-MESSAGE: ERROR", `${error}`));
        }
    }
);

connection.trace(jsonRpc.Trace.Verbose, {
    log: (msg) => write(output("RPC-TRACE: LOG", `${msg}`))
});

async function sendInitializeRequest(): Promise<void> {
    let serverInitializeResponse = await connection.sendRequest("initialize", vars.languageServerInitializationParams);
    connection.sendNotification("initialized");
    write(output("Server initialize response", JSON.stringify(serverInitializeResponse)));
}

sendInitializeRequest();

// let serverInitializeResponse = await connection.sendRequest("initialize", vars.languageServerInitializationParams);
// connection.sendNotification("initialized");
        

// connection.onNotification("textDocument/publishDiagnostics", (result) => { 
//             write(output("RECIEVED DIAGNOSTICS in lsp-client", `${JSON.stringify(result)}`));
//             let thisSegment = (() => {
//                 let returnSegment;
//                 documentSegmentList.forEachSegmentNode((segment) => {
//                     if(result.uri == segment.uri){
//                         returnSegment = segment; 
//                     }
//                 });
//                 return returnSegment;
//             })();
//             write(output("thisSegment", `text: -->|${thisSegment.text}|<--\n-- segment: --\n${JSON.stringify(thisSegment)}\n --END --`));
//             let progressMarker = 0;

//             for(i = 0; i < result.diagnostics.length; i++){
//                 write(output(`MODIFYING element nr.: ${i}`, `${JSON.stringify(result.diagnostics[i])}`));
//                 // write(`Diagnostic source: ${JSON.stringify(result.diagnostics[i].source)}`);
//                 result.diagnostics[i].range.start.line = thisSegment.range.start.line + result.diagnostics[i].range.start.line;
//                 progressMarker = 1;
//                 write(`- Got to here -> nr: ${progressMarker}`);
//                 write(`- Modified Diagnostic:\n${JSON.stringify(result.diagnostics[i])}`);
//                 if(result.diagnostics[i].range.start.line == thisSegment.range.start.line){
//                     //progressMarker = 2;
//                     write(`- Got to here -> nr: 2`);
//                     write(`- Modified Diagnostic:\n${JSON.stringify(result.diagnostics[i])}`);
//                     result.diagnostics[i].range.start.character = thisSegment.range.start.character + result.diagnostics[i].range.start.character;
//                     progressMarker = 3;
//                     write(`- Got to here -> nr: ${progressMarker}`);
//                     write(`- Modified Diagnostic:\n${JSON.stringify(result.diagnostics[i])}`);
//                 };
//                 result.diagnostics[i].range.end.line = thisSegment.range.start.line + result.diagnostics[i].range.end.line;
//                 progressMarker = 4;
//                 write(`- Got to here -> nr: ${progressMarker}`);
//                 write(`- Modified Diagnostic:\n${JSON.stringify(result.diagnostics[i])}`);
//                 let code = result.diagnostics[i].code;
//                 let source = "My-Ts-Client";
//                 result.diagnostics[i] = new vscode.Diagnostic(new vscode.Range(new vscode.Position(result.diagnostics[i].range.start.line,
//                         result.diagnostics[i].range.start.character),
//                         new vscode.Position(result.diagnostics[i].range.end.line,
//                             result.diagnostics[i].range.end.character
//                         )
//                     ),
//                     result.diagnostics[i].message,
//                     result.diagnostics[i].severity,
//                 );
//                 result.diagnostics[i].code = code;
//                 result.diagnostics[i].source = source;
//                 progressMarker = 5;
//                 write(`- Got to here -> nr: ${progressMarker}`);
//                 write(`- Modified Diagnostic:\n${JSON.stringify(result.diagnostics[i])}`);
//             };
//             progressMarker = 6;
//             write(`- Got to here -> nr: ${progressMarker}`);
//             write(`-- Collection to be Set:\n${JSON.stringify(result.diagnostics)}`);
//             embeddedJsDiagnosticCollection.set(vscode.Uri.parse(documentUri), result.diagnostics);
//             progressMarker = 7;
//             write(`- Got to here -> nr: ${progressMarker}`);
//             let displayCurrentCollection = embeddedJsDiagnosticCollection.get(vscode.Uri.parse(documentUri));
//             if(typeof displayCurrentCollection != undefined){
//                 write(`Diagnostics found!`)
//             }else{
//                 write(`No diagnostics found!`)
//             }
//             write("\n-- END --");
//         });