import * as vscode from 'vscode';

export function activate(ctx: vscode.ExtensionContext) {
  ctx.subscriptions.push(
    vscode.languages.registerFoldingRangeProvider(
      'markdown',
      {
        provideFoldingRanges: textDocument => {
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
      }
    ));
}

