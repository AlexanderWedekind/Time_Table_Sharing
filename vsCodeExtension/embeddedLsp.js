const vscode =  require("vscode");
const fs = require("fs");

let context = vscode.ExtensionContext;

async function embeddedLspNeeded()
{
    const files = await vscode.workspace.findFiles("**/*.csproj");

    for(file in files)
    {
        path = file.fsPath;
        content = fs.readFileSync("");

        if(content.includes("<EmbeddedLsp>true</EmbeddedLsp>"))
        {
            return true;
        }
    }
    return false;
}

function handleRequests()
{
    while(true)
    {
        
    }
}

async function activate(context)
{
    vscode.window.showInformationMessage("embeddedLsp activated at workspace opening");
    let run = false;
    run = await embeddedLspNeeded();

    if(run)
    {
        vscode.window.showInformationMessage("embeddedLsp ready to recieve start command");
    }
    else
    {
        vscode.window.showInformationMessage("embeddedLsp will not run; no ' <EmbeddedLsp>true</EmbeddedLsp> ' field found in ' *.csproj '");
    }
        
    const startCommand = vscode.commands.registerCommand("JsAndCssInC#.startEmbeddedLsp", async function()
    {
        if(run)
        {
            vscode.window.showInformationMessage("embeddedLsp is running");
            handleRequests();
        }
    });

    context.subscriptions.push(startCommand);
    
}

function deactivate() {}

module.exports = {
    activate,
    deactivate
}