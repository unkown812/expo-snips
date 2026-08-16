import chalk from "chalk";

export interface DiffHunk {
  type: "add" | "remove" | "context";
  line: string;
}

export function diffLines(oldText: string, newText: string): DiffHunk[] {
  const a = oldText.split("\n");
  const b = newText.split("\n");

  const n = a.length;
  const m = b.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array(m + 1).fill(0));

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const hunks: DiffHunk[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (a[i] === b[j]) {
      hunks.push({ type: "context", line: a[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      hunks.push({ type: "remove", line: a[i] });
      i++;
    } else {
      hunks.push({ type: "add", line: b[j] });
      j++;
    }
  }
  while (i < n) {
    hunks.push({ type: "remove", line: a[i] });
    i++;
  }
  while (j < m) {
    hunks.push({ type: "add", line: b[j] });
    j++;
  }
  return hunks;
}

export function printDiff(filePath: string, oldText: string, newText: string): void {
  const hunks = diffLines(oldText, newText);
  const changed = hunks.filter((h) => h.type !== "context").length;
  if (changed === 0) return;

  console.log(chalk.cyan(`\n  ${filePath}`));
  for (const hunk of hunks) {
    if (hunk.type === "add") {
      console.log(chalk.green(`+   ${hunk.line}`));
    } else if (hunk.type === "remove") {
      console.log(chalk.red(`-   ${hunk.line}`));
    } else {
      console.log(chalk.gray(`    ${hunk.line}`));
    }
  }
}

export function hasChanges(oldText: string, newText: string): boolean {
  return oldText !== newText;
}