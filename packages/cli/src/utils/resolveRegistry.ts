import chalk from "chalk";
import {
  fetchRecipes,
  getAllRecipes,
} from "@expo-snips/registry";
import { ScreenRecipe } from "@expo-snips/core";

export interface RegistryResolution {
  recipes: ScreenRecipe[];
  source: "remote" | "local";
  url?: string;
}

export async function resolveRegistry(registryUrl?: string): Promise<RegistryResolution> {
  if (registryUrl) {
    try {
      console.log(chalk.dim(`Fetching registry from ${registryUrl}...`));
      const recipes = await fetchRecipes(registryUrl);
      console.log(chalk.dim(`Loaded ${recipes.length} recipes from remote registry.`));
      return { recipes, source: "remote", url: registryUrl };
    } catch (err) {
      console.warn(
        chalk.yellow(`Could not fetch remote registry (${(err as Error).message}). Falling back to local.`)
      );
    }
  }
  return { recipes: getAllRecipes(), source: "local" };
}

export function makeRecipeLookup(recipes: ScreenRecipe[]) {
  const map = new Map(recipes.map((r) => [r.id, r]));
  return (id: string) => map.get(id);
}