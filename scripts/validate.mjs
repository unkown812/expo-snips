import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const dataDir = path.join(root, "packages", "registry", "data");
const templatesDir = path.join(root, "packages", "registry", "templates");
const schemaPath = path.join(root, "packages", "registry", "schema.json");

const schema = JSON.parse(fs.readFileSync(schemaPath, "utf-8"));

// Inline JSON Schema validator (Draft-07 subset)
function validateRecipe(recipe, schema) {
  const errors = [];

  // Check required fields
  for (const field of schema.required || []) {
    if (recipe[field] === undefined || recipe[field] === null) {
      errors.push(`Missing required field: "${field}"`);
    }
  }

  // Check id format
  if (recipe.id && !/^[a-z0-9-]+\/[a-z0-9-]+$/.test(recipe.id)) {
    errors.push(`Invalid id format: "${recipe.id}" (expected: <category>/<name>)`);
  }

  // Check version format
  if (recipe.version && !/^\d+\.\d+\.\d+$/.test(recipe.version)) {
    errors.push(`Invalid version format: "${recipe.version}" (expected semver)`);
  }

  // Check enum values
  if (recipe.framework && recipe.framework !== "react-native") {
    errors.push(`Invalid framework: "${recipe.framework}"`);
  }
  if (recipe.runtime && recipe.runtime !== "expo") {
    errors.push(`Invalid runtime: "${recipe.runtime}"`);
  }

  // Check supported options
  if (recipe.supported) {
    const validStyling = ["nativewind", "stylesheet", "tamagui"];
    const validRouter = ["expo-router", "react-navigation"];
    const validUi = ["native", "shadcn", "custom"];
    const validIcons = ["lucide", "vector-icons", "none"];

    for (const s of recipe.supported.styling || []) {
      if (!validStyling.includes(s)) errors.push(`Invalid styling option: "${s}"`);
    }
    for (const r of recipe.supported.router || []) {
      if (!validRouter.includes(r)) errors.push(`Invalid router option: "${r}"`);
    }
    for (const u of recipe.supported.ui || []) {
      if (!validUi.includes(u)) errors.push(`Invalid ui option: "${u}"`);
    }
    for (const i of recipe.supported.icons || []) {
      if (!validIcons.includes(i)) errors.push(`Invalid icons option: "${i}"`);
    }
  }

  // Check files array
  if (!Array.isArray(recipe.files) || recipe.files.length === 0) {
    errors.push("At least one file entry is required");
  } else {
    for (const [idx, file] of recipe.files.entries()) {
      if (!file.path) errors.push(`files[${idx}]: missing "path"`);
      if (!file.templateFile) errors.push(`files[${idx}]: missing "templateFile"`);
    }
  }

  return errors;
}

function walkJson(dir) {
  const results = [];
  for (const entry of fs.readdirSync(dir, { recursive: true })) {
    if (typeof entry === "string" && entry.endsWith(".json")) {
      results.push(path.join(dir, entry));
    }
  }
  return results;
}

let totalErrors = 0;
const recipeFiles = walkJson(dataDir);

console.log(`Validating ${recipeFiles.length} recipes...\n`);

for (const filePath of recipeFiles) {
  const rel = path.relative(root, filePath);
  const recipe = JSON.parse(fs.readFileSync(filePath, "utf-8"));
  const errors = validateRecipe(recipe, schema);

  // Check id matches file path
  const expectedId = path.relative(dataDir, filePath).replace(/\.json$/, "").replace(/\\/g, "/");
  if (recipe.id !== expectedId) {
    errors.push(`id "${recipe.id}" does not match file path "${expectedId}"`);
  }

  // Check template files exist
  for (const file of recipe.files || []) {
    if (file.templateFile) {
      const tplPath = path.join(templatesDir, file.templateFile);
      if (!fs.existsSync(tplPath)) {
        errors.push(`Template not found: ${file.templateFile}`);
      }
    }
  }

  if (errors.length > 0) {
    console.error(`❌ ${rel}`);
    for (const err of errors) {
      console.error(`   - ${err}`);
    }
    totalErrors += errors.length;
  } else {
    console.log(`✅ ${rel}`);
  }
}

console.log(`\n${recipeFiles.length} recipes checked, ${totalErrors} error(s).`);
process.exit(totalErrors > 0 ? 1 : 0);
