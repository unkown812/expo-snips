import { Command } from "commander";
import chalk from "chalk";
import { readManifest } from "../utils/manifest";

export const statusCommand = new Command("status")
  .description("Show screens tracked by .expo-snips.json")
  .action(() => {
    const manifest = readManifest(process.cwd());
    if (manifest.installs.length === 0) {
      console.log(chalk.yellow("No screens tracked in this project yet."));
      return;
    }
    console.log(chalk.cyan(`Tracked screens (${manifest.installs.length}):\n`));
    for (const entry of manifest.installs) {
      const variant = entry.variant ? ` (variant: ${entry.variant})` : "";
      console.log(
        `  ${entry.recipeId.padEnd(24)} v${entry.recipeVersion}${variant}`
      );
    }
    console.log(`\nRun ${chalk.bold("expo-snips update")} to update them to the latest version.`);
  });