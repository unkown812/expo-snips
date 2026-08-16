import fs from "fs-extra";
import path from "path";
import {
  getFilesForRecipe,
  GenerationContext,
  ScreenRecipe,
} from "@expo-snips/core";
import { GeneratedFile } from "./writeFiles";

export interface PrimitiveResolution {
  files: GeneratedFile[];
  dependencies: string[];
  devDependencies: string[];
  skipped: string[];
}

function resolvePrimitives(
  recipe: ScreenRecipe,
  context: GenerationContext,
  projectRoot: string,
  seen: Set<string>,
  acc: PrimitiveResolution,
  findRecipe: (id: string) => ScreenRecipe | undefined
): void {
  for (const id of recipe.primitives ?? []) {
    if (seen.has(id)) continue;
    seen.add(id);

    const primitive = findRecipe(id);
    if (!primitive) {
      console.warn(`  Skipping unknown primitive "${id}".`);
      continue;
    }

    resolvePrimitives(primitive, context, projectRoot, seen, acc, findRecipe);

    const primitiveContext: GenerationContext = {
      ...context,
      options: { ...context.options, styling: "nativewind", ui: "shadcn" },
    };

    for (const file of getFilesForRecipe(primitive, primitiveContext)) {
      const fullPath = path.join(projectRoot, file.path);
      if (fs.existsSync(fullPath)) {
        acc.skipped.push(file.path);
        continue;
      }
      acc.files.push(file);
    }

    acc.dependencies.push(...(primitive.dependencies ?? []));
    acc.devDependencies.push(...(primitive.devDependencies ?? []));
  }
}

export function getPrimitives(
  recipe: ScreenRecipe,
  context: GenerationContext,
  projectRoot: string,
  findRecipe: (id: string) => ScreenRecipe | undefined
): PrimitiveResolution {
  const acc: PrimitiveResolution = {
    files: [],
    dependencies: [],
    devDependencies: [],
    skipped: [],
  };
  resolvePrimitives(recipe, context, projectRoot, new Set(), acc, findRecipe);

  acc.dependencies = [...new Set(acc.dependencies)];
  acc.devDependencies = [...new Set(acc.devDependencies)];
  return acc;
}