# AGENTS.md

Guidance for AI coding agents (and humans) working in this repository.

**Read this first**, then the relevant package. Companion documents:

- [`README.md`](./README.md) — what the project is, install/usage, CLI/API reference.
- [`documents/README.md`](./documents/README.md) — index of the reverse-engineered documentation suite (LaTeX/PDF/DOCX) under `documents/`.
- [`CONTRIBUTING.md`](./CONTRIBUTING.md) — contribution workflow.

This file is intentionally a working guide, not a full manual. Detailed architecture and product notes live in `README.md` and `documents/`.

---

## 1. Project Overview

**Expo Snips** is a pnpm-workspace monorepo that generates complete Expo / React Native screens from a catalog of versioned, stack-aware "screen recipes".

Two user-facing surfaces share one generation engine:

| Surface | Package | Bundle id |
|---|---|---|
| Terminal CLI | `@expo-snips/cli` | bin `expo-snips` |
| VS Code extension | `expo-snippets` | display name "Expo Snippets" |

There is **no server application, no database, and no user accounts**. The only persisted state is a `.expo-snips.json` manifest that is written into the *end user's* Expo project — **not** into this repository. The only HTTP endpoints are a static JSON registry (built into `registry/`) and a local fixture server (`scripts/serve.mjs`).

**Important boundaries**

- All generation logic (types, Handlebars rendering, option filtering) lives in `packages/core`. The CLI and the extension are thin surfaces over it. **Fix shared behavior in `core`, not in both surfaces.**
- The screen catalog is *data*: recipe JSON in `packages/registry/data/**` and Handlebars templates in `packages/registry/templates/**`.
- `registry/` at the repository root is a **generated artifact** (produced by `scripts/build-registry.mjs`) and is committed for deployment. Do not hand-edit it; edit the source in `packages/registry/` and regenerate.
- `documents/` is a generated documentation suite (LaTeX source + PDF/DOCX output). Treat the code as the source of truth if they ever disagree.

---

## 2. Repository Structure

```text
expo-snips/
├── packages/
│   ├── core/                  # @expo-snips/core — engine + types (MIT)
│   │   └── src/               # types.ts, context.ts, generate.ts, index.ts
│   ├── cli/                   # @expo-snips/cli — terminal CLI (MIT)
│   │   ├── src/commands/      # init, list, add, update, status
│   │   ├── src/utils/         # detectProject, registry, resolveRegistry, manifest,
│   │   │                      #   primitives, installDeps, diff, writeFiles
│   │   └── src/generated/     # build-time inlined catalog (git-ignored)
│   ├── registry/              # @expo-snips/registry — catalog data (private)
│   │   ├── data/**            # 24 recipe JSON files (one per screen)
│   │   ├── templates/**       # 48 Handlebars (.hbs) templates
│   │   ├── schema.json        # JSON Schema for a recipe
│   │   └── scripts/           # build-bundle.mjs
│   └── vscode-extension/      # expo-snippets — VS Code extension (proprietary)
│       ├── src/               # extension, commands, completionProvider, generator,
│       │                      #   project, registry
│       ├── scripts/           # prepare-registry.mjs
│       ├── assets/            # logo.png
│       └── esbuild.mjs        # bundler config
├── registry/                  # GENERATED deployable catalog (index.json + recipes/*.json)
├── scripts/
│   ├── build-registry.mjs     # data/ + templates/ -> registry/
│   ├── validate.mjs           # schema + template existence check
│   ├── serve.mjs              # local static registry server (:3000, CORS)
│   └── lib/build-recipes.mjs  # shared recipe loader / template inliner
├── documents/                 # generated documentation suite (do not edit as source)
├── .github/workflows/         # deploy-registry.yml, publish.yml, ci.yml
├── package.json               # workspace root scripts
├── pnpm-workspace.yaml
└── tsconfig.base.json
```

---

## 3. Technology Stack

- **Language:** TypeScript (strict) targeting ES2020; CommonJS output. Base config: `tsconfig.base.json`.
- **Runtime:** Node.js **>= 18** (CI uses Node 20; `.nvmrc` pins `20`).
- **Package manager:** **pnpm** workspaces (`pnpm-workspace.yaml`, `packages/*`). Do not introduce npm/yarn lockfiles.
- **Template engine:** **Handlebars** (`packages/core`), with `eq` / `neq` helpers and `when`-condition filtering.
- **CLI:** `commander`, `prompts`, `chalk`, `fs-extra`.
- **VS Code extension:** VS Code API `^1.80.0`, bundled with **esbuild**, packaged with `@vscode/vsce`.
- **Catalog schema:** JSON Schema (draft-07) at `packages/registry/schema.json`.
- **CI/CD:** GitHub Actions (registry deploy, npm publish, CI).
- **Database / ORM:** none. **Auth:** none in the tool itself.
- **Tests:** none (see §8).

---

## 4. Development Setup

```bash
pnpm install
```

- Node **>= 18** and **pnpm 9+** are required. The CI-recommended Node version is **20** (`.nvmrc`).
- **No environment variables are required** to build, run, or develop this repo. No `.env` file is loaded anywhere.
- Optional runtime variables (read from the process environment, not from a file):
  - `EXPO_SNIPS_REGISTRY` — remote registry base URL for the CLI.
  - `PORT` — port for `scripts/serve.mjs` (default `3000`).
- `NPM_TOKEN` is used only by the publish workflow; never reference or commit it.

---

## 5. Common Commands

Run from the repository root unless noted.

| Command | What it does |
|---|---|
| `pnpm install` | Install workspace dependencies. |
| `pnpm build` | `pnpm -r build` — builds `core`, `cli`, `registry`, `vscode-extension` in dependency order. **Re-run after editing any recipe or template**, because the CLI and extension inline the catalog at build time. |
| `pnpm validate` | Schema-validates all recipes and asserts every referenced `templateFile` exists. **Run this after any catalog change.** |
| `pnpm build:registry` | Regenerate the deployable `registry/` folder from `packages/registry/`. |
| `pnpm serve` | `build:registry` then serve `registry/` at `http://localhost:3000`. |
| `pnpm --filter expo-snippets typecheck` | `tsc --noEmit` for the VS Code extension. |
| `pnpm --filter expo-snippets build` | Bundle the extension to `out/extension.js` (esbuild). |
| `pnpm --filter expo-snippets watch` | Rebuild the extension on change. |
| `pnpm --filter expo-snippets package` | Produce `expo-snippets-<version>.vsix` (esbuild + `vsce`). |
| `pnpm --filter <pkg> build` | Build a single package (e.g. `@expo-snips/core`, `@expo-snips/cli`). |
| `node packages/cli/dist/index.js <cmd>` | Run the CLI from the repo after `pnpm build` (e.g. `... list`, `... add auth/login`). |

**Do not rely on these two root scripts:**

- `pnpm dev` → `pnpm -r dev`: **no package defines a `dev` script**; it does nothing useful.
- `pnpm test` → `pnpm -r test`: **no package defines a `test` script**; there is no test suite.

If you add a real `dev`/`test` workflow, implement the script in the relevant package(s) too.

---

## 6. Architecture and Code Organization

Generation flow (both surfaces):

```
trigger (CLI `add` / VS Code `snip:` or command)
  -> resolve catalog: remote registry if configured, else bundled REGISTRY_RECIPES
  -> detectProject(): read package.json + tsconfig.json -> styling/router/ui/icons/TS
  -> resolve options (CLI prompts for gaps; VS Code uses settings fallbacks)
  -> enforce invariants: ui=shadcn implies styling=nativewind AND icons=lucide
  -> getFilesForRecipe(): filter files by `when`, render Handlebars with RenderContext
  -> writeFiles()
  -> if ui=shadcn: resolve primitives recursively (ui/utils, ui/button, ui/input), skip existing
  -> installDependencies() using the detected package manager
  -> upsertEntry() into .expo-snips.json
```

**Module responsibilities**

- `packages/core/src/generate.ts` — `getFilesForRecipe`, `renderTemplate`, Handlebars helpers, `when` matching.
- `packages/core/src/types.ts` — `ScreenRecipe`, `FileTemplate`, `ScreenVariant`, option unions.
- `packages/core/src/context.ts` — `GenerationContext` / `RenderContext`.
- `packages/cli/src/utils/registry.ts` — bundled catalog (`src/generated/registry-data.ts`) + optional remote fetch (10s timeout, graceful fallback).
- `packages/cli/src/utils/detectProject.ts` — stack detection (mirrored in `packages/vscode-extension/src/project.ts`; keep them consistent).
- `packages/cli/src/utils/manifest.ts` — `.expo-snips.json` read/write/upsert.
- `packages/cli/src/utils/diff.ts` — LCS line diff used by `update`.
- `packages/registry/src/index.ts` and `scripts/lib/build-recipes.mjs` — load recipes and inline `.hbs` template references.

**Extension specifics:** `src/extension.ts` registers commands + the `snip:` completion provider + a status bar item; `src/generator.ts` orchestrates generation, primitive resolution and terminal-based dependency install.

---

## 7. Coding Conventions

- **Match the existing style.** 2-space indentation; double-quoted strings in TypeScript; `camelCase` for values/functions, `PascalCase` for types and React components; file names are `kebab-case` for utils and `PascalCase` for components.
- **Exports:** core and CLI export named symbols; CLI commands export a `Command` constant (e.g. `addCommand`). Keep that pattern.
- **Type safety:** the repo is `strict`. Avoid `any`; prefer the shared types from `@expo-snips/core`.
- **Errors/UX:** the CLI prints colored, actionable messages via `chalk`, sets `process.exitCode = 1` on failure, and returns rather than throwing for user errors. Follow that style.
- **No new runtime dependencies** unless clearly justified; the tool aims to stay small. The extension runs in Node (VS Code host), the CLI on Node >= 18.
- **Templates:** Handlebars templates must stay consistent with the template engine in `core`. Use existing conditionals (`{{#if (eq styling "nativewind")}}`, `{{#if typescript}}`) rather than inventing new helpers.
- **Detected-option values:** only `nativewind`, `stylesheet` (styling); `expo-router`, `react-navigation` (router); `native`, `shadcn` (ui); `lucide`, `none` (icons) are implemented in recipes/CLI. `tamagui`, `custom`, `vector-icons` are declared in types/settings but **not implemented** — do not present them as supported.

---

## 8. Testing Requirements

**There is no test suite in this repository.** No test files, runners, or `test` scripts exist. Do not claim tests pass.

Before finishing a change, run the checks that *do* exist:

| Check | Command | Applies to |
|---|---|---|
| Recipe/schema validation | `pnpm validate` | any change under `packages/registry/` |
| Extension type check | `pnpm --filter expo-snippets typecheck` | `packages/vscode-extension` |
| Full build (all packages) | `pnpm build` | any change to `core`, `cli`, `registry`, or the extension |
| CLI smoke test | `node packages/cli/dist/index.js list` | `packages/cli` / `core` |

For behavior changes in generation, verify by generating into a **scratch Expo project** (not this repo) and inspecting the output files. Report exactly which checks you ran and which you could not run, and why.

If you add tests, wire a real `test` script into the relevant package so the root `pnpm test` target becomes meaningful.

---

## 9. Security Requirements

- **Never commit secrets.** There are no secrets in the repo; keep it that way. `.env*` is git-ignored (with `.env.example` allowed). `NPM_TOKEN` is CI-only.
- **Do not log credentials.** ⚠️ A known issue in the generated mock auth hook (`packages/registry/templates/auth/login/hooks.use-login.hbs`) logs `{ email, password }` to the console. Do **not** copy this pattern into new templates; prefer not to extend it. It is tracked as a documented limitation in `README.md`.
- **Generated code is a placeholder, not a security boundary.** Auth templates simulate work with a delay and an `Alert`; they must be wired to real, vetted auth by the end user.
- **Registry input is untrusted.** When a remote registry is configured, recipes arrive over the network. Do not execute recipe-sourced content beyond rendering templates and installing the declared dependency *names*.
- **Local server:** `scripts/serve.mjs` confines requests to the registry root (path-traversal guard). Preserve that guard.
- **Do not weaken security controls** (timeouts, path checks, fallbacks) to make a build or check pass.
- Review dependency changes carefully; the project prefers a small dependency surface.

---

## 10. UI and UX Requirements (generated screens)

The repository has no web/desktop UI, but it **generates** React Native UI. When authoring or editing templates:

- Follow the established visual language: light, card-based, mobile-first. Primary blue `#2563EB`; app background `#F9FAFB`; white surfaces; primary text `#111827`; secondary text `#6B7280`/`#9CA3AF`; borders `#D1D5DB`/`#F3F4F6`; success `#16A34A`; error `#EF4444`; warning `#F59E0B`; `rounded-2xl` cards and `rounded-lg`/`rounded-xl` inputs/buttons; system fonts.
- When `ui=shadcn`, use the tokenized classes from the shadcn templates (`bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `border-input`, etc.) rather than raw colors.
- Every stateful screen should handle **loading, error, empty and success** states where applicable; keep keyboard avoidance (`KeyboardAvoidingView`) and safe areas (`SafeAreaView`).
- Support **both** NativeWind and StyleSheet output, and both TypeScript and JavaScript output, using the existing conditional pattern.
- Forms use `react-hook-form` + `zod` with inline error messages.

---

## 11. Registry and Recipe Guidelines

**Recipe schema** (`packages/registry/schema.json`, `additionalProperties: false`): required fields are `id`, `name`, `description`, `version`, `framework` (`"react-native"`), `runtime` (`"expo"`), `supported`, `dependencies`, `files`.

- **`id`** must be `<category>/<name>` (lowercase, digits, hyphens) and **must match the file path** under `data/` (e.g. `auth/login` → `data/auth/login.json`). `pnpm validate` enforces this.
- **`version`** must be semver `x.y.z`.
- **`files[]`** entries require `path` and `templateFile`; optional `when` (conditions) and `variants`/`perStyling` overrides. `templateFile` must exist under `templates/`.
- **`primitives[]`** lists UI primitive recipe ids required when `ui=shadcn`.

**Adding a recipe:** add the JSON under `packages/registry/data/<category>/`, add the `.hbs` templates under `packages/registry/templates/`, run `pnpm validate`, then `pnpm build:registry` and `pnpm build` so the CLI/extension refresh their bundled catalogs.

**Registry HTTP API** (read-only, no auth): `GET {base}/index.json`, `GET {base}/recipes/{urlencodedId}.json`, `GET {base}/schema.json`. Both clients use a 10-second timeout and fall back to the bundled catalog.

**Generated artifacts — do not hand-edit:** `registry/**`, `packages/*/dist/**`, `packages/vscode-extension/out/**`, and `packages/*/src/generated/**`. Regenerate them with the build scripts.

---

## 12. Git and Change Management

- Make **focused, reviewable** changes. Do not touch unrelated files.
- **Preserve user work.** Never use destructive commands (`git reset --hard`, `git checkout -- .`, force-push, history rewrites) unless explicitly authorized.
- **Do not commit generated output or artifacts:** `dist/`, `out/`, `src/generated/`, and `*.vsix` are git-ignored — keep them that way.
- There is **no established branch/commit convention** in this repo. Do not enforce one; keep commit messages clear and scoped.
- **Do not stage, commit, push, or open PRs unless explicitly asked.**
- Review the final diff before declaring completion.

---

## 13. Definition of Done

A task is complete when:

- [ ] The change addresses the request and follows existing patterns.
- [ ] Existing behavior is preserved (no unintended changes to app/CLI/extension behavior).
- [ ] `pnpm validate` passes for any catalog change.
- [ ] `pnpm build` succeeds for any code change under `core`, `cli`, `registry`, or the extension.
- [ ] `pnpm --filter expo-snippets typecheck` passes for extension changes.
- [ ] Generated artifacts were regenerated by the build scripts, not hand-edited.
- [ ] Documentation (`README.md` / this file) is updated when behavior or commands change.
- [ ] No secrets, credentials, or generated artifacts were added; the diff contains only intended files.
- [ ] Limitations and any checks that could not be run are disclosed honestly.

---

## 14. Agent Workflow

1. **Inspect before editing.** Read the relevant package and the affected flow; don't guess.
2. **Locate the smallest safe change** — prefer fixing shared logic in `packages/core` over duplicating it in both surfaces.
3. **Reuse existing utilities and types** (`@expo-snips/core`, `src/utils/*`) instead of adding new ones.
4. **Do not add dependencies** without clear justification.
5. **Validate** using the commands in §5/§8.
6. **Review the full diff** (`git diff`) for accidental edits, generated artifacts, or secrets.
7. **Summarize** what changed, which checks you ran (with results), and what remains unverified.

### Licensing note for contributors and agents

This is a **mixed-license monorepo**: `@expo-snips/core` and `@expo-snips/cli` are **MIT**; the `expo-snippets` VS Code extension is **proprietary** (see `packages/vscode-extension/LICENSE`); the `@expo-snips/registry` package declares **no license**. Do **not** add, change, or remove license headers or terms, and do not assume the whole repository is MIT. See `README.md` → License.
