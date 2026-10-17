# Expo Snips — Documentation Suite

Complete software, product and architecture documentation for the
[Expo Snips](https://github.com/unkown812/expo-snips) monorepo, produced by
reverse-engineering the repository at `C:\Dev\expo-snips`.

Everything in this folder is **generated from repository analysis**. No
application source code was modified. Where a capability is absent, it is marked
**NOT APPLICABLE** rather than omitted silently.

---

## What is in this folder

```
documents/
├── README.md                         ← this file
├── build.ps1                         ← one-command build (PDF + DOCX)
├── ProjectDescription.md             ← pre-existing product description (untouched)
├── latex/
│   ├── main.tex                      ← master document (report class)
│   ├── preamble.tex                  ← shared LaTeX setup
│   ├── metadata.tex                  ← title/version metadata
│   ├── sections/                     ← 45 chapter/appendix files
│   └── diagrams/                     ← 10 Mermaid sources (.mmd) + rendered PNGs
└── output/
    ├── Expo-Snips-Documentation.pdf  ← compiled PDF (≈2.4 MB, 203 pages)
    └── Expo-Snips-Documentation.docx ← Word version (≈1.4 MB, 170 tables)
```

---

## How to build

Requirements: `pdflatex` (MiKTeX or TeX Live), `pandoc` (for DOCX), and
optionally `mmdc` (Mermaid CLI, only needed to re-render diagrams).

```powershell
pwsh -File build.ps1
```

The script will:

1. Render any missing Mermaid diagrams to PNG (`mmdc`, if available).
2. Run `pdflatex` twice (TOC and cross-references) and copy the PDF to
   `output/`.
3. Produce the Word document with Pandoc and copy it to `output/`.

### Building manually

```powershell
# PDF (run twice)
cd latex
pdflatex main
pdflatex main

# DOCX — see the note below about the column-spec rewrite
cd ..\.pandoc-build
pandoc main.tex -o ..\output\Expo-Snips-Documentation.docx --toc --toc-depth=1 --resource-path=.
```

> **Why `build.ps1` uses `.pandoc-build`.** Pandoc's LaTeX reader cannot parse
> this project's custom column type (`\newcolumntype L`) or the `@{}` column
> specifier; without a rewrite it drops every table. `build.ps1` therefore copies
> the sources into `.pandoc-build/` and, for that copy only, rewrites `@{}` →
> (removed), `L{}` → `p{}`, and collapses the duplicated `longtable` header
> block. The original `.tex` files are never modified. Pandoc also resolves
> `\input` relative to the **current directory**, so it must be run from inside
> the build directory.

---

## Document inventory

The suite is a single LaTeX `report` with one chapter per document type. Part
headings are intentionally omitted so the Word outline is a flat list of
chapters.

### Front matter
- Document control and analysis scope

### Product and business
- Project overview · Executive summary · Project description
- Business requirements (BRD) · Product requirements (PRD)

### Requirements
- Functional requirements · Non-functional requirements · Technical requirements

### Architecture and design
- System architecture · Software architecture
- High-level design · Low-level design · Frontend architecture

### Interfaces and behaviour
- CLI reference · Registry and recipes · API documentation
- Authentication · Authorization · User flows · Data flows

### Experience and design system
- UI/UX · Design system

### Quality, security and operations
- Security · Performance · Scalability · Testing
- Deployment · CI/CD · Integrations · Configuration

### Discoverability
- SEO · AEO · GEO

### Maintenance and evolution
- Known issues · Technical debt · Roadmap
- Development guidelines · Contribution guide

### Reference and appendices
- Glossary · References
- Appendix A: Catalog reference
- Appendix B: Environment and toolchain
- Appendix C: Classification and coverage
- Appendix D: File index

---

## Evidence conventions

Every substantive claim is labelled with one of:

| Label | Meaning |
|-------|---------|
| **IMPLEMENTED** | Present in the repository, with a file/artefact pointer. |
| **INFERRED** | A reasoned conclusion, not stated explicitly. |
| **RECOMMENDED** | A proposed improvement, *not* present. Never presented as existing. |
| **UNKNOWN** | Not determinable from the repository. |
| **NOT APPLICABLE** | The concept does not exist in this product. |

Security findings use **Finding / Severity / Evidence / Impact /
Recommendation**. Maintenance items use identifiers (`SEC-nn`, `KI-nn`, `TD-nn`,
`PERF-nn`, `SCALE-nn`, `SEO-nn`, `AEO-nn`, `GEO-nn`, `RM-nn`, `RN-nn`).

---

## Deliberately omitted documents

The following document types were requested but are **NOT APPLICABLE** to this
repository. They were not written, because doing so would mean padding a chapter
with no evidence. The reasons are recorded in Appendix C:

- **Backend architecture** — there is no server application. The only server is a
  local static-JSON fixture (`scripts/serve.mjs`).
- **Database design** — there is no database or persistence layer. The only
  persisted state is a JSON manifest (`.expo-snips.json`) written into the user's
  project.

Other not-applicable areas (recorded within relevant chapters): user accounts,
role-based access control, web/browser UI, a public website, telemetry,
payments, containerisation/IaC and real-time streaming.

---

## Key verified facts

- **4 packages** in a pnpm workspace: `core` and `cli` (MIT, v0.1.0),
  `registry` (private, v0.1.0, no licence field), and the VS Code extension
  `expo-snippets` (v0.1.3, publisher `ukown812`, "Private License").
- **24 screen recipes** and **48 Handlebars templates**.
- **3 recipes define a `glass` variant** (`app/home`, `auth/login`,
  `onboarding/welcome`); the other 21 have none.
- Registry endpoints: `GET {base}/index.json` and
  `GET {base}/recipes/{encodedId}.json`.
- CLI: five commands (`init`, `list`, `add`, `update`, `status`).
- **No tests exist** and there is **no CI on pull requests**; the extension is
  packaged manually.

Full figures with sources are listed in the References chapter.

---

## Known gaps in this documentation

- No wall-clock performance measurements were taken; the Performance chapter is
  based on static analysis, complexity and measured artefact sizes.
- The liveness and ownership of the hard-coded default registry host
  (`registry.expo-snips.dev`) cannot be verified from the repository and is
  marked **UNKNOWN**.
- Line counts marked *approx.* in Appendix D are estimates provided for scale,
  not exact facts.
- The DOCX is a best-effort conversion: Pandoc reproduces chapters, sections,
  tables and images, but complex LaTeX float placement is not preserved exactly.
