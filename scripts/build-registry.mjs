import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRecipes, toIndexEntry } from "./lib/build-recipes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const registryPkgDir = path.join(root, "packages", "registry");
const registryDir = path.join(root, "registry");
const recipesDir = path.join(registryDir, "recipes");

const recipes = loadRecipes(registryPkgDir);

fs.rmSync(registryDir, { recursive: true, force: true });
fs.mkdirSync(recipesDir, { recursive: true });

for (const recipe of recipes) {
  const target = path.join(recipesDir, `${recipe.id}.json`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(recipe, null, 2));
}

const index = recipes.map(toIndexEntry);
fs.writeFileSync(path.join(registryDir, "index.json"), JSON.stringify(index, null, 2));

console.log(
  `Wrote ${recipes.length} recipes to ${path.relative(root, recipesDir)} and index.json`
);
