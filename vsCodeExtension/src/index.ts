import * as vscode from 'vscode';
import * as ts from 'typescript';
import * as rpc from 'vscode-jsonrpc';
import * as cp from 'child_process';
import * as term from './setupLogic/createTerminal';
import { run } from './functions/run';
import { targetCurrentDoc } from './functions/functions';

const name = require('../package.json').name;
const version = require('../package.json').version;
//const targetCurrentDoc = functions.targetCurrentDoc;


//let myOutputs: vscode.OutputChannel | undefined;

//let myPseudoTerm: vscode.Pseudoterminal | undefined, myTerminal: vscode.Terminal | undefined, termDims: vscode.TerminalDimensions | undefined, terminalWrite: vscode.EventEmitter<string>, output;

export function activate(context: vscode.ExtensionContext){
    // myOutputs = vscode.window.createOutputChannel('embedded ts lsp output channel');
    // myOutputs.show(true);
    //const run = runFunction.run;
    //({termDims, terminalWrite, myPseudoTerm, myTerminal, output} = createTerminal());

    // const termSetupResults = createTerminal();
    // let termDims = termSetupResults.termDims;
    // const terminalWrite = termSetupResults.terminalWrite;
    // myPseudoTerm = termSetupResults.myPseudoTerm;
    // myTerminal = termSetupResults.myTerminal;
    // const output = termSetupResults.output;

    // let termDims: vscode.TerminalDimensions = {
    //     columns: 0 as number,
    //     rows: 0 as number
    // };
    
    // const terminalWrite: vscode.EventEmitter<string> = new vscode.EventEmitter<string>();

    // myPseudoTerm = {
    //     onDidWrite: terminalWrite.event,
    //     open: () => {},
    //     close: () => {},
    //     setDimensions: (dimensions) => {
    //         termDims = dimensions;
    //     }
    // }

    // myTerminal = vscode.window.createTerminal({
    //     name: "embedded-lsp-debug-info",
    //     pty: myPseudoTerm
    // });

    // myTerminal.show(true);

    // function output(title: string, data: string): string{
    //     let dataArr: string[] = data.split('\n');
    //     let dataReturn: string = "";
    //     for(let i = 0; i < dataArr.length; i++){
    //         dataReturn = `  ${dataArr[i]}\n`;
    //     };
    //     return `\n-- ${title}: --\n${dataReturn}\n-- end --`;
    // }
    const startCommand = "JsAndCssInCsharp.startEmbeddedLsp";
    context.subscriptions.push(vscode.commands.registerCommand(startCommand, run));
    const newTargetTextCommand = "JsAndCssInCsharp.targetNewDocument";
    context.subscriptions.push(vscode.commands.registerCommand(newTargetTextCommand, targetCurrentDoc));

};

export function deactivate(context: vscode.ExtensionContext){
    term.myTerminalDispose();
    term.myPseudoTermClose()
};