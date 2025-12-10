console.log("Top of indes.ts")
debugger;

import * as vscode from 'vscode';
import * as ts from 'typescript';
import * as rpc from 'vscode-jsonrpc';
import * as cp from 'child_process';
import * as term from './setupLogic/createTerminal';
import { run } from './functions/run';
import { targetCurrentDoc } from './functions/functions';

const name = require('../package.json').name;
const version = require('../package.json').version;

export function activate(context: vscode.ExtensionContext){
    console.log("I should see this in the debug console");
    debugger;
    //term.write(term.output("Running!", `${name} version [${version}] is running`))
    console.log("REGISTERED COMMANDS:", vscode.commands.getCommands())
    const startCommand = "JsAndCssInCsharp.startEmbeddedLsp";
    context.subscriptions.push(vscode.commands.registerCommand(startCommand, () => {console.log("START COMMAND INVOKED");run()}));
        const newTargetTextCommand = "JsAndCssInCsharp.targetNewDocument";
        context.subscriptions.push(vscode.commands.registerCommand(newTargetTextCommand, targetCurrentDoc));
        const quitCommand = "JsAndCssInCsharp.quitEmbeddedLsp";
        context.subscriptions.push(vscode.commands.registerCommand(quitCommand, deactivate));
};

export function deactivate(){
    term.write(term.output(
        "Quit", `quitting ${name}-${version}\n${term.output(
            "Cleanup",
            `${
                (() => {try{
                    term.myTerminalDispose();
                    return "terminal disposed..."
                    }catch(error){
                        return `failed to dispose terminal\n${JSON.stringify(error)}`
                    }
                })()
            }${
                (() => {
                    try{
                        term.myPseudoTermClose();
                        return "\npseudo terminal closed..."
                    }catch(error){
                        return `\nfailed to disclose pseudo terminal\n${JSON.stringify(error)}`
                    }
                })()
            }`
        )}`))
};