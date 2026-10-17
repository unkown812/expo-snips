import fs from "node:fs";
import path from "node:path";

/**
 * Shared registry recipe loader used by the registry builder, the offline
 * bundles consumed by the CLI and the VS Code extension, and the registry
 * package itself.
 *
 * Recipes live in `packages/registry/data/**\/*.json` and reference Handlebars
 * templates with `templateFile`. A recipe may also map a screen variant (or a
 * styling override) to a template file. Every referenced `.hbs` file is inlined
 * into the emitted recipe so consumers never need filesystem access to render.
 */

const TEMPLATE_EXT = ".hbs";

export function walkJsonFiles(dir) {
  const results = [];
  for (const rel of fs.readdirSync(dir, { recursive: true })) {
    if (typeof rel === "string" && rel.endsWith(".json")) {
      results.push(path.join(dir, rel));
    }
  }
  return results;
}

function readTemplate(templatesDir, ref) {
  const templatePath = path.resolve(templatesDir, ref);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${ref} (looked in ${templatesDir})`);
  }
  return fs.readFileSync(templatePath, "utf-8");
}

function inlineTemplateRef(templatesDir, value) {
  // Variant / per-styling overrides may hold either a template string or a
  // path to a `.hbs` file. Resolve file references to their contents.
  if (typeof value !== "string") return value;
  if (value.endsWith(TEMPLATE_EXT)) return readTemplate(templatesDir, value);
  return value;
}

/**
 * Load and fully inline every recipe from a registry package directory.
 * `registryPkgDir` must contain `data/` and `templates/`.
 */
export function loadRecipes(registryPkgDir) {
  const dataDir = path.join(registryPkgDir, "data");
  const templatesDir = path.join(registryPkgDir, "templates");

  return walkJsonFiles(dataDir)
    .map((filePath) => {
      const recipe = JSON.parse(fs.readFileSync(filePath, "utf-8"));

      for (const file of recipe.files ?? []) {
        if (file.templateFile) {
          file.template = readTemplate(templatesDir, file.templateFile);
          delete file.templateFile;
        }
        if (file.variants) {
          for (const [key, value] of Object.entries(file.variants)) {
            file.variants[key] = inlineTemplateRef(templatesDir, value);
          }
        }
        if (file.perStyling) {
          for (const [key, value] of Object.entries(file.perStyling)) {
            file.perStyling[key] = inlineTemplateRef(templatesDir, value);
          }
        }
      }

      return recipe;
    })
    .sort((a, b) => String(a.id).localeCompare(String(b.id)));
}

/** Index summary for a recipe (everything a browser/quick-pick needs). */
export function toIndexEntry(recipe) {
  return {
    id: recipe.id,
    name: recipe.name,
    description: recipe.description,
    version: recipe.version,
    typescript: recipe.typescript,
    tags: recipe.tags ?? [],
    supported: recipe.supported,
  };
}

/**
 * Write an auto-generated TypeScript module that exports the recipes as a
 * plain data constant. Used by packages compiled with `tsc` (the CLI) and by
 * esbuild (the VS Code extension) without needing JSON copy steps.
 */
export function writeRecipesModule(recipes, outFile, coreImport = "@expo-snips/core") {
  const json = JSON.stringify(recipes, null, 2);
  const content =
    "// AUTO-GENERATED FILE - do not edit.\n" +
    "// Regenerate with `pnpm --filter <package> build` (see scripts/prepare-registry.mjs).\n" +
    `import type { ScreenRecipe } from ${JSON.stringify(coreImport)};\n\n` +
    `export const REGISTRY_RECIPES = ${json} as unknown as ScreenRecipe[];\n`;
  fs.mkdirSync(path.dirname(outFile), { recursive: true });
  fs.writeFileSync(outFile, content);
  return recipes.length;
}
