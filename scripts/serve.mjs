import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", "packages", "registry");
const PORT = parseInt(process.env.PORT || "3000", 10);

const MIME = {
  ".json": "application/json",
  ".hbs": "text/plain",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
};

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  let filePath = path.join(root, url.pathname);

  if (filePath.endsWith("/")) filePath = path.join(filePath, "index.json");

  if (!fs.existsSync(filePath)) {
    res.writeHead(404, { "Content-Type": "application/json" });
    res.end(JSON.stringify({ error: "Not found" }));
    return;
  }

  if (fs.statSync(filePath).isDirectory()) {
    const index = path.join(filePath, "index.json");
    if (fs.existsSync(index)) {
      filePath = index;
    } else {
      res.writeHead(404, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Not found" }));
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
  console.log(`  Schema:    http://localhost:${PORT}/schema.json`);
  console.log(`\nServing from: ${root}`);
});
