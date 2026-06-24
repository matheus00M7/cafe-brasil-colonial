@echo off
setlocal
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo.
  echo Node.js nao foi encontrado.
  echo Instale o Node.js LTS em https://nodejs.org e tente novamente.
  echo.
  pause
  exit /b 1
)

if not exist ".env.local" (
  copy ".env.example" ".env.local" >nul
  echo Arquivo .env.local criado.
)

if not exist "node_modules" (
  echo Instalando dependencias. Isso acontece apenas na primeira vez...
  call npm.cmd install
  if errorlevel 1 (
    echo Nao foi possivel instalar as dependencias.
    pause
    exit /b 1
  )
)

echo.
echo O painel sera aberto em http://localhost:3000/admin
echo Para desligar, volte a esta janela e pressione Ctrl+C.
echo.

start "" cmd /c "timeout /t 4 /nobreak >nul & start http://localhost:3000/admin"
call npm.cmd run dev
pause
