import * as vscode from'vscode';
import {vars} from '../vars/vars';
import {write, output} from './createTerminal';

export function createDiagnosticCollection(){
    vars.diagnosticCollection = vscode.languages.createDiagnosticCollection('ts-in-csharp-lsp');
}

export function disposeDiagnosticCollection(){
    if(vars.diagnosticCollection != undefined){
        vars.diagnosticCollection.dispose();
        vars.diagnosticCollection = undefined;
    }
}

// export function setDiagnostics(diagnostics: vscode.Diagnostic[] | undefined){
//     if(vars.diagnosticCollection != undefined){
//         vars.diagnosticCollection.set(vars.currentTargetDoc!.uri, diagnostics);
//     }else{
//         write(output(
//             "setDiagnostics() -> Problem",
//             "'vars.diagnosticCollection' was undefined -> no diagnostics were set"
//         ))
//     }
// }
