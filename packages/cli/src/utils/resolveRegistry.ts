import chalk from "chalk";
import {
  getRegistryBase,
  resolveRecipeIndex,
  type RecipeIndexEntry,
  type RegistrySource,
} from "./registry";

export interface RegistryResolution {
  index: RecipeIndexEntry[];
  source: RegistrySource;
  url: string;
}

export async function resolveRegistry(registryUrl?: string): Promise<RegistryResolution> {
  const base = getRegistryBase(registryUrl);
  const resolved = await resolveRecipeIndex(registryUrl);

  if (resolved.source === "remote") {
    console.log(chalk.dim(`Loaded ${resolved.index.length} screens from ${base}.`));
  } else if (base) {
    console.warn(
      chalk.yellow(`Could not reach registry at ${base}. Using ${resolved.index.length} built-in screens.`)
    );
  } else {
    console.log(chalk.dim(`Using ${resolved.index.length} built-in screens.`));
  }

  return resolved;
}
