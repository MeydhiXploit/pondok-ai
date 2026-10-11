# local-ai-stack

[English](README.md) · [Bahasa Indonesia](README_id.md) · [한국어](README_ko.md) · [العربية](README_ar.md) · [Español](README_es.md) · [中文](README_zh.md) · [Français](README_fr.md) · [日本語](README_ja.md) · [Deutsch](README_de.md) · [Português](README_pt.md) · **Русский** · [हिन्दी](README_hi.md) · [Türkçe](README_tr.md) · [Italiano](README_it.md) · [Tiếng Việt](README_vi.md)

<p align="center">
  <strong>Запустите свой собственный приватный стек ИИ локально одной командой.</strong>
</p>

<p align="center">
  <a href="#быстрый-старт">Быстрый Старт</a> •
  <a href="#возможности">Возможности</a> •
  <a href="#пресеты">Пресеты</a> •
  <a href="#команды-cli">Команды CLI</a> •
  <a href="#api-шлюз">API Шлюз</a> •
  <a href="#примеры">Примеры</a> •
  <a href="#документация">Документация</a>
</p>

---

## Обзор

`local-ai-stack` — это дружественный разработчикам, бесшовный CLI и инструментарий оркестрации контейнеров, который запускает полную, приватную среду ИИ непосредственно на вашей локальной рабочей станции.

Работая на **Docker Compose v2**, `local-ai-stack` предоставляет вам локальные LLM, чат-интерфейс, векторный поиск, персистентность базы данных и API-шлюз, совместимый с OpenAI, за считанные секунды. Промпты, чаты и эмбеддинги обрабатываются на вашей машине; загрузка образов контейнеров и весов моделей требует подключения к интернету.

```bash
npx local-ai-stack init
npx local-ai-stack up
```

---

## Возможности

-  **Локальная Обработка**: Промпты, чаты, эмбеддинги и вывод выполняются на вашем оборудовании. Начальная загрузка образов контейнеров и моделей требует доступа к интернету.
- ⚡ **Нулевое Трение Настройки**: Автоматически определяет ОС, архитектуру, RAM и GPU (Apple Metal / NVIDIA CUDA).
-  **Модульные Пресеты**: Масштабируйтесь от легкого чат-интерфейса (`minimal`) до корпоративного RAG-стека (`standard`) или автономного конвейера автоматизации (`full`).
-  **OpenAI-Совместимый Шлюз**: Направьте стандартные SDK OpenAI или LangChain напрямую на `http://localhost:8000/v1` без переписывания кода.
-  **Встроенный Менеджер Моделей**: Загружайте, перечисляйте, проверяйте и удаляйте модели со встроенными предупреждениями безопасности RAM/диска.
-  **Самовосстанавливающаяся Диагностика**: Встроенная команда `doctor` диагностирует коллизии портов, состояние демона Docker и ограничения ресурсов до того, как вы столкнетесь с проблемами.

---

## Архитектура

```
┌───────────────────────────────────────────────────────────────┐
│                  Хост-Машина (CLI)                            │
│                                                               │
│   Порт 3000             Порт 8000           Порт 5678         │
│       │                     │                   │             │
└───────┼─────────────────────┼───────────────────┼─────────────┘
        ▼                     ▼                   ▼
  ┌───────────┐         ┌───────────┐       ┌───────────┐
  │ Open      │         │ API       │       │ n8n       │
  │ WebUI     │         │ Шлюз      │       │ (Full)    │
  └─────┬─────┘         └─────┬─────┘       └─────┬─────┘
        │                     │                   │
        ├─────────────────────┼───────────────────┤
        ▼                     ▼                   ▼
  ┌───────────┐         ┌───────────┐       ┌───────────┐
  │ Ollama    │         │ Qdrant    │       │ Postgres  │
  │ (LLMs)    │         │ (Вектор)  │       │ (Состояние)│
  └───────────┘         └───────────┘       └───────────┘
```

---

## Пресеты

| Пресет | Включенные Сервисы | Мин. RAM | Рекомендуется Для |
|---|---|---|---|
| **`minimal`** | Ollama, Open WebUI | 8 GB | Быстрый локальный чат, легкие эксперименты |
| **`standard`** *(по умолчанию)* | Ollama, Open WebUI, PostgreSQL, Qdrant, API Шлюз | 16 GB | RAG-конвейеры, разработка приложений, замена OpenAI |
| **`full`** | Standard + движок автоматизации n8n | 16+ GB | Автономные ИИ-агенты, визуальная автоматизация рабочих процессов |

---

## Быстрый Старт

### Автоматизированная Установка Одной Командой

#### macOS и Linux
```bash
curl -fsSL https://raw.githubusercontent.com/rasidi3112/local-ai-stack/main/scripts/install.sh | bash
```

#### Windows (PowerShell)
```powershell
iwr -useb https://raw.githubusercontent.com/rasidi3112/local-ai-stack/main/scripts/install.ps1 | iex
```

### Ручной Быстрый Старт через npx

Предварительные требования: Node.js 22 или новее, Docker и Docker Compose v2.

#### 1. Инициализировать стек
```bash
# Интерактивный мастер настройки с автоматическим определением оборудования
npx local-ai-stack init

# Или неинтерактивный с выбранным пресетом
npx local-ai-stack init --preset standard --yes
```

#### 2. Запустить сервисы с автоматическими проверками работоспособности
```bash
npx local-ai-stack up
```

После запуска получите доступ к вашему стеку:
- **Open WebUI**: [http://localhost:3000](http://localhost:3000)
- **API Шлюз**: [http://localhost:8000](http://localhost:8000)
- **Ollama**: [http://localhost:11434](http://localhost:11434)
- **Qdrant**: [http://localhost:6333/dashboard](http://localhost:6333/dashboard) *(при сопоставлении)*

#### 3. Умное Определение Оборудования и Рекомендации Моделей
```bash
# Получите умные рекомендации на основе вашего RAM/VRAM
npx local-ai-stack model recommend

# Установите модель с предварительной проверкой безопасности памяти и диска
npx local-ai-stack model install llama3.2:3b
```

---

## Команды CLI

| Команда | Описание |
|---|---|
| `local-ai-stack init` | Запустить интерактивный мастер настройки с определением оборудования |
| `local-ai-stack up` | Проверить конфигурацию Compose, запустить контейнеры и дождаться проверок работоспособности |
| `local-ai-stack down` | Остановить и удалить контейнеры стека |
| `local-ai-stack start` | Запустить существующие остановленные контейнеры |
| `local-ai-stack stop` | Остановить запущенные контейнеры |
| `local-ai-stack restart` | Перезапустить контейнеры стека |
| `local-ai-stack status` | Показать работоспособность контейнеров и URL |
| `local-ai-stack logs [сервис]` | Просмотреть логи (`-f` для потоковой передачи) |
| `local-ai-stack doctor` | Диагностировать Docker, RAM, GPU/VRAM, порты и рекомендации моделей |
| `local-ai-stack update` | Повторно загрузить настроенные закрепленные образы с автоматическим резервным копированием и проверками работоспособности |
| `local-ai-stack backup` | Резервное копирование конфигураций и томов данных с проверками целостности SHA-256 (не зашифровано) |
| `local-ai-stack restore <путь>` | Восстановить из резервной копии с проверкой целостности SHA-256 (не зашифровано) |
| `local-ai-stack reset` | Сбросить стек (сохраняет тома, если не указан `--delete-data`) |
| `local-ai-stack config` | Проверить или отредактировать активную конфигурацию |
| `local-ai-stack model list` | Перечислить загруженные модели |
| `local-ai-stack model recommend` | Рекомендации моделей с учетом оборудования (RAM, VRAM, Диск) |
| `local-ai-stack model install <имя>` | Загрузить новую модель с предварительными проверками безопасности ресурсов |
| `local-ai-stack model remove <имя>` | Удалить установленную модель |
| `local-ai-stack model status` | Проверить отпечатки ресурсов моделей |

Образы закреплены за явными версиями. `local-ai-stack update` обновляет настроенные версии; он не выбирает более новые релизы. После установки более новой CLI запустите `local-ai-stack update --upgrade-images`, чтобы мигрировать только устаревшие теги образов по умолчанию CLI. Пользовательские значения образов сохраняются.

---

## API Шлюз

API Шлюз предоставляет готовые к использованию REST-эндпоинты OpenAI:

Установите `LOCAL_AI_API_KEY` в сгенерированный `API_SECRET_KEY` перед вызовом эндпоинта `/v1/*`.

Шлюз ограничивает аутентифицированные запросы `/v1/*` по IP-адресу источника до 120 запросов в минуту по умолчанию. Настройте `RATE_LIMIT_MAX_REQUESTS` и `RATE_LIMIT_WINDOW_MS` в `.env`, если вашему локальному клиенту нужны другие лимиты.

```bash
curl http://localhost:8000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LOCAL_AI_API_KEY" \
  -d '{
    "model": "llama3.2:3b",
    "messages": [
      { "role": "user", "content": "Привет из моего приватного локального ИИ-стека!" }
    ]
  }'
```

### Использование с Официальным Node.js SDK OpenAI
```typescript
import OpenAI from 'openai';

const apiKey = process.env.LOCAL_AI_API_KEY;
if (!apiKey) {
  throw new Error('Установите LOCAL_AI_API_KEY в ваш сгенерированный API_SECRET_KEY.');
}

const openai = new OpenAI({
  baseURL: 'http://localhost:8000/v1',
  apiKey,
});

const completion = await openai.chat.completions.create({
  model: 'llama3.2:3b',
  messages: [{ role: 'user', content: 'Объясните квантовые вычисления в одном предложении.' }],
});

console.log(completion.choices[0].message.content);
```

---

## Примеры

- [`examples/openai-compat/`](./examples/openai-compat): Готовый скрипт интеграции OpenAI SDK.
- [`examples/rag-example/`](./examples/rag-example): Сквозной RAG-конвейер с использованием векторной базы данных Qdrant и эмбеддингов Ollama.

---

## Документация

- [Обзор Архитектуры](./docs/architecture.md)
- [Справочник API Шлюза](./docs/api-reference.md)
- [Руководство по Конфигурации](./docs/configuration.md)
- [Настройка Ускорения GPU (Metal / CUDA)](./docs/gpu-setup.md)
- [Устранение Неполадок и Диагностика](./docs/troubleshooting.md)

---

## Вклад

Вклад приветствуется! Ознакомьтесь с [CONTRIBUTING.md](./CONTRIBUTING.md), чтобы начать.

## Лицензия

[MIT](./LICENSE) © 2026 участники local-ai-stack
