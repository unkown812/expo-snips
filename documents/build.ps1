<#
  build.ps1 --- Build the Expo Snips documentation suite.

  Produces:
    latex/main.pdf                        (via pdfLaTeX)
    output/Expo-Snips-Documentation.docx  (via Pandoc)

  The PDF is built from the sources in latex/ unchanged.

  Pandoc's LaTeX reader cannot parse this project's custom column type
  (\newcolumntype L) or the @{} column specifier, and it would drop every
  table as a result. To keep the PDF layout intact while still producing a
  table-preserving Word document, the script copies the sources into a
  temporary directory and rewrites only the table column specifications for
  that copy:
      @{}  ->  (removed)
      L{}  ->  p{}      (case-sensitive)
      the duplicate first header (\endfirsthead ... \endhead) is collapsed
  The original .tex files are never modified.

  Usage:  pwsh -File build.ps1
#>

$ErrorActionPreference = "Continue"

# Note: native tools (pdflatex, mmdc, pandoc) may print benign notices to
# stderr, which PowerShell would otherwise treat as terminating errors when
# ErrorActionPreference is "Stop". This script therefore checks exit codes and
# output files explicitly instead.

# --- Resolve directories -------------------------------------------------
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$latexDir = Join-Path $here "latex"
$outputDir = Join-Path $here "output"
New-Item -ItemType Directory -Force -Path $outputDir | Out-Null

# Make sure winget-installed tools (Pandoc) are visible in this session.
$env:Path = [System.Environment]::GetEnvironmentVariable("Path", "Machine") + ";" +
            [System.Environment]::GetEnvironmentVariable("Path", "User")

function Get-ToolPath([string]$name) {
  $cmd = Get-Command $name -ErrorAction SilentlyContinue
  if ($cmd) { return $cmd.Source }
  return $null
}

# --- 1. Diagrams (Mermaid -> PNG), only if missing ------------------------
$diagramsDir = Join-Path $latexDir "diagrams"
$mmdc = Get-ToolPath "mmdc"
if ($mmdc) {
  Get-ChildItem $diagramsDir -Filter *.mmd | ForEach-Object {
    $png = [System.IO.Path]::ChangeExtension($_.FullName, ".png")
    if (-not (Test-Path $png)) {
      Write-Host "Rendering $($_.Name) ..."
      & $mmdc -i $_.FullName -o $png -b white -s 2 | Out-Null
    }
  }
} else {
  Write-Host "mmdc not found; using existing PNG diagrams."
}

# --- 2. PDF via pdfLaTeX (twice, for TOC and cross-references) ------------
Push-Location $latexDir
try {
  Write-Host "Running pdfLaTeX (pass 1 of 2) ..."
  & pdflatex -interaction=nonstopmode -file-line-error main.tex *> pdflatex-pass1.log
  Write-Host "Running pdfLaTeX (pass 2 of 2) ..."
  & pdflatex -interaction=nonstopmode -file-line-error main.tex *> pdflatex-pass2.log

  if (-not (Test-Path (Join-Path $latexDir "main.pdf"))) {
    throw "PDF build failed; see latex/pdflatex-pass2.log"
  }
  Copy-Item "main.pdf" (Join-Path $outputDir "Expo-Snips-Documentation.pdf") -Force
  Write-Host "PDF written to output/Expo-Snips-Documentation.pdf"
} finally {
  Pop-Location
}

# --- 3. DOCX via Pandoc (preprocessed copy) ------------------------------
$pandoc = Get-ToolPath "pandoc"
if (-not $pandoc) {
  Write-Warning "Pandoc not found; skipping DOCX generation."
  return
}

$pdir = Join-Path $here ".pandoc-build"
if (Test-Path $pdir) { Remove-Item -Recurse -Force $pdir }
New-Item -ItemType Directory -Force -Path $pdir | Out-Null

Copy-Item (Join-Path $latexDir "main.tex") $pdir
Copy-Item (Join-Path $latexDir "preamble.tex") $pdir
Copy-Item (Join-Path $latexDir "metadata.tex") $pdir
Copy-Item (Join-Path $latexDir "sections") $pdir -Recurse
Copy-Item $diagramsDir (Join-Path $pdir "diagrams") -Recurse
if (Test-Path (Join-Path $latexDir "assets")) {
  Copy-Item (Join-Path $latexDir "assets") (Join-Path $pdir "assets") -Recurse
}

Get-ChildItem $pdir -Filter *.tex -Recurse | ForEach-Object {
  $c = Get-Content $_.FullName -Raw
  $c = $c -creplace '@\{\}', ''                                   # drop @{} column spec
  $c = $c -creplace 'L\{', 'p{'                                   # L{w} -> p{w} (case-sensitive)
  $c = [regex]::Replace($c, '\\endfirsthead[\s\S]*?\\endhead', '') # collapse duplicate header
  Set-Content -Path $_.FullName -Value $c -NoNewline
}

Write-Host "Running Pandoc ..."
# Pandoc resolves \input paths relative to the current directory, so it must
# run from inside the build directory.
Push-Location $pdir
try {
  & pandoc "main.tex" `
      -o (Join-Path $outputDir "Expo-Snips-Documentation.docx") `
      --toc --toc-depth=1 `
      --resource-path=. 2> (Join-Path $pdir "pandoc.log")
  $pandocCode = $LASTEXITCODE
} finally {
  Pop-Location
}
if ($pandocCode -ne 0) { throw "Pandoc conversion failed (exit $pandocCode); see .pandoc-build/pandoc.log" }
if (-not (Test-Path (Join-Path $outputDir "Expo-Snips-Documentation.docx"))) {
  throw "DOCX was not produced."
}
Write-Host "DOCX written to output/Expo-Snips-Documentation.docx"

# --- 4. Summary ----------------------------------------------------------
Write-Host ""
Write-Host "Build complete:"
Get-ChildItem $outputDir | ForEach-Object { "  {0,-40} {1,10:N0} bytes" -f $_.Name, $_.Length }

if ((Test-Path (Join-Path $outputDir "Expo-Snips-Documentation.pdf")) -and
    (Test-Path (Join-Path $outputDir "Expo-Snips-Documentation.docx"))) {
  exit 0
} else {
  exit 1
}
