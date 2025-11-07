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

const output = (title: string, data: string): string => {
    let dataArr: string[] = data.split('\n');
    let indent: string = "    ";
    // let indent: string = ((tabsCount: number = tabs) => {
    //     let oneIndent: string = "    ";
    //     let returnString = "";
    //     while(tabsCount > 0){
    //         returnString = `${returnString}${oneIndent}`;
    //         tabsCount--;
    //     };
    //     return returnString;
    // })();
    const lineLimit = termDims.columns - indent.length - 1;
    for(let i = 0; i < dataArr.length; i++){
        if(dataArr[i].length > lineLimit){
            let keepString: string = "";
            let keepArr: string[] = [];
            let splitOffPart: string = dataArr[i].substring(lineLimit - 1);
            dataArr[i] = dataArr[i].substring(0, lineLimit);
            keepArr[0] = splitOffPart;
            let j = i + 1;
            let k = i + 1;
            while(j < dataArr.length){
                keepArr.push(dataArr[j]);
                j++;
            };
            dataArr = dataArr.filter((element, index) => {
                let returnElement: string;
                if(index < k){
                    return element;
                }
                }).concat(keepArr);
        }
    };
    return `${(() => {
        let dataString: string = "";
        for(let line of dataArr){
            dataString = dataString + line + '\n';
        };
        return `-- ${title}: --\n${dataString}\n-- end --`;
    })()}`;
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
