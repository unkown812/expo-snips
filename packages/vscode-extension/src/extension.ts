import * as vscode from "vscode";
import { registerCommands } from "./commands";
import { registerCompletionProvider } from "./completionProvider";

export function activate(context: vscode.ExtensionContext): void {
  registerCommands(context);
  registerCompletionProvider(context);

  const statusBar = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Right, 100);
  statusBar.text = "$(sparkle) Expo Snips";
  statusBar.tooltip = "Add an Expo Snip screen";
  statusBar.command = "expo-snips.addScreen";
  statusBar.show();
  context.subscriptions.push(statusBar);
}

export function deactivate(): void {}
