$ErrorActionPreference = "Stop"
$project = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $project ".env.local"

if (-not (Test-Path -LiteralPath $envFile)) {
  Copy-Item -LiteralPath (Join-Path $project ".env.example") -Destination $envFile
}

function ConvertTo-PlainText([Security.SecureString]$secure) {
  $pointer = [Runtime.InteropServices.Marshal]::SecureStringToBSTR($secure)
  try {
    return [Runtime.InteropServices.Marshal]::PtrToStringBSTR($pointer)
  }
  finally {
    [Runtime.InteropServices.Marshal]::ZeroFreeBSTR($pointer)
  }
}

Write-Host ""
Write-Host "Trocar senha do painel administrativo" -ForegroundColor Cyan
$first = ConvertTo-PlainText (Read-Host "Digite a nova senha" -AsSecureString)
$second = ConvertTo-PlainText (Read-Host "Repita a nova senha" -AsSecureString)

if ($first -ne $second) {
  throw "As senhas nao sao iguais."
}
if ($first.Length -lt 10) {
  throw "Use uma senha com pelo menos 10 caracteres."
}

$env:CBC_NEW_ADMIN_PASSWORD = $first
$hash = & node -e "const c=require('crypto');const p=process.env.CBC_NEW_ADMIN_PASSWORD;const s=c.randomBytes(16).toString('hex');console.log(s+':'+c.scryptSync(p,s,64).toString('hex'))"
Remove-Item Env:CBC_NEW_ADMIN_PASSWORD

$content = Get-Content -Raw -LiteralPath $envFile
if ($content -match "(?m)^ADMIN_PASSWORD_HASH=") {
  $content = $content -replace "(?m)^ADMIN_PASSWORD_HASH=.*$", "ADMIN_PASSWORD_HASH=$hash"
}
else {
  $content = $content.TrimEnd() + [Environment]::NewLine + "ADMIN_PASSWORD_HASH=$hash" + [Environment]::NewLine
}

Set-Content -LiteralPath $envFile -Value $content -Encoding UTF8
Write-Host ""
Write-Host "Senha alterada. Reinicie o site para aplicar." -ForegroundColor Green
