import * as vscode from "vscode";
import { getRecipeById, getRecipeIndex } from "./registry";
import { generateScreen } from "./generator";

export function registerCommands(context: vscode.ExtensionContext): void {
  context.subscriptions.push(
    vscode.commands.registerCommand("expo-snips.addScreen", async () => {
      const index = await getRecipeIndex();
      if (index.length === 0) {
        vscode.window.showErrorMessage("Expo Snips: no screens found in the registry.");
        return;
      }

      const selected = await vscode.window.showQuickPick(
        index.map((r) => ({
          label: r.name,
          description: r.id,
          detail: r.description,
          id: r.id,
        })),
        {
          placeHolder: "Select a screen to add",
          matchOnDescription: true,
        }
      );
      if (!selected) return;

      const recipe = await getRecipeById(selected.id);
      if (!recipe) {
        vscode.window.showErrorMessage(`Expo Snips: screen not found: ${selected.id}`);
        return;
      }
      await generateScreen(recipe);
    }),

    vscode.commands.registerCommand(
      "expo-snips.generateFromCompletion",
      async (recipeId?: string) => {
        if (!recipeId) return;
        const recipe = await getRecipeById(recipeId);
        if (!recipe) {
          vscode.window.showErrorMessage(`Expo Snips: screen not found: ${recipeId}`);
          return;
        }
        await generateScreen(recipe);
      }
    )
  );
}
