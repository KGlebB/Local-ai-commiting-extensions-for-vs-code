// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const util = require('util');
const exec = util.promisify(require('child_process').exec);

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "local-ai-commit" is now active!');

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	const disposable = vscode.commands.registerCommand('local-ai-commit.helloWorld', async function () {
		// The code you place here will be executed every time your command is executed
		// await exec('PROVIDER=ollama');
		process.env.PROVIDER = 'ollama';
		const workspaceFolder = getWorkspaceFolder();
		// const { stdout, stderr } = await exec('ai-commit', {
		// 	cwd: workspaceFolder,
		// });
		
		const task = new vscode.Task(
		  { type: 'shell', command: 'set PROVIDER=ollama && ai-commit' },
		  workspaceFolder,
		  'Run ai-commit',
		  'ai-commit',
		  new vscode.ShellExecution('cmd.exe', ['/c', 'set PROVIDER=ollama && ai-commit']),
		);

		const taskExecution = await vscode.tasks.executeTask(task);
  
		// Listen for the task completion event
		const taskCompletionDisposable = vscode.tasks.onDidEndTask((event) => {
		  if (event.execution === taskExecution) {
			// Get the task result
			const result = event.task.definition.command;
			handleTaskResult(result);
		  }
		});
  
		context.subscriptions.push(taskCompletionDisposable);
	});

	context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
function deactivate() { }



function getWorkspaceFolder() {
	const activeTextEditor = vscode.window.activeTextEditor;
	if (!activeTextEditor) {
		return null;
	}

	const workspaceFolder = vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri);
	console.log(workspaceFolder);
	return workspaceFolder;
}

module.exports = {
	activate,
	deactivate
}
