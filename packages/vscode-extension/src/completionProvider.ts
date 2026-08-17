import * as vscode from "vscode";
import { getRecipeIndex } from "./registry";

const TRIGGER_PATTERN = /expo-snips:$|snip:$/;

export function registerCompletionProvider(context: vscode.ExtensionContext): void {
  const provider = vscode.languages.registerCompletionItemProvider(
    ["typescript", "typescriptreact", "javascript", "javascriptreact"],
    {
      async provideCompletionItems(document, position) {
        const linePrefix = document.lineAt(position).text.slice(0, position.character);
        const match = linePrefix.match(TRIGGER_PATTERN);
        if (!match) return undefined;

        const range = new vscode.Range(
          position.line,
          match.index ?? position.character,
          position.line,
          position.character
        );

        const index = await getRecipeIndex();
        return index.map((entry) => {
          const item = new vscode.CompletionItem(entry.id, vscode.CompletionItemKind.Class);
          item.detail = entry.name;
          item.documentation = new vscode.MarkdownString(
            entry.description + (entry.tags?.length ? `\n\n_Tags: ${entry.tags.join(", ")}_` : "")
          );
          item.sortText = entry.id;
          item.range = range;
          item.insertText = "";
          item.command = {
            command: "expo-snips.generateFromCompletion",
            title: "Generate screen",
            arguments: [entry.id],
          };
          return item;
        });
      },
    },
    ":"
  );

  context.subscriptions.push(provider);
}
