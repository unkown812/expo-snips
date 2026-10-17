import { ScreenRecipe } from "@expo-snips/core";
import { REGISTRY_RECIPES } from "../generated/registry-data";

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

export type RegistrySource = "remote" | "local";

export interface ResolvedRegistryIndex {
  index: RecipeIndexEntry[];
  source: RegistrySource;
  url: string;
}

// Catalog bundled into the CLI at build time. Always available offline.
const localRecipes: ScreenRecipe[] = Array.isArray(REGISTRY_RECIPES) ? REGISTRY_RECIPES : [];
const localById = new Map<string, ScreenRecipe>(localRecipes.map((r) => [r.id, r]));
const localIndex: RecipeIndexEntry[] = localRecipes.map((r) => ({
  id: r.id,
  name: r.name,
  description: r.description,
  version: r.version,
  typescript: r.typescript,
  tags: r.tags ?? [],
  supported: r.supported,
}));

/**
 * Resolve the registry base URL. An explicit `--registry` flag or the
 * `EXPO_SNIPS_REGISTRY` env var selects a remote registry; otherwise the
 * bundled offline catalog is used.
 */
export function getRegistryBase(override?: string): string {
  return (override || process.env.EXPO_SNIPS_REGISTRY || "").trim().replace(/\/+$/, "");
}

export function hasLocalRegistry(): boolean {
  return localRecipes.length > 0;
}

export function getLocalRecipeById(id: string): ScreenRecipe | null {
  return localById.get(id) ?? null;
}

async function fetchJSON<T>(url: string): Promise<T | null> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10_000);
  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) return null;
    return (await response.json()) as T;
  } finally {
    clearTimeout(timeout);
  }
}

/**
 * Fetch the index from the remote registry when one is configured, otherwise
 * fall back to the bundled catalog.
 */
export async function resolveRecipeIndex(base?: string): Promise<ResolvedRegistryIndex> {
  const url = getRegistryBase(base);
  if (url) {
    try {
      const data = await fetchJSON<RecipeIndexEntry[]>(`${url}/index.json`);
      if (Array.isArray(data) && data.length > 0) {
        return { index: data, source: "remote", url };
      }
    } catch {
      // Ignore and fall back to the bundled catalog.
    }
  }
  return { index: localIndex, source: "local", url };
}

export async function getRecipeIndex(base?: string): Promise<RecipeIndexEntry[]> {
  return (await resolveRecipeIndex(base)).index;
}

export async function getRecipeById(id: string, base?: string): Promise<ScreenRecipe | null> {
  const url = getRegistryBase(base);
  if (url) {
    try {
      const recipe = await fetchJSON<ScreenRecipe>(
        `${url}/recipes/${encodeURIComponent(id)}.json`
      );
      if (recipe && recipe.id) return recipe;
    } catch {
      // Ignore and fall back to the bundled catalog.
    }
  }
  return localById.get(id) ?? null;
}

export async function getRecipesByIds(ids: string[], base?: string): Promise<ScreenRecipe[]> {
  const recipes = await Promise.all(ids.map((id) => getRecipeById(id, base)));
  return recipes.filter((r): r is ScreenRecipe => r !== null);
}
