# Túnel rápido (Cloudflare) — URL pública temporária para testes externos.
# Pré-requisito: app em http://localhost:3000 (npm run dev) e Postgres (npm run db:up).
#
# Uso: npm run tunnel

$ErrorActionPreference = "Stop"

function Find-Cloudflared {
  $cmd = Get-Command cloudflared -ErrorAction SilentlyContinue
  if ($cmd -and $cmd.Source) { return $cmd.Source }

  $candidates = @(
    "${env:ProgramFiles(x86)}\cloudflared\cloudflared.exe",
    "$env:ProgramFiles\cloudflared\cloudflared.exe",
    "$env:LOCALAPPDATA\Microsoft\WinGet\Links\cloudflared.exe",
    "$env:LOCALAPPDATA\Programs\cloudflared\cloudflared.exe"
  )
  foreach ($c in $candidates) {
    if ($c -and (Test-Path -LiteralPath $c)) { return $c }
  }

  $wingetPkgs = Join-Path $env:LOCALAPPDATA "Microsoft\WinGet\Packages"
  if (Test-Path $wingetPkgs) {
    $found = Get-ChildItem -Path $wingetPkgs -Filter "cloudflared.exe" -Recurse -ErrorAction SilentlyContinue |
      Select-Object -First 1 -ExpandProperty FullName
    if ($found) { return $found }
  }
  return $null
}

$bin = Find-Cloudflared
if (-not $bin) {
  Write-Host "cloudflared nao encontrado."
  Write-Host "Instale com: winget install --id Cloudflare.cloudflared -e"
  Write-Host "Depois feche e reabra o terminal (ou rode npm run tunnel de novo)."
  exit 1
}

Write-Host "Usando: $bin"
Write-Host "Abrindo tunel para http://localhost:3000 ..."
Write-Host "Deixe este terminal aberto. A URL publica aparece abaixo (trycloudflare.com)."
Write-Host ""

& $bin tunnel --url http://localhost:3000
