import chalk from "chalk";
import { getRecipeIndex, getRegistryBase, RecipeIndexEntry } from "./registry";

export interface RegistryResolution {
  index: RecipeIndexEntry[];
  source: "remote";
  url: string;
}

export async function resolveRegistry(registryUrl?: string): Promise<RegistryResolution> {
  const base = getRegistryBase(registryUrl);
  console.log(chalk.dim(`Fetching registry index from ${base}...`));
  const index = await getRecipeIndex(registryUrl);
  if (index.length === 0) {
    console.warn(chalk.yellow(`Could not fetch registry index from ${base}.`));
  } else {
    console.log(chalk.dim(`Loaded ${index.length} screens from remote registry.`));
  }
  return { index, source: "remote", url: base };
}