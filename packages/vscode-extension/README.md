# Expo Snips for VS Code

Generate complete React Native / Expo screens from a short abbreviation. This
extension uses the same `@expo-snips/core` engine and registry as the
[`expo-snips` CLI](https://www.npmjs.com/package/@expo-snips/cli), so every screen
you add here is identical to one added from the command line.

## Features

- **Abbreviation expansion** — type `snip:` or `expo-snips:` in any TypeScript or
  JavaScript file and a completion list of available screens appears. Selecting
  one generates the full screen into your project.
- **Command palette** — run **Expo Snips: Add Screen...** to browse and add a screen.
- **Project aware** — auto-detects your router, styling, UI primitives, icon
  library, and TypeScript/JavaScript from the open workspace (with overrides in
  settings).
- **Registry driven** — the list of screens is fetched from the registry at
  `https://registry.expo-snips.dev` (configurable).

## Usage

1. Open an Expo / React Native project as the workspace root.
2. In a `.tsx` / `.ts` / `.jsx` / `.js` file, type `snip:`.
3. Pick a screen from the completion list (e.g. `auth/login`).
4. The screen's files are written into the project, the dependency list is
   installed in a terminal (optional), and the manifest `.expo-snips.json` is
   updated so `expo-snips update` keeps working.

You can also run **Expo Snips: Add Screen...** from the command palette, or use
the status bar item.

## Settings

| Setting                              | Default                           | Description                            |
| ------------------------------------ | --------------------------------- | -------------------------------------- |
| `expo-snips.registryUrl`             | `https://registry.expo-snips.dev` | URL of the screen registry             |
| `expo-snips.defaultStyling`          | `nativewind`                      | Styling fallback when not detected     |
| `expo-snips.defaultRouter`           | `expo-router`                     | Router fallback when not detected      |
| `expo-snips.defaultUi`               | `native`                          | UI primitives fallback when not detected |
| `expo-snips.defaultIcons`            | `lucide`                          | Icon library fallback when not detected |
| `expo-snips.installDependencies`     | `true`                            | Install recipe dependencies after generation |

## Development

```sh
pnpm install
pnpm --filter expo-snips build   # bundle to out/extension.js
```

Press `F5` in VS Code (with this folder open) to launch the Extension
Development Host.

## Packaging

```sh
pnpm --filter expo-snips package   # produces expo-snips-<version>.vsix
```

## License

MIT
