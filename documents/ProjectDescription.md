# Expo Snips — Project Description & Landing Page Intelligence

> **Single source of truth** for generating the product's landing page, marketing website, product copy, SEO content, and AI-generated website designs.
>
> Every claim in this document is derived from the actual repository at `C:\Dev\expo-snips`. Sections are labeled with confidence levels (`High` / `Medium` / `Low`) and repository evidence. Anything not found in the repository is explicitly marked as **Unknown / Not found in repository**.

---

## 1. Executive Summary

**Expo Snips** is an open-source developer tool that generates complete, production-quality **Expo / React Native screens** from a short abbreviation — with a single CLI command or a VS Code code-completion trigger.

Developers working in Expo / React Native constantly re-build the same screens by hand: login, registration, OTP verification, settings, product listings, onboarding, empty states. Expo Snips turns that into a catalog lookup. Pick a screen, and the tool writes a fully styled, validated, keyboard-safe screen into your project — including form validation (zod + react-hook-form), loading and error states, safe-area handling, correct routing, and dependency installation. It auto-detects your project's styling, routing, UI-primitive, and icon setup so the generated code matches your stack, not the other way around.

**One-line description:** Beautiful, production-ready React Native screens for Expo apps — one command away.

---

## 2. Product Identity

### Product Name
**Expo Snips**
- Evidence: `packages/cli/package.json` (`@expo-snips/cli`), `packages/core/package.json` (`@expo-snips/core`), `packages/vscode-extension/package.json` (`"name": "expo-snips"`, `"displayName": "Expo Snips"`), CLI `program.name("expo-snips")` in `packages/cli/src/index.ts:12`.
- Confidence: **High**

### Product Type
**Developer Tool** — specifically a **React Native / Expo screen generator** delivered as a:
- CLI (`expo-snips`, published as `@expo-snips/cli`)
- VS Code extension (`Expo Snips`)
- Shared generation engine (`@expo-snips/core`)
- Versioned screen registry (`https://registry.expo-snips.dev`, served from the `registry/` folder)
- Confidence: **High**

### One-Line Description
Beautiful, production-ready React Native screens for Expo apps — one command away.

### Short Product Description (Hero / Meta / Social)
Expo Snips generates complete Expo / React Native screens from a single short abbreviation. Run `expo-snips add auth/login` or type `snip:` in VS Code to drop a fully styled, validated screen — login, registration, OTP, settings, product grids, onboarding, and more — straight into your project. The tool detects your router, styling, UI, and icon stack automatically, installs dependencies, and keeps your screens updateable.

### Full Product Description
Expo Snips is an open-source scaffolding tool for Expo and React Native developers. It maintains a registry of "screen recipes" — pre-authored, best-practice implementations of common app screens (authentication flows, app chrome, e-commerce, onboarding, utility states). When a developer runs `expo-snips add <screenId>` from the terminal or triggers the **Expo Snips: Add Screen…** command (or types `snip:` in any TypeScript/JavaScript file) in VS Code, the tool renders the recipe into complete files in the user's project.

The generated code is not a paste of a static file. It is a template engine output (Handlebars) that adapts to the developer's actual stack: it detects whether the project uses **NativeWind or StyleSheet**, **Expo Router**, native React Native components or **shadcn-style primitives**, and **lucide icons or no icon library**, and whether the project is TypeScript or JavaScript. Recipes include battle-tested patterns: `react-hook-form` + `zod` validation, `KeyboardAvoidingView`, `SafeAreaView`, loading spinners, error messages, and empty/error states.

After generation, the tool optionally installs the recipe's dependencies using the project's package manager (npm, pnpm, yarn, or bun), and records the install in a `.expo-snips.json` manifest so screens can be updated later with `expo-snips update` and inspected with `expo-snips status`.

**Key positioning note:** Expo Snips is a *screen generator*, not a full app template or a design-to-code AI. It fills the gap between "snippet library" (one line at a time) and "boilerplate starter" (entire project) by generating *whole screens* that fit your existing project.

---

## 3. Problem Statement

### Current Problem
Building Expo / React Native apps means writing the same screen boilerplate over and over:
- Auth screens (login, register, forgot password, OTP) with form validation, error handling, loading states, secure text inputs, and keyboard handling.
- App chrome (home dashboard, settings, profile, notifications, search) with correct safe areas, lists, and navigation.
- E-commerce views (product grids, product details with quantity selectors).
- Onboarding flows and permission requests.
- Empty / error / retry states.

Each of these requires many files (screen, form component, hooks), many libraries (forms, validation, icons, safe-area, notifications), and careful styling. Rebuilding them per project is slow, inconsistent, and error-prone — especially validation logic, loading states, and platform keyboard behavior.

### Existing Alternatives
Evidence-supported alternatives a developer might use instead:
- **Copy-paste from a previous project or code snippet library** — fast but fragile; code doesn't adapt to the current stack, and validation/loading logic is often stripped out.
- **`create-expo-app` templates / full boilerplate starters** — produce an entire project, not individual screens, so they don't fit into an existing codebase.
- **Design-to-code tools / component libraries** — generate components, not complete, wired screens with hooks and validation.
- **Hand-writing from scratch** — most flexible, least productive.

(These are framed as plausible alternatives based on the product's positioning; the repository does not name specific competitors. Confidence: **Medium** — inferred, not stated in the repo.)

### Consequences
When the problem is not solved:
- **Wasted time** on repetitive screen-building instead of product logic.
- **Inconsistent UI** across screens and projects (styling, spacing, error states drift).
- **Missing quality details** — forgotten keyboard avoidance, safe areas, loading states, or validation.
- **Repetitive dependency setup** — re-adding and re-configuring forms, validation, icons, safe-area per screen.
- **Slow onboarding** for new screens in existing apps.

---

## 4. Product Solution

### Core Solution
Expo Snips delivers whole-screen generation from a registry of versioned, stack-aware recipes, directly into the developer's existing project.

### Main Workflow (as implemented)
```
Developer runs:  expo-snips add auth/login
       (or VS Code: type "snip:" / command palette "Expo Snips: Add Screen…")
            ↓
CLI fetches registry index from https://registry.expo-snips.dev (configurable)
            ↓
CLI detects the project's stack (router, styling, UI, icons, TS/JS) from package.json
            ↓
Recipes not fully supported by detection prompt the user for styling/router/UI/icons
            ↓
Core engine (@expo-snips/core) renders Handlebars templates
            ↓
Complete screen files are written to the project (screen, form component, hooks)
            ↓
shadcn-style primitives (Button/Input/cn util) are added when ui=shadcn
            ↓
Recipe dependencies are installed via the project's package manager
            ↓
Install is recorded in .expo-snips.json manifest
            ↓
Developer reviews, wires real backend logic, runs the app
```
- Evidence: `packages/cli/src/commands/add.ts`, `packages/cli/src/utils/*`, `packages/core/src/generate.ts`, `packages/vscode-extension/src/generator.ts`
- Confidence: **High**

### Automation
- **Stack auto-detection:** router (expo-router / react-navigation), styling (nativewind / stylesheet), UI (native / shadcn), icons (lucide / none), TypeScript/JS — all read from `package.json` and `tsconfig.json`. Evidence: `packages/cli/src/utils/detectProject.ts:12`, `packages/vscode-extension/src/project.ts:17`.
- **Dependency installation:** automatically runs `npm|pnpm|yarn|bun add` for recipe dependencies. Evidence: `packages/cli/src/utils/installDeps.ts`, `packages/vscode-extension/src/generator.ts:115`.
- **Primitive dependency resolution:** when a recipe needs `ui=shadcn`, the engine recursively pulls in `ui/button`, `ui/input`, and `ui/utils` primitives, skipping ones already present. Evidence: `packages/cli/src/utils/primitives.ts:17`.
- **Package-manager detection:** pnpm-lock.yaml → pnpm, yarn.lock → yarn, bun.lockb → bun, else npm. Evidence: `packages/cli/src/utils/installDeps.ts:6`.

### Intelligence
- **Conditional template rendering:** Handlebars templates with `{{#if (eq styling "nativewind")}}` / `{{#if typescript}}` conditionals produce different output per stack. Evidence: `packages/core/src/generate.ts:5`, template files under `packages/registry/templates/`.
- **Variant support:** recipes can define named variants (e.g., "glass", "dark" — surfaced in CLI `--variant` and VS Code variant picker); the infrastructure exists, but no current recipe defines variants. Evidence: `ScreenVariant` in `packages/core/src/types.ts:27`, `packages/vscode-extension/src/generator.ts:92`. Confidence: **High (infrastructure) / Low (usage)**
- **TypeScript-aware output:** generates `.ts`/`.tsx` vs `.js`/`.jsx` variants (e.g., `hooks/useLogin.ts` vs `hooks/useLogin.js`). Evidence: `packages/registry/data/auth/login.json:83-95`.

### User Experience
- Terminal-first with a friendly interactive picker (`prompts`) when no screen ID is provided, plus flags (`--styling`, `--router`, `--ui`, `--icons`, `--variant`, `--typescript`, `--javascript`, `--no-install`). Evidence: `packages/cli/src/commands/add.ts`.
- VS Code integration: status bar item, command palette, and inline code-completion (`snip:` / `expo-snips:`). Evidence: `packages/vscode-extension/src/extension.ts:9`, `packages/vscode-extension/src/completionProvider.ts:4`.
- Post-generation guidance ("Next steps") and an "Open main file" quick action in VS Code. Evidence: `packages/cli/src/commands/add.ts:274`, `packages/vscode-extension/src/generator.ts:253`.
- Versioned update flow with diff preview before applying. Evidence: `packages/cli/src/commands/update.ts:108`.

### Transformation
```
BEFORE
A developer hand-writes a login screen: screen file + form component + hook +
validation schema + loading/error states + keyboard handling + styling +
dependency setup + safe areas  (≈ hours, error-prone, inconsistent)

↓  PROBLEM / FRICTION: repetitive boilerplate, inconsistent quality

PRODUCT
expo-snips add auth/login  (or "snip:" in VS Code)

↓  IMPROVED WORKFLOW: stack detection → template render → write files → install deps → manifest

AFTER
Complete, validated, keyboard-safe login screen generated in seconds,
matching the developer's existing router, styling, UI, and icon stack.
Developer reviews and wires real auth logic.
```

---

## 5. Target Audience

### Primary Users
- **Expo / React Native developers** building mobile (or mobile-first) apps.
- Developers using **Expo Router** with **NativeWind** or **StyleSheet**, in TypeScript or JavaScript.
- Solo developers, indie hackers, freelancers, and product teams who want fast, consistent screen scaffolding.

### Secondary Users
- **Agencies / studios** producing many client apps and needing consistent screen quality.
- **Team leads** who want a shared, versioned catalog of approved screen patterns.
- **Educators / course authors** teaching React Native who want best-practice example screens.

### User Roles
Supported by actual functionality:
- **Developer** (primary — CLI and VS Code usage)
- **Screenshot/UI builder** (contributor role — recipes are JSON + Handlebars templates in `packages/registry/`, enabling community contribution of new screens; implied by `files`, `tags`, `primitives`, `variants` schema and the public registry build script)

---

## 6. User Personas

### Persona 1: The Solo App Builder
- **Role:** Independent developer shipping an Expo app.
- **Context:** Building a new product; needs auth, onboarding, and core app screens fast.
- **Goals:** Get to a working, good-looking app quickly; avoid boilerplate.
- **Problems:** Hand-writing auth screens with validation takes hours; output is inconsistent with the rest of the app.
- **Needs:** Screens that match their existing stack and are editable afterward.
- **Relevant Features:** CLI `add`, stack auto-detection, dependency install, update flow, `.expo-snips.json` manifest.
- **Expected Outcome:** `expo-snips add auth/login` → working, validated login screen in their stack in seconds.

### Persona 2: The Team / Agency Developer
- **Role:** Developer on a team shipping several Expo apps.
- **Context:** Consistency across projects matters; multiple developers generate screens.
- **Goals:** Uniform, best-practice screens; fewer bugs in validation/loading states.
- **Problems:** Each developer re-builds screens differently; quality drifts.
- **Needs:** A shared catalog, deterministic output, and a way to update screens when the catalog improves.
- **Relevant Features:** Registry-driven catalog, versioned recipes, `expo-snips update` with diff preview, `expo-snips status`.
- **Expected Outcome:** Any developer can generate identical, version-tracked screens and pull in catalog improvements.

### Persona 3: The VS Code Power User
- **Role:** React Native developer living in VS Code.
- **Context:** Prefers editor-native workflows over terminal.
- **Goals:** Generate screens without leaving the editor.
- **Problems:** Switching to a terminal and remembering commands slows them down.
- **Needs:** In-editor discovery and generation.
- **Relevant Features:** `snip:`/`expo-snips:` completion provider, command palette, status bar button, "Open main file" action.
- **Expected Outcome:** Type `snip:`, pick `auth/login`, watch the screen appear in the project.

---

## 7. Core Value Proposition

### Primary Value Proposition
**Ship complete, production-quality React Native screens for Expo in seconds — matched to your stack, not the other way around.**

### Supporting Value Propositions
1. **Whole screens, not just snippets** — screen, form component, and hooks generated together.
2. **Best practices baked in** — zod + react-hook-form validation, loading states, error handling, keyboard avoidance, safe areas.
3. **Stack-aware by default** — auto-detects router, styling, UI primitives, icons, and TypeScript/JavaScript.
4. **Zero-config dependency setup** — installs recipe dependencies with your package manager.
5. **Versioned and updateable** — screens tracked in a manifest and updatable with a diff preview.
6. **Works where you work** — CLI or VS Code (command palette, status bar, inline `snip:` completion).
7. **Open source, MIT licensed** — free to use, modify, and extend.

### Transformation Statement
**From:** A developer spending hours hand-building repetitive, inconsistently styled screens with fiddly validation, loading, and keyboard handling.
**To:** A developer generating a complete, validated, keyboard-safe screen in seconds that already matches their project's stack — and being free to focus on product logic.

---

## 8. Product Features

### 8.1 Core Features

#### Feature: Screen Recipe Catalog (Registry)
- **Description:** A versioned catalog of screen recipes with names, descriptions, tags, supported stacks, dependencies, file templates, and optional variants/primitives.
- **User Benefit:** Discoverable, documented screens; one source of truth for screen patterns.
- **How It Works:** `index.json` lists every recipe; each recipe JSON (e.g., `registry/recipes/auth/login.json`) defines files, dependencies, supported options, and primitives.
- **Relevant User:** Developer.
- **Key Workflow:** `expo-snips list` → choose → `expo-snips add <id>`.
- **Supporting Files:** `registry/index.json`, `registry/recipes/**/*.json`, `packages/registry/src/index.ts`, `scripts/build-registry.mjs`.
- **Dependencies:** None (static JSON + templates; registry hosted via GitHub Pages).
- **Confidence:** **High**

#### Feature: One-Command Screen Generation (CLI)
- **Description:** `expo-snips add <screenId>` (or interactive picker) writes complete screen files into the project.
- **User Benefit:** A working screen in seconds instead of an hour of boilerplate.
- **How It Works:** Resolves the recipe from the registry, detects the project stack, prompts for any un-detected options, renders Handlebars templates, writes files, installs deps, records the install.
- **Relevant User:** Developer.
- **Key Workflow:** `expo-snips add auth/login [--styling nativewind] [--no-install]` …
- **Supporting Files:** `packages/cli/src/commands/add.ts`.
- **Dependencies:** `@expo-snips/core`, registry.
- **Confidence:** **High**

#### Feature: Stack Auto-Detection & Adaptation
- **Description:** Reads the project's `package.json`/`tsconfig.json` to detect router, styling, UI, icons, and TypeScript/JS; the chosen options shape the generated code.
- **User Benefit:** Generated code matches your existing stack — no rework.
- **How It Works:** Checks for `expo-router`/`@react-navigation/native`, `nativewind`, `lucide-react-native`, `@shadcn/ui`/`react-native-reusables`, and `tsconfig.json`.
- **Relevant User:** Developer.
- **Key Workflow:** Automatic during `add` / VS Code generation.
- **Supporting Files:** `packages/cli/src/utils/detectProject.ts`, `packages/vscode-extension/src/project.ts`.
- **Dependencies:** None.
- **Confidence:** **High**

#### Feature: Best-Practice Screen Templates
- **Description:** Generated screens include form validation (zod + react-hook-form), loading/error states, keyboard avoidance, safe areas, and expo-router navigation.
- **User Benefit:** Production-quality patterns without the effort of getting them right.
- **How It Works:** Handlebars templates (`packages/registry/templates/**/*.hbs`) encode the patterns; conditionals adapt them per stack.
- **Relevant User:** Developer.
- **Key Workflow:** Part of generation.
- **Supporting Files:** `packages/registry/templates/`, e.g. `auth/login/components.login-form.hbs`.
- **Dependencies:** `react-hook-form`, `zod`, `@hookform/resolvers`, `lucide-react-native` per recipe.
- **Confidence:** **High**

#### Feature: Automated Dependency Installation
- **Description:** After generating, the tool installs the recipe's dependencies (and dev deps) with the detected package manager.
- **User Benefit:** No manual `npm i` / config drift; screen works immediately.
- **How It Works:** Detects npm/pnpm/yarn/bun from lockfiles, runs `add` / `add -D`. In VS Code it runs in a terminal (configurable, default on).
- **Relevant User:** Developer.
- **Key Workflow:** Post-generation step of `add`.
- **Supporting Files:** `packages/cli/src/utils/installDeps.ts`, `packages/vscode-extension/src/generator.ts:115`.
- **Dependencies:** None.
- **Confidence:** **High**

#### Feature: Install Tracking & Updates (Manifest)
- **Description:** Installs are recorded in `.expo-snips.json`; `expo-snips status` shows tracked screens; `expo-snips update` regenerates them at the latest recipe version, with a diff preview and confirmation.
- **User Benefit:** Screens stay current with catalog improvements; change control via diff.
- **How It Works:** Manifest entries store recipeId, version, options, variant, files, installedAt. Update re-renders files and diffs against disk.
- **Relevant User:** Developer / team lead.
- **Key Workflow:** `expo-snips status` → `expo-snips update`.
- **Supporting Files:** `packages/cli/src/utils/manifest.ts`, `packages/cli/src/commands/status.ts`, `packages/cli/src/commands/update.ts`, `packages/cli/src/utils/diff.ts`.
- **Dependencies:** Registry (for latest versions).
- **Confidence:** **High**

#### Feature: VS Code Integration (Add Screen, Command Palette, Status Bar, `snip:` Completion)
- **Description:** Generate screens from the editor: command palette **Expo Snips: Add Screen…**, a status bar button, and inline completion after typing `snip:` or `expo-snips:` in TS/JS/TSX/JSX files.
- **User Benefit:** Discover and generate screens without leaving the editor.
- **How It Works:** The completion provider triggers on `:`; selecting a completion runs the generation command. The extension reuses the same core engine as the CLI.
- **Relevant User:** Developer (VS Code).
- **Key Workflow:** Type `snip:` → pick → screen generated → "Open main file".
- **Supporting Files:** `packages/vscode-extension/src/extension.ts`, `commands.ts`, `completionProvider.ts`, `generator.ts`.
- **Dependencies:** `@expo-snips/core`, VS Code API.
- **Confidence:** **High**

### 8.2 Supporting Features

#### Feature: Project Bootstrap (`expo-snips init`)
- **Description:** Creates a new Expo project via `create-expo-app` (optional template flag).
- **User Benefit:** Start from zero and immediately use the catalog.
- **How It Works:** Runs `npx create-expo-app@latest`; refuses to overwrite an existing `app.json`.
- **Relevant User:** Developer (new project).
- **Key Workflow:** `expo-snips init --name myapp`.
- **Supporting Files:** `packages/cli/src/commands/init.ts`.
- **Confidence:** **High**

#### Feature: shadcn-style UI Primitives
- **Description:** Recipes using `ui=shadcn` automatically generate `components/ui/button.tsx`, `components/ui/input.tsx`, and `lib/utils.ts` (cn helper) built with `class-variance-authority` and NativeWind.
- **User Benefit:** shadcn-style component quality in React Native without manual setup.
- **How It Works:** Recursive primitive resolution (`recipe.primitives`), skipping already-existing files.
- **Relevant User:** Developer using shadcn-style primitives.
- **Key Workflow:** `expo-snips add auth/register --ui shadcn`.
- **Supporting Files:** `packages/cli/src/utils/primitives.ts`, `packages/registry/templates/ui/*.hbs`.
- **Dependencies:** `class-variance-authority`, NativeWind, lucide (enforced).
- **Confidence:** **High**

#### Feature: Variants
- **Description:** Screen-level variants (e.g., "glass", "dark") selectable via `--variant` or the VS Code variant picker; template files can provide per-variant overrides.
- **User Benefit:** Design variations without duplicating recipes (infrastructure ready).
- **How It Works:** `ScreenVariant[]` in recipe; `resolveTemplateString` prefers variant overrides.
- **Relevant User:** Developer.
- **Key Workflow:** `expo-snips add app/home --variant dark`.
- **Supporting Files:** `packages/core/src/types.ts:27`, `packages/core/src/generate.ts:17`, `packages/vscode-extension/src/generator.ts:92`.
- **Dependencies:** None.
- **Note:** No current recipe defines variants — infrastructure only. Confidence: **High (infrastructure) / Low (usage)**

#### Feature: Configurable Registry
- **Description:** The registry URL is configurable via the `EXPO_SNIPS_REGISTRY` env var, the CLI `--registry` flag, or the VS Code `expo-snips.registryUrl` setting.
- **User Benefit:** Point at private/custom registries.
- **How It Works:** `getRegistryBase()` resolution chain.
- **Relevant User:** Team lead / advanced user.
- **Key Workflow:** Set env var or setting.
- **Supporting Files:** `packages/cli/src/utils/registry.ts`, `packages/vscode-extension/src/registry.ts`.
- **Confidence:** **High**

### 8.3 Advanced Features

#### Feature: Stack-Conditional Template Engine
- **Description:** A shared Handlebars-based engine with `eq`/`neq` helpers and `when` conditions produces per-stack output for every file.
- **User Benefit:** One recipe covers many stacks (NativeWind + StyleSheet, TS + JS, native + shadcn, lucide + none).
- **How It Works:** `getFilesForRecipe` filters files by `when` conditions and renders with render context; per-styling and per-variant overrides supported.
- **Relevant User:** Developer; recipe author.
- **Key Workflow:** Automatic during generation.
- **Supporting Files:** `packages/core/src/generate.ts`, `packages/core/src/context.ts`.
- **Confidence:** **High**

#### Feature: Versioned Update with Diff Preview
- **Description:** `expo-snips update` regenerates tracked screens and shows a line-level diff before applying.
- **User Benefit:** Safe, reviewable upgrades of generated code.
- **How It Works:** Diff via longest-common-subsequence implementation; confirmation prompt (or `--yes`).
- **Relevant User:** Developer / team lead.
- **Key Workflow:** `expo-snips update [screenId] [--yes]`.
- **Supporting Files:** `packages/cli/src/commands/update.ts`, `packages/cli/src/utils/diff.ts`.
- **Confidence:** **High**

### 8.4 Administrative Features

#### Feature: Registry Build & Deploy Automation
- **Description:** `scripts/build-registry.mjs` compiles `packages/registry/data/**` + templates into the flat `registry/` folder (`index.json` + per-recipe JSON); a GitHub Actions workflow deploys it to GitHub Pages; another workflow publishes `@expo-snips/core` and `@expo-snips/cli` to npm on version tags.
- **User Benefit:** Infrastructure to distribute the catalog and packages automatically (maintainer value).
- **How It Works:** CI on push to main/master (registry deploy) and on `v*` tags (npm publish).
- **Relevant User:** Maintainer.
- **Key Workflow:** Push → build → deploy/publish.
- **Supporting Files:** `scripts/build-registry.mjs`, `.github/workflows/deploy-registry.yml`, `.github/workflows/publish.yml`, `packages/registry/scripts/build-bundle.mjs`.
- **Confidence:** **High**

---

## 9. Feature Prioritization

| Priority | Features |
| --- | --- |
| **P0 — Core** | Screen recipe catalog (registry); one-command CLI generation; stack auto-detection; best-practice templates; automated dependency install; install tracking + updates; VS Code integration (`snip:` completion, command palette, status bar). |
| **P1 — Important** | `expo-snips init`; shadcn-style primitives; configurable registry. |
| **P2 — Secondary** | Variants (infrastructure; unused by current recipes). |
| **P3 — Internal/admin** | Registry build/deploy automation, npm publish workflow. |

**Landing page guidance:** Lead with P0 (generation, stack-aware output, best-practice screens, updates, VS Code + CLI). Mention P1 as supporting capabilities. Do not feature P2/P3 in primary marketing copy.

---

## 10. Key Benefits (Technical Capability → User Benefit)

| Technical Capability | User Benefit |
| --- | --- |
| Registry of versioned screen recipes | A discoverable, consistent catalog of screens instead of one-off snippets |
| `expo-snips add <id>` generation | Complete screens in seconds instead of hours of boilerplate |
| Stack auto-detection (router/styling/UI/icons/TS) | Generated code matches your project — no rework |
| zod + react-hook-form templates | Validated forms with proper error messages, out of the box |
| Loading/error/keyboard/safe-area handling baked in | Production-quality UX details without the manual effort |
| Automated dependency installation (npm/pnpm/yarn/bun) | Screen works immediately; no dependency drift |
| `.expo-snips.json` manifest + `update` with diff | Screens stay current; changes are reviewable |
| VS Code `snip:` completion & commands | Generate screens without leaving the editor |
| NativeWind AND StyleSheet output | Works with your styling choice (Tailwind-like or classic) |
| shadcn-style primitives (cva) | shadcn-quality components in React Native |
| TypeScript/JavaScript output | Works in TS or JS projects |
| Open source (MIT) | Free to use, audit, and extend |

---

## 11. Product Differentiators

### Proven Differentiators (clearly supported by implementation)
1. **Whole-screen generation** — generates complete screens (screen + form component + hooks), not single snippets. Evidence: recipe `files` arrays generate multiple files per recipe (e.g., `auth/login` → `app/login/index.tsx`, `components/LoginForm.tsx`, `hooks/useLogin.ts`).
2. **Project-aware output** — detects router, styling, UI, icons, and TypeScript/JS and renders conditional templates to match. Evidence: `detectProject.ts`, `generate.ts` conditionals.
3. **Dual surface (CLI + VS Code)** — identical engine behind terminal and editor workflows, including an abbreviation-triggered completion (`snip:`). Evidence: `@expo-snips/core` shared by `packages/cli` and `packages/vscode-extension`.
4. **Updateable, version-tracked screens** — `.expo-snips.json` manifest, `status`, and diff-preview `update`. Evidence: `manifest.ts`, `update.ts`, `diff.ts`.
5. **Automated dependency + primitive resolution** — installs deps and recursively pulls shadcn primitives. Evidence: `installDeps.ts`, `primitives.ts`.
6. **Best-practice authentication templates** — validated auth flows (login/register/forgot/OTP) using react-hook-form + zod with full state handling. Evidence: `packages/registry/templates/auth/**`.
7. **Registry-driven catalog** — screens distributed via a versioned remote registry (configurable), enabling the catalog to grow independently of the CLI. Evidence: `registry/index.json`, GitHub Pages deploy workflow.

### Potential Differentiators (interesting; require validation)
- **Variant system** ("glass", "dark" examples referenced in CLI help) — infrastructure exists but no recipe ships variants yet; could become a differentiator when populated.
- **Custom/self-hosted registries** — the configurable registry could enable private/company catalogs; not yet marketed or documented beyond settings.

**Avoid superlatives:** Do not claim "fastest", "best", "first", "only" without evidence.

---

## 12. Product Workflow (Primary User Journey)

### CLI journey
```
Install CLI  (npm i -g @expo-snips/cli, or npx)
   ↓
expo-snips init --name myapp        (optional: create a new Expo project)
   ↓
expo-snips list                     (browse the catalog from the registry)
   ↓
expo-snips add auth/login           (or interactively pick a screen)
   ↓
Stack detection + prompts (styling / router / UI / icons)
   ↓
Files generated → dependencies installed → .expo-snips.json updated
   ↓
Review generated code, wire real backend/auth logic
   ↓
expo-snips status / expo-snips update   (manage & keep screens current)
```

### VS Code journey
```
Open Expo project in VS Code
   ↓
Type "snip:" (or "expo-snips:") in a TS/TSX/JS/JSX file
   — or run "Expo Snips: Add Screen…" from the command palette / status bar
   ↓
Pick a screen from the quick-pick list
   ↓
Screen generated into the workspace (deps installed in a terminal, optional)
   ↓
"Open main file" → review, wire real logic
```

- **Activation point:** The first `expo-snips add <screenId>` (or VS Code `snip:` trigger) that produces a working screen in the developer's stack.
- **Primary action:** `expo-snips add <screenId>`.
- **Key user moment:** Seeing a complete, validated screen appear that matches the project's existing stack — instant scaffolding.
- **Successful outcome:** The generated screen runs in the app and is wired to the developer's real backend.
- **Retention loop:** The registry gains new/updated recipes; `expo-snips update` brings installed screens up to date → developer keeps using the tool. (Infrastructure exists; loop strength not yet proven.)

---

## 13. Landing Page Content Intelligence

### Hero
- **Headline:** "Beautiful React Native screens, one command away."
  - (This is the CLI's own tagline — `packages/cli/package.json` description and `packages/cli/src/index.ts:13`. Communicates outcome, not technology.)
- **Subheadline:** "Generate complete Expo / React Native screens — login, onboarding, settings, product grids, and more — matched to your router, styling, and UI stack. From the CLI or right inside VS Code."
- **Primary CTA:** **Get Started** (→ install / CLI usage)
- **Secondary CTA:** **Browse the Screens** (→ screen catalog)
- **Hero Product Concept:** Terminal/editor visual — `$ expo-snips add auth/login` with a resulting phone mockup of a generated login screen; or a VS Code window showing `snip:` completion.
- **Note:** There is no SaaS signup, trial, or account. The product is a free, open-source CLI + extension. CTAs should drive installation and usage, not account creation.

---

## 14. Landing Page Sections

| Section | Purpose | What it should communicate | Recommended content |
| --- | --- | --- | --- |
| **Hero** | First impression + conversion | One-command screen generation, works with your stack | Headline/subheadline above; terminal + phone mockup; Get Started + Browse the Screens |
| **Problem** | Build urgency | Hand-writing repetitive screens is slow, inconsistent, error-prone | Rebuild-the-same-screens friction; validation/loading/keyboard pitfalls |
| **Solution** | Introduce the product | A catalog of versioned, stack-aware screen recipes | Registry concept; `expo-snips add <id>`; `snip:` in VS Code |
| **How It Works** | Reduce friction/doubt | 4-step flow from command to running screen | Install → list → add → wire real logic; VS Code path |
| **Core Features** | Show value | Generation, stack detection, best practices, updates, deps | Feature cards per §8 P0 |
| **Product Showcase** | Proof | Real generated screens | Auth, home dashboard, product grid, onboarding, settings, empty/error states |
| **Use Cases** | Relevance to visitor | Auth flows, app chrome, e-commerce, onboarding, utility states | Category chips tied to recipe groups |
| **Benefits** | Outcome framing | Time saved, consistency, quality | §10 capability→benefit table |
| **Differentiators** | Choose us | Whole screens, stack-aware, CLI + VS Code, updateable | §11 proven differentiators |
| **FAQ** | Objection handling | Works in my stack? TypeScript/JS? How do updates work? Is it free? | §24 FAQ |
| **Final CTA** | Convert | Start generating | Get Started (install instructions) |
| **Footer** | Navigation + trust | Links to registry, GitHub, license | Open-source / MIT; GitHub repo; registry URL |

**Omit:** Testimonials (none exist), pricing (none), trust logos (none verified). If included, mark as placeholder social-proof reserved for future evidence.

---

## 15. CTA Strategy

- **Primary CTA: Get Started** — install and run the tool. The honest conversion path is: install the CLI/extension and generate a screen. No signup, trial, or demo exists.
- **Secondary CTA: Browse the Screens** — showcase the catalog (the 19 recipes).
- **Supporting CTA options:** "Install for VS Code", "Install via npm", "View the source" (GitHub), "Read the docs".
- **What the product supports:** open-source download/use (CLI via npm, extension via vsix/Marketplace), direct usage; **no** signup, login, demo, waitlist, purchase, or billing flow exists anywhere in the repository.

---

## 16. Trust Signals

**No verified quantitative trust signals identified in the repository** (no GitHub star counts, user counts, testimonials, ratings, partner logos, or certifications).

Supported signals that *can* be stated factually:
- **Open source** — MIT license declared in every package (`packages/*/package.json`), full source in repo.
- **Public npm distribution** — `@expo-snips/cli` and `@expo-snips/core` publish configuration (`publishConfig.access: public`) and an npm publish workflow (`.github/workflows/publish.yml`).
- **VS Code extension** — published under publisher `expo-snips` (packaging supported via `vsce package`, `packages/vscode-extension/package.json:6,34`).
- **Automated delivery** — GitHub Actions CI for registry deploy (GitHub Pages) and npm publishing.
- **Consistency guarantee** — VS Code and CLI share one generation engine (`@expo-snips/core`), so output is identical across surfaces (documented in `packages/vscode-extension/README.md`).

---

## 17. Visual Product Identity

### Brand
- **No logo or branded assets** are present in the repository (no images, SVGs, or logo files found).
- Brand name: **Expo Snips**; VS Code status bar shows a sparkle glyph + "Expo Snips" (`$(sparkle)`, `packages/vscode-extension/src/extension.ts:10`).
- There is no brand color, marketing site, or established brand identity in the repo.

### Colors
Identified from the generated-screen templates (the product's actual UI output). This is a **light, neutral, blue-accented palette** (Tailwind Gray + Blue scale):

| Role | Value(s) | Evidence |
| --- | --- | --- |
| Primary / accent | `#2563EB` (blue-600); hover `#3B82F6` (blue-500); light fill `#EFF6FF` (blue-50) | `packages/registry/templates/**/*.hbs` |
| Background | `#FFFFFF` (white); app screens `#F9FAFB` (gray-50) | home/notifications/profile/settings templates |
| Surface / cards | `#FFFFFF` on gray-50 | card styles in templates |
| Text (primary) | `#111827` (gray-900) | headers/titles |
| Text (secondary) | `#6B7280` (gray-500), `#4B5563` (gray-600) | body |
| Text (muted) | `#9CA3AF` (gray-400) | timestamps, placeholder |
| Border / divider | `#D1D5DB` (gray-300), `#F3F4F6` (gray-100) | inputs, list dividers |
| Semantic — success | `#16A34A` (green-600), fills `#D1FAE5`/`#F0FDF4` | status tints |
| Semantic — error | `#EF4444` (red-500), text `#DC2626` (red-600), fills `#FEE2E2`/`#FEF2F2` | error messages, logout |
| Semantic — warning | `#F59E0B` (amber-500), fill `#FEF3C7` | ratings/accents |
| Semantic — info/pink/indigo | `#DBEAFE`, `#FCE7F3`, `#E0E7FF`, `#BFDBFE` | product placeholder colors |
| shadcn tokens (ui=shadcn) | `bg-background`, `text-foreground`, `text-muted-foreground`, `bg-primary`, `text-destructive`, `border-input`, `text-primary-foreground` | `packages/registry/templates/ui/button.hbs`, shadcn templates |

**Landing page recommendation:** Primary blue `#2563EB`, light-gray `#F9FAFB` background, white surfaces, near-black `#111827` text — consistent with the generated product screens.

### Typography
- **No custom fonts.** Generated screens use **system fonts** (React Native default). Evidence: no `fontFamily` usage in templates.
- Hierarchy (from templates): page titles `text-2xl`–`3xl` bold (`#111827`); section headers `text-lg` bold; labels `text-sm` medium; body `text-sm`–`text-base`; timestamps `text-xs`.
- Rounded-corner language: `rounded-2xl` (16px) cards, `rounded-lg`/`rounded-xl` (8–12px) inputs/buttons, `rounded-full` icon buttons.

### UI Style
**Modern, minimal, card-based, mobile-first** — white rounded cards (`rounded-2xl`) on a light-gray (`gray-50`) canvas, blue accent CTAs, generous spacing, subtle gray dividers, icon-forward navigation. The shadcn variant is a tokenized, Tailwind/NativeWind-based design system. This is a clean, contemporary mobile UI language — appropriate to mirror on the landing page.

---

## 18. UI Components Useful for the Landing Page

Reusable visual elements demonstrated by the generated screens (use these as landing-page showcase imagery):

- **Cards** (rounded-2xl white cards) — stats, product, notification, profile cards.
- **Buttons** (rounded, blue primary, ghost/outline/destructive variants in shadcn) — CTA styling reference.
- **Forms & inputs** (icon-in-input fields, validation error text) — auth showcases.
- **OTP input** — segmented code entry.
- **Lists** (FlatList product grid 2-col, notification list, search results).
- **Search bar** with recent-search chips.
- **Toggle/grouped settings list**.
- **Empty & error states** with icon + message + action button.
- **Onboarding screens** (feature cards, permission request).
- **Status/stat indicators** (streak, tasks done), ratings (star).
- **Data-free product imagery** — generated screens use colored placeholder blocks, so landing page can show product UI without external photography.

Recommend featuring: auth/login, home dashboard, product grid, onboarding welcome, settings, and empty state as a visual strip on the landing page.

---

## 19. Product Screenshots / Showcase

**Note:** The repository contains no rendered screenshots. The strongest "showcase" is the set of screens the tool *can generate* (the 19 recipes). Landing page can render these recipes to produce live screenshots.

| Screen | Route (generated) | Purpose | Feature demonstrated | Why it matters | Recommended landing page section |
| --- | --- | --- | --- | --- | --- |
| Login | `app/login/index.tsx` | Sign-in flow | Full form validation, loading state, keyboard avoidance, secure password toggle, forgot-password link | Flagship demo of best-practice generation | Hero / Showcase |
| Register | `app/register/index.tsx` | Sign-up flow | Name+email+password validation, error handling, shadcn variant | Breadth of auth coverage | Use Cases |
| Home Dashboard | `app/home/index.tsx` | App landing | Greeting, stat cards, task list, refresh control, icon actions | Shows "complete screen" value | Showcase / Solution |
| Product Grid | `app/products/index.tsx` | E-commerce catalog | Two-column FlatList grid, ratings, prices, filter button | App-chrome breadth | Showcase |
| Product Details | `app/products/[id].tsx` | Product page | Quantity selector, favorite toggle, share, add-to-cart, dynamic route param | Route-param support (`[id]`) | Use Cases |
| Settings | `app/settings/index.tsx` | Preferences | Grouped items, toggles, back navigation | Common app screen | Showcase |
| Notifications | `app/notifications/index.tsx` | Activity feed | Unread indicators, mark-all-read, read/unread states | List patterns | Showcase |
| OTP Verification | `app/otp-verification/index.tsx` | Code entry | Segmented OTP input, auto-submit, error handling | Unique pattern | Use Cases |
| Onboarding Welcome | `app/welcome/index.tsx` | First-run | Feature highlights + CTA; shadcn variant | First-run UX | Use Cases |
| Permissions | `app/permissions/index.tsx` | Permissions | Allow/deny notification permission, uses `expo-notifications` | Permission flows | Use Cases |
| Empty / Error states | `app/empty.tsx`, `app/error.tsx` | Fallback UI | Icon + message + action button | Completeness of catalog | Differentiators |

---

## 20. SEO Intelligence

### Primary Keywords
- react native screen generator
- expo screen generator
- expo snips
- react native boilerplate screens
- expo boilerplate
- react native snippets
- expo app screens

### Secondary Keywords
- react native login screen template
- expo router screens
- nativewind templates react native
- shadcn react native
- expo form validation screen
- react native onboarding screen
- react native settings screen template
- expo ecommerce screen

### Long-Tail Keywords
- generate react native login screen with validation
- react native auth screens with zod validation
- expo screen generator CLI
- add screens to existing expo app
- react native otp verification screen
- vs code react native screen generator
- update react native screens from registry

### Search Intent
- **Informational:** "react native login screen best practices", "expo router forms"
- **Commercial:** "react native boilerplate screens", "expo app screen templates"
- **Transactional:** "expo-snips add auth/login", "install expo snips"
- **Navigational:** "expo snips", "expo snips github"

(These keywords are derived from the product's actual function and copy in the repository; they are recommendations, not measured search data.)

---

## 21. AI Search / AEO / GEO Intelligence

**What is Expo Snips?**
Expo Snips is an open-source developer tool that generates complete Expo / React Native screens from a short abbreviation, via a CLI (`expo-snips add <screenId>`) or a VS Code extension (`snip:` completion). It renders versioned screen "recipes" into your project with stack-aware templates and installs dependencies automatically.

**Who is Expo Snips for?**
Expo / React Native developers — solo builders, product teams, and agencies — who want to add complete screens (auth, onboarding, settings, e-commerce, utility states) to their projects quickly and consistently, in either TypeScript or JavaScript.

**What problem does Expo Snips solve?**
It eliminates repetitive, error-prone, hand-written screen boilerplate (forms, validation, loading states, keyboard/safe-area handling, styling, dependency setup) by generating whole, production-quality screens on demand.

**How does Expo Snips work?**
1. Fetch the screen catalog from a registry (`https://registry.expo-snips.dev`, configurable). 2. Detect the project's router, styling, UI, icons, and TS/JS. 3. Render Handlebars templates conditionally per stack. 4. Write screen files, add shadcn primitives if needed, install dependencies, and record the install in `.expo-snips.json`.

**What are the main features?**
One-command screen generation; project stack auto-detection; best-practice templates (react-hook-form + zod validation, loading/error states, keyboard handling, safe areas); automatic dependency installation; version-tracked screens with `status` and diff-preview `update`; VS Code integration (`snip:` completion, command palette, status bar); shadcn-style primitives; configurable registry.

**What makes Expo Snips different?**
It generates whole screens (not single snippets), adapts output to the developer's existing stack, works from both the terminal and VS Code with a shared engine, and tracks/updates installed screens from a versioned registry.

**What are the main use cases?**
Authentication flows (login, register, forgot password, OTP); app chrome (home dashboard, settings, profile, notifications, search); e-commerce (product grids and product details); onboarding (welcome, features, permissions); utility states (empty, error).

**What alternatives might users consider?**
Copy-pasting snippets or code from other projects, full-project boilerplate templates, component libraries, or hand-writing screens from scratch.

**Why would someone choose Expo Snips?**
To ship consistent, best-practice screens in seconds without leaving their editor or terminal, while keeping screens updateable as the catalog improves — free and open source.

---

## 22. FAQ Discovery

| Question | Answer | Evidence |
| --- | --- | --- |
| What is Expo Snips? | A CLI + VS Code extension that generates complete Expo/React Native screens from a short abbreviation. | CLI bin `expo-snips`, VS Code commands/status bar, shared `@expo-snips/core`. |
| Which React Native frameworks does it support? | Expo / React Native apps using Expo Router (all recipes), with NativeWind or StyleSheet styling, native or shadcn-style UI, lucide icons or none, and TypeScript or JavaScript. | `packages/registry/data/**` `supported` fields; recipe `framework: "react-native"`, `runtime: "expo"`. |
| Is Expo Snips free? | Yes — MIT-licensed open source; no pricing, billing, or accounts exist in the repository. | `license: "MIT"` in all packages; no pricing code. |
| Do I need a backend to use it? | No — generated screens run standalone; the auth hooks include placeholder logic with a documented comment to "replace with your actual authentication logic". | `useLogin` template comment "// Replace with your actual authentication logic". |
| Does it work in an existing project? | Yes — it detects your stack and adds screens into the current working directory / VS Code workspace; it does not require a fresh project. | `detectProject`, `add.ts` writing to `process.cwd()`. |
| Can I use TypeScript or JavaScript? | Both — `--typescript` (default) / `--javascript`, with separate `.ts`/`.js` template outputs. | `add.ts:160`, recipes' TS/JS file variants. |
| Can I use it without a terminal? | Yes — VS Code extension: command palette, status bar, or typing `snip:`/`expo-snips:` in a TS/TSX/JS/JSX file. | `packages/vscode-extension/**`. |
| How do I get more screens? | `expo-snips list` shows the catalog; new recipes are distributed via the registry and `expo-snips update` brings installed screens current. | `list.ts`, `update.ts`, registry deploy workflow. |
| Does the generated code really work immediately? | Screens render and run; form validation and UI states are functional. Business logic (auth API calls, real data) is a placeholder to be wired by the developer. | Templates include real `useForm`/`zod` wiring; `useLogin` uses a mock delay + `Alert`. |
| What if my project uses react-navigation? | Detection checks for it, but no current recipe declares react-navigation support — the recipes target Expo Router. | `detectProject.ts:24`; all recipes' `supported.router: ["expo-router"]`. |
| Can I use shadcn-style UI? | Yes — `--ui shadcn` generates `components/ui/button.tsx`, `components/ui/input.tsx`, and `lib/utils.ts` (cva + NativeWind), and enforces NativeWind + lucide. | `add.ts:201-213`, `primitives.ts`, `templates/ui/*.hbs`. |
| Is there a custom registry option? | Yes — `EXPO_SNIPS_REGISTRY` env var, `--registry` flag, or `expo-snips.registryUrl` setting. | `registry.ts` (CLI + extension). |
| Does Expo Snips require an internet connection? | No — the CLI and VS Code extension bundle the screen catalog and work fully offline. A remote registry (via `EXPO_SNIPS_REGISTRY`, `--registry`, or `expo-snips.registryUrl`) can be configured to fetch recipes instead. | Bundled catalog generated by `scripts/lib/build-recipes.mjs`; `registry.ts` (CLI + extension). |

---

## 23. Competitive Positioning

**Product Category:** React Native / Expo screen generator (developer tooling).

**Typical Alternatives** (external market context, not repository-derived facts): hand-written code, snippet collections, component libraries, full-project boilerplate/starters, and other code-generation tools.

**Common Alternative Workflow:** Open a snippet/old project → copy the file → strip it down → re-style → re-add validation/loading → install dependencies manually → repeat per screen and per project.

**Product's Advantage:** Generates *complete, stack-aware, best-practice screens* with dependencies and update tracking, from either CLI or VS Code, in a single step.

**Potential Positioning:** "The screen generator for Expo apps — whole screens, matched to your stack, updateable over time."

---

## 24. Pricing & Monetization

**Pricing model could not be determined from repository.**
- No pricing page, plans, subscriptions, billing, payment integrations, credits, usage limits, or premium tiers exist anywhere in the codebase.
- The product is **free and open source (MIT)**, with public npm packages (`publishConfig.access: public`) and a public registry.

---

## 25. Technical Product Summary

```
Frontend (tooling UX):      CLI (commander + prompts + chalk, Node ≥18); VS Code extension
                            (TypeScript, esbuild bundle); no web UI/SaaS app
Backend:                    None (no server app; registry is static JSON served via GitHub Pages)
Database:                   None (local state only via .expo-snips.json manifest)
Authentication:             None in the product itself (generated auth templates are placeholders)
Hosting:                    Registry: GitHub Pages (peaceiris/actions-gh-pages);
                            Packages: npm registry (@expo-snips/core, @expo-snips/cli)
Infrastructure:             pnpm monorepo (packages/*), GitHub Actions workflows
External APIs:              Registry endpoints: GET {base}/index.json, GET {base}/recipes/{id}.json
                            (default https://registry.expo-snips.dev)
AI/ML:                      None
Storage:                    .expo-snips.json manifest (installs, versions, options, files)
Major integrations:         create-expo-app (init); npm/pnpm/yarn/bun (dependency install);
                            VS Code extension API; expo-router, react-hook-form, zod,
                            NativeWind, class-variance-authority, lucide-react-native,
                            react-native-safe-area-context, expo-notifications
                            (as generated recipe dependencies)
```

Technologies detected: TypeScript, Handlebars (template engine), `@expo-snips/core` shared engine, Node.js. Confidence: **High**.

---

## 26. Product Limitations

- **Requires network access** to fetch the registry (CLI has no offline cache; extension caches the index for 5 minutes). Evidence: `packages/cli/src/utils/registry.ts`, `packages/vscode-extension/src/registry.ts:16`.
- **Expo Router only for generated screens** — react-navigation is detected but no recipe declares support. Evidence: all recipes' `supported.router`.
- **Placeholder business logic** — auth hooks simulate login/register (mock delay + `Alert`) and are meant to be replaced with real auth. Evidence: `templates/auth/login/hooks.use-login.hbs`.
- **Mock/placeholder content** — generated screens ship sample data (e.g., "Jane", sample products, stats) the developer replaces. Evidence: templates.
- **shadcn UI requires NativeWind + lucide** — enforced by the generator (`add.ts:201-213`).
- **`tamagui` and `vector-icons` are listed as options in VS Code settings** but are not implemented in current recipes/CLI choices. Evidence: settings enum vs `add.ts` choices, recipes. Confidence: **High**.
- **Variants unused** — variant infrastructure exists but no recipe ships variants. Evidence: all recipes `variants: []`.
- **No tests** in the repository. Evidence: repo-wide search found no test files.
- **Early maturity** — version 0.1.0, small commit history. Evidence: `package.json` files, `git log`.

---

## 27. Product Maturity

**Classification: MVP** (early-stage, pre-production-marketing).
- Evidence: all packages at version `0.1.0`; early commit history (init → 17-8 → VS Code extension); no root README; no website; no tests; infrastructure (CI for registry deploy + npm publish) present but young.
- The core generation engine, CLI, registry, and VS Code extension are all implemented and functional, and the npm publish workflow suggests intent to distribute publicly — but nothing in the repo demonstrates production adoption.
- Do not market as "production-ready" or "enterprise".

---

## 28. Marketing Claims & Content Guardrails

### Safe Claims (directly supported by implementation)
- "Generates complete React Native/Expo screens from a short abbreviation."
- "Available as a CLI and a VS Code extension (type `snip:` in your editor)."
- "Auto-detects your router, styling, UI primitives, icons, and TypeScript/JavaScript."
- "Screens include form validation (react-hook-form + zod), loading and error states, keyboard avoidance, and safe-area handling."
- "Installs recipe dependencies using your package manager (npm/pnpm/yarn/bun)."
- "Tracks installed screens in `.expo-snips.json` and can update them with a diff preview (`expo-snips update`)."
- "Registry of 19 versioned screen recipes across auth, app, e-commerce, onboarding, UI primitives, and utility states."
- "Free and open source under the MIT license."
- "The VS Code and CLI use the same generation engine, so output is identical."

### Claims Requiring Verification
- "Loved by thousands of developers" / any user counts.
- "Saves hours per week" / any quantified time savings (no metrics exist).
- Any claim about rendering quality vs. specific competitors.
- "Production-ready" or "battle-tested at scale."
- Community/adoption claims (no community data in repo).

### Claims To Avoid
- Superlatives without evidence: "the fastest", "the best", "the first", "the only".
- Fabricated testimonials, star counts, download counts, ratings, or customer logos.
- Claiming features that are infrastructure-only (e.g., variants) as shipped capabilities.
- Claiming react-navigation, tamagui, or vector-icons support (not implemented in recipes).
- Pricing claims (no pricing exists — free/open-source is accurate).

---

## 29. Landing Page Copy Source Material

```
PRODUCT_NAME: Expo Snips
PRODUCT_CATEGORY: Developer Tool — React Native / Expo screen generator (CLI + VS Code extension + registry)
ONE_LINE_DESCRIPTION: Beautiful, production-ready React Native screens for Expo apps — one command away.
PRIMARY_AUDIENCE: Expo / React Native developers (solo, teams, agencies); TypeScript and JavaScript
PRIMARY_PROBLEM: Hand-writing the same screen boilerplate (auth, onboarding, settings, e-commerce, empty/error states) is slow, inconsistent, and error-prone
PRIMARY_SOLUTION: A versioned registry of stack-aware screen recipes rendered into complete, validated screens on demand (CLI or VS Code `snip:` trigger)
PRIMARY_VALUE_PROPOSITION: Ship complete, production-quality React Native screens in seconds — matched to your stack, not the other way around
PRIMARY_CTA: Get Started
SECONDARY_CTA: Browse the Screens
CORE_FEATURES: One-command screen generation; project stack auto-detection; best-practice templates (react-hook-form + zod, loading/error states, keyboard/safe-area handling); automatic dependency installation; version-tracked screens with `status`/`update` (diff preview); VS Code integration (`snip:` completion, command palette, status bar); shadcn-style primitives; configurable registry
KEY_BENEFITS: Screens in seconds; consistent UI; validated forms; no dependency drift; updateable screens; works in your editor or terminal; free & open source
KEY_DIFFERENTIATORS: Whole screens not snippets; stack-aware output; dual CLI + VS Code with one engine; versioned, updateable installs; automated dependency + primitive resolution; best-practice auth templates; registry-driven catalog
PRIMARY_USE_CASES: Auth flows (login, register, forgot password, OTP); app chrome (home dashboard, settings, profile, notifications, search); e-commerce (product grid, product details); onboarding (welcome, features, permissions); utility states (empty, error)
PRODUCT_WORKFLOW: Install CLI/extension → `expo-snips list` (or `snip:` in VS Code) → `expo-snips add <screenId>` → stack detection → files + deps + manifest → review & wire real logic → `expo-snips update`
SEO_KEYWORDS: react native screen generator, expo screen generator, expo snips, react native boilerplate screens, expo boilerplate, react native snippets, expo router screens, nativewind templates, shadcn react native, react native login screen template
FAQ_TOPICS: What it is; frameworks supported; free/open source; backend requirements; existing projects; TypeScript/JavaScript; VS Code usage; registry/updates; react-navigation; shadcn UI; custom registry; internet requirement
VISUAL_STYLE: Modern, minimal, card-based, mobile-first; white rounded cards (rounded-2xl) on light-gray background; blue accent CTAs; system fonts; terminal/editor + phone-mockup hero
BRAND_COLORS: Primary #2563EB (blue-600); background #FFFFFF / #F9FAFB; surface #FFFFFF; text #111827 / #6B7280 / #9CA3AF; borders #D1D5DB / #F3F4F6; success #16A34A; error #EF4444; warning #F59E0B
TYPOGRAPHY: System fonts (no custom); bold 2xl–3xl titles, text-sm/base body, text-xs meta; 16px card radius, 8–12px input/button radius
TRUST_SIGNALS: MIT open source; public npm packages (@expo-snips/cli, @expo-snips/core); VS Code extension (publisher expo-snips); GitHub Actions CI/CD; shared engine guarantees CLI/VS Code parity. No user counts, testimonials, or ratings exist.
PRODUCT_SCREENSHOTS: None in repo — generate the 19 recipes to produce live showcase screens (login, home dashboard, product grid, onboarding, settings, empty/error states)
MARKETING_GUARDRAILS: Avoid superlatives and fabricated metrics; do not claim react-navigation/tamagui/vector-icons/variants as shipped; no pricing (free/open source); generated auth logic is placeholder — say "ready to wire to your backend"
```

---

## 30. Evidence & Confidence Summary

| Claim | Evidence | Confidence |
| --- | --- | --- |
| Product is a CLI + VS Code + registry generator for Expo/RN screens | `packages/cli/package.json`, `packages/vscode-extension/package.json`, `packages/core/package.json`, `registry/index.json` | High |
| CLI command set: init, list, add, update, status | `packages/cli/src/index.ts:16-20`, `packages/cli/src/commands/*` | High |
| Project stack auto-detection | `packages/cli/src/utils/detectProject.ts`, `packages/vscode-extension/src/project.ts` | High |
| Conditional template rendering engine | `packages/core/src/generate.ts`, `packages/core/src/context.ts` | High |
| Handlebars-based, per-stack templates | `packages/registry/templates/**/*.hbs` | High |
| 19 versioned recipes in the catalog | `registry/index.json` (app ×5, auth ×4, ecommerce ×2, onboarding ×3, utility ×2, ui ×3) | High |
| Automated dependency installation (npm/pnpm/yarn/bun) | `packages/cli/src/utils/installDeps.ts:6` | High |
| shadcn-style primitive resolution | `packages/cli/src/utils/primitives.ts`, `packages/registry/templates/ui/*.hbs` | High |
| Manifest tracking + update with diff preview | `packages/cli/src/utils/manifest.ts`, `packages/cli/src/commands/update.ts`, `packages/cli/src/utils/diff.ts` | High |
| VS Code `snip:` completion + commands + status bar | `packages/vscode-extension/src/completionProvider.ts`, `commands.ts`, `extension.ts` | High |
| Generated screens include zod + react-hook-form validation and mock auth | `packages/registry/templates/auth/login/components.login-form.hbs`, `hooks.use-login.hbs` | High |
| Registry hosted/designed for GitHub Pages + npm publishing | `.github/workflows/deploy-registry.yml`, `.github/workflows/publish.yml` | High |
| MIT license / open source | `license: "MIT"` in all `packages/*/package.json` | High |
| No pricing/monetization in repo | Repo-wide search for pricing/billing/subscription/credits found nothing | High |
| No tests in repo | Repo-wide search found no test files or test scripts | High |
| Variants infrastructure exists but unused | `ScreenVariant` type + `variant` option vs all recipes `variants: []` | High (infra) / Low (usage) |
| react-navigation, tamagui, vector-icons listed but unsupported by recipes | `detectProject.ts`, settings enums vs recipe `supported` fields | High |
| Adoption/user metrics, testimonials, competitors | Not found in repository | Unknown / Not found |

---

## 31. Source References

- `package.json`, `pnpm-workspace.yaml`, `tsconfig.base.json` — monorepo root
- `packages/cli/package.json` — CLI metadata, bin `expo-snips`, tagline
- `packages/cli/src/index.ts` — command registration, program description
- `packages/cli/src/commands/add.ts` — generation command, flags, prompts, shadcn enforcement
- `packages/cli/src/commands/init.ts` — `create-expo-app` bootstrap
- `packages/cli/src/commands/list.ts` — catalog listing
- `packages/cli/src/commands/status.ts` — manifest inspection
- `packages/cli/src/commands/update.ts` — versioned updates with diff preview
- `packages/cli/src/utils/detectProject.ts` — stack detection
- `packages/cli/src/utils/registry.ts` — registry fetch + `EXPO_SNIPS_REGISTRY`
- `packages/cli/src/utils/resolveRegistry.ts` — registry resolution
- `packages/cli/src/utils/manifest.ts` — `.expo-snips.json` manifest
- `packages/cli/src/utils/primitives.ts` — recursive primitive resolution
- `packages/cli/src/utils/diff.ts` — diff implementation
- `packages/cli/src/utils/installDeps.ts` — package manager detection/install
- `packages/cli/src/utils/writeFiles.ts` — file writing
- `packages/core/package.json` — shared engine metadata
- `packages/core/src/types.ts` — `ScreenRecipe`, `FileTemplate`, `ScreenVariant`, `Conditions`, option types
- `packages/core/src/generate.ts` — `getFilesForRecipe`, Handlebars helpers
- `packages/core/src/context.ts` — `GenerationContext`, `RenderContext`
- `packages/registry/src/index.ts` — recipe loading/search/fetch
- `packages/registry/scripts/build-bundle.mjs` — bundle build
- `packages/registry/data/**/*.json` — recipe definitions (19)
- `packages/registry/templates/**/*.hbs` — generated-screen templates (visual identity + features)
- `packages/vscode-extension/package.json` — extension metadata, settings, commands
- `packages/vscode-extension/README.md` — extension documentation
- `packages/vscode-extension/src/extension.ts` — activation, status bar
- `packages/vscode-extension/src/commands.ts` — Add Screen command
- `packages/vscode-extension/src/completionProvider.ts` — `snip:`/`expo-snips:` completion
- `packages/vscode-extension/src/generator.ts` — editor generation flow
- `packages/vscode-extension/src/project.ts` — workspace detection + manifest
- `packages/vscode-extension/src/registry.ts` — registry fetch + cache
- `registry/index.json` — catalog index (19 recipes)
- `registry/recipes/**/*.json` — built per-recipe JSON
- `scripts/build-registry.mjs` — registry build script
- `.github/workflows/deploy-registry.yml` — GitHub Pages deploy
- `.github/workflows/publish.yml` — npm publish
- `.gitignore`

---

## 32. Quality Gate Checklist

**Product Understanding**
- [x] A non-technical person can understand the product ("generates React Native app screens with one command").
- [x] Target audience is clear (Expo/React Native developers).
- [x] Problem, solution, and value proposition are clear and evidenced.

**Landing Page Readiness**
- [x] An AI can generate a landing page from §13–§29.
- [x] Primary CTA ("Get Started") and conversion path (install → generate) are defined and honest.
- [x] P0/P1 features prioritized; infra-only features flagged.
- [x] Use cases, hero copy, feature sections, and visual identity documented.

**Accuracy**
- [x] Every claim is grounded in repository evidence or marked with confidence.
- [x] Unsupported claims flagged; no fake stats, testimonials, customers, or competitors.

**Technical Accuracy**
- [x] Technologies, routes/screens, integrations, and features map to real implementation (§25, §8, §31).

**Marketing Quality**
- [x] Communicates outcomes (screens in seconds, consistent UI) rather than only technology.
- [x] Positioning is specific ("stack-aware whole-screen generator"), free of generic AI fluff; comprehensible in 10 seconds.