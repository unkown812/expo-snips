import { Command } from "commander";
import { resolveRegistry } from "../utils/resolveRegistry";

export const listCommand = new Command("list")
  .description("List all available screens")
  .option("--registry <url>", "Remote registry URL (defaults to EXPO_SNIPS_REGISTRY)")
  .action(async (options) => {
    const { index, source } = await resolveRegistry(options.registry);
    if (index.length === 0) {
      console.log("No screens found in the registry.");
      return;
    }
    console.log(`Available screens (${index.length}) from ${source} registry:\n`);
    for (const entry of index) {
      const tags = entry.tags?.length ? ` [${entry.tags.join(", ")}]` : "";
      console.log(`  ${entry.id.padEnd(24)} ${entry.name}${tags}`);
    }
  });