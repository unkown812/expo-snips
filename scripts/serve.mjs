import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Serve the built registry (`registry/`) which contains index.json and
// recipes/<category>/<name>.json. Build it first with `pnpm build:registry`.
const root = path.resolve(__dirname, "..", "registry");
const PORT = parseInt(process.env.PORT || "3000", 10);

const MIME = {
  ".json": "application/json",
  ".hbs": "text/plain",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

if (!fs.existsSync(path.join(root, "index.json"))) {
  console.error(`Registry index not found in ${root}.`);
  console.error("Run `pnpm build:registry` first (or use `pnpm serve`).");
  process.exit(1);
}

function notFound(res) {
  res.writeHead(404, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Not found" }));
}

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    });
    res.end();
    return;
  }

  const url = new URL(req.url, `http://localhost:${PORT}`);
  let filePath = path.join(root, decodeURIComponent(url.pathname));

  // Prevent path traversal outside the registry root.
  if (!filePath.startsWith(root + path.sep) && filePath !== root) {
    notFound(res);
    return;
  }

  if (filePath.endsWith(path.sep)) filePath = path.join(filePath, "index.json");

  if (!fs.existsSync(filePath)) {
    notFound(res);
    return;
  }

  if (fs.statSync(filePath).isDirectory()) {
    const index = path.join(filePath, "index.json");
    if (fs.existsSync(index)) {
      filePath = index;
    } else {
      notFound(res);
      return;
    }
  }

  const ext = path.extname(filePath);
  const mime = MIME[ext] || "application/octet-stream";

  res.writeHead(200, {
    "Content-Type": mime,
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(PORT, () => {
  console.log(`Expo Snips registry running at http://localhost:${PORT}`);
  console.log(`  Index:     http://localhost:${PORT}/index.json`);
  console.log(`  Recipes:   http://localhost:${PORT}/recipes/<category>/<name>.json`);
  console.log(`\nServing from: ${root}`);
});
