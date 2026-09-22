$ports = @(5173, 8000)
$processIds = @()

foreach ($port in $ports) {
    $matches = netstat -ano | Select-String ":$port\s"

    foreach ($match in $matches) {
        if ($match.Line -match "LISTENING\s+(\d+)$") {
            $processIds += [int]$Matches[1]
        }
    }
}

$processIds = $processIds | Sort-Object -Unique

if (-not $processIds) {
    Write-Host "No NEXORA dev servers are listening on ports 5173 or 8000."
    exit 0
}

foreach ($processId in $processIds) {
    try {
        Stop-Process -Id $processId -Force -ErrorAction Stop
        Write-Host "Stopped process $processId."
    } catch {
        Write-Host "Could not stop process ${processId}: $($_.Exception.Message)"
    }
}
