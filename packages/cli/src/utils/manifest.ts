import fs from "fs-extra";
import path from "path";

export interface ManifestOptions {
  styling: string;
  router: string;
  ui: string;
  icons: string;
  typescript: boolean;
}

export interface ManifestEntry {
  recipeId: string;
  recipeVersion: string;
  installedAt: string;
  options: ManifestOptions;
  variant?: string;
  files: string[];
}

export interface Manifest {
  version: number;
  installs: ManifestEntry[];
}

export const MANIFEST_FILENAME = ".expo-snips.json";

export function manifestPath(dir: string = process.cwd()): string {
  return path.join(dir, MANIFEST_FILENAME);
}

export function readManifest(dir: string = process.cwd()): Manifest {
  const file = manifestPath(dir);
  if (!fs.existsSync(file)) {
    return { version: 1, installs: [] };
  }
  try {
    const raw = fs.readJSONSync(file) as Partial<Manifest>;
    return {
      version: raw.version ?? 1,
      installs: Array.isArray(raw.installs) ? raw.installs : [],
    };
  } catch {
    return { version: 1, installs: [] };
  }
}

export function writeManifest(manifest: Manifest, dir: string = process.cwd()): void {
  fs.writeJSONSync(manifestPath(dir), manifest, { spaces: 2 });
}

export function upsertEntry(entry: ManifestEntry, dir: string = process.cwd()): void {
  const manifest = readManifest(dir);
  const idx = manifest.installs.findIndex(
    (e) => e.recipeId === entry.recipeId && e.variant === entry.variant
  );
  if (idx >= 0) {
    manifest.installs[idx] = entry;
  } else {
    manifest.installs.push(entry);
  }
  writeManifest(manifest, dir);
}

export function updateEntryVersions(
  entries: Array<{ recipeId: string; variant?: string; recipeVersion: string }>,
  dir: string = process.cwd()
): void {
  const manifest = readManifest(dir);
  for (const update of entries) {
    const idx = manifest.installs.findIndex(
      (e) => e.recipeId === update.recipeId && e.variant === update.variant
    );
    if (idx >= 0) {
      manifest.installs[idx].recipeVersion = update.recipeVersion;
    }
  }
  writeManifest(manifest, dir);
}