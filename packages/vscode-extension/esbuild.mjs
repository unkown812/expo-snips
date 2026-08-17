import { build } from "esbuild";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const watch = process.argv.includes("--watch");

const options = {
  entryPoints: [path.join(__dirname, "src", "extension.ts")],
  bundle: true,
  external: ["vscode"],
  platform: "node",
  target: "node18",
  format: "cjs",
  outfile: path.join(__dirname, "out", "extension.js"),
  sourcemap: true,
  logLevel: "info",
};

await build(watch ? { ...options, watch: true } : options);

if (!watch) {
  console.log("Bundled extension -> out/extension.js");
}
