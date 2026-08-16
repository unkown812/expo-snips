import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pkgRoot = path.resolve(__dirname, "..");
const dataDir = path.join(pkgRoot, "data");
const templatesDir = path.join(pkgRoot, "templates");
const outFile = path.join(pkgRoot, "bundle.json");

function walkJson(dir) {
  const results = [];
  for (const rel of fs.readdirSync(dir, { recursive: true })) {
    if (typeof rel === "string" && rel.endsWith(".json")) {
      results.push(path.join(dir, rel));
    }
  }
  return results;
}

const recipes = walkJson(dataDir).map((filePath) => {
  const recipe = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  for (const file of recipe.files || []) {
    if (file.templateFile) {
      file.template = fs.readFileSync(path.join(templatesDir, file.templateFile), "utf-8");
      delete file.templateFile;
    }
  }
  return recipe;
});

const bundle = {
  version: 1,
  name: "@expo-snips/registry",
  generatedAt: new Date().toISOString(),
  recipes,
};

fs.writeFileSync(outFile, JSON.stringify(bundle, null, 2));
console.log(`Wrote ${recipes.length} recipes to ${outFile}`);