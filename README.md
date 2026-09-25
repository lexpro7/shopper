# Shopper — Buy & Sell Marketplace

Полноценное локальное demo marketplace-приложение с собственным брендом, адаптивным интерфейсом и реальной SQLite persistence. Интерфейс на английском, цены в CHF. Все объявления, продавцы и операции — демонстрационные.

## Быстрый запуск

Требования: Node.js **22.12+** (проверено на 22.21), npm 10+, современный браузер. Интернет нужен при первой установке зависимостей и Prisma engine. Seed-фотографии включены в `public/images`, поэтому для обычного просмотра внешний доступ к изображениям не требуется.

```bash
npm install
npm run dev
```

Откройте **http://127.0.0.1:3000**. На Windows PowerShell с запретом `.ps1` используйте `npm.cmd install` и `npm.cmd run dev`.

`postinstall` автоматически копирует `.env.example` в `.env`, если его ещё нет, генерирует Prisma Client, создаёт таблицы и запускает идемпотентный seed. Существующие записи не перезаписываются. Пустой SQLite-файл создаётся заранее для совместимости с Windows.

Отдельные команды:

```bash
npx prisma generate
npx prisma db push
npm run seed
npm run db:setup
npm run lint
npm run typecheck
npm run build
npm start
```

Production-сервер по умолчанию также слушает `127.0.0.1:3000`. Остановите dev-сервер перед `npm start`. Это production-сборка **demo-приложения**, а не готовая инфраструктура для реальных платежей и публичного коммерческого запуска.

## Demo-доступ

| Пользователь | Email             | Пароль       | Роль                 |
| ------------ | ----------------- | ------------ | -------------------- |
| Alex Martin  | alex@example.com  | Seconda2026! | Admin, buyer, seller |
| Léa Dubois   | lea@example.com   | Seconda2026! | Buyer, seller        |
| Marco Rossi  | marco@example.com | Seconda2026! | Buyer, seller        |
| Nina Keller  | nina@example.com  | Seconda2026! | Buyer, seller        |
| Tom Weber    | tom@example.com   | Seconda2026! | Buyer, seller        |

При `DEMO_MODE=true` посетителю без cookie доступен общий аккаунт Alex. Это позволяет сразу исследовать наполненный кабинет. Регистрация создаёт отдельного пользователя; вход меняет активный аккаунт через подписанную HTTP-only cookie. Пароли хешируются `scrypt` с солью. Seed-пароль публичен по назначению; не используйте его для реальных аккаунтов.

## Что реализовано

- Главная: editorial hero, категории, рекомендации, новые и популярные объявления, аукционы, продавцы, история просмотра и sell CTA.
- Каталог: поиск, локальные подсказки и история запросов, категории/подкатегории, цена, состояние, бренд, рейтинг, формат продажи, местоположение, доставка, pickup, доступность, сортировка, пагинация, grid/list. Фильтры в URL, mobile drawer.
- Объявление: галерея, характеристики, продавец, отзывы, доставка, избранное, quantity, корзина, buy now, offer dialog, report, ставки с server validation, countdown и история ставок.
- Корзина: SQLite persistence, количество, удаление, сохранение в избранное, доставка, промокод **HELLO10**.
- Checkout: контакт, полный адрес, способ доставки, Card/TWINT/PayPal, подтверждение mock payment, транзакционное списание количества, order success и история заказов. Суммы хранятся в целых раппенах; итог рассчитывается сервером.
- Кабинет: dashboard, покупки, продажи, детали заказа/timeline, запрос возврата/спора, отзывы, объявления и их состояния, избранное, предложения, аукционы, сообщения, адреса, уведомления, сохранённые поиски, настройки и безопасность.
- Продажа: восемь шагов, localStorage draft, URL photo preview, fixed price/auction, характеристики, доставка, preview, публикация и редактирование через общую форму.
- Общение: сохранение сообщений, привязка к товару, mobile list/chat, block/unblock, offer/report dialogs и demo attachment label.
- Админка: динамические метрики, график инвентаря, пользователи, объявления, заказы, платежи, категории, отчёты, споры, отзывы, продвижения, поддержка и настройки. Approve/reject/hide, suspend/restore, resolve сохраняются в базе.
- Help Center, FAQ, поиск помощи, Trust & Safety, protection, report/contact, юридические demo-страницы.
- Loading skeletons, empty/error/404 states, toast feedback, доступные Radix dialogs с focus trap, keyboard focus, labels, semantic headings, metadata.

## Стек и структура

### Брендинг

Пользовательский бренд — **Shopper**. Header и footer используют общий `BrandLogo`: исходное прикреплённое изображение сохранено без изменений в `public/brand/shopper-logo.png`, слева от названия, без рамки и с сохранением пропорций. `app/icon.png` и `app/apple-icon.png` — уменьшенные копии того же изображения для App Router file-based metadata. Основной title, Open Graph title/description и siteName настроены в `app/layout.tsx`; вымышленный production URL не задан.

Технические ключи `seconda-*` и существующий demo-пароль сохранены для совместимости с созданными аккаунтами, сессиями, черновиками и предпочтениями.

Next.js 16.3.6 (stable при установке), App Router, React 19, TypeScript, Tailwind CSS 4, shadcn-compatible UI primitives (CVA, Radix Slot/Dialog), Lucide, Prisma 6.19, SQLite, Zod, React Hook Form, Sonner, ESLint, Prettier, Playwright. Точные версии закреплены в `package-lock.json`.

Prisma 6 выбран как стабильный вариант с встроенным SQLite engine, без отдельного native adapter. Код доступа к данным изолирован в `lib/db.ts` и `lib/queries.ts`. Для исправления audit advisory транзитивная `deepmerge-ts` переопределена на 8.x; Prisma generate, db push и seed проверены с этой версией.

```text
app/                       App Router pages, metadata, error/loading/404
  api/[resource]/          HTTP read/write API
  category/, listing/      Category/listing and listing edit routes
  profile/                 Buyer/seller account routes
  admin/[[...path]]/        Admin routes, server-side role check
components/
  ui/                      Buttons, inputs, dialogs, badges, tabs, states
  layout/                  Header, search, footer, mobile navigation
  marketplace/             Provider, cards, image fallback, seller, content
  catalog/                 URL-driven filters, sort, layout, pagination
  listing/                 Detail, gallery, bidding, selling wizard
  checkout/                Cart and validated checkout
  profile/                 Domain-specific account/admin components
lib/                       Prisma client, queries, session and Zod schemas
types/                     Shared typed entity payloads
data/                      Seed catalog, content, local photo manifest
prisma/                    18-model schema, seed, ignored local database
public/images/             Local illustrative product/editorial photography
scripts/                   Setup and image/visual utilities
tests/                     Browser and API regression scenarios
```

Server Components загружают Prisma-данные; Client Components отвечают за взаимодействие. Контекст `Provider` читает `/api/account` и обновляет состояние после мутаций. Основные бизнес-операции проходят через API; браузерное хранилище используется для черновиков, истории и demo-предпочтений.

## Environment

```dotenv
DATABASE_URL="file:./dev.db"
DEMO_MODE="true"
# Для отдельного закрытого окружения задайте собственный случайный ключ:
# SESSION_SECRET="..."
```

SQLite URL разрешается относительно `prisma/schema.prisma`: по умолчанию это `prisma/dev.db`. `.env`, БД, node_modules, .next и тестовые артефакты исключены из git. Не коммитьте реальные секреты. `DEMO_MODE=false` отключает гостевой fallback Alex; необходима регистрация/авторизация. Перед публичным запуском обязательны настоящий session secret, production authentication, rate limiting и отключение публичных seed-аккаунтов.

## API

JSON POST используется для изменений, GET — для чтения. Ошибки возвращают `{ "error": "..." }`. Формы и обработчики валидируют ввод. Доступ к собственным сообщениям, объявлениям и заказам проверяется на сервере; admin требует роль ADMIN. Проверка Origin/Host защищает browser mutations от сторонних origins.

| Маршрут                                                     | Назначение                                                 |
| ----------------------------------------------------------- | ---------------------------------------------------------- |
| GET `/api/listings`, `/api/search?q=...`, `/api/categories` | Public catalog data                                        |
| GET `/api/account`                                          | Current user and related account data, без password hashes |
| POST `/api/auth`                                            | register, login, logout, demo recovery                     |
| POST `/api/listings`                                        | Create/edit/duplicate/pause/archive/sold/promote           |
| POST `/api/cart`, `/api/favorites`                          | Cart quantity and favorite toggle                          |
| POST `/api/orders`                                          | Transactional mock checkout                                |
| POST `/api/bids`, `/api/offers`                             | Bids and negotiated offers                                 |
| POST `/api/messages`, `/api/reviews`                        | Conversations and purchase reviews                         |
| POST `/api/searches`, `/api/notifications`                  | Saved queries and read status                              |
| POST `/api/addresses`, `/api/settings`, `/api/security`     | Account management                                         |
| POST `/api/reports`, `/api/disputes`, `/api/order-status`   | Support and fulfilment demo                                |
| POST `/api/admin`                                           | Moderation                                                 |

## Проверки

```bash
npm run lint
npm run typecheck
npm run build
npm test
```

Playwright использует установленный Google Chrome (`channel: chrome`). Если Chrome отсутствует, установите его или замените channel в `playwright.config.ts` на установленный Playwright Chromium (`npx playwright install chromium`). Сервер тестов запускается автоматически либо используется уже работающий `127.0.0.1:3000`.

Проверяются поиск/фильтры/сортировка, избранное, quantity/promo/checkout/order success, сообщения, ставки и отказ для низкой ставки, offers, публикация/архивирование, регистрация/login/ownership, все разделы и ширины **375, 430, 768, 1024, 1280, 1440**. Тесты выполняют реальные demo-мутации: создают тестовые аккаунты/заказы, архивированные fixture-объявления, сообщения и ставки. Используйте отдельную копию проекта/БД для тестов поверх уже наполненного личного demo.

`node scripts/visual-check.mjs` при работающем dev-сервере сохраняет desktop/mobile screenshots в `artifacts/`; HTML-отчёт тестов находится в `playwright-report/`.

## Светлая и тёмная тема

В header доступно меню **Light / Dark / System** с иконками Sun, Moon и Monitor; такой же выбор находится в **Profile → Settings → Appearance** (`/profile/settings`). По умолчанию выбран System. Настройка сохраняется в `localStorage` (`shopper-theme`), синхронизируется между вкладками и применяется без перезагрузки.

Используются `next-themes` и доступное с клавиатуры меню Radix UI. Провайдер подключён в `app/layout.tsx`, компоненты темы находятся в `components/theme/`, общие цветовые токены — в `app/theme.css`. Тема применяется до гидратации; изображения товаров и логотип не изменяются. Browser `theme-color` следует выбранной теме.

`npm test -- tests/theme.spec.ts` проверяет переключение, системные настройки, сохранение, раннюю загрузку и основные страницы на ширинах 375, 768, 1280 и 1440 px. Эти проверки не изменяют данные пользователя.

## Demo-ограничения и подключение сервисов

- Оплаты не выполняются. Card/TWINT/PayPal — только выбор mock метода; платёжные реквизиты не собираются.
- Email recovery, email/phone verification, 2FA, уведомления вне приложения и доставка не подключены. Эти экраны прямо обозначены как demo. Изменение пароля для авторизованного пользователя работает.
- Сообщения обновляются после действий и загрузки страницы; WebSocket/realtime и реальный upload вложений отсутствуют. Photo UI использует URL/preview, не загружает пользовательские файлы.
- Дедлайн и валидация ставки работают. Won/Lost вычисляются по времени и текущей ставке; автоматическое закрытие/settlement аукциона и создание заказа победителя требуют фонового сервиса.
- Принятие offer сохраняет статус переговоров; не запускает настоящий платёж и не резервирует остаток.
- UI языков сохраняет предпочтение; полный перевод строк и конвертация валют не подключены. Follow, preferences, draft/recent history хранятся на устройстве. Privacy/2FA switches — явно обозначенные demo-предпочтения.
- Verification, seller rating и часть профиля — sample data. Изображения иллюстративные, могут отличаться от точной модели товара. Источники перечислены в seed и `data/image-manifest.json`; chair fallback использует Unsplash `photo-1503602642458-232111445657`.
- Сохранённые поиски показывают локальные совпадения; фоновые email alerts не рассылаются.
- Admin chart отображает число объявлений по категориям; финансовые суммы — только demo GMV/доставка. Нет реального комиссионного дохода.
- Списание остатка защищено транзакцией и условным обновлением; для публичной нагрузки потребуются idempotency keys, rate limits, журнал аудита, полноценные статусы fulfilment, escrow/refunds и интеграция платёжного провайдера.

Для PostgreSQL: замените provider/connection URL в Prisma schema, создайте миграции для PostgreSQL и перенесите данные. Модели используют переносимые scalar fields, строки статусов и integer money; приложение не использует SQLite SQL напрямую. В production также замените `db push`/auto-seed на контролируемый `prisma migrate deploy`, подключите объектное хранилище, email/SMS, background jobs и защищённую authentication-систему.
