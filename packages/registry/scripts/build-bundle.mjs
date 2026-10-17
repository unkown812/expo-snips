import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadRecipes } from "../../../scripts/lib/build-recipes.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, "..");
const outFile = path.join(pkgRoot, "bundle.json");

const recipes = loadRecipes(pkgRoot);

const bundle = {
  version: 1,
  name: "@expo-snips/registry",
  recipes,
};

fs.writeFileSync(outFile, JSON.stringify(bundle, null, 2));
console.log(`Wrote ${recipes.length} recipes to ${outFile}`);
