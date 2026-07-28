# Step 4: Move into frontend
Write-Host "Restructuring folders..."
Set-Location "D:\prototype-next-main"

$exclude = @("frontend", "backend", ".git", ".github", ".gitignore", "README.md")
Get-ChildItem -Force | Where-Object { $exclude -notcontains $_.Name } | ForEach-Object {
    Write-Host "Moving $($_.Name) to frontend..."
    Move-Item -LiteralPath $_.FullName -Destination "D:\prototype-next-main\frontend" -Force
}

# Step 5: Verify
if (Test-Path "D:\prototype-next-main\frontend\package.json") {
    Write-Host "Frontend package.json verified successfully."
} else {
    Write-Host "ERROR: frontend/package.json not found."
    exit 1
}
