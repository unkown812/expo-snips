# Changelog

All notable changes to the Expo Snips VS Code extension are documented in this
file. The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.1.3] - 2026-10-17

### Fixed

- **Screen catalog is now bundled into the extension** and works fully offline,
  immediately after install. Previously the extension could only load screens
  from a remote registry URL that was not reachable, which produced
  "no screens found in the registry".
- `expo-snips.registryUrl` now defaults to empty (built-in catalog). Set it only
  to load screens from a self-hosted or remote registry.
- Variant templates (for example the `glass` variant) are now resolved to their
  actual file contents instead of a raw template file path.
- Added a request timeout so an unreachable registry no longer hangs the
  extension.

## [0.1.0] - 2026-08-30

### Added

- Generate complete React Native / Expo screens from a short abbreviation.
- `snip:` / `expo-snips:` code-completion trigger in TypeScript and JavaScript
  files.
- **Expo Snips: Add Screen...** command palette entry and status bar action.
- Project-aware stack detection (router, styling, UI primitives, icons,
  TypeScript/JavaScript) with configurable fallbacks.
- Registry-driven screen catalog with configurable `expo-snips.registryUrl`.
- Automatic recipe dependency installation (configurable).

[0.1.0]: https://github.com/expo-snips/expo-snips/releases/tag/v0.1.0
