function Get-AssetUrl {
  param(
    [string]$Url,
    [switch]$Insecure
  )

  try {
    if ($Insecure) {
      $html = curl.exe -k -L -A "Mozilla/5.0" $Url 2>$null
      if (-not $html) { return $null }
      $base = [uri]$Url
    } else {
      $r = Invoke-WebRequest $Url -UseBasicParsing -TimeoutSec 20 -Headers @{ 'User-Agent' = 'Mozilla/5.0' }
      $html = $r.Content
      $base = $r.BaseResponse.ResponseUri
    }

    $patterns = @(
      '<meta[^>]+property="og:image"[^>]+content="([^"]+)"',
      '<link[^>]+rel="[^\"]*(?:icon|apple-touch-icon)[^\"]*"[^>]+href="([^"]+)"',
      '<img[^>]+src="([^"]*logo[^"]*)"'
    )

    foreach ($pattern in $patterns) {
      $m = [regex]::Match($html, $pattern, 'IgnoreCase')
      if ($m.Success) {
        return ([uri]$base, $m.Groups[1].Value).AbsoluteUri
      }
    }
  } catch {
    return $null
  }

  return $null
}

$tests = @(
  @{ Name='UNI'; Url='https://www.uniindia.com' },
  @{ Name='Startup News'; Url='https://startupnews.in' },
  @{ Name='India Economic Observer'; Url='https://www.indianeconomicobserver.com' },
  @{ Name='Big News Network'; Url='https://www.bignewsnetwork.com' },
  @{ Name='Indian Community'; Url='https://indian.community' },
  @{ Name='Naveen Times'; Url='https://www.naveentimes.com' },
  @{ Name='DD India'; Url='https://ddindia.co.in' },
  @{ Name='The Mojo Story'; Url='https://mojostory.com'; Insecure=$true },
  @{ Name='Amrit India'; Url='https://amritindia.com' },
  @{ Name='CVR English Official'; Url='https://www.youtube.com/c/CVREnglishOfficial' }
)

foreach ($t in $tests) {
  $asset = Get-AssetUrl -Url $t.Url -Insecure:([bool]$t.Insecure)
  Write-Output ("$($t.Name)`t$($t.Url)`t$asset")
}
