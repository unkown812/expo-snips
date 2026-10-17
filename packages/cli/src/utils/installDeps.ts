import { execSync } from "node:child_process";
import fs from "fs-extra";
import path from "path";

type PackageManager = "npm" | "pnpm" | "yarn" | "bun";

function detectPackageManager(dir: string = process.cwd()): PackageManager {
  if (fs.existsSync(path.join(dir, "pnpm-lock.yaml"))) return "pnpm";
  if (fs.existsSync(path.join(dir, "yarn.lock"))) return "yarn";
  if (fs.existsSync(path.join(dir, "bun.lockb"))) return "bun";
  return "npm";
}

export async function installDependencies(
  dependencies: string[] = [],
  devDependencies: string[] = [],
  dir: string = process.cwd()
): Promise<void> {
  if (dependencies.length === 0 && devDependencies.length === 0) return;

  const manager = detectPackageManager(dir);

  if (dependencies.length > 0) {
    console.log(`\nInstalling dependencies (${manager}): ${dependencies.join(", ")}`);
    execSync(`${manager} add ${dependencies.join(" ")}`, {
      cwd: dir,
      stdio: "inherit",
    });
  }

  if (devDependencies.length > 0) {
    console.log(
      `\nInstalling dev dependencies (${manager}): ${devDependencies.join(", ")}`
    );
    execSync(`${manager} add -D ${devDependencies.join(" ")}`, {
      cwd: dir,
      stdio: "inherit",
    });
  }
}