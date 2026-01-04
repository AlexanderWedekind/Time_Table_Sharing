import * as vscode from 'vscode';

let termDims: vscode.TerminalDimensions = {
    columns: 0 as number,
    rows: 0 as number
};

const terminalWrite: vscode.EventEmitter<string> = new vscode.EventEmitter<string>();

let myPseudoTerm: vscode.Pseudoterminal | undefined = {
    onDidWrite: terminalWrite.event,
    open: () => {},
    close: () => {},
    setDimensions: (dimensions) => {
        termDims = dimensions;
    }
}

let myTerminal: vscode.Terminal | undefined = vscode.window.createTerminal({
    name: "embedded-lsp-debug-info",
    pty: myPseudoTerm
});

myTerminal.show(true);

const output = (title: string, data: any): string => {
    let dataArr: string[] = [];
    let returnDataArr: string[] = [];
    let dataReturnString: string = "";
    let indent: string = "    ";
    const lineLimit = termDims.columns - indent.length - 1;
    
    if(typeof data == "string"){
        dataArr = data.split('\n');

        for(let line in dataArr){
            dataArr[line] = dataArr[line].replace('\r', '');
        };
        
        for(const line of dataArr){
            let thisLineArr: string[] = [];
            thisLineArr[thisLineArr.length] = line;
            while(thisLineArr[thisLineArr.length - 1].length > lineLimit){
                thisLineArr[thisLineArr.length] = thisLineArr[thisLineArr.length - 1].substring(lineLimit + 1);
                thisLineArr[thisLineArr.length - 1] = thisLineArr[thisLineArr.length - 1].substring(0, lineLimit + 1);
            }
            returnDataArr = returnDataArr.concat(thisLineArr);
        }

        for(const line of returnDataArr){
            dataReturnString = dataReturnString + indent + line + "\r\n";
        }
    }else{
        dataReturnString = "~ logging input was Not of type 'String' ~";
    }
    
    return `\r\n-- ${title}: --\r\n${dataReturnString}-- End --`
};

const write = (output: string = "") => {
    terminalWrite.fire(output);
};

const myPseudoTermClose = () => {
    if(myPseudoTerm != undefined){
        myPseudoTerm.close();
        myPseudoTerm = undefined;
    }
};

const myTerminalDispose = () => {
    if(myTerminal != undefined){
        myTerminal.dispose();
        myTerminal = undefined;
    }
};

export {
    output,
    write,
    myPseudoTermClose,
    myTerminalDispose
};
