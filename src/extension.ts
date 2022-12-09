import assert = require("assert");
import * as vscode from "vscode";

function difference<T>(a: T[], b: T[]): T[] {
  const setB = new Set(b);
  return a.filter((x) => !setB.has(x));
}

function htmlEntities(rawStr: string) {
  return rawStr.replace(/[\u00A0-\u9999<>\&]/g, function (i) {
    return "&#" + i.charCodeAt(0) + ";";
  });
}

function stringToList(str: string) {
  return str.trim().split(/[\n\r]+/);
}

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "manipulist.diffList",
    async () => {
      const selections = vscode.window?.activeTextEditor?.selections;
      if (!selections) {
        vscode.window.showErrorMessage("No selections found");
        return;
      }
      assert(selections);
      if (selections.length !== 1) {
        vscode.window.showErrorMessage("Should select exactly 1 text");
        return;
      }
      const activeTextEditor = vscode.window.activeTextEditor;
      if (!activeTextEditor) {
        vscode.window.showErrorMessage("No activeTextEditor");
        return;
      }
      assert(activeTextEditor);

      const clipboard = await vscode.env.clipboard.readText();
      if (!clipboard) {
        vscode.window.showErrorMessage("No clipboard content");
        return;
      }

      const asString = [
        activeTextEditor.document.getText(selections[0]),
        await vscode.env.clipboard.readText(),
      ];
      const asList = asString.map((str) => stringToList(str));
      const panel = vscode.window.createWebviewPanel(
        "result",
        "Result",
        vscode.ViewColumn.Beside
      );
      panel.webview.html = `<div style="white-space: pre-line;">${htmlEntities(
        difference(asList[0], asList[1]).join("\n")
      )}</div>`;
    }
  );

  context.subscriptions.push(disposable);
}

export function deactivate() {}
