@echo off
chcp 65001 >nul
title Debet.auto Runner
echo ======================================================
echo    Debet.auto - Автоматический запуск сервисов
echo ======================================================
echo.
echo [1/3] Запуск локального сервера FastAPI (порт 8000)...
start "Debet Backend API" cmd /k ".\.venv\Scripts\activate && uvicorn backend.main:app --reload --port 8000"

echo [2/3] Запуск интерфейса Vite (порт 5173)...
start "Debet Frontend" cmd /k "npm run dev"

echo [3/3] Ожидание готовности и открытие браузера...
timeout /t 3 >nul
start http://localhost:5173

echo.
echo Все сервисы успешно запущены!
echo Это окно можно закрыть.
timeout /t 2 >nul
