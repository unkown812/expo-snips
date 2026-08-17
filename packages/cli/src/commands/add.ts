import { Command } from "commander";
import chalk from "chalk";
import prompts from "prompts";
import {
  GenerationContext,
  getFilesForRecipe,
  IconOption,
  RouterOption,
  ScreenRecipe,
  StylingOption,
  UIOption,
} from "@expo-snips/core";
import { detectProject } from "../utils/detectProject";
import { writeFiles } from "../utils/writeFiles";
import { installDependencies } from "../utils/installDeps";
import { getPrimitives } from "../utils/primitives";
import { getRecipeById } from "../utils/registry";
import { resolveRegistry } from "../utils/resolveRegistry";
import { upsertEntry } from "../utils/manifest";

const stylingChoices: Array<{ title: string; value: StylingOption }> = [
  { title: "NativeWind (Tailwind for RN)", value: "nativewind" },
  { title: "StyleSheet (built-in)", value: "stylesheet" },
];

const routerChoices: Array<{ title: string; value: RouterOption }> = [
  { title: "Expo Router", value: "expo-router" },
  { title: "React Navigation", value: "react-navigation" },
];

const uiChoices: Array<{ title: string; value: UIOption }> = [
  { title: "Native components", value: "native" },
  { title: "shadcn/ui", value: "shadcn" },
];

const iconChoices: Array<{ title: string; value: IconOption }> = [
  { title: "lucide-react-native", value: "lucide" },
  { title: "None", value: "none" },
];

async function promptSelect<T extends string>(
  message: string,
  choices: Array<{ title: string; value: T }>,
  initial?: T
): Promise<T> {
  const response = await prompts({
    type: "select",
    name: "value",
    message,
    choices,
    initial: initial ? choices.findIndex((c) => c.value === initial) : 0,
  });
  return response.value as T;
}

export const addCommand = new Command("add")
  .argument("[screenId]", "Screen ID (e.g. auth/login)")
  .option("--styling <styling>", "Styling approach (nativewind, stylesheet, tamagui)")
  .option("--router <router>", "Router (expo-router, react-navigation)")
  .option("--ui <ui>", "UI primitives (native, shadcn, custom)")
  .option("--icons <icons>", "Icon library (lucide, vector-icons, none)")
  .option("--variant <variant>", "Screen variant (e.g. glass, dark)")
  .option("--typescript", "Force TypeScript (default true)")
  .option("--javascript", "Use JavaScript instead of TypeScript")
  .option("--no-install", "Skip dependency installation")
  .option("--registry <url>", "Remote registry URL (defaults to EXPO_SNIPS_REGISTRY)")
  .action(async (screenId: string | undefined, options) => {
    const { index } = await resolveRegistry(options.registry);
    const findRecipe = async (id: string): Promise<ScreenRecipe | undefined> =>
      (await getRecipeById(id, options.registry)) ?? undefined;

    if (!screenId) {
      if (index.length === 0) {
        console.error(chalk.red("No screens found in the registry."));
        console.error("Set EXPO_SNIPS_REGISTRY or use --registry <url> to point at a registry.");
        process.exitCode = 1;
        return;
      }
      const choices = index.map((r) => ({ title: r.name, value: r.id }));
      const response = await prompts({
        type: "select",
        name: "screenId",
        message: "Select a screen:",
        choices,
      });
      screenId = response.screenId;
      if (!screenId) {
        process.exitCode = 1;
        return;
      }
    }

    const recipe = await findRecipe(screenId);
    if (!recipe) {
      console.error(chalk.red(`Screen not found: ${screenId}`));
      console.error(`Run "expo-snips list" to see available screens.`);
      process.exitCode = 1;
      return;
    }

    const detected = await detectProject();

    let styling = options.styling as StylingOption | undefined;
    if (styling && !recipe.supported.styling.includes(styling)) {
      console.error(chalk.red(`Recipe "${recipe.id}" does not support styling "${styling}".`));
      process.exitCode = 1;
      return;
    }

    if (!styling) {
      const detectedStyling =
        detected.styling && recipe.supported.styling.includes(detected.styling)
          ? detected.styling
          : undefined;
      styling = detectedStyling ?? undefined;
    }

    let router =
      (options.router as RouterOption | undefined) ??
      (recipe.supported.router.length === 1
        ? recipe.supported.router[0]
        : detected.router && recipe.supported.router.includes(detected.router)
          ? detected.router
          : undefined);

    if (router && !recipe.supported.router.includes(router)) {
      console.error(chalk.red(`Recipe "${recipe.id}" does not support router "${router}".`));
      process.exitCode = 1;
      return;
    }

    let ui =
      (options.ui as UIOption | undefined) ??
      (recipe.supported.ui.length === 1
        ? recipe.supported.ui[0]
        : detected.ui && recipe.supported.ui.includes(detected.ui)
          ? detected.ui
          : undefined);

    if (ui && !recipe.supported.ui.includes(ui)) {
      console.error(chalk.red(`Recipe "${recipe.id}" does not support ui "${ui}".`));
      process.exitCode = 1;
      return;
    }

    let icons =
      (options.icons as IconOption | undefined) ??
      (recipe.supported.icons.length === 1
        ? recipe.supported.icons[0]
        : detected.icons && recipe.supported.icons.includes(detected.icons)
          ? detected.icons
          : undefined);

    if (icons && !recipe.supported.icons.includes(icons)) {
      console.error(chalk.red(`Recipe "${recipe.id}" does not support icons "${icons}".`));
      process.exitCode = 1;
      return;
    }

    const typescript = options.javascript ? false : options.typescript ?? detected.typescript ?? true;

    if (typescript === false && recipe.typescript) {
      console.error(chalk.yellow(`Warning: "${recipe.id}" is authored for TypeScript.`));
    }

    if (!styling) {
      const detectedStyling =
        detected.styling && recipe.supported.styling.includes(detected.styling)
          ? detected.styling
          : undefined;
      styling = await promptSelect("Which styling approach?", stylingChoices, detectedStyling);
    }

    if (!router) {
      const detectedRouter =
        detected.router && recipe.supported.router.includes(detected.router)
          ? detected.router
          : undefined;
      const choices = routerChoices.filter((c) => recipe.supported.router.includes(c.value));
      router = await promptSelect("Which router are you using?", choices, detectedRouter);
    }

    if (!ui) {
      const detectedUi =
        detected.ui && recipe.supported.ui.includes(detected.ui)
          ? detected.ui
          : undefined;
      const choices = uiChoices.filter((c) => recipe.supported.ui.includes(c.value));
      ui = await promptSelect("Which UI primitives?", choices, detectedUi);
    }

    if (!icons) {
      const detectedIcons =
        detected.icons && recipe.supported.icons.includes(detected.icons)
          ? detected.icons
          : undefined;
      const choices = iconChoices.filter((c) => recipe.supported.icons.includes(c.value));
      icons = await promptSelect("Which icon library?", choices, detectedIcons);
    }

    if (ui === "shadcn" && styling !== "nativewind") {
      console.log(
        chalk.yellow(`Note: shadcn-style primitives require NativeWind. Using styling=nativewind.`)
      );
      styling = "nativewind";
    }

    if (ui === "shadcn" && icons !== "lucide") {
      console.log(
        chalk.yellow(`Note: shadcn-style templates require lucide icons. Using icons=lucide.`)
      );
      icons = "lucide";
    }

    const variant = options.variant || undefined;

    const context: GenerationContext = {
      projectRoot: process.cwd(),
      options: { styling, router, ui, icons, typescript },
      variant,
    };

    const files = getFilesForRecipe(recipe, context);

    if (files.length === 0) {
      console.error(chalk.red("No files matched the selected options. Nothing generated."));
      process.exitCode = 1;
      return;
    }

    console.log(chalk.cyan(`\nGenerating "${recipe.name}" (${recipe.id})...`));
    console.log(
      chalk.dim(
        `  styling=${styling} router=${router} ui=${ui} icons=${icons} typescript=${typescript}`
      )
    );
    await writeFiles(files, process.cwd());

    const allDeps = [...recipe.dependencies];
    const allDevDeps = [...(recipe.devDependencies ?? [])];
    const writtenFiles = files.map((f) => f.path);

    if (ui === "shadcn") {
      const primitives = await getPrimitives(recipe, context, process.cwd(), findRecipe);
      if (primitives.files.length > 0) {
        console.log(chalk.cyan("\nGenerating UI primitives..."));
        await writeFiles(primitives.files, process.cwd());
      }
      for (const skipped of primitives.skipped) {
        console.log(chalk.dim(`  Skipped (already exists): ${skipped}`));
      }
      writtenFiles.push(...primitives.files.map((f) => f.path));
      allDeps.push(...primitives.dependencies);
      allDevDeps.push(...primitives.devDependencies);
    }

    if (options.install) {
      await installDependencies([...new Set(allDeps)], [...new Set(allDevDeps)]);
    }

    upsertEntry(
      {
        recipeId: recipe.id,
        recipeVersion: recipe.version,
        installedAt: new Date().toISOString(),
        options: { styling, router, ui, icons, typescript },
        variant,
        files: writtenFiles,
      },
      process.cwd()
    );

    console.log(chalk.green(`\n\u2713 ${recipe.name} added successfully!\n`));
    console.log("Next steps:");
    console.log("  - Review the generated files and adjust as needed.");
    console.log("  - Run your Expo app to see the screen.");
    console.log("  - Run `expo-snips update` to update to new recipe versions later.");
  });