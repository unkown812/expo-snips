# Security Policy

Thank you for helping keep Expo Snips and its users safe.

## Supported versions

Expo Snips is early-stage (packages at `0.1.0`; the VS Code extension at `0.1.3`). There are **no tagged releases yet**, so security fixes are applied to the **latest code on the default branch** (`master`) and shipped in the next published version.

> Maintainer: confirm and update a supported-versions matrix here once tagged releases exist.

## Reporting a vulnerability

Please **do not open a public issue** for security problems.

Preferred channel: **GitHub private vulnerability reporting** — go to the repository's **Security** tab and use **Report a vulnerability** (GitHub Security Advisories). This keeps the report private while it is investigated.

> Maintainer: if private vulnerability reporting is not enabled, enable it in **Settings → Code security**, or document an alternative private contact method here. **No security contact email is defined in this repository**, so none is listed — please add one only if you intend to monitor it.

If you cannot use the private channel, open a minimal public issue asking for a private contact method, and **do not include vulnerability details**.

## What to include in a report

- A clear description of the vulnerability and its impact.
- Reproduction steps or a proof of concept.
- Affected surface (CLI `@expo-snips/cli`, extension `expo-snippets`, `@expo-snips/core`, or the registry data under `packages/registry/`).
- The affected version/commit and your environment (OS, Node.js, package manager).
- Any suggested remediation.

## Scope and expectations

- **No response-time SLA is committed** by this project. Please be patient — it is maintained on a best-effort basis.
- Fixes and disclosure timelines will be coordinated with the reporter where possible.

### In scope

- The CLI, the shared engine (`@expo-snips/core`), and the VS Code extension source.
- The recipe catalog and its validated schema (`pnpm validate`).
- The local registry server (`scripts/serve.mjs`) and the registry HTTP endpoints.
- Supply-chain concerns in the build/release workflows (`.github/workflows/`).

### Notable, already-known considerations

These are documented limitations rather than undisclosed vulnerabilities (see also `README.md` → Known Limitations and Security):

- **Generated code is a placeholder, not a security boundary.** Auth templates ship mock logic (`setTimeout` + `Alert`) that must be replaced with real authentication.
- **The generated mock login hook logs credentials to the console** (`console.log('Login attempt', { email, password })` in `packages/registry/templates/auth/login/hooks.use-login.hbs`). This is a known authoring flaw in a template and is intended to be replaced by the user.
- **A remote registry is untrusted input.** Configuration is available via `EXPO_SNIPS_REGISTRY`, `--registry`, or the `expo-snips.registryUrl` setting. Only point the tool at registries you trust.

## Handling of secrets

This repository contains **no secrets** and requires **no credentials** to build or run locally. The only secret used anywhere is `NPM_TOKEN`, supplied at release time through GitHub Actions secrets — never commit it or reference it in source.

If you believe a secret was committed, report it privately (above) rather than opening a public issue. The maintainer should rotate/revoke the exposed credential; note that removing a file does not erase it from Git history.
