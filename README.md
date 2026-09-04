# Debet.auto — Учет взаиморасчетов, запчастей и долгов

Современное веб-приложение для ведения учета закупок автозапчастей, взаиморасчетов с поставщиками (Тотус, Эрнест, Витя и др.), заказов по автомобилям и расчетов с клиентами/мастерами («Другие»).

- 📱 **Работает на любом устройстве**: телефон, планшет, компьютер 24/7.
- 🌐 **Бесплатный хостинг**: развернуто через **GitHub Pages**.
- 🛡️ **Двухфакторная защита Google Authenticator (2FA)**: подтверждение входа 1 раз в неделю (сессия 7 дней) по 6-значному одноразовому коду.
- 🐘 **База данных PostgreSQL**: поддержка Docker Compose, облачных СУБД (Supabase, Neon, Render) и локального fallback SQLite.
- ⚡ **Оффлайн-режим и гибридная синхронизация**: локальный кэш + синхронизация с PostgreSQL и GitHub.
- 📊 **Экспорт и бэкапы**: выгрузка в Excel (.xlsx) и JSON в один клик.

---

## 🔐 Подключение Google Authenticator (2FA раз в неделю)

Для максимальной безопасности доступ к приложению можно защитить временными кодами через приложение **Google Authenticator** на смартфоне. 

> [!NOTE]
> Сессия авторизации действует **ровно 7 дней**. В течение недели приложение открывается на вашем устройстве мгновенно, а спустя 7 дней запросит новый 6-значный код из приложения.

### Инструкция по подключению:
1. Установите приложение **Google Authenticator** на смартфон:
   - [Google Authenticator для Android (Google Play)](https://play.google.com/store/apps/details?id=com.google.android.apps.authenticator2)
   - [Google Authenticator для iOS (App Store)](https://apps.apple.com/app/google-authenticator/id388497605)
2. В веб-приложении перейдите во вкладку **«Настройки»**.
3. В блоке **Google Authenticator (2FA)** нажмите **«Подключить приложение»**.
4. В приложении Google Authenticator на телефоне нажмите значок **«+»** (добавить) &rarr; выберите **«Сканировать QR-код»** и наведите камеру на QR-код на экране.
   *(или выберите «Ввести ключ настройки» и скопируйте текстовый секретный ключ)*.
5. Приложение начнет генерировать 6-значные коды, обновляющиеся каждые 30 секунд.
6. Введите текущий 6-значный код в поле подтверждения на сайте и нажмите **«Активировать 2FA»**.
7. Готово! Теперь раз в 7 дней вход будет подтверждаться через Google Authenticator (при необходимости доступен резервный мастер-пароль).

---

## 🐘 База данных PostgreSQL

Проект поддерживает гибкую архитектуру базы данных через асинхронный ORM **SQLAlchemy 2.0 + asyncpg + Alembic**:

### Вариант 1: Запуск через Docker Compose (Рекомендуется локально)
В корне проекта уже подготовлен файл `docker-compose.yml` (PostgreSQL 16 Alpine + веб-панель pgAdmin):

```bash
# Запуск контейнеров PostgreSQL и pgAdmin
docker compose up -d

# Просмотр статуса
docker compose ps
```
- **PostgreSQL**: порт `5432` (пользователь: `postgres`, пароль: `postgres`, база: `debet`)
- **pgAdmin**: доступен в браузере по адресу `http://localhost:5050` (логин: `admin@debet.auto`, пароль: `admin123`)

### Вариант 2: Облачный PostgreSQL (Supabase / Neon / Render / Timeweb)
1. Создайте бесплатную базу PostgreSQL на [Supabase](https://supabase.com/) или [Neon](https://neon.tech/).
2. В файле `.env` укажите полученную строку подключения:
   ```env
   DATABASE_URL=postgresql+asyncpg://postgres.yourproject:yourpassword@aws-0-eu-central-1.pooler.supabase.com:5432/postgres?ssl=require
   ```

### Вариант 3: Автоматический Fallback (SQLite)
Если PostgreSQL временно не запущен, бэкенд автоматически использует локальную защищенную базу SQLite (`debet.db`), поэтому всё работает сразу без предварительной настройки.

---

## 💻 Локальный запуск (Разработка)

### 1. Запуск бэкенда (FastAPI + PostgreSQL):
```bash
# Активация виртуального окружения (PowerShell)
.\.venv\Scripts\Activate.ps1

# Применение миграций базы данных
alembic upgrade head

# Миграция начальных данных из JSON в базу (при первом запуске)
python scripts/migrate_json_to_postgres.py

# Запуск сервера API
uvicorn backend.main:app --reload --port 8000
```
- Документация Swagger UI: `http://localhost:8000/docs`
- Проверка статуса базы: `http://localhost:8000/api/health`

### 2. Запуск фронтенда (React + Vite):
```bash
npm install
npm run dev
```
Приложение откроется по адресу `http://localhost:5173`.

---

## 🚀 Развертывание на GitHub Pages

Репозиторий: `https://github.com/tigarden/wq1ewdb-hnajskdfbn-qwe`.

1. **Отправка изменений**:
   ```bash
   git add .
   git commit -m "Add PostgreSQL database, 2FA Google Authenticator, and 7-day session security"
   git push origin main
   ```
2. Сайт доступен по адресу:
   👉 **`https://tigarden.github.io/wq1ewdb-hnajskdfbn-qwe/`**
