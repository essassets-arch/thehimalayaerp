# Step 4 continued: Install backend deps
Set-Location "D:\prototype-next-main\backend"

Write-Host "Installing backend deps..."
npm install @nestjs/config @nestjs/jwt @nestjs/passport passport passport-jwt bcrypt class-validator class-transformer helmet cookie-parser compression @prisma/client
npm install --save-dev prisma @types/bcrypt @types/passport-jwt @types/cookie-parser @types/compression

Write-Host "Initializing Prisma..."
npx prisma init

# Step 5: Create module structure
Write-Host "Creating module structure..."
$folders = @(
    "src\common\decorators",
    "src\common\exceptions",
    "src\common\filters",
    "src\common\guards",
    "src\common\interceptors",
    "src\common\middleware",
    "src\common\pipes",
    "src\common\types",
    "src\config",
    "src\database",
    "src\modules\auth\dto",
    "src\modules\auth\guards",
    "src\modules\auth\strategies",
    "src\modules\users\dto",
    "src\modules\roles\dto",
    "src\modules\customers\dto",
    "src\modules\leads\dto",
    "src\modules\audit",
    "src\modules\health",
    "prisma\migrations",
    "scripts"
)

foreach ($folder in $folders) {
    New-Item -ItemType Directory -Path $folder -Force | Out-Null
}
Write-Host "Backend structure created."
