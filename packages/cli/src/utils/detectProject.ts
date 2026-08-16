import fs from "fs-extra";
import path from "path";

export interface DetectedProject {
  typescript: boolean;
  router: "expo-router" | "react-navigation" | undefined;
  styling: "nativewind" | "stylesheet" | undefined;
  ui: "native" | "shadcn" | undefined;
  icons: "lucide" | "none" | undefined;
}

export async function detectProject(dir: string = process.cwd()): Promise<DetectedProject> {
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