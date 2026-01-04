import * as vscode from 'vscode';
import * as childProcess from 'child_process';
import * as jsonRpc from 'vscode-jsonrpc/node';

import { vars } from '../vars/vars';
import { write, output } from './createTerminal';

// try{
//     write("...");

//     write("...");
// }catch(e: unknown){
//     if(typeof(e) == typeof(Error)){
//         write(output("...", `Error:\n${e.message}`))
//     }else{
//         write(output("...", `Error:\n${JSON.stringify(e)}`))
//     }
// }

export async function startTypescriptServer(){
    vars.languageServer = childProcess.spawn(process.execPath, [vars.tsLanguageServerPath, "--stdio"], {stdio: ["pipe","pipe", "pipe"]});
}

export async function registerTsServerLoggingCallbacks(){
    vars.languageServer?.on('exit', (code, signal) => {
        write(output("TsServer Exit", `code:\n${code}\nsignal:\n${signal}`))
    });
    vars.languageServer?.stderr?.on('data', (data) => {
        write(output("TsServer StdErr Data", `data:\n${data.toString()}`))
    });
    vars.languageServer?.stderr?.on("error", (error) => {
        write(output("TsServer StdErr Error", `error:\n${error.message.toString()}`))
    });
}

export async function setupJsonRpcConnection(){
    vars.connection = jsonRpc.createMessageConnection(
        new jsonRpc.StreamMessageReader(vars.languageServer?.stdout!),
        new jsonRpc.StreamMessageWriter(vars.languageServer?.stdin!),
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
}

export async function doConnectionTrace(){
    vars.connection!.trace(jsonRpc.Trace.Verbose, {
        log: (msg) => write(output("RPC-TRACE: LOG", `${msg}`))
    });
}

export function connectionListen(){
    vars.connection!.listen();
}

export async function sendInitializeRequest(){
    write("\r\n--> sendInitialize was called -> assigning response to 'serverInitializeResponse'");
    let serverInitializeResponse = await vars.connection!.sendRequest("initialize", vars.languageServerInitializationParams);
    write(`\r\n--> 'serverInitializeResponse' has been assigned: ${JSON.stringify(serverInitializeResponse)}`);
    vars.connection!.sendNotification("initialized");
    write("\r\n--> notification 'initialized' sent to server")
    write(output("Server initialize response", JSON.stringify(serverInitializeResponse)));
}

//sendInitializeRequest();

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