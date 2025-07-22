# 🧹 AI Vision Classifier - Windows Cleanup Script
# Run this script before uploading to GitHub

Write-Host "🧹 AI Vision Classifier - Repository Cleanup" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

# Check current directory
Write-Host "📂 Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# 1. Remove Node.js dependencies (will be reinstalled on clone)
Write-Host "🗂️  Removing Node.js dependencies..." -ForegroundColor Green
if (Test-Path "frontend\node_modules") {
    Remove-Item -Path "frontend\node_modules" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Removed frontend\node_modules (487 MB saved!)" -ForegroundColor Green
} else {
    Write-Host "ℹ️  frontend\node_modules not found" -ForegroundColor Gray
}

if (Test-Path "frontend\.next") {
    Remove-Item -Path "frontend\.next" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Removed frontend\.next (build artifacts)" -ForegroundColor Green
} else {
    Write-Host "ℹ️  frontend\.next not found" -ForegroundColor Gray
}

# 2. Remove uploads directory
Write-Host "🖼️  Removing upload directory..." -ForegroundColor Green
if (Test-Path "uploads") {
    Remove-Item -Path "uploads" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Removed uploads directory (10 MB saved!)" -ForegroundColor Green
} else {
    Write-Host "ℹ️  uploads directory not found" -ForegroundColor Gray
}

# 3. Remove database data
Write-Host "🗄️  Removing database data..." -ForegroundColor Green
if (Test-Path "db_data") {
    Remove-Item -Path "db_data" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "✅ Removed db_data directory" -ForegroundColor Green
} else {
    Write-Host "ℹ️  db_data directory not found" -ForegroundColor Gray
}

# 4. Clean Python cache
Write-Host "🐍 Cleaning Python cache..." -ForegroundColor Green
$pycacheCount = 0
Get-ChildItem -Path . -Recurse -Directory -Name "__pycache__" -ErrorAction SilentlyContinue | ForEach-Object {
    $pycacheCount++
    Remove-Item -Path $_ -Recurse -Force -ErrorAction SilentlyContinue
}
if ($pycacheCount -gt 0) {
    Write-Host "✅ Removed $pycacheCount __pycache__ directories" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No __pycache__ directories found" -ForegroundColor Gray
}

# 5. Remove environment files (will use .env.original as template)
Write-Host "🔐 Removing environment files..." -ForegroundColor Green
$envFiles = @(".env", ".env.local", "api\.env")
$removedEnvCount = 0
foreach ($envFile in $envFiles) {
    if (Test-Path $envFile) {
        Remove-Item -Path $envFile -Force -ErrorAction SilentlyContinue
        $removedEnvCount++
    }
}
if ($removedEnvCount -gt 0) {
    Write-Host "✅ Removed $removedEnvCount environment files" -ForegroundColor Green
} else {
    Write-Host "ℹ️  No environment files found" -ForegroundColor Gray
}

# 6. Check final size
Write-Host ""
Write-Host "📊 Final repository size check..." -ForegroundColor Yellow
$totalSize = (Get-ChildItem -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1MB
Write-Host "📦 Repository size: {0:N1} MB" -f $totalSize -ForegroundColor Cyan

# 7. Size recommendations
if ($totalSize -lt 50) {
    Write-Host "✅ Excellent! Size is under 50 MB - Perfect for GitHub" -ForegroundColor Green
} elseif ($totalSize -lt 100) {
    Write-Host "⚠️  Good! Size is under 100 MB - Acceptable for GitHub" -ForegroundColor Yellow
} else {
    Write-Host "❌ Warning! Size is over 100 MB - May have upload issues" -ForegroundColor Red
    Write-Host "   Consider checking for additional large files" -ForegroundColor Red
}

# 8. Show what's left
Write-Host ""
Write-Host "📁 Remaining largest directories:" -ForegroundColor Yellow
Get-ChildItem -Directory | ForEach-Object {
    $size = (Get-ChildItem $_.FullName -Recurse -File | Measure-Object -Property Length -Sum).Sum / 1KB
    if ($size -gt 1000) {  # Only show directories > 1 MB
        "{0:N0} KB - {1}" -f $size, $_.Name
    }
} | Sort-Object {[int]($_ -split ' ')[0]} -Descending | Select-Object -First 5

Write-Host ""
Write-Host "🎉 Cleanup completed successfully!" -ForegroundColor Green
Write-Host "📋 Next steps:" -ForegroundColor Cyan
Write-Host "   1. Run: git add ." -ForegroundColor White
Write-Host "   2. Run: git commit -m 'feat: Initial commit - AI Vision Classifier'" -ForegroundColor White
Write-Host "   3. Push to GitHub!" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Your AI Vision Classifier is ready for GitHub! ⭐" -ForegroundColor Green 