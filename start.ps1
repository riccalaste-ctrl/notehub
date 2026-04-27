$nodeCommand = Get-Command node -ErrorAction SilentlyContinue
$nodePath = $null

if ($nodeCommand) {
  $nodePath = $nodeCommand.Source
}

if (-not $nodePath) {
  $candidate = Get-ChildItem -Path "$env:ProgramFiles\WindowsApps" -Directory -Filter "OpenAI.Codex_*" -ErrorAction SilentlyContinue |
    Sort-Object Name -Descending |
    ForEach-Object { Join-Path $_.FullName "app\resources\node.exe" } |
    Where-Object { Test-Path $_ } |
    Select-Object -First 1

  if ($candidate) {
    $nodePath = $candidate
  }
}

if (-not $nodePath) {
  throw "Node non trovato. Installa Node.js oppure avvia il progetto da Codex Desktop."
}

& $nodePath "$PSScriptRoot\server.js"
