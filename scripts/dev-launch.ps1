# Forge-OS browser dev launcher
# Stops any existing Forge-OS dev server (Vite ports 5173-5180), then starts fresh.
# Only touches processes listening on Vite's port range — never kills other node apps.

$ErrorActionPreference = 'SilentlyContinue'

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "   Forge-OS  -  Browser Dev Launcher" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# --- 1. Clean up any existing dev server on Vite's port range ---
$ports = 5173..5180
$killedPorts = @()

foreach ($port in $ports) {
    $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
    foreach ($conn in $conns) {
        $procId = $conn.OwningProcess
        if (-not $procId) { continue }
        $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
        # Only stop node-based dev servers on these ports — leave everything else alone.
        if ($proc -and $proc.ProcessName -match 'node|electron') {
            try {
                Stop-Process -Id $procId -Force -ErrorAction Stop
                $killedPorts += $port
                Write-Host "  stopped $($proc.ProcessName) (PID $procId) on port $port" -ForegroundColor Yellow
            } catch {
                Write-Host "  could not stop PID $procId on port $port (it may have already exited)" -ForegroundColor DarkGray
            }
        }
    }
}

if ($killedPorts.Count -gt 0) {
    Write-Host "Existing dev server cleaned: port(s) $($killedPorts -join ', ')" -ForegroundColor Green
} else {
    Write-Host "No existing dev server found." -ForegroundColor DarkGray
}

Write-Host ""
Write-Host "Starting Vite dev server (browser will open automatically)..." -ForegroundColor Cyan
Write-Host "Press Ctrl+C to stop." -ForegroundColor DarkGray
Write-Host ""

# --- 2. Start fresh ---
# Give the OS a moment to release the port after kill.
Start-Sleep -Milliseconds 500

npm run dev:open
