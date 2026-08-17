import * as vscode from "vscode";
import type { ScreenRecipe } from "@expo-snips/core";

export const DEFAULT_REGISTRY = "https://registry.expo-snips.dev";

export interface RecipeIndexEntry {
  id: string;
  name: string;
  description: string;
  version: string;
  typescript: boolean;
  tags: string[];
  supported: ScreenRecipe["supported"];
}

const CACHE_TTL_MS = 5 * 60 * 1000;

let cachedIndex: RecipeIndexEntry[] | undefined;
let cachedAt = 0;

export function getRegistryBase(): string {
  const config = vscode.workspace.getConfiguration("expo-snips");
  return config.get<string>("registryUrl") || DEFAULT_REGISTRY;
}

async function fetchJSON<T>(url: string): Promise<T | null> {
  const response = await fetch(url);
  if (!response.ok) return null;
  return (await response.json()) as T;
}

export async function getRecipeIndex(): Promise<RecipeIndexEntry[]> {
  if (cachedIndex && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedIndex;
  }
  try {
    const data = await fetchJSON<RecipeIndexEntry[]>(`${getRegistryBase()}/index.json`);
    cachedIndex = Array.isArray(data) ? data : [];
    cachedAt = Date.now();
  } catch {
    cachedIndex = cachedIndex ?? [];
  }
  return cachedIndex;
}

export async function getRecipeById(id: string): Promise<ScreenRecipe | null> {
  try {
    const recipe = await fetchJSON<ScreenRecipe>(
      `${getRegistryBase()}/recipes/${encodeURIComponent(id)}.json`
    );
    return recipe && recipe.id ? recipe : null;
  } catch {
    return null;
  }
}

export async function getRecipesByIds(ids: string[]): Promise<ScreenRecipe[]> {
  const recipes = await Promise.all(ids.map((id) => getRecipeById(id)));
  return recipes.filter((r): r is ScreenRecipe => r !== null);
}