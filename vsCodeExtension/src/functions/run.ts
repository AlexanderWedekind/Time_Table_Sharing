import * as vscode from 'vscode';
import * as functions from './functions';
import { vars } from '../vars/vars';
import { output, write } from '../setupLogic/createTerminal';


function run(){
    functions.targetCurrentDoc();
    write(output("Doc Uri", `${functions.giveCurrentDocUri()}\r\n${output("Doc Uri", functions.giveCurrentDocUri())}`));
    //write(output("Doc uri", functions.giveCurrentDocUri()));
    //write(output("TEST", "indented"))
}

export {
    run
}
