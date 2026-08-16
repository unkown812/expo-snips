import { Command } from "commander";
import chalk from "chalk";
import { execSync } from "node:child_process";
import fs from "fs-extra";
import path from "path";

export const initCommand = new Command("init")
  .description("Create a new Expo project")
  .option("--name <name>", "Project name")
  .option("--template <template>", "create-expo-app template (default: default)")
  .action(async (options) => {
    const name = options.name;
    const template = options.template ?? "default";

    if (fs.existsSync(path.join(process.cwd(), "app.json"))) {
      console.log(chalk.yellow("An Expo project already exists in this directory."));
      return;
    }

    const nameArg = name ? `${name}` : ".";
    const cmd = `npx create-expo-app@latest ${nameArg} --template ${template} --yes`;
    console.log(chalk.cyan(`Running: ${cmd}`));
    execSync(cmd, { cwd: process.cwd(), stdio: "inherit" });

    console.log(chalk.green(`\nExpo project ${name ? `"${name}"` : ""} created.`));
    console.log("Next: cd into the project and run:");
    console.log("  expo-snips list   to see available screens");
    console.log("  expo-snips add auth/login   to add a login screen");
  });