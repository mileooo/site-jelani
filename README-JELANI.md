# JELANI запуск заказов

## Что уже работает

- Корзина, комбо, конструктор шаурмы/сэндвича.
- Форма оформления: имя, телефон, самовывоз/доставка, адрес только для доставки и комментарий.
- Промокод `JELANI10`: скидка 10% на первый заказ в этом браузере.
- Допродажи в корзине: фри, напиток, соус, сыр.
- Быстрый блок из трёх актуальных позиций меню с добавлением за один клик.
- Персональный повтор последнего заказа с перепроверкой цены и доступности.
- Раздел «Мои заказы»: сохранение нескольких сборок, повтор, редактирование, переименование и удаление.
- Сохранённые заказы синхронизируются с D1 через `/api/saved-orders`; браузер хранит локальный кэш для быстрого интерфейса.
- После каждого нового заказа сервер выдаёт один случайный бонус с весами, сроком действия и одноразовым применением.
- Активный JELANI DROP загружается из D1, автоматически скрывается после окончания и учитывает остаток.
- Вкусовой профиль и персональные комбо формируются по реальным позициям и модификаторам заказов.
- Профиль клиента работает через серверную сессию: вход по SMS и Telegram, привязка VK и Mail.ru, адреса, история, выход и удаление профиля.
- MAX подключается тем же OAuth-маршрутом после выдачи официальных адресов и ключей приложения.
- Быстрые фильтры поиска: острое, с говядиной, до 300 ₽, без мяса, на двоих, комбо.
- Статус точки по времени: открыто до 21:45 или заказы с 9:00.
- Серверная отправка оплаченных заказов в Telegram без хранения токена в браузере.
- Онлайн-предоплата через YooKassa: банковская карта и СБП, серверные уведомления, защита от повторной обработки и полный возврат через администратора.
- Оплата наличными при получении доступна только для самовывоза и дополнительно проверяется сервером.
- Неоплаченный заказ не отправляется в Telegram и не учитывается в статистике покупок, бонусах и вкусовом профиле.

## Как включить Telegram

### Локально на компьютере

1. Скопируйте `.env.example` в `.env`.
2. Вставьте токен бота в `TELEGRAM_BOT_TOKEN`.
3. Вставьте ID чата или группы в `TELEGRAM_CHAT_ID`.
4. Добавьте Telegram ID сотрудников в `TELEGRAM_OPERATOR_IDS` через запятую.
5. Запустите:

```bash
node server.js
```

6. Откройте сайт:

```text
http://localhost:8787
```

Локальный `server.js` показывает интерфейс, но намеренно не принимает оплату и не отправляет заказы на кухню. Полный платёжный сценарий работает в Cloudflare Worker с D1.

### На Cloudflare Pages

1. Загрузите проект вместе с `_worker.js`, `wrangler.toml` и папкой `functions`.
2. В Cloudflare откройте проект: `Workers & Pages -> JELANI -> Settings -> Variables and Secrets`.
3. Добавьте переменные:

```text
TELEGRAM_BOT_TOKEN
TELEGRAM_CHAT_ID
TELEGRAM_CHAT_IDS
TELEGRAM_OPERATOR_IDS
ADMIN_API_TOKEN
AUTH_SECRET
SMSRU_API_ID
SMSRU_FROM
TELEGRAM_BOT_USERNAME
VK_CLIENT_ID
VK_CLIENT_SECRET
OK_CLIENT_ID
OK_CLIENT_SECRET
MAILRU_CLIENT_ID
MAILRU_CLIENT_SECRET
MAX_BOT_TOKEN
MAX_MINI_APP_URL
YOOKASSA_SHOP_ID
YOOKASSA_SECRET_KEY
YOOKASSA_PAYMENT_METHODS
YOOKASSA_RECEIPTS
YOOKASSA_VAT_CODE
YOOKASSA_PAYMENT_SUBJECT
PUBLIC_SITE_URL
PAYMENT_CREATION_TIMEOUT_MINUTES
```

`TELEGRAM_CHAT_ID` подходит для основного получателя. Если заказ должен приходить еще кому-то, добавьте `TELEGRAM_CHAT_IDS`. В `TELEGRAM_OPERATOR_IDS` перечислите ID сотрудников, которым разрешено менять статусы. Без этого списка кнопки статусов не выполняют действия.

`ADMIN_API_TOKEN` защищает управление бонусами, DROP и возвратами. Используйте 64 шестнадцатеричных символа; токен нельзя добавлять в клиентский код.

`YOOKASSA_SECRET_KEY` хранится только в секретах Worker. Для `YOOKASSA_PAYMENT_METHODS` используйте `bank_card,sbp`. Если чеки формирует YooKassa, включите `YOOKASSA_RECEIPTS=true`, укажите корректный для вашей системы налогообложения `YOOKASSA_VAT_CODE` и проверьте `YOOKASSA_PAYMENT_SUBJECT` с бухгалтером. До этого оставьте `YOOKASSA_RECEIPTS=false`.

4. Создайте Cloudflare D1 database `jelani-db` и добавьте к Worker binding:

```text
DB
```

Таблицы клиентов, способов входа, сессий, SMS-кодов, адресов, заказов, сохранённых сборок, бонусов, DROP, вкусовых профилей, сообщений Telegram и истории статусов создаются автоматически при первом обращении. Файл `schema.sql` содержит ту же схему для ручной проверки. Старый KV binding `ORDER_STATUS` можно временно оставить: он используется только для заказов, созданных до перехода на D1.

## Авторизация

Сессия хранится в `HttpOnly` cookie, а личные данные и способы входа — в D1. Задайте `AUTH_SECRET` длиной не менее 32 символов. Для SMS нужен ключ `SMSRU_API_ID`; на localhost код возвращается только при `DEVELOPMENT_MODE=true`. На боевом домене код никогда не попадает в ответ API. Telegram использует `TELEGRAM_BOT_TOKEN` и имя бота из `TELEGRAM_BOT_USERNAME`. Для Telegram Login Widget домен `jjelani.ru` должен быть привязан к боту через BotFather (`/setdomain`).

Для VK, Одноклассников и Mail.ru создайте приложения и добавьте точные callback-адреса:

```text
https://jjelani.ru/api/auth/oauth/callback/vk
https://jjelani.ru/api/auth/oauth/callback/ok
https://jjelani.ru/api/auth/oauth/callback/mail
```

VK и Одноклассники используют VK ID OAuth 2.1 с PKCE. Для кнопки Одноклассников создайте отдельное приложение VK ID для сценария OK и сохраните его ID в `OK_CLIENT_ID`. Для Mail.ru используются `https://oauth.mail.ru/login`, `https://oauth.mail.ru/token`, `https://oauth.mail.ru/userinfo` и scope `userinfo`; их можно переопределить переменными `MAILRU_*`.

У MAX сейчас используется официальный сценарий мини-приложения, а не выдуманный web OAuth. Создайте чат-бота и мини-приложение в MAX для бизнеса, укажите `https://jjelani.ru/` как URL приложения, сохраните токен в `MAX_BOT_TOKEN`, а ссылку запуска — в `MAX_MINI_APP_URL`. Сервер проверяет подпись и срок `WebAppData` до создания сессии. Старые переменные `MAX_CLIENT_*` оставлены только для будущего официального OAuth.

При входе в уже авторизованный профиль новый способ автоматически привязывается. Если подтверждённый номер совпадает, сервер объединяет заказы, адреса, бонусы и сохранённые сборки в один профиль. Секреты провайдеров никогда не передаются в браузер.

Клиентские маршруты этапа 4:

```text
GET          /api/auth/config
POST         /api/auth/phone/request
POST         /api/auth/phone/verify
POST         /api/auth/telegram
POST         /api/auth/max
GET          /api/auth/oauth/start
GET          /api/auth/oauth/callback/{provider}
GET/DELETE   /api/auth/session
GET/PATCH/DELETE /api/account
```

Административные маршруты:

```text
GET/PATCH  /api/admin/bonuses
GET/POST   /api/admin/drops
PATCH      /api/admin/drops/{id}
POST       /api/admin/refunds
GET/POST   /api/admin/payments
```

Передавайте токен в заголовке `Authorization: Bearer ADMIN_API_TOKEN`. Через эти маршруты меняются вероятности бонусов, сроки, условия и расписание DROP.

Проверка после деплоя:

```text
https://jjelani.ru/api/health
```

Рабочая конфигурация возвращает `database: true`, `statusStorage: "d1"`, `telegram: true`, нужные значения в `authProviders`, `onlinePaymentConfigured: true`, `paymentProvider: "yookassa"` и `orderingAvailable: true`.

## Онлайн-оплата

1. Заключите договор с YooKassa и включите в магазине банковские карты и СБП.
2. Скопируйте `shopId` в `YOOKASSA_SHOP_ID`, выпустите секретный ключ API и сохраните его только как `YOOKASSA_SECRET_KEY` в Cloudflare.
3. Установите `YOOKASSA_PAYMENT_METHODS=bank_card,sbp` и `PUBLIC_SITE_URL=https://jjelani.ru`.
4. Если чеки формирует YooKassa, согласуйте НДС и предмет расчёта с бухгалтером, затем включите `YOOKASSA_RECEIPTS=true`. До этого оставьте `false`.

В личном кабинете YooKassa добавьте URL уведомлений:

```text
https://jjelani.ru/api/yookassa-webhook
```

Включите события `payment.succeeded`, `payment.canceled`, `refund.succeeded` и `refund.canceled`. Обработчик не доверяет данным из уведомления: он повторно запрашивает платёж или возврат у YooKassa и сверяет номер заказа, валюту и сумму. Один и тот же webhook можно присылать повторно без повторного заказа на кухне.

Worker дополнительно сверяет незавершённые платежи каждые пять минут. Это страхует заказы при задержке webhook. Попытка без созданного платежа автоматически отменяется через `PAYMENT_CREATION_TIMEOUT_MINUTES`, освобождая зарезервированный бонус и остаток DROP. Для ручной сверки отправьте `POST /api/admin/payments` с телом `{"action":"reconcile"}` и административным токеном.

Клиентские платёжные маршруты:

```text
GET   /api/payment/config
POST  /api/order
GET   /api/payment/status?id=JL-...&track=...
POST  /api/yookassa-webhook
```

Полный возврат остатка выполняется администратором. `requestId` должен быть новым для операции; повтор с тем же значением безопасно возвращает состояние уже созданного возврата:

```bash
curl -X POST https://jjelani.ru/api/admin/refunds \
  -H "Authorization: Bearer ADMIN_API_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"orderId":"JL-1234567","requestId":"refund-20260717-001","reason":"Отмена клиентом"}'
```

5. После деплоя заказы будут уходить на маршрут:

```text
/api/order
```

Webhook для кнопок Telegram выставляется автоматически при новом заказе. Если нужно поставить вручную, используйте:

```text
https://ВАШ-ДОМЕН/api/telegram-webhook
```

Пример:

```text
https://jelani.pages.dev/api/telegram-webhook
```

Если проект подключён к GitHub и Cloudflare запускает `npx wrangler deploy`, файл `wrangler.toml` должен лежать в корне репозитория. Без него build падает на этапе Deploying.
