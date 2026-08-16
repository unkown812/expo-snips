import fs from "fs-extra";
import path from "path";

export interface GeneratedFile {
  path: string;
  content: string;
}

export async function writeFiles(
  files: GeneratedFile[],
  projectRoot: string
): Promise<void> {
  for (const file of files) {
    const fullPath = path.join(projectRoot, file.path);
    await fs.ensureDir(path.dirname(fullPath));
    await fs.writeFile(fullPath, file.content);
    console.log(`  Created ${file.path}`);
  }
}