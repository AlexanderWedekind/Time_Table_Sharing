import * as vscode from 'vscode';

const vars = {
    currentDocUri: vscode.window.activeTextEditor?.document.uri as vscode.Uri | undefined
};


export {
    vars
}
    
