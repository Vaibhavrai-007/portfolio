@echo off
title Portfolio Local Server
echo Starting local web server to serve the portfolio...

:: Check for Python (Windows Launcher)
py --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Python Launcher detected. Starting python http.server at http://127.0.0.1:8000
    start http://127.0.0.1:8000
    py -m http.server 8000 --bind 127.0.0.1
    pause
    exit
)

:: Check for Python
python --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Python detected. Starting python http.server at http://127.0.0.1:8000
    start http://127.0.0.1:8000
    python -m http.server 8000 --bind 127.0.0.1
    pause
    exit
)

:: Check for Node.js (npx)
npx --version >nul 2>&1
if %errorlevel% equ 0 (
    echo Node.js (npx) detected. Starting serve on port 3000
    start http://localhost:3000
    npx serve -p 3000
    pause
    exit
)

echo ERROR: Neither Python nor Node.js (npx) is installed or in PATH.
echo Since this project uses fetch() to load data.json, it requires a local web server to bypass browser CORS limitations.
echo Please install Python (https://www.python.org/) or Node.js (https://nodejs.org/) to run this properly.
pause
