<div align="center">

# Expo Snips

### Generate complete React Native / Expo screens from a short abbreviation.

[![Version](https://img.shields.io/badge/version-0.1.3-blue)](https://github.com/expo-snips/expo-snips/releases)
[![License](https://img.shields.io/badge/license-proprietary-red)](./LICENSE)
[![VS Code](https://img.shields.io/badge/VS%20Code-%5E1.80.0-007acc?logo=visual-studio-code)](https://code.visualstudio.com/)
[![React Native](https://img.shields.io/badge/React%20Native-Expo-black?logo=react)](https://expo.dev/)
[![Registry](https://img.shields.io/badge/registry-built--in%20catalog-green)](#registry-driven-catalog)

[Installation](#installation) &bull; [Usage](#usage) &bull; [Settings](#settings) &bull; [Development](#development)

</div>

---

## What is Expo Snips?

Expo Snips is a VS Code extension that generates **complete, production-quality React Native / Expo screens** from a short abbreviation. Type `snip:auth/login` in any TypeScript or JavaScript file, and a fully styled, validated, keyboard-safe screen is written into your project — including form validation, loading states, safe-area handling, and dependency installation.

It uses the same `@expo-snips/core` engine and registry as the [`expo-snips` CLI](https://www.npmjs.com/package/@expo-snips/cli), so every screen you add from VS Code is identical to one added from the command line.

---

## The Problem

Building Expo / React Native apps means rewriting the same screens repeatedly:

- **Auth screens** — login, registration, forgot password, OTP — with form validation, error handling, loading states, secure inputs, and keyboard avoidance.
- **App chrome** — home dashboard, settings, profile, notifications, search — with correct safe areas, lists, and navigation wiring.
- **E-commerce views** — product grids, product details with quantity selectors.
- **Onboarding flows** and permission requests.
- **Empty / error / retry states**.

Each screen requires multiple files, careful styling, and integration with several libraries. Existing alternatives — copy-paste from previous projects, full-app templates, or component libraries — don't solve the "whole screen, right stack" problem cleanly.

**Expo Snips fills the gap between a snippet library and a boilerplate starter.**

---

## Key Features

### Inline Completion

Type `snip:` or `expo-snips:` in any `.ts`, `.tsx`, `.js`, or `.jsx` file and a completion list of available screens appears. Select one and the full screen is generated into your project.

### Command Palette

Run **Expo Snips: Add Screen...** from the command palette or click the sparkle icon in the status bar to browse and add screens.

### Project-Aware Stack Detection

The extension reads your `package.json` and `tsconfig.json` to automatically detect:

| Detection | What it checks |
|-----------|---------------|
| **Router** | `expo-router` or `@react-navigation/native` in dependencies |
| **Styling** | `nativewind` in dependencies (falls back to `stylesheet`) |
| **UI primitives** | `@shadcn/ui` or `react-native-reusables` |
| **Icons** | `lucide-react-native` in dependencies |
| **TypeScript** | Presence of `tsconfig.json` |

Detected values are used as defaults, with user-configurable settings as fallbacks.

### Registry-Driven Catalog

The full screen catalog is **bundled into the extension**, so it works offline and
immediately after install — no account, server, or network access required. The
catalog includes recipes that are versioned, stack-aware, and built on
battle-tested patterns:

- `react-hook-form` + `zod` validation
- `KeyboardAvoidingView` and `SafeAreaView` handling
- Loading spinners and error states
- shadcn-style UI primitives (Button, Input, cn utility)

Optionally, set `expo-snips.registryUrl` to fetch screens from a hosted registry
instead (for example `http://localhost:3000` while running `pnpm serve` from the
repository). When a remote registry is unreachable, the extension automatically
falls back to the built-in catalog.

### Automatic Dependency Installation

After generation, the extension detects your package manager (npm, pnpm, yarn, or bun) and installs the screen's dependencies in a VS Code terminal.

### Manifest Tracking

Every installed screen is recorded in `.expo-snips.json` with recipe ID, version, installed options, and file list — enabling future update and status workflows.

---

## Technology Stack

| Layer | Technology |
|-------|-----------|
| Language | TypeScript (strict mode, ES2020) |
| Bundler | esbuild (CJS, Node 18 target) |
| Extension API | VS Code ^1.80.0 |
| Template Engine | Handlebars via `@expo-snips/core` |
| File System | `fs-extra` |
| Package Manager | pnpm (workspace monorepo) |
| Packaging | `@vscode/vsce` |

---

## How It Works

```mermaid
flowchart LR
    A[Developer] -->|snip:login| B[VS Code Extension]
    A -->|Command Palette| B
    A -->|Status Bar| B
    B -->|bundled catalog| C[Built-in Screens]
    B -->|GET /index.json| C2[Remote Registry (optional)]
    B -->|read package.json| D[Project Detection]
    B -->|getFilesForRecipe| E["@expo-snips/core\n(Handlebars)"]
    E -->|Generated files| F[Write to Workspace]
    D -->|Stack options| E
    F -->|Install deps| G[Package Manager]
    F -->|Update manifest| H[".expo-snips.json"]
```

1. You trigger screen generation via `snip:`, command palette, or status bar.
2. The extension loads the screen catalog from its built-in bundle (or from a
   remote registry if `expo-snips.registryUrl` is set; cached 5 minutes).
3. You select a screen from the Quick Pick list.
4. The extension detects your project's stack from `package.json`.
5. `@expo-snips/core` renders Handlebars templates adapted to your stack.
6. Generated files are written to your project.
7. If using shadcn UI, primitives (Button, Input, cn) are recursively resolved.
8. The `.expo-snips.json` manifest is updated.
9. Dependencies are installed in a terminal (if enabled).

---

## Installation

### From VSIX

1. Download `expo-snips-0.1.3.vsix` from the [releases page](https://github.com/expo-snips/expo-snips/releases).
2. In VS Code, open the Command Palette (`Ctrl+Shift+P` / `Cmd+Shift+P`).
3. Run **Extensions: Install from VSIX...** and select the downloaded file.
4. Reload VS Code when prompted.

### From Source

```bash
git clone https://github.com/expo-snips/expo-snips.git
cd expo-snips
pnpm install
pnpm --filter expo-snips package
```

Then install the generated `.vsix` file as described above.

---

## Usage

### Quick Start

1. Open an Expo / React Native project as the workspace root.
2. In any `.tsx`, `.ts`, `.jsx`, or `.js` file, type `snip:`.
3. Pick a screen from the completion list (e.g. `auth/login`).
4. The screen's files are written into your project, dependencies are installed, and `.expo-snips.json` is updated.

### Via Command Palette

1. Press `Ctrl+Shift+P` / `Cmd+Shift+P`.
2. Type **Expo Snips: Add Screen...**.
3. Select a screen from the list.

### Via Status Bar

Click the sparkle icon (`$(sparkle) Expo Snips`) in the bottom-right status bar.

---

## Settings

| Setting | Type | Default | Description |
|---------|------|---------|-------------|
| `expo-snips.registryUrl` | `string` | *(empty)* | Optional remote registry URL. Leave empty to use the built-in catalog |
| `expo-snips.defaultStyling` | `enum` | `nativewind` | Styling fallback when not detected |
| `expo-snips.defaultRouter` | `enum` | `expo-router` | Router fallback when not detected |
| `expo-snips.defaultUi` | `enum` | `native` | UI primitives fallback when not detected |
| `expo-snips.defaultIcons` | `enum` | `lucide` | Icon library fallback when not detected |
| `expo-snips.installDependencies` | `boolean` | `true` | Install recipe dependencies after generation |

**Supported values:**

- `defaultStyling`: `nativewind`, `stylesheet`
- `defaultRouter`: `expo-router`, `react-navigation`
- `defaultUi`: `native`, `shadcn`
- `defaultIcons`: `lucide`

> Note: `tamagui`, `vector-icons`, and `custom` are listed as setting options but are not yet implemented in the current recipe catalog.

---

## Project Structure

```
vscode-extension/
├── src/
│   ├── extension.ts            # Entry point — activate/deactivate
│   ├── commands.ts             # Command palette handlers
│   ├── completionProvider.ts   # Inline snip: / expo-snips: completion
│   ├── generator.ts            # Core screen generation logic
│   ├── project.ts              # Project detection & manifest management
│   ├── registry.ts             # Offline catalog + optional remote registry client
│   └── generated/              # Build-time registry bundle (git-ignored)
├── scripts/
│   └── prepare-registry.mjs    # Inlines the registry into the extension at build time
├── out/
│   └── extension.js            # Bundled output (esbuild)
├── package.json                # Extension manifest & settings
├── tsconfig.json               # TypeScript configuration
├── esbuild.mjs                 # Bundler configuration
├── CHANGELOG.md                # Release history
├── LICENSE                     # Proprietary license
└── README.md
```

### Source Files

| File | Lines | Purpose |
|------|-------|---------|
| `extension.ts` | 17 | Registers commands, completion provider, and status bar item |
| `commands.ts` | 49 | Handles `addScreen` and `generateFromCompletion` commands |
| `completionProvider.ts` | 45 | Provides `snip:` / `expo-snips:` inline completions |
| `generator.ts` | 268 | Orchestrates detection, rendering, file writing, and dependency install |
| `project.ts` | 103 | Detects project stack and manages `.expo-snips.json` manifest |
| `registry.ts` | ~120 | Loads the bundled catalog and (optionally) a remote registry |

---

## Monorepo Context

Expo Snips is part of a pnpm monorepo with four packages:

| Package | Description |
|---------|-------------|
| `@expo-snips/core` | Shared Handlebars template engine and types ([npm](https://www.npmjs.com/package/@expo-snips/core)) |
| `@expo-snips/cli` | Terminal CLI for screen generation ([npm](https://www.npmjs.com/package/@expo-snips/cli)) |
| `packages/registry` | Screen recipe data, templates, and build scripts |
| `expo-snips` (this package) | VS Code extension |

---

## Development

### Prerequisites

- Node.js 18+
- pnpm 9+

### Setup

```bash
git clone https://github.com/expo-snips/expo-snips.git
cd expo-snips
pnpm install
```

### Build

```bash
pnpm --filter expo-snips build      # Bundle to out/extension.js
```

### Watch Mode

```bash
pnpm --filter expo-snips watch      # Rebuild on file changes
```

### Type Check

```bash
pnpm --filter expo-snips typecheck  # TypeScript type checking
```

### Package

```bash
pnpm --filter expo-snips package    # Produces expo-snips-<version>.vsix
```

### Debug

1. Open this folder in VS Code.
2. Press `F5` to launch the Extension Development Host.
3. The extension activates on `snip:` trigger or when a TypeScript/JavaScript file is opened.

---

## Roadmap

- [ ] `expo-snips update` — update installed screens to latest recipe versions
- [ ] `expo-snips status` — inspect installed screens and available updates
- [ ] Tamagui styling support
- [ ] Vector Icons support
- [ ] Custom UI primitive support
- [ ] Expanded screen catalog (more authentication, e-commerce, and utility screens)
- [ ] Testing infrastructure
- [ ] CI/CD pipeline for the VS Code extension

---

## Known Limitations

- **No tests** — testing infrastructure is not yet implemented.
- **No CI/CD for the extension** — the extension is packaged manually; only the registry and npm packages have automated workflows.
- **Limited icon/styling options** — `tamagui`, `vector-icons`, and `custom` are setting options but lack recipe support.
- **Offline by default** — the catalog ships with the extension; only set `expo-snips.registryUrl` if you want to load a custom/remote registry.
- **VS Code only** — the VS Code extension is separate from the CLI; both share the same core engine but are independently installed.

---

## License

This project is licensed under a **Proprietary License**. All rights reserved. See [LICENSE](./LICENSE) for full terms.

The `@expo-snips/core` package is licensed under [MIT](https://github.com/expo-snips/expo-snips/blob/main/packages/core/LICENSE).

---

## Credits

- Built with the [VS Code Extension API](https://code.visualstudio.com/api)
- Template engine powered by [Handlebars](https://handlebarsjs.com/)
- File operations via [fs-extra](https://github.com/jprichardson/node-fs-extra)
- Bundled with [esbuild](https://esbuild.github.io/)

---

<div align="center">

**[Expo Snips](https://github.com/expo-snips/expo-snips)** &bull; Beautiful, production-ready React Native screens — one abbreviation away.

</div>
