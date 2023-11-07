// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';


export function activate(context: vscode.ExtensionContext) {
	console.log('activate makefile buttons!')
	const codelensProvider = new MakefileCodelensProvider();

	context.subscriptions.push(
		vscode.languages.registerCodeLensProvider(
			{ scheme: 'file', language: 'makefile' }, codelensProvider
		)
	);

	const disposable = vscode.commands.registerCommand('extension.runCommand', (target: string) => {
		runCommand(target)
	});
}

class MakefileCodelensProvider implements vscode.CodeLensProvider {
	

	protected enabled = true;
	private onDidChangeCodeLensesEmitter = new vscode.EventEmitter<void>();
	
	private _onDidChangeCodeLenses: vscode.EventEmitter<void> = new vscode.EventEmitter<void>()
    public readonly onDidChangeCodeLenses: vscode.Event<void> = this._onDidChangeCodeLenses.event

	
	public setEnabled(enabled: false): void {
		if (this.enabled !== enabled) {
			this.enabled = enabled;
			this.onDidChangeCodeLensesEmitter.fire();
		}
	}

	constructor() {
        vscode.workspace.onDidChangeConfiguration((_) => {
            this._onDidChangeCodeLenses.fire();
        });
    }


	public provideCodeLenses(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.CodeLens[] {
		// console.log('provideCodeLenses!')
		
		if (!this.enabled) {
			// console.log('this not enabled!')
			return [];
		}
		
		if (!(document.fileName.endsWith('Makefile') || document.fileName.endsWith('makefile'))) {
			// console.log('document is not Makefile!')
			return [];
		} 

		const codeLenses = this.findMatches(document)
		

	  	return ([] as vscode.CodeLens[]).concat(...codeLenses);;
	}

	public findMatches(document: vscode.TextDocument): vscode.CodeLens[] {
		// console.log('findMatches!')
		
		const codeLenses: vscode.CodeLens[] = [];
		const pattern = /^([\w\-]+):(?!=)/m;
		
		
		for (let i = 0; i < document.lineCount; i++) {
			const line = document.lineAt(i);
			const simpleMatch = line.text.match(pattern);
			
			
			if (simpleMatch) {
				
					const target = simpleMatch[1];
					
					codeLenses.push(
						new vscode.CodeLens(
							line.range,
							{
								title: 'make ' + target,
								command: 'extension.runCommand',
								arguments: [target],
								tooltip: "executes target " + target
							})
					);
				// }
			}
		}
		return codeLenses;
	}
}
  
function runCommand(target: string) {
	console.log('run target: ' + target)

	let t: vscode.Terminal
	if (vscode.window.activeTerminal) {
		t = vscode.window.activeTerminal
	} else {
		t = vscode.window.createTerminal();
	}

	t.show(false)
	t.sendText(`make ${target}`);

}