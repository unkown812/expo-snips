import { ScreenRecipe } from "@expo-snips/core";

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

export function getRegistryBase(override?: string): string {
  return override || process.env.EXPO_SNIPS_REGISTRY || DEFAULT_REGISTRY;
}

async function fetchJSON<T>(url: string): Promise<T | null> {
  const response = await fetch(url);
  if (!response.ok) return null;
  return (await response.json()) as T;
}

export async function getRecipeIndex(base?: string): Promise<RecipeIndexEntry[]> {
  try {
    const data = await fetchJSON<RecipeIndexEntry[]>(`${getRegistryBase(base)}/index.json`);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

export async function getRecipeById(id: string, base?: string): Promise<ScreenRecipe | null> {
  try {
    return await fetchJSON<ScreenRecipe>(`${getRegistryBase(base)}/recipes/${id}.json`);
  } catch {
    return null;
  }
}

export async function getRecipesByIds(ids: string[], base?: string): Promise<ScreenRecipe[]> {
  const recipes = await Promise.all(ids.map((id) => getRecipeById(id, base)));
  return recipes.filter((r): r is ScreenRecipe => r !== null);
}