import { Command } from "commander";
import { resolveRegistry } from "../utils/resolveRegistry";

export const listCommand = new Command("list")
  .description("List all available screens")
  .option("--registry <url>", "Remote registry URL (falls back to local on failure)")
  .action(async (options) => {
    const { recipes, source } = await resolveRegistry(options.registry);
    if (recipes.length === 0) {
      console.log("No screens found in the registry.");
      return;
    }
    console.log(`Available screens (${recipes.length}) from ${source} registry:\n`);
    for (const recipe of recipes) {
      const tags = recipe.tags?.length ? ` [${recipe.tags.join(", ")}]` : "";
      console.log(`  ${recipe.id.padEnd(24)} ${recipe.name}${tags}`);
    }
  });