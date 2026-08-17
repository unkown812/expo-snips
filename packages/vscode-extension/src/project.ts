import * as vscode from "vscode";
import * as fs from "fs-extra";
import * as path from "path";

export interface DetectedProject {
  typescript: boolean;
  router: "expo-router" | "react-navigation" | undefined;
  styling: "nativewind" | "stylesheet" | undefined;
  ui: "native" | "shadcn" | undefined;
  icons: "lucide" | "none" | undefined;
}

export function getWorkspaceRoot(): string | undefined {
  return vscode.workspace.workspaceFolders?.[0]?.uri.fsPath;
}

export async function detectProject(dir: string): Promise<DetectedProject> {
  let typescript = false;
  let router: DetectedProject["router"];
  let styling: DetectedProject["styling"];
  let ui: DetectedProject["ui"] = "native";
  let icons: DetectedProject["icons"] = "none";

  const pkgPath = path.join(dir, "package.json");
  if (await fs.pathExists(pkgPath)) {
    const pkg = await fs.readJSON(pkgPath);

    if (pkg.dependencies?.["expo-router"]) router = "expo-router";
    else if (pkg.dependencies?.["@react-navigation/native"]) router = "react-navigation";

    if (pkg.dependencies?.["nativewind"]) styling = "nativewind";
    else styling = "stylesheet";

    if (pkg.dependencies?.["lucide-react-native"]) icons = "lucide";

    if (pkg.dependencies?.["@shadcn/ui"] || pkg.dependencies?.["react-native-reusables"]) {
      ui = "shadcn";
    }
  }

  if (await fs.pathExists(path.join(dir, "tsconfig.json"))) typescript = true;

  return { typescript, router, styling, ui, icons };
}

export const MANIFEST_FILENAME = ".expo-snips.json";

export interface ManifestEntry {
  recipeId: string;
  recipeVersion: string;
  installedAt: string;
  options: {
    styling: string;
    router: string;
    ui: string;
    icons: string;
    typescript: boolean;
  };
  variant?: string;
  files: string[];
}

export interface Manifest {
  version: number;
  installs: ManifestEntry[];
}

export function manifestPath(dir: string): string {
  return path.join(dir, MANIFEST_FILENAME);
}

export function readManifest(dir: string): Manifest {
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

export function writeManifest(manifest: Manifest, dir: string): void {
  fs.writeJSONSync(manifestPath(dir), manifest, { spaces: 2 });
}

export function upsertEntry(entry: ManifestEntry, dir: string): void {
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
