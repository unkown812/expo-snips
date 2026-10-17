# Contributing to Expo Snips

Thanks for your interest in improving Expo Snips. This document explains how to set up the project, make changes, and get them merged.

Before you start, skim [`README.md`](./README.md) for what the project is and [`AGENTS.md`](./AGENTS.md) for the architecture, conventions, and command reference. This guide focuses on the contribution workflow.

> **Scope reminder:** Expo Snips is a **mixed-license monorepo**. `@expo-snips/core` and `@expo-snips/cli` are MIT; the `expo-snippets` VS Code extension is proprietary; `@expo-snips/registry` declares no license. By contributing, you agree that your changes will be distributed under the license of the package you modify.

---

## Getting started

### Prerequisites

- **Node.js >= 18** (CI and `.nvmrc` use **20**)
- **pnpm 9+** (this is a pnpm workspace — please don't add npm/yarn lockfiles)

### Set up

```bash
git clone https://github.com/unkown812/expo-snips.git
cd expo-snips
pnpm install
pnpm build      # builds core, cli, registry and the VS Code extension
```

No environment variables or `.env` file are required.

---

## Ways to contribute

### 1. Add or improve a screen recipe

The catalog is the heart of the project. A recipe lives in `packages/registry/`:

1. Add a recipe JSON under `packages/registry/data/<category>/<name>.json`. The file path **must** match the recipe `id` (e.g. `auth/login` → `data/auth/login.json`).
2. Add the Handlebars templates it references under `packages/registry/templates/`.
3. Keep the visible behavior consistent across stacks — support **NativeWind and StyleSheet**, and **TypeScript and JavaScript**, using the existing conditional pattern.
4. Validate and rebuild:

   ```bash
   pnpm validate        # schema + template existence check
   pnpm build:registry  # regenerate the deployable registry/
   pnpm build           # refresh the catalog bundled into the CLI + extension
   ```

5. Verify by generating the screen into a scratch Expo project (not this repo):

   ```bash
   cd /path/to/scratch-expo-app
   node /path/to/expo-snips/packages/cli/dist/index.js add <your-recipe-id>
   ```

See `packages/registry/schema.json` for the full recipe schema and `AGENTS.md` §11 for the guidelines.

### 2. Improve the engine or tooling

- Shared generation logic lives in `packages/core` — prefer fixing it there rather than duplicating in both surfaces.
- CLI code is in `packages/cli/src` (`commands/` and `utils/`).
- The VS Code extension is in `packages/vscode-extension/src`.

### 3. Fix documentation

- The user-facing docs are `README.md` and this file. Keep commands in sync with the actual scripts.
- `documents/` is a generated documentation suite — treat the code as the source of truth and don't hand-edit it as primary content.

---

## Before you open a pull request

Run the checks that exist (there is currently **no automated test suite**):

```bash
pnpm validate                              # if you touched packages/registry
pnpm build                                 # always
pnpm --filter expo-snippets typecheck      # if you touched the extension
```

Report in your PR description which of these you ran and the result. If you couldn't run something, say so — don't claim a check passed if it didn't.

Please also:

- Keep changes **focused** — one concern per pull request.
- **Do not commit generated output**: `registry/`, `dist/`, `out/`, `packages/*/src/generated/`, and `*.vsix` are git-ignored on purpose.
- Update `README.md` / `AGENTS.md` when you change commands or behavior.
- Do **not** relicense code or add/remove license headers.

---

## Coding standards

Follow the conventions already in the codebase (see `AGENTS.md` §7):

- 2-space indentation; double-quoted strings in TypeScript.
- Strict TypeScript; avoid `any`; prefer shared types from `@expo-snips/core`.
- Keep the dependency surface small — justify any new runtime dependency.
- Match the existing CLI UX: colored, actionable messages via `chalk`, `process.exitCode = 1` on failure.

---

## Commit messages and branches

There is **no enforced** branch or commit-message convention in this repository. Write clear, scoped messages (for example, `registry: add pricing screen` or `cli: fix package-manager detection on Windows`).

---

## Bug reports and feature requests

Open an issue on [GitHub](https://github.com/unkown812/expo-snips/issues). A useful report includes:

- What you expected vs. what happened.
- The exact command or action (e.g. `expo-snips add auth/login --ui shadcn`).
- Your OS, Node.js version, package manager, and whether you used the CLI or the VS Code extension.
- Relevant output (redact anything sensitive).

---

## Security

Please do **not** report security vulnerabilities in public issues. See [`SECURITY.md`](./SECURITY.md).

---

## Questions

Open a [discussion or issue](https://github.com/unkown812/expo-snips/issues). There is no chat or mailing list.
