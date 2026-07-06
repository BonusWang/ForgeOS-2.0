#Requires -Version 5.1
# Forge-OS dev service controller.
# Commands: status | stop | start | restart
# Designed to be called by AI (Codex/Claude) via shell_command.
# start launches a detached process that survives the AI session.

param(
    [Parameter(Position = 0)]
    [ValidateSet('status', 'stop', 'start', 'restart')]
    [string]$Command = 'status'
)

$ErrorActionPreference = 'Stop'
$ProjectRoot = Split-Path -Parent (Split-Path -Parent $MyInvocation.MyCommand.Path)
$Ports = 5173..5180
$PidFile = Join-Path $ProjectRoot 'vite-dev-current.pid'
$OutLog = Join-Path $ProjectRoot 'vite-dev.out.log'
$ErrLog = Join-Path $ProjectRoot 'vite-dev.err.log'

function Get-ForgedevProcesses {
    $found = @()
    foreach ($port in $Ports) {
        $conns = Get-NetTCPConnection -LocalPort $port -State Listen -ErrorAction SilentlyContinue
        foreach ($conn in $conns) {
            $procId = $conn.OwningProcess
            if (-not $procId) { continue }
            $proc = Get-Process -Id $procId -ErrorAction SilentlyContinue
            if ($proc -and $proc.ProcessName -match 'node|electron') {
                $found += [PSCustomObject]@{
                    Port      = $port
                    PID       = $procId
                    Process   = $proc.ProcessName
                }
            }
        }
    }
    return @($found | Sort-Object Port -Unique)
}

function Stop-ForgeDev {
    $procs = @(Get-ForgedevProcesses)
    $killed = @()
    foreach ($p in $procs) {
        try {
            Stop-Process -Id $p.PID -Force -ErrorAction Stop
            $killed += [PSCustomObject]@{ port = $p.Port; pid = $p.PID; process = $p.Process }
        } catch {
            # process may have already exited
        }
    }
    Start-Sleep -Milliseconds 500
    return $killed
}

function Start-ForgeDev {
    # Launch a detached PowerShell that runs npm run dev.
    # -WindowStyle Hidden: no visible window.
    # The spawned process tree parent is the system, not this AI session.
    $wrapperScript = @"
`$ErrorActionPreference = 'SilentlyContinue'
Set-Location '$ProjectRoot'
npm run dev *>> '$OutLog' 2>> '$ErrLog'
"@
    $encodedCommand = [Convert]::ToBase64String([Text.Encoding]::Unicode.GetBytes($wrapperScript))

    $proc = Start-Process -FilePath 'powershell.exe' `
        -ArgumentList "-NoProfile -ExecutionPolicy Bypass -EncodedCommand $encodedCommand" `
        -WindowStyle Hidden -PassThru

    # Save the wrapper PID for reference (the actual node process spawns underneath)
    Set-Content -Path $PidFile -Value $proc.Id -NoNewline

    # Wait for the dev server to come up (check ports for up to 30 seconds)
    $maxWait = 30
    for ($i = 0; $i -lt $maxWait; $i++) {
        Start-Sleep -Seconds 1
        $procs = @(Get-ForgedevProcesses)
        if ($procs.Count -gt 0) {
            return $procs
        }
    }
    return @()
}

function Get-ForgeDevStatus {
    $procs = @(Get-ForgedevProcesses)
    $pidFromFile = $null
    if (Test-Path $PidFile) {
        $pidFromFile = (Get-Content $PidFile -Raw).Trim()
    }
    return @{
        running    = $procs.Count -gt 0
        processes  = @($procs | ForEach-Object {
            @{ port = $_.Port; pid = $_.PID; process = $_.Process }
        })
        wrapperPid = $pidFromFile
    }
}

switch ($Command) {
    'status' {
        $result = Get-ForgeDevStatus
        $result | ConvertTo-Json -Depth 3
    }
    'stop' {
        $killed = Stop-ForgeDev
        @{ action = 'stop'; killed = @($killed) } | ConvertTo-Json -Depth 3
    }
    'start' {
        $procs = @(Start-ForgeDev)
        @{ action = 'start'; running = ($procs.Count -gt 0); processes = @($procs | ForEach-Object {
            @{ port = $_.Port; pid = $_.PID; process = $_.Process }
        }) } | ConvertTo-Json -Depth 3
    }
    'restart' {
        $killed = @(Stop-ForgeDev)
        $procs = @(Start-ForgeDev)
        @{ action = 'restart'; killed = @($killed); running = ($procs.Count -gt 0); processes = @($procs | ForEach-Object {
            @{ port = $_.Port; pid = $_.PID; process = $_.Process }
        }) } | ConvertTo-Json -Depth 3
    }
}
