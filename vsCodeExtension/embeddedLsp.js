const vscode =  require("vscode");

//let context = vscode.ExtensionContext;

// async function embeddedLspNeeded()
// {
//     const files = await vscode.workspace.findFiles("**/*.csproj");

//     for(file in files)
//     {
//         let filePath = file.fsPath;
//         content = fs.readFileSync(filePath);

//         if(content.includes("<EmbeddedLsp>true</EmbeddedLsp>"))
//         {
//             return true;
//         }
//     }
//     return false;
// }
//""""
// here is the first code snippet
//""""
function activate(context)
{
    //vscode.window.showInformationMessage("embeddedLsp activated at workspace opening");
    //let run = false;
    //run = await embeddedLspNeeded();

    // if(run)
    // {
    //     vscode.window.showInformationMessage("embeddedLsp ready to recieve start command");
    // }
    // else
    // {
    //     vscode.window.showInformationMessage("embeddedLsp will not run; no ' <EmbeddedLsp>true</EmbeddedLsp> ' field found in ' *.csproj '");
    // }

    function handleRequests()
    {
        let myOutputs = vscode.window.createOutputChannel("embeddedLsp output");
        myOutputs.show();
        var extensionTerminal = vscode.window.createTerminal("extension terminal");
        extensionTerminal.show(true);
        vscode.window.showInformationMessage(`embeddedLsp terminal is called: ${extensionTerminal.name}`);
        let text = vscode.window.activeTextEditor.document.getText();
        myOutputs.appendLine(typeof text);
        let codeSnippets = [];
        let snippetSearchCompleted = false;
        let preSnippetBoundaryStringIndex = 0;
        let postSnippetBoundaryStringIndex = 0;
        
        do{
            preSnippetBoundaryStringIndex = text.indexOf("\"\"\"\"", preSnippetBoundaryStringIndex);
            postSnippetBoundaryStringIndex = text.indexOf("\"\"\"\"", preSnippetBoundaryStringIndex + 1);
            if(preSnippetBoundaryStringIndex > -1 && postSnippetBoundaryStringIndex > -1){
                codeSnippets.push(text.substring(preSnippetBoundaryStringIndex + 4, postSnippetBoundaryStringIndex));
                preSnippetBoundaryStringIndex = postSnippetBoundaryStringIndex + 1;
            }else{
                snippetSearchCompleted = true;
            }
        }while(snippetSearchCompleted == false);

        codeSnippets.forEach((snippet, index) => {myOutputs.appendLine(`Snippet ${index + 1}:\n${snippet}`);});
        // let testString = "ladidadida";
        // myOutputs.appendLine(`index: ${testString.indexOf("abcd")}`);
        // function snippedExists(activeEditorText){
        //     textToBeEvaluated = activeEditorText;
        //     if(textToBeEvaluated.includes("\"\"\"\"")){
        //         let firstIndex = textToBeEvaluated.indexOf("\"\"\"\"");
        //         textToBeEvaluated = textToBeEvaluated.substring(firstIndex);
        //         if(textToBeEvaluated.includes("\"\"\"\"")){
        //             return true;
        //         }
        //         return false;
        //     }
        //     return false;
        // }

        // while(snippedExists(text)){
        //     let firstIndex = text.indexOf("\"\"\"\"");
        //     text = text.substring(firstIndex + 4);
        //     let secondIndex = text.substring("\"\"\"\"");
        //     let newSnippet = text.substring(0, secondIndex);
        //     snippets.push(newSnippet);
        //     text = text.substring(secondIndex + 4);
        // }
        // for(i = 0; i < snippets.length; i++){
        //     extensionTerminal.sendText(snippets[i], false);
        //     console.log(snippets[i]);
        // }
        // let textLines = text.split("\n");
        // for(line in textLines)
        // {
        //     for(char in line)
        //     {
        //         if(char == "\n"){
        //             char = "";
        //         }
        //     }
        //     extensionTerminal.sendText(line, false);
        // };
        // //vscode.window.activeTerminal.sendText(text, false);
        //vscode.window.showInformationMessage(vscode.window.activeTextEditor.document.getText());
        
        // while(true)
        // {

            
        // }
    }

    const startUpCommand = "JsAndCssInCsharp.startEmbeddedLsp";

    const runOnStartupCommand = () => {
        let run = true;
        if(run){
            vscode.window.showInformationMessage("embeddedLsp [1.0.7] is running");
            handleRequests();
        }
        else
        {
            vscode.window.showInformationMessage("embeddedLsp will not run; no ' <EmbeddedLsp>true</EmbeddedLsp> ' field found in ' *.csproj '");
        }
        //""""
        // and the second code snippet
        //""""

    };

    
    context.subscriptions.push(vscode.commands.registerCommand(startUpCommand, runOnStartupCommand));
    
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
};