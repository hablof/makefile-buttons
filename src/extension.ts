// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as child_process from 'child_process';



// const MakefilePattegn: vscode.DocumentFilter = { scheme: 'file', pattern: 'Makefile' };
// const MakefileLanguage: vscode.DocumentFilter = { scheme: 'file', language: 'Makefile' };
// export function isMakefile(document: vscode.TextDocument): boolean {
// 	if (
// 		vscode.languages.match(MakefilePattegn, document) ||
// 		vscode.languages.match(MakefileLanguage, document)
// 	) {
// 		return true;
// 	}
// 	return false;
// }

export function activate(context: vscode.ExtensionContext) {
	console.log('activate makefile buttons!')
	const codelensProvider = new MakefileCodelensProvider();

	context.subscriptions.push(
		vscode.languages.registerCodeLensProvider(
			{ scheme: 'file' }, codelensProvider
		)
	);
	// context.subscriptions.push(vscode.languages.registerCodeLensProvider(MakefileLanguage, codelensProvider));
	// context.subscriptions.push(vscode.languages.registerCodeLensProvider(MakefilePattegn, codelensProvider));
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
		console.log('provideCodeLenses!')
		
		if (!this.enabled) {
			console.log('this not enabled!')
			return [];
		}
		
		if (!(document.fileName.endsWith('Makefile') || document.fileName.endsWith('makefile'))) {
			console.log('document is not Makefile!')
			return [];
		} 

		const codeLenses = this.findMatches(document)
		

	  	return ([] as vscode.CodeLens[]).concat(...codeLenses);;
	}

	public findMatches(document: vscode.TextDocument): vscode.CodeLens[] {
		console.log('findMatches!')

		const codeLenses: vscode.CodeLens[] = [];
		const pattern = /^[\w\-]+:(?:\s[\.\w\-]+)*/gm;


		for (let i = 0; i < document.lineCount; i++) {
			const line = document.lineAt(i);
			const simpleMatch = line.text.match(pattern);


			if (simpleMatch) {
				const target = simpleMatch[0];

				codeLenses.push(
					new vscode.CodeLens(
						line.range,
						{
							title: 'make ' + target,
							command: 'makefile.runCommand',
							arguments: [target]
						})
				);
			}
		}
		return codeLenses;
	}
}
  
  function runCommand(command: string, args: string[]) {
	const makeProcess = child_process.spawn(command, args, { cwd: vscode.workspace.rootPath });
	makeProcess.stdout.on('data', (data) => {
	  console.log(data.toString());
	});
	makeProcess.stderr.on('data', (data) => {
	  console.error(data.toString());
	});
	makeProcess.on('exit', (code) => {
	  if (code !== 0) {
		vscode.window.showErrorMessage(`Makefile command "${command}" failed with error code ${code}`);
	  }
	});
  }