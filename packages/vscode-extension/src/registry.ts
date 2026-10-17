import * as vscode from "vscode";
import type { ScreenRecipe } from "@expo-snips/core";
import { REGISTRY_RECIPES } from "./generated/registry-data";

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

let cachedRemoteIndex: RecipeIndexEntry[] | undefined;
let cachedAt = 0;
let remoteRetryAfter = 0;

// The catalog bundled into the extension at build time. This is always
// available, so the extension works offline and directly after install.
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

/** Registry URL configured by the user, or "" to use only the bundled catalog. */
export function getRegistryBase(): string {
  const config = vscode.workspace.getConfiguration("expo-snips");
  return (config.get<string>("registryUrl") ?? "").trim().replace(/\/+$/, "");
}

export function hasLocalRegistry(): boolean {
  return localRecipes.length > 0;
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

export async function getRecipeIndex(): Promise<RecipeIndexEntry[]> {
  if (cachedRemoteIndex && Date.now() - cachedAt < CACHE_TTL_MS) {
    return cachedRemoteIndex;
  }

  const base = getRegistryBase();
  if (base && Date.now() >= remoteRetryAfter) {
    try {
      const data = await fetchJSON<RecipeIndexEntry[]>(`${base}/index.json`);
      if (Array.isArray(data) && data.length > 0) {
        cachedRemoteIndex = data;
        cachedAt = Date.now();
        return cachedRemoteIndex;
      }
    } catch {
      // Fall through to the bundled catalog.
    }
    // Avoid repeatedly stalling on an unreachable registry.
    remoteRetryAfter = Date.now() + CACHE_TTL_MS;
  }

  return localIndex;
}

export async function getRecipeById(id: string): Promise<ScreenRecipe | null> {
  const base = getRegistryBase();
  if (base && Date.now() >= remoteRetryAfter) {
    try {
      const recipe = await fetchJSON<ScreenRecipe>(
        `${base}/recipes/${encodeURIComponent(id)}.json`
      );
      if (recipe && recipe.id) return recipe;
    } catch {
      // Fall through to the bundled catalog.
    }
    remoteRetryAfter = Date.now() + CACHE_TTL_MS;
  }

  return localById.get(id) ?? null;
}

export async function getRecipesByIds(ids: string[]): Promise<ScreenRecipe[]> {
  const recipes = await Promise.all(ids.map((id) => getRecipeById(id)));
  return recipes.filter((r): r is ScreenRecipe => r !== null);
}
