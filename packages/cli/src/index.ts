#!/usr/bin/env node
import { Command } from "commander";
import { addCommand } from "./commands/add";
import { listCommand } from "./commands/list";
import { initCommand } from "./commands/init";
import { updateCommand } from "./commands/update";
import { statusCommand } from "./commands/status";

const program = new Command();

program
  .name("expo-snips")
  .description("Beautiful React Native screens, one command away.")
  .version("0.1.0");

program.addCommand(initCommand);
program.addCommand(listCommand);
program.addCommand(addCommand);
program.addCommand(updateCommand);
program.addCommand(statusCommand);

program.parse(process.argv);