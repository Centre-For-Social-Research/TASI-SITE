param(
  [string]$InputPath = 'C:\Users\Media\Downloads\TASI Guest List (Master+Conference+Embassy) (1).xlsx',
  [string]$OutputPath = 'C:\Users\Media\Desktop\New folder\TASI Attendees Cleaned.xlsx'
)

$ErrorActionPreference = 'Stop'

Add-Type -AssemblyName System.IO.Compression.FileSystem

function Get-ZipEntryText {
  param(
    [System.IO.Compression.ZipArchive]$Zip,
    [string]$EntryPath
  )

  $entry = $Zip.Entries | Where-Object { $_.FullName -eq $EntryPath }
  if (-not $entry) {
    return $null
  }

  $reader = [System.IO.StreamReader]::new($entry.Open())
  try {
    return $reader.ReadToEnd()
  }
  finally {
    $reader.Dispose()
  }
}

function Get-CellText {
  param(
    [xml]$SheetXml,
    [System.Xml.XmlNode]$CellNode,
    [string[]]$SharedStrings,
    [System.Xml.XmlNamespaceManager]$Ns
  )

  if (-not $CellNode) {
    return ''
  }

  $type = [string]$CellNode.GetAttribute('t')
  $valueNode = $CellNode.SelectSingleNode('./main:v', $Ns)

  if ($type -eq 's' -and $valueNode) {
    return [string]$SharedStrings[[int]$valueNode.InnerText]
  }

  if ($type -eq 'inlineStr') {
    $inlineNode = $CellNode.SelectSingleNode('./main:is', $Ns)
    if ($inlineNode) {
      return [string]$inlineNode.InnerText
    }
  }

  if ($valueNode) {
    return [string]$valueNode.InnerText
  }

  return [string]$CellNode.InnerText
}

function Get-ColumnLetters {
  param([string]$CellReference)
  return ([regex]::Match($CellReference, '^[A-Z]+')).Value
}

function Get-CanonicalHeader {
  param([string]$Header)

  $normalized = (($Header -replace '\s+', ' ').Trim()).ToLowerInvariant()
  switch -Regex ($normalized) {
    '^name$' { return 'Name' }
    '^category$' { return 'Category' }
    '^organisation$' { return 'Organisation' }
    '^designation$' { return 'Designation' }
    '^(email|contact)$' { return 'Email' }
    '^phone$' { return 'Phone' }
    '^notes$' { return 'Notes' }
    '^source$' { return 'Source' }
    '^events?$' { return 'Events' }
    '^sponsors?$' { return 'Sponsors' }
    default { return $null }
  }
}

function Clean-Text {
  param([string]$Value)

  if ($null -eq $Value) {
    return ''
  }

  $cleaned = $Value -replace '[\r\n\t]+', ' '
  $cleaned = $cleaned -replace '\s+', ' '
  return $cleaned.Trim()
}

function Normalize-Key {
  param([string]$Value)

  $base = (Clean-Text $Value).ToLowerInvariant()
  $base = $base -replace '^(mr|mrs|ms|miss|dr|prof)\.?\s+', ''
  $base = $base -replace '[^a-z0-9]+', ' '
  return ($base -replace '\s+', ' ').Trim()
}

function Score-Value {
  param([string]$Value)

  $text = Clean-Text $Value
  if (-not $text) {
    return 0
  }

  $score = $text.Length
  if ($text -match '@') {
    $score += 100
  }
  if ($text -match '\d') {
    $score += 20
  }
  if ($text -match '\bhttps?://|\bwww\.') {
    $score += 40
  }
  return $score
}

function Merge-Field {
  param(
    [hashtable]$Record,
    [string]$Field,
    [string]$Candidate
  )

  $candidateText = Clean-Text $Candidate
  if (-not $candidateText) {
    return
  }

  $current = [string]$Record[$Field]
  if (-not $current) {
    $Record[$Field] = $candidateText
    return
  }

  if ($current -eq $candidateText) {
    return
  }

  if ((Score-Value $candidateText) -gt (Score-Value $current)) {
    $Record[$Field] = $candidateText
  }
}

function Merge-ListField {
  param(
    [hashtable]$Record,
    [string]$Field,
    [string]$Candidate
  )

  $candidateText = Clean-Text $Candidate
  if (-not $candidateText) {
    return
  }

  $existing = @()
  if ($Record.ContainsKey($Field) -and $Record[$Field]) {
    $existing = [string]$Record[$Field] -split '\s*\|\s*'
  }

  if ($existing -notcontains $candidateText) {
    if ($existing.Count -eq 0) {
      $Record[$Field] = $candidateText
    }
    else {
      $Record[$Field] = (($existing + $candidateText) | Where-Object { $_ } | Select-Object -Unique) -join ' | '
    }
  }
}

function Get-SheetRows {
  param(
    [System.IO.Compression.ZipArchive]$Zip,
    [string]$WorksheetPath,
    [string[]]$SharedStrings,
    [System.Xml.XmlNamespaceManager]$Ns
  )

  $sheetText = Get-ZipEntryText -Zip $Zip -EntryPath $WorksheetPath
  if (-not $sheetText) {
    return @()
  }

  $sheetXml = [xml]$sheetText
  $rows = @()
  foreach ($rowNode in $sheetXml.SelectNodes('//main:sheetData/main:row', $Ns)) {
    $row = @{}
    foreach ($cellNode in $rowNode.SelectNodes('./main:c', $Ns)) {
      $column = Get-ColumnLetters -CellReference $cellNode.r
      $row[$column] = Clean-Text (Get-CellText -SheetXml $sheetXml -CellNode $cellNode -SharedStrings $SharedStrings -Ns $Ns)
    }
    $rows += [pscustomobject]@{
      RowNumber = [int]$rowNode.r
      Cells = $row
    }
  }

  return $rows
}

function Get-HeaderMap {
  param([object[]]$Rows)

  foreach ($row in $Rows) {
    $map = @{}
    foreach ($column in $row.Cells.Keys) {
      $header = Get-CanonicalHeader -Header $row.Cells[$column]
      if ($header) {
        $map[$header] = $column
      }
    }

    if ($map.ContainsKey('Name') -and $map.ContainsKey('Category')) {
      return [pscustomobject]@{
        HeaderRow = $row.RowNumber
        Map = $map
      }
    }
  }

  return $null
}

function Get-SheetLabel {
  param([string]$SheetName)

  switch ($SheetName) {
    'Master (Inaugural+Conference)' { return 'Conference' }
    'Additions 7-8' { return 'Conference' }
    'Additions For Embassies' { return 'Embassy' }
    'Invitees' { return 'Invitees' }
    'master embassy list' { return 'Embassy' }
    'Opening Reception (Embassy of F' { return 'Opening Reception' }
    'Netherlands Reception (7th Oct)' { return 'Netherlands Reception' }
    'Swedish Embassy (8th Oct)' { return 'Swedish Embassy' }
    'Online Registrations' { return 'Online Registration' }
    default { return $SheetName }
  }
}

if (-not (Test-Path -LiteralPath $InputPath)) {
  throw "Input file not found: $InputPath"
}

$zip = [System.IO.Compression.ZipFile]::OpenRead($InputPath)
try {
  $namespaceTable = [System.Xml.NameTable]::new()
  $ns = [System.Xml.XmlNamespaceManager]::new($namespaceTable)
  $ns.AddNamespace('main', 'http://schemas.openxmlformats.org/spreadsheetml/2006/main')

  $sharedStrings = @()
  $sharedText = Get-ZipEntryText -Zip $zip -EntryPath 'xl/sharedStrings.xml'
  if ($sharedText) {
    $sharedXml = [xml]$sharedText
    foreach ($si in $sharedXml.sst.si) {
      $sharedStrings += [string]$si.InnerText
    }
  }

  $workbookText = Get-ZipEntryText -Zip $zip -EntryPath 'xl/workbook.xml'
  $relationshipsText = Get-ZipEntryText -Zip $zip -EntryPath 'xl/_rels/workbook.xml.rels'

  $sheets = @()
  [regex]::Matches($workbookText, '<sheet[^>]*name="([^"]+)"[^>]*r:id="([^"]+)"') | ForEach-Object {
    $sheets += [pscustomobject]@{
      Name = $_.Groups[1].Value
      RelId = $_.Groups[2].Value
    }
  }

  $relationshipMap = @{}
  [regex]::Matches($relationshipsText, '<Relationship[^>]*Id="([^"]+)"[^>]*Target="([^"]+)"') | ForEach-Object {
    $relationshipMap[$_.Groups[1].Value] = 'xl/' + $_.Groups[2].Value
  }

  $records = @{}

  foreach ($sheet in $sheets) {
    if ($sheet.Name -eq 'SPONSORS') {
      continue
    }

    $worksheetPath = $relationshipMap[$sheet.RelId]
    if (-not $worksheetPath) {
      continue
    }

    $rows = Get-SheetRows -Zip $zip -WorksheetPath $worksheetPath -SharedStrings $sharedStrings -Ns $ns
    if (-not $rows -or $rows.Count -eq 0) {
      continue
    }

    $headerInfo = Get-HeaderMap -Rows $rows
    if (-not $headerInfo) {
      continue
    }

    $sourceLabel = Get-SheetLabel -SheetName $sheet.Name

    foreach ($row in $rows) {
      if ($row.RowNumber -le $headerInfo.HeaderRow) {
        continue
      }

      $name = ''
      if ($headerInfo.Map.ContainsKey('Name')) {
        $name = $row.Cells[$headerInfo.Map['Name']]
      }

      $name = Clean-Text $name
      if (-not $name) {
        continue
      }

      $key = Normalize-Key $name
      if (-not $key) {
        continue
      }

      if (-not $records.ContainsKey($key)) {
        $records[$key] = @{
          Name = ''
          Category = ''
          Organisation = ''
          Designation = ''
          Email = ''
          Phone = ''
          Notes = ''
          Source = ''
          Events = ''
        }
      }

      $record = $records[$key]
      Merge-Field -Record $record -Field 'Name' -Candidate $name

      foreach ($field in @('Category', 'Organisation', 'Designation', 'Email', 'Phone')) {
        if ($headerInfo.Map.ContainsKey($field)) {
          Merge-Field -Record $record -Field $field -Candidate $row.Cells[$headerInfo.Map[$field]]
        }
      }

      if ($headerInfo.Map.ContainsKey('Notes')) {
        Merge-ListField -Record $record -Field 'Notes' -Candidate $row.Cells[$headerInfo.Map['Notes']]
      }

      Merge-ListField -Record $record -Field 'Source' -Candidate $sheet.Name
      Merge-ListField -Record $record -Field 'Events' -Candidate $sourceLabel
    }
  }

  $orderedRecords = $records.Values | Sort-Object Name

  $excel = New-Object -ComObject Excel.Application
  $excel.Visible = $false
  $excel.DisplayAlerts = $false

  try {
    $workbook = $excel.Workbooks.Add()
    $worksheet = $workbook.Worksheets.Item(1)
    $worksheet.Name = 'Attendees'

    $headers = @('Name', 'Category', 'Organisation', 'Designation', 'Email', 'Phone', 'Notes', 'Events', 'Source')
    for ($i = 0; $i -lt $headers.Count; $i++) {
      $worksheet.Cells.Item(1, $i + 1) = $headers[$i]
    }

    $rowIndex = 2
    foreach ($record in $orderedRecords) {
      for ($i = 0; $i -lt $headers.Count; $i++) {
        $worksheet.Cells.Item($rowIndex, $i + 1) = [string]$record[$headers[$i]]
      }
      $rowIndex++
    }

    $headerRange = $worksheet.Range('A1', 'I1')
    $headerRange.Font.Bold = $true
    $headerRange.Interior.ColorIndex = 15
    $worksheet.Columns.AutoFit() | Out-Null
    $worksheet.Application.ActiveWindow.SplitRow = 1
    $worksheet.Application.ActiveWindow.FreezePanes = $true

    $outputDirectory = Split-Path -Parent $OutputPath
    if ($outputDirectory -and -not (Test-Path -LiteralPath $outputDirectory)) {
      New-Item -ItemType Directory -Path $outputDirectory | Out-Null
    }

    $workbook.SaveAs($OutputPath, 51)

    $csvPath = [System.IO.Path]::ChangeExtension($OutputPath, '.csv')
    $worksheet.SaveAs($csvPath, 6)

    $workbook.Close($false)
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($worksheet) | Out-Null
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($workbook) | Out-Null

    Write-Output "Created: $OutputPath"
    Write-Output "Created: $csvPath"
    Write-Output ('Attendees: ' + $orderedRecords.Count)
  }
  finally {
    $excel.Quit()
    [System.Runtime.InteropServices.Marshal]::ReleaseComObject($excel) | Out-Null
    [gc]::Collect()
    [gc]::WaitForPendingFinalizers()
  }
}
finally {
  $zip.Dispose()
}
