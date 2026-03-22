$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$folder = 'c:\Users\Media\Desktop\New folder\Media House'
$manifestPath = Join-Path $folder 'media-house-domains.json'
$entries = Get-Content -Raw $manifestPath | ConvertFrom-Json
$results = @()

foreach ($entry in $entries) {
  $targetPath = Join-Path $folder $entry.File
  $googleUrl = "https://www.google.com/s2/favicons?domain=$($entry.Domain)&sz=256"
  $duckUrl = "https://icons.duckduckgo.com/ip3/$($entry.Domain).ico"
  $status = 'failed'
  $source = ''
  $bytes = 0

  try {
    Invoke-WebRequest -Uri $googleUrl -OutFile $targetPath
    $bytes = (Get-Item $targetPath).Length
    if ($bytes -gt 0) {
      $status = 'downloaded'
      $source = 'google-s2'
    }
  } catch {
  }

  if ($status -ne 'downloaded') {
    try {
      Invoke-WebRequest -Uri $duckUrl -OutFile $targetPath
      $bytes = (Get-Item $targetPath).Length
      if ($bytes -gt 0) {
        $status = 'downloaded'
        $source = 'duckduckgo-ip3'
      }
    } catch {
    }
  }

  if ($status -ne 'downloaded' -and (Test-Path $targetPath)) {
    Remove-Item $targetPath -Force
  }

  $results += [PSCustomObject]@{
    Name = $entry.Name
    Domain = $entry.Domain
    File = $entry.File
    Status = $status
    Source = $source
    Bytes = $bytes
  }
}

$results | Export-Csv -Path (Join-Path $folder 'download-report.csv') -NoTypeInformation -Encoding UTF8
$downloaded = ($results | Where-Object Status -eq 'downloaded').Count
$failed = ($results | Where-Object Status -ne 'downloaded').Count
"downloaded=$downloaded failed=$failed"
