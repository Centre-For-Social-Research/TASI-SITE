$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'

$folder = 'c:\Users\Media\Desktop\New folder\Media House'
$manifestPath = Join-Path $folder 'media-house-domains.json'
$reportPath = Join-Path $folder 'download-report.csv'

$entries = Get-Content -Raw $manifestPath | ConvertFrom-Json
$previous = @{}
if (Test-Path $reportPath) {
  Import-Csv $reportPath | ForEach-Object { $previous[$_.Name] = $_ }
}

$fixes = @(
  @{ Name='Amrit India'; Domain='amritindia.com'; File='amrit-india.png'; Url='https://www.google.com/s2/favicons?domain=amritindia.com&sz=256'; Source='google-s2-second-pass' },
  @{ Name='UNI'; Domain='www.uniindia.com'; File='uni.jpg'; Url='https://www.uniindia.com/images/uni.jpg'; Source='direct-site-logo' },
  @{ Name='Startup News'; Domain='startupnews.in'; File='startup-news.png'; Url='https://www.google.com/s2/favicons?domain=startupnews.in&sz=256'; Source='google-s2-second-pass' },
  @{ Name='India Economic Observer'; Domain='www.indianeconomicobserver.com'; File='india-economic-observer.png'; Url='https://aniportalimages.s3.amazonaws.com/media/details/IEO.png'; Source='direct-site-logo' },
  @{ Name='Big News Network'; Domain='www.bignewsnetwork.com'; File='big-news-network.png'; Url='https://assets.kreatio.net/bnn2/images/big-news-network.png'; Source='direct-site-logo' },
  @{ Name='Indian Community'; Domain='indian.community'; File='indian-community.png'; Url='https://indian.community/wp-content/uploads/2024/11/Indian-Community-Logo-Original-2-e1686759322762-1.png'; Source='direct-site-logo' },
  @{ Name='Naveen Times'; Domain='www.naveentimes.com'; File='naveen-times.png'; Url='https://www.naveentimes.com/src/img/basic/logo.png'; Source='direct-site-logo' },
  @{ Name='DD India'; Domain='ddindia.co.in'; File='dd-india.png'; Url='https://ddindia.co.in/wp-content/uploads/2023/09/DD-india-New-logo.png'; Source='direct-site-logo' },
  @{ Name='The Mojo Story'; Domain='www.youtube.com/@mojostory'; File='the-mojo-story.jpg'; Url='https://yt3.googleusercontent.com/c-KbOFQP2dNkeGdzBWps0omjmKT2otZIjnbYUAp0pD7maaTopzlcrYgHZmfnjqSotof230fVYw=s900-c-k-c0x00ffffff-no-rj'; Source='youtube-channel-avatar' },
  @{ Name='CVR English Official'; Domain='www.youtube.com/c/CVREnglishOfficial'; File='cvr-english-official.jpg'; Url='https://yt3.googleusercontent.com/t5V0y3DnbZGMLISvRDilq8SLIHHOnVZz72KSGtz5NDiwZ7mVk3l4oKu_RwMMi-j7xvQRlU8H9w=s900-c-k-c0x00ffffff-no-rj'; Source='youtube-channel-avatar' }
)

$fixMap = @{}
foreach ($fix in $fixes) { $fixMap[$fix.Name] = $fix }

foreach ($entry in $entries) {
  if ($fixMap.ContainsKey($entry.Name)) {
    $entry.Domain = $fixMap[$entry.Name].Domain
    $entry.File = $fixMap[$entry.Name].File
  }
}

foreach ($fix in $fixes) {
  $targetPath = Join-Path $folder $fix.File
  Invoke-WebRequest -Uri $fix.Url -OutFile $targetPath -Headers @{ 'User-Agent' = 'Mozilla/5.0' } -TimeoutSec 30
}

$entries | ConvertTo-Json -Depth 2 | Set-Content -Path $manifestPath -Encoding UTF8

$results = foreach ($entry in $entries) {
  $targetPath = Join-Path $folder $entry.File
  if (Test-Path $targetPath) {
    $source = if ($fixMap.ContainsKey($entry.Name)) { $fixMap[$entry.Name].Source } elseif ($previous.ContainsKey($entry.Name)) { $previous[$entry.Name].Source } else { '' }
    [PSCustomObject]@{
      Name = $entry.Name
      Domain = $entry.Domain
      File = $entry.File
      Status = 'downloaded'
      Source = $source
      Bytes = (Get-Item $targetPath).Length
    }
  } else {
    $source = if ($previous.ContainsKey($entry.Name)) { $previous[$entry.Name].Source } else { '' }
    [PSCustomObject]@{
      Name = $entry.Name
      Domain = $entry.Domain
      File = $entry.File
      Status = 'failed'
      Source = $source
      Bytes = 0
    }
  }
}

$results | Export-Csv -Path $reportPath -NoTypeInformation -Encoding UTF8

$failed = $results | Where-Object Status -ne 'downloaded'
$readme = @()
$readme += 'Media House downloads'
$readme += ''
$readme += ("This folder contains {0} downloaded media brand images." -f (($results | Where-Object Status -eq 'downloaded').Count))
$readme += ''
$readme += 'Notes:'
$readme += '- Most files were fetched automatically from publisher domains.'
$readme += '- Some second-pass recoveries use direct site logo assets or YouTube channel avatars when a main site logo endpoint was unavailable.'
$readme += '- Check download-report.csv for the full status list.'
$readme += ''
if ($failed.Count -gt 0) {
  $readme += 'Entries still needing a confirmed source:'
  foreach ($item in $failed) { $readme += ('- ' + $item.Name) }
} else {
  $readme += 'All listed entries now have a downloaded file.'
}
$readme -join "`r`n" | Set-Content -Path (Join-Path $folder 'README.txt') -Encoding UTF8

"downloaded=$((($results | Where-Object Status -eq 'downloaded').Count)) failed=$($failed.Count)"
