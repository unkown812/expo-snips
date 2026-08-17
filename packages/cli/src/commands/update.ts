import { Command } from "commander";
import chalk from "chalk";
import prompts from "prompts";
import fs from "fs-extra";
import path from "path";
import {
  GenerationContext,
  getFilesForRecipe,
  IconOption,
  RouterOption,
  ScreenRecipe,
  StylingOption,
  UIOption,
} from "@expo-snips/core";
import {
  readManifest,
  ManifestEntry,
  updateEntryVersions,
} from "../utils/manifest";
import { writeFiles } from "../utils/writeFiles";
import { getPrimitives } from "../utils/primitives";
import { getRecipeById } from "../utils/registry";
import { resolveRegistry } from "../utils/resolveRegistry";
import { hasChanges, printDiff } from "../utils/diff";

function buildContext(entry: ManifestEntry, projectRoot: string): GenerationContext {
  return {
    projectRoot,
    options: {
      styling: entry.options.styling as StylingOption,
      router: entry.options.router as RouterOption,
      ui: entry.options.ui as UIOption,
      icons: entry.options.icons as IconOption,
      typescript: entry.options.typescript,
    },
    variant: entry.variant,
  };
}

export const updateCommand = new Command("update")
  .description("Update generated screens to the latest registry version")
  .argument("[screenId]", "Screen ID to update (e.g. auth/login); updates all if omitted")
  .option("--registry <url>", "Remote registry URL (defaults to EXPO_SNIPS_REGISTRY)")
  .option("--yes", "Apply updates without asking for confirmation")
  .action(async (screenId: string | undefined, options) => {
    const projectRoot = process.cwd();
    const manifest = readManifest(projectRoot);

    let entries = manifest.installs;
    if (screenId) {
      entries = entries.filter((e) => e.recipeId === screenId);
      if (entries.length === 0) {
        console.error(chalk.red(`No installed screens match "${screenId}".`));
        console.log("Run `expo-snips status` to see tracked screens.");
        process.exitCode = 1;
        return;
      }
    }

    if (entries.length === 0) {
      console.log(chalk.yellow("No screens are tracked in this project yet."));
      console.log("Run `expo-snips add <screenId>` to generate one.");
      return;
    }

    await resolveRegistry(options.registry);
    const findRecipe = async (id: string): Promise<ScreenRecipe | undefined> =>
      (await getRecipeById(id, options.registry)) ?? undefined;

    const updates: Array<{
      entry: ManifestEntry;
      files: Array<{ path: string; content: string }>;
    }> = [];
    const diffs: Array<{ path: string; oldContent: string; newContent: string }> = [];

    for (const entry of entries) {
      const recipe = await findRecipe(entry.recipeId);
      if (!recipe) {
        console.warn(
          chalk.yellow(`Skipping ${entry.recipeId}: not found in registry (may have been removed or renamed).`)
        );
        continue;
      }

      const context = buildContext(entry, projectRoot);
      const files = getFilesForRecipe(recipe, context);

      let allFiles = files;
      if (context.options.ui === "shadcn") {
        const primitives = await getPrimitives(recipe, context, projectRoot, findRecipe);
        allFiles = [...files, ...primitives.files];
      }

      for (const file of allFiles) {
        const fullPath = path.join(projectRoot, file.path);
        const oldContent = fs.existsSync(fullPath) ? fs.readFileSync(fullPath, "utf-8") : null;

        if (oldContent === null) {
          diffs.push({ path: file.path, oldContent: "", newContent: file.content });
        } else if (hasChanges(oldContent, file.content)) {
          diffs.push({ path: file.path, oldContent, newContent: file.content });
        }
      }

      updates.push({ entry, files: allFiles });
    }

    if (diffs.length === 0) {
      console.log(chalk.green("All tracked screens are up to date."));
      return;
    }

    console.log(chalk.cyan(`\n${diffs.length} file(s) would change:\n`));
    for (const diff of diffs) {
      printDiff(diff.path, diff.oldContent, diff.newContent);
    }

    const proceed = options.yes
      ? true
      : (
          await prompts({
            type: "confirm",
            name: "proceed",
            message: "Apply these updates?",
            initial: false,
          })
        ).proceed;

    if (!proceed) {
      console.log(chalk.yellow("Update cancelled."));
      return;
    }

    for (const { files } of updates) {
      await writeFiles(files, projectRoot);
    }

    updateEntryVersions(
      await Promise.all(
        updates.map(async (u) => ({
          recipeId: u.entry.recipeId,
          variant: u.entry.variant,
          recipeVersion: (await findRecipe(u.entry.recipeId))?.version ?? u.entry.recipeVersion,
        }))
      ),
      projectRoot
    );

    console.log(chalk.green(`\n\u2713 Updated ${updates.length} screen(s) to the latest version.`));
  });