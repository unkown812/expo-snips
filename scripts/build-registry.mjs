import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "packages", "registry", "data");
const templatesDir = path.join(root, "packages", "registry", "templates");
const registryDir = path.join(root, "registry");
const recipesDir = path.join(registryDir, "recipes");

function walkJson(dir) {
  const results = [];
  for (const rel of fs.readdirSync(dir, { recursive: true })) {
    if (typeof rel === "string" && rel.endsWith(".json")) {
      results.push(path.join(dir, rel));
    }
  }
  return results;
}

fs.rmSync(registryDir, { recursive: true, force: true });
fs.mkdirSync(recipesDir, { recursive: true });

const index = [];
for (const filePath of walkJson(dataDir)) {
  const recipe = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  for (const file of recipe.files || []) {
    if (file.templateFile) {
      file.template = fs.readFileSync(path.join(templatesDir, file.templateFile), "utf-8");
      delete file.templateFile;
    }
  }

  const rel = path.relative(dataDir, filePath);
  const id = rel.replace(/\.json$/, "").replace(/\\/g, "/");
  const target = path.join(recipesDir, `${id}.json`);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, JSON.stringify(recipe, null, 2));

  index.push({
    id,
    name: recipe.name,
    description: recipe.description,
    version: recipe.version,
    typescript: recipe.typescript,
    tags: recipe.tags ?? [],
    supported: recipe.supported,
  });
}

index.sort((a, b) => a.id.localeCompare(b.id));
fs.writeFileSync(path.join(registryDir, "index.json"), JSON.stringify(index, null, 2));
console.log(`Wrote ${index.length} recipes to ${path.relative(root, recipesDir)} and index.json`);