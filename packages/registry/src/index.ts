import fs from "fs";
import path from "path";
import { ScreenRecipe, StylingOption } from "@expo-snips/core";

const dataDir = path.resolve(__dirname, "..", "data");
const templatesDir = path.resolve(__dirname, "..", "templates");

function walkJson(dir: string): string[] {
  const results: string[] = [];
  for (const rel of fs.readdirSync(dir, { recursive: true })) {
    if (typeof rel === "string" && rel.endsWith(".json")) {
      results.push(path.join(dir, rel));
    }
  }
  return results;
}

function readTemplate(ref: string): string {
  const templatePath = path.resolve(templatesDir, ref);
  if (!fs.existsSync(templatePath)) {
    throw new Error(`Template not found: ${ref}`);
  }
  return fs.readFileSync(templatePath, "utf-8");
}

function inlineTemplateRef(value: string): string {
  // Variant / per-styling overrides hold either inline template strings or a
  // path to a `.hbs` file. Resolve file references to their contents.
  return value.endsWith(".hbs") ? readTemplate(value) : value;
}

export function loadRecipeFromFile(filePath: string): ScreenRecipe {
  const raw = fs.readFileSync(filePath, "utf-8");
  const recipe = JSON.parse(raw) as ScreenRecipe;

  for (const file of recipe.files) {
    if (file.templateFile) {
      file.template = readTemplate(file.templateFile);
      delete file.templateFile;
    }
    if (file.variants) {
      for (const [key, value] of Object.entries(file.variants)) {
        file.variants[key] = inlineTemplateRef(value);
      }
    }
    if (file.perStyling) {
      for (const [key, value] of Object.entries(file.perStyling)) {
        file.perStyling[key as StylingOption] = inlineTemplateRef(value);
      }
    }
  }

  return recipe;
}

export function getAllRecipes(): ScreenRecipe[] {
  return walkJson(dataDir).map(loadRecipeFromFile);
}

export function getRecipeById(id: string): ScreenRecipe | undefined {
  return getAllRecipes().find((r) => r.id === id);
}

export function searchRecipes(query: string): ScreenRecipe[] {
  const q = query.toLowerCase();
  return getAllRecipes().filter(
    (r) =>
      r.id.toLowerCase().includes(q) ||
      r.name.toLowerCase().includes(q) ||
      r.tags?.some((t) => t.toLowerCase().includes(q))
  );
}

export interface RegistryBundle {
  version?: number;
  name?: string;
  recipes?: ScreenRecipe[];
}

export async function fetchRecipes(url: string): Promise<ScreenRecipe[]> {
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`HTTP ${res.status} ${res.statusText}`);
  }
  const data: unknown = await res.json();
  if (Array.isArray(data)) {
    return data as ScreenRecipe[];
  }
  if (data && typeof data === "object") {
    const bundle = data as RegistryBundle;
    if (Array.isArray(bundle.recipes)) {
      return bundle.recipes as ScreenRecipe[];
    }
    if ("id" in bundle && "files" in bundle) {
      return [bundle as unknown as ScreenRecipe];
    }
  }
  throw new Error("Response is not a valid registry bundle");
}