import * as vscode from 'vscode';
import * as functions from './functions';
import { vars } from '../vars/vars';
import { output, write } from '../setupLogic/createTerminal';
import * as serverSetup from '../setupLogic/createServerInstance';

//"""" a snippet """"

async function run(){
    functions.targetCurrentDoc();
    write(output("Doc Uri", `${functions.giveCurrentDocUri()}\r\n${output("Doc Uri", functions.giveCurrentDocUri())}`));
    //write(output("Doc uri", functions.giveCurrentDocUri()));
    //write(output("TEST", "indented"))
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

    functions.refreshCurrentText();
    functions.identifySnippets();
    write(output(
        "Document Segment List - Head",
        `head:\n
        ${(() => {
            let returnString = "";
            let head = vars.documentSegmentList.getLastSegment();
            if(head == null){
                returnString = "nothing found";
            }else{
                returnString = JSON.stringify(head);
            }
            return returnString;
        })()}`
    ))
}

export {
    run
}
