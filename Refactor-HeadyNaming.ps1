<#
.SYNOPSIS
  Global Heady{Value} naming refactor.

.DESCRIPTION
  - Uses a mapping table of "old -> new" names.
  - Renames directories and files (kebab-case).
  - Updates text in source/config/docs for:
      - kebab-case (folders, services)
      - PascalCase (canonical names)
      - camelCase (variables)
  - Skips .git and common build/output directories.

.RUN
  1. Adjust $NameMappings and $textExtensions as needed.
  2. Run from repo root:
       .\Refactor-HeadyNaming.ps1
#>

param(
    [switch]$AutoConfirm
)

$ErrorActionPreference = "Stop"

Write-Host "Global Heady{Value} naming refactor."
Write-Host "Run on a clean branch and review all diffs."
$confirm = if ($AutoConfirm) { "yes" } else { Read-Host "Continue? (yes/no)" }
if ($confirm -ne "yes") {
    Write-Host "Aborted."
    exit 1
}

$root = Get-Location

# -------------------------------
# 1. Name mappings (edit here)
# -------------------------------
# Each entry describes one logical node naming family.
# kebabOld  -> old folder/service name
# kebabNew  -> new folder/service name
# pascalOld -> old canonical name
# pascalNew -> new canonical name
# camelOld  -> old variable/function name
# camelNew  -> new variable/function name
#
# Add more entries for other Heady{Value} nodes as needed.
$NameMappings = @(
    [PSCustomObject]@{
        kebabOld  = "heady-vinci"
        kebabNew  = "heady-vinci"
        pascalOld = "HeadyVinci"
        pascalNew = "HeadyVinci"
        camelOld  = "HeadyVinci"
        camelNew  = "headyVinci"
    }
    # Example additional entries:
    # [PSCustomObject]@{
    #     kebabOld  = "heady-crawler-old"
    #     kebabNew  = "heady-crawler"
    #     pascalOld = "HeadyCrawlerOld"
    #     pascalNew = "HeadyCrawler"
    #     camelOld  = "headyCrawlerOld"
    #     camelNew  = "headyCrawler"
    # }
)

# --------------------------------
# 2. Extensions & ignored folders
# --------------------------------
$textExtensions = @(
    ".js", ".jsx", ".ts", ".tsx",
    ".json", ".yml", ".yaml",
    ".md", ".txt",
    ".env", ".env.example",
    ".sh", ".ps1", ".psm1",
    ".Dockerfile"
)

$ignoreDirs = @(
    ".git", "node_modules", "dist", "build", "out", ".next", "coverage"
)

function Test-SkipPath {
    param([string]$Path)
    foreach ($id in $ignoreDirs) {
        if ($Path -like "*\$id\*") {
            return $true
        }
    }
    return $false
}

# --------------------------------
# 3. Rename directories (kebab)
# --------------------------------
Write-Host ""
Write-Host "Renaming directories (kebab-case) based on mappings ..."

foreach ($mapping in $NameMappings) {
    $kebabOld = $mapping.kebabOld
    $kebabNew = $mapping.kebabNew

    if ([string]::IsNullOrWhiteSpace($kebabOld) -or [string]::IsNullOrWhiteSpace($kebabNew)) {
        continue
    }

    $dirs = Get-ChildItem -Path $root -Recurse -Directory -Force |
        Where-Object {
            $_.Name -like "*$kebabOld*" -and -not (Test-SkipPath $_.FullName)
        } |
        Sort-Object FullName -Descending   # deepest first

    foreach ($dir in $dirs) {
        $newName = $dir.Name -replace [Regex]::Escape($kebabOld), $kebabNew
        $newPath = Join-Path -Path $dir.Parent.FullName -ChildPath $newName
        Write-Host "  DIR: '$($dir.FullName)' -> '$newPath'"
        Rename-Item -Path $dir.FullName -NewName $newName
    }
}

# --------------------------------
# 4. Rename files (kebab)
# --------------------------------
Write-Host ""
Write-Host "Renaming files (kebab-case) based on mappings ..."

foreach ($mapping in $NameMappings) {
    $kebabOld = $mapping.kebabOld
    $kebabNew = $mapping.kebabNew

    if ([string]::IsNullOrWhiteSpace($kebabOld) -or [string]::IsNullOrWhiteSpace($kebabNew)) {
        continue
    }

    $filesToRename = Get-ChildItem -Path $root -Recurse -File -Force |
        Where-Object {
            $_.Name -like "*$kebabOld*" -and -not (Test-SkipPath $_.FullName)
        } |
        Sort-Object FullName -Descending

    foreach ($file in $filesToRename) {
        $newName = $file.Name -replace [Regex]::Escape($kebabOld), $kebabNew
        $newPath = Join-Path -Path $file.DirectoryName -ChildPath $newName
        Write-Host "  FILE: '$($file.FullName)' -> '$newPath'"
        Rename-Item -Path $file.FullName -NewName $newName
    }
}

# --------------------------------
# 5. Text replacement (kebab + Pascal + camel)
# --------------------------------
Write-Host ""
Write-Host "Updating text content in mapped files ..."

$allTextFiles = Get-ChildItem -Path $root -Recurse -File -Force |
    Where-Object {
        -not (Test-SkipPath $_.FullName) -and
        $textExtensions -contains $_.Extension
    }

foreach ($file in $allTextFiles) {
    $content = Get-Content -Path $file.FullName -Raw
    $originalContent = $content

    foreach ($mapping in $NameMappings) {
        # Kebab-case (paths, services)
        if ($mapping.kebabOld -and $mapping.kebabNew) {
            $content = $content -replace [Regex]::Escape($mapping.kebabOld), $mapping.kebabNew
        }

        # PascalCase (canonical node names)
        if ($mapping.pascalOld -and $mapping.pascalNew) {
            $content = $content -replace [Regex]::Escape($mapping.pascalOld), $mapping.pascalNew
        }

        # camelCase (variables/functions)
        if ($mapping.camelOld -and $mapping.camelNew) {
            $content = $content -replace [Regex]::Escape($mapping.camelOld), $mapping.camelNew
        }
    }

    if ($content -ne $originalContent) {
        Write-Host "  TEXT updated: $($file.FullName)"
        Set-Content -Path $file.FullName -Value $content -NoNewline
    }
}

Write-Host ""
Write-Host "Global Heady{Value} naming refactor complete."
Write-Host "Next steps:"
Write-Host "  1. Inspect 'git status' and 'git diff' carefully."
Write-Host "  2. Run tests and any docker compose/k8s deploy."
Write-Host "  3. Manually fix any special-case names if needed."
