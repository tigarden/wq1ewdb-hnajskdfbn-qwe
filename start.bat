@echo off
chcp 65001 >nul
title Debet.auto Runner
echo ======================================================
echo    Debet.auto - Запуск приложения
echo ======================================================
echo.
echo [1/2] Запуск локального интерфейса Vite (порт 5173)...
start "Debet Frontend" cmd /k "npm run dev"

echo [2/2] Открытие браузера...
timeout /t 2 >nul
start http://localhost:5173

echo.
echo Приложение успешно запущено!
echo Это окно можно закрыть.
timeout /t 2 >nul

