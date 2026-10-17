import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { loadRecipes, writeRecipesModule } from "../../../scripts/lib/build-recipes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, "..");
const registryPkgDir = path.resolve(pkgRoot, "..", "registry");
const outFile = path.join(pkgRoot, "src", "generated", "registry-data.ts");

/**
 * Inline the local screen registry into a TypeScript module so the extension
 * works fully offline, immediately after install, with no remote registry.
 */
export function prepareRegistry() {
  const recipes = loadRecipes(registryPkgDir);
  const count = writeRecipesModule(recipes, outFile);
  console.log(`Prepared offline registry: ${count} recipes -> ${path.relative(pkgRoot, outFile)}`);
  return recipes;
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  prepareRegistry();
}
