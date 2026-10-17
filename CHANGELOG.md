# Changelog

All notable changes to the Expo Snips monorepo are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
Versioning is intended to follow [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

> **Status:** the workspace packages are at `0.1.0` and the VS Code extension at `0.1.3`, but **no Git tags or published releases exist yet**. The `v*` publish workflow has not been run, so this file tracks the default branch rather than tagged releases.
>
> Per-package release notes for the VS Code extension live in [`packages/vscode-extension/CHANGELOG.md`](./packages/vscode-extension/CHANGELOG.md).

## [Unreleased]

### Added

- Root project documentation and repository metadata: [`AGENTS.md`](./AGENTS.md), [`CONTRIBUTING.md`](./CONTRIBUTING.md), [`SECURITY.md`](./SECURITY.md), this changelog, [`.editorconfig`](./.editorconfig), [`.gitattributes`](./.gitattributes), [`.nvmrc`](./.nvmrc), and GitHub issue/PR templates and a CI workflow.
- Root [`README.md`](./README.md) rewritten as a project-focused landing page.

### Notes

- No application, CLI, extension, or catalog behavior was changed by the additions above.
- No tests were added (the repository still has no test suite — see `README.md` → Testing).

---

## Release history

There are **no tagged releases** in this repository. The first entry here should be added when a `v*` tag is cut; at that point, use `git tag` and the merged pull requests to describe the changes accurately rather than backfilling history.
