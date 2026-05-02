#!/usr/bin/env pwsh
<#
.SYNOPSIS
Start NoteHub development server
#>

$nodeCommand = Get-Command node -ErrorAction SilentlyContinue

if (-not $nodeCommand) {
  Write-Error "Node.js non trovato. Installa Node.js da https://nodejs.org/"
  exit 1
}

Write-Host "🚀 Avvio NoteHub in modalità sviluppo..." -ForegroundColor Green
Write-Host "📂 Directory: $(Get-Location)" -ForegroundColor Cyan

# Install dependencies if needed
if (-not (Test-Path "node_modules")) {
  Write-Host "📦 Installazione dipendenze..." -ForegroundColor Yellow
  npm install
}

# Start Next.js dev server
Write-Host "⏳ Avvio server Next.js..." -ForegroundColor Yellow
npm run dev

