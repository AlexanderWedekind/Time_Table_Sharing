import * as vscode from 'vscode';
import * as functions from './functions';
import { vars } from '../vars/vars';
import { output, write } from '../setupLogic/createTerminal';
//import { sendInitializeRequest } from '../setupLogic/createServerInstance';


function run(){
    functions.targetCurrentDoc();
    write(output("Doc Uri", `${functions.giveCurrentDocUri()}\r\n${output("Doc Uri", functions.giveCurrentDocUri())}`));
    //write(output("Doc uri", functions.giveCurrentDocUri()));
    //write(output("TEST", "indented"))
    //write(output("tsserver path", vars.tsServerPath));
    //write("--> before sendInitializeRequest")
    //sendInitializeRequest();
    //write("--> after sendInitializeRequest")
}

export {
    run
}
