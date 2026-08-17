import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs-extra";
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
  detectProject,
  DetectedProject,
  getWorkspaceRoot,
  upsertEntry,
} from "./project";
import { getRecipeById } from "./registry";

interface GeneratedFile {
  path: string;
  content: string;
}

interface ResolvedOptions {
  styling: StylingOption;
  router: RouterOption;
  ui: UIOption;
  icons: IconOption;
  typescript: boolean;
}

interface PrimitiveResolution {
  files: GeneratedFile[];
  dependencies: string[];
  devDependencies: string[];
  skipped: string[];
}

function pickSupported<T extends string>(
  supported: T[],
  preferred: T | undefined,
  fallback: T
): T {
  if (supported.length === 0) return fallback;
  return preferred && supported.includes(preferred) ? preferred : supported[0];
}

export function resolveOptions(
  recipe: ScreenRecipe,
  detected: DetectedProject
): ResolvedOptions {
  const config = vscode.workspace.getConfiguration("expo-snips");

  const defaultStyling = config.get<StylingOption>("defaultStyling");
  const defaultRouter = config.get<RouterOption>("defaultRouter");
  const defaultUi = config.get<UIOption>("defaultUi");
  const defaultIcons = config.get<IconOption>("defaultIcons");

  let styling = pickSupported<StylingOption>(
    recipe.supported.styling,
    detected.styling ?? defaultStyling,
    "nativewind"
  );
  const router = pickSupported<RouterOption>(
    recipe.supported.router,
    detected.router ?? defaultRouter,
    "expo-router"
  );
  let ui = pickSupported<UIOption>(
    recipe.supported.ui,
    detected.ui ?? defaultUi,
    "native"
  );
  let icons = pickSupported<IconOption>(
    recipe.supported.icons,
    detected.icons ?? defaultIcons,
    "lucide"
  );

  if (ui === "shadcn") {
    styling = "nativewind";
    icons = "lucide";
  }

  const typescript = detected.typescript ?? recipe.typescript ?? true;

  return { styling, router, ui, icons, typescript };
}

async function pickVariant(recipe: ScreenRecipe): Promise<string | undefined> {
  const variants = recipe.variants ?? [];
  if (variants.length === 0) return undefined;

  const chosen = await vscode.window.showQuickPick(
    variants.map((v) => ({
      label: v.label,
      description: v.id,
      detail: v.description,
      id: v.id,
    })),
    { placeHolder: `Select a variant for "${recipe.name}"` }
  );
  return chosen?.id;
}

function detectPackageManager(dir: string): string {
  if (fs.existsSync(path.join(dir, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(dir, "yarn.lock"))) return "yarn";
  if (fs.existsSync(path.join(dir, "bun.lockb"))) return "bun";
  return "npm";
}

function installDependencies(dir: string, deps: string[], devDeps: string[]): void {
  const manager = detectPackageManager(dir);
  const terminal = vscode.window.createTerminal({ name: "Expo Snips", cwd: dir });
  terminal.show(true);
  if (deps.length > 0) {
    terminal.sendText(`${manager} add ${deps.join(" ")}`);
  }
  if (devDeps.length > 0) {
    terminal.sendText(`${manager} add -D ${devDeps.join(" ")}`);
  }
}

async function resolvePrimitives(
  recipe: ScreenRecipe,
  context: GenerationContext,
  projectRoot: string,
  seen: Set<string>,
  acc: PrimitiveResolution,
  findRecipe: (id: string) => Promise<ScreenRecipe | undefined | null>
): Promise<void> {
  for (const id of recipe.primitives ?? []) {
    if (seen.has(id)) continue;
    seen.add(id);

    const primitive = await findRecipe(id);
    if (!primitive) continue;

    await resolvePrimitives(primitive, context, projectRoot, seen, acc, findRecipe);

    const primitiveContext: GenerationContext = {
      ...context,
      options: { ...context.options, styling: "nativewind", ui: "shadcn" },
    };

    for (const file of getFilesForRecipe(primitive, primitiveContext)) {
      if (fs.existsSync(path.join(projectRoot, file.path))) {
        acc.skipped.push(file.path);
        continue;
      }
      acc.files.push(file);
    }

    acc.dependencies.push(...(primitive.dependencies ?? []));
    acc.devDependencies.push(...(primitive.devDependencies ?? []));
  }
}

async function getPrimitives(
  recipe: ScreenRecipe,
  context: GenerationContext,
  projectRoot: string,
  findRecipe: (id: string) => Promise<ScreenRecipe | undefined | null>
): Promise<PrimitiveResolution> {
  const acc: PrimitiveResolution = {
    files: [],
    dependencies: [],
    devDependencies: [],
    skipped: [],
  };
  await resolvePrimitives(recipe, context, projectRoot, new Set(), acc, findRecipe);

  acc.dependencies = [...new Set(acc.dependencies)];
  acc.devDependencies = [...new Set(acc.devDependencies)];
  return acc;
}

export async function generateScreen(recipe: ScreenRecipe): Promise<void> {
  const projectRoot = getWorkspaceRoot();
  if (!projectRoot) {
    vscode.window.showErrorMessage("Expo Snips: no workspace folder is open.");
    return;
  }

  const detected = await detectProject(projectRoot);
  const options = resolveOptions(recipe, detected);
  const variant = await pickVariant(recipe);

  const context: GenerationContext = { projectRoot, options, variant };
  const files = getFilesForRecipe(recipe, context);
  if (files.length === 0) {
    vscode.window.showErrorMessage(
      `Expo Snips: no files matched "${recipe.id}" for the selected options.`
    );
    return;
  }

  const config = vscode.workspace.getConfiguration("expo-snips");
  const install = config.get<boolean>("installDependencies", true);

  const result = await vscode.window.withProgress(
    {
      location: vscode.ProgressLocation.Notification,
      title: `Expo Snips: generating ${recipe.name}...`,
    },
    async () => {
      const written: string[] = [];
      const allDeps = [...recipe.dependencies];
      const allDevDeps = [...(recipe.devDependencies ?? [])];

      for (const file of files) {
        const fullPath = path.join(projectRoot, file.path);
        await fs.ensureDir(path.dirname(fullPath));
        await fs.writeFile(fullPath, file.content);
        written.push(file.path);
      }

      if (options.ui === "shadcn") {
        const primitives = await getPrimitives(recipe, context, projectRoot, getRecipeById);
        for (const file of primitives.files) {
          const fullPath = path.join(projectRoot, file.path);
          await fs.ensureDir(path.dirname(fullPath));
          await fs.writeFile(fullPath, file.content);
          written.push(file.path);
        }
        allDeps.push(...primitives.dependencies);
        allDevDeps.push(...primitives.devDependencies);
      }

      upsertEntry(
        {
          recipeId: recipe.id,
          recipeVersion: recipe.version,
          installedAt: new Date().toISOString(),
          options: { ...options },
          variant,
          files: written,
        },
        projectRoot
      );

      return {
        written,
        allDeps: [...new Set(allDeps)],
        allDevDeps: [...new Set(allDevDeps)],
      };
    }
  );

  const action = await vscode.window.showInformationMessage(
    `Expo Snips: added ${recipe.name} (${result.written.length} file${result.written.length === 1 ? "" : "s"}).`,
    { detail: `Generated:\n${result.written.map((f) => `  ${f}`).join("\n")}` },
    "Open main file"
  );
  if (action === "Open main file" && result.written[0]) {
    const doc = await vscode.workspace.openTextDocument(
      path.join(projectRoot, result.written[0])
    );
    await vscode.window.showTextDocument(doc);
  }

  if (install && (result.allDeps.length > 0 || result.allDevDeps.length > 0)) {
    installDependencies(projectRoot, result.allDeps, result.allDevDeps);
  }
}
