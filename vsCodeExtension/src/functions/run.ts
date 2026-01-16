import * as vscode from 'vscode';
import * as functions from './functions';
import { TargetedDoc, TextSnippet, vars } from '../vars/vars';
import { output, write } from '../setupLogic/createTerminal';
import * as serverSetup from '../setupLogic/createServerInstance';
import {createDiagnosticCollection} from '../setupLogic/diagNosticCollection';

//"""" a snippet """"

async function run(){
    write(output("tsserver path", vars.tsLanguageServerPath));
    write(output(
            "Start TsServer",
            `${await(async() => {
                try{
                    await serverSetup.startTypescriptServer();
                    return "success";
                }catch(e: any){
                    return `Failed:\n${e.message}`;
                }
            })()}`
        )
    );
    write(output(
            "Register TsServer Logging callbacks",
            `${await(async() => {
                try{
                    await serverSetup.registerTsServerLoggingCallbacks();
                    return "success";
                }catch(e: any){
                    return `Failed:\n${e.message}`;
                }
            })()}`
        )
    )
    write(output(
            "Setup JsonRpc connection",
            `${await(async() => {
                try{
                    await serverSetup.setupJsonRpcConnection();
                    return "success";
                }catch(e: any){
                    return `Failed:\n${e.message}`;
                }
            })()}`
        )
    )
    write(output(
            "Connection.trace",
            `${await(async() => {
                try{
                    await serverSetup.doConnectionTrace();
                    return "success";
                }catch(e:any){
                    return `Failed:\n${e.message}`;
                }
            })()}`
        )
    )
    write(output(
            "Connection.listen",
            `${(() => {
                try{
                    serverSetup.connectionListen();
                    return "success";
                }catch(e: any){
                    return `Failed:\n${e.message}`;
                }
            })()}`
        )
    )
    write(output(
            "TsServer initialze",
            `${await(async() => {
                try{
                    await serverSetup.sendInitializeRequest();
                    return "success";
                }catch(e: any){
                    return `Failed:\n${e.message}`;
                }
            })()}`
        )
    )

    createDiagnosticCollection();
    functions.displayDiagnosticOnServerPublish();
    functions.renewDiagnosticsAtDocumentChange();
    functions.atStartupFirstDocFindSnippetExtractionDiagnosticPublishSequence();

    write(output(
        "workspace target docs",
        `${(() => {
            let returnString = "";
            vars.workspaceTargetDocsCollection.forEach((targetedDoc: TargetedDoc) => {
                if(returnString.length > 0){
                    returnString += "\n"
                }
                returnString += output(
                    `index: ${targetedDoc.index}\ndoc name: ${targetedDoc.textDocument.fileName}\nsnippets:`,
                    `${(() => {
                        let docSnippetsReturnString = "";
                        let count = 0;
                        targetedDoc.documentSegmentList.forEachSegmentNode((segment: TextSnippet) => {
                            count ++;
                            if(docSnippetsReturnString.length > 0){
                                docSnippetsReturnString += "\n"
                            }
                            docSnippetsReturnString += `- snippet: ${count}\n    type: ${segment.type}\n    uri: ${segment.uri}\n    range: ${JSON.stringify(segment.range)}`;
                            if(segment.type == vars.snippetType.typescript){
                                docSnippetsReturnString += `\n    text:\n        ${segment.text}`
                            }
                        })
                        return docSnippetsReturnString
                    })()}`
                )
            })
            return returnString
        })()}`
    ))
}

export {
    run
}
