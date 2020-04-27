import * as vscode from 'vscode';

let statusBarItem: vscode.StatusBarItem;

export function activate(ctx: vscode.ExtensionContext) {
  statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left);

  ctx.subscriptions.push(
    vscode.languages.registerFoldingRangeProvider('markdown', { provideFoldingRanges: findFoldingRanges }),
    vscode.window.onDidChangeTextEditorSelection(findCurrentRange),
    vscode.window.onDidChangeActiveTextEditor(findCurrentRange));
}

function findFoldingRanges(textDocument: vscode.TextDocument): vscode.FoldingRange[] {
  const foldingRanges: vscode.FoldingRange[] = [];
  let rangeStartIndex = null;

  for (let i = 0; i < textDocument.lineCount; i++) {
    const currentLine = textDocument.lineAt(i);

    if (currentLine.isEmptyOrWhitespace) {
      continue;
    }

    if (rangeStartIndex === null) {
      if (/^::: moniker range=".+"$/.test(currentLine.text)) {
        rangeStartIndex = i;
      }

      continue;
    }

    if (/^::: moniker-end$/.test(currentLine.text)) {
      foldingRanges.push({
        start: rangeStartIndex,
        end: i
      });

      rangeStartIndex = null;
    }
  }

  return foldingRanges;
}

function findCurrentRange(): void {
  const activeTextEditor = vscode.window.activeTextEditor;
  let statusBarItemText: string | null = null;

  if (activeTextEditor && activeTextEditor.document.languageId === 'markdown') {
    const textDocument = activeTextEditor.document;

    for (let i = activeTextEditor.selection.start.line; i >= 0; i--) {
      const currentLine = textDocument.lineAt(i);

      if (currentLine.isEmptyOrWhitespace) {
        continue;
      }

      const startRangeMatch = /^::: moniker range="(?<range>.+)"$/.exec(currentLine.text)

      if (startRangeMatch) {
        statusBarItemText = startRangeMatch.groups!['range'];
        break;
      }

      if (i !== activeTextEditor.selection.start.line && /^::: moniker-end$/.test(currentLine.text)) {
        break;
      }
    }
  }

  if (statusBarItemText) {
    statusBarItem.text = statusBarItemText;
    statusBarItem.show();
  } else {
    statusBarItem.hide();
  }
}
