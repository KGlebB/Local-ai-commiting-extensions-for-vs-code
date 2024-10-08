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
	console.log('Congratulations, your extension "local-ai-commit" is now active!');
	const disposable = vscode.commands.registerCommand('local-ai-commit.helloWorld', async function () {
		process.env.PROVIDER = 'ollama';
		const workspaceFolder = vscode.workspace.rootPath;
		const { stdout, stderr } = await exec('git diff --quiet', {
			cwd: workspaceFolder,
		});
		if (stderr) {
			const userChoice = await vscode.window.showInformationMessage('No git diff provided');
			return;
		}
		const childPromise = exec('set PROVIDER=ollama && ai-commit', {
			cwd: workspaceFolder,
		});;
		let output = '';
		childPromise.child.stdout.on('data', (data) => {
			output += data.toString();
		});
		setTimeout(async () => {
			const commit = getProposedCommit(output);
			const userChoice = await vscode.window.showInformationMessage(`Autogenerated commit suggestion`, { modal: true, detail: commit }, 'Commit');
			const userInput = userChoice === 'Commit' ? 'y\n' : 'n\n';
			console.log(childPromise.child.stdin.write(userInput));
			childPromise.child.stdin.end();
		}, 2000);
	});

	context.subscriptions.push(disposable);
}

function getProposedCommit(output) {
	const startIndex = output.indexOf('Proposed Commit:');
	console.log(startIndex);
	const endIndex = output.lastIndexOf('\n');
	console.log(endIndex);
	if (startIndex === -1 || endIndex === -1) {
		return '';
	}
	return output.slice(startIndex + 'Proposed Commit:'.length, endIndex).trim().replace(/^-+\n\s*/, '').replace(/\n-+$/, '').replace(/\n-+\n/, '\n');
}

function getWorkspaceFolder() {
	const activeTextEditor = vscode.window.activeTextEditor;
	if (!activeTextEditor) {
		return null;
	}

	const workspaceFolder = vscode.workspace.getWorkspaceFolder(activeTextEditor.document.uri);
	return workspaceFolder;
}

// This method is called when your extension is deactivated
function deactivate() { }

module.exports = {
	activate,
	deactivate
}
