const http = require('http');
const fs = require('fs');
const path = require('path');

const ROOT = __dirname;

loadEnvFile();

const PORT = Number(process.env.PORT || 8787);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.ico': 'image/x-icon'
};

function loadEnvFile() {
  const file = path.join(ROOT, '.env');
  if (!fs.existsSync(file)) return;
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/);
  for (const line of lines) {
    const match = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/i);
    if (!match || process.env[match[1]]) continue;
    process.env[match[1]] = match[2].replace(/^["']|["']$/g, '');
  }
}

function sendJson(res, status, data) {
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(JSON.stringify(data));
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => {
      body += chunk;
      if (body.length > 200_000) {
        reject(new Error('Слишком большой заказ'));
        req.destroy();
      }
    });
    req.on('end', () => {
      try { resolve(JSON.parse(body || '{}')); }
      catch { reject(new Error('Некорректный JSON')); }
    });
    req.on('error', reject);
  });
}

function html(value) {
  return String(value || '').replace(/[&<>"']/g, char => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  }[char]));
}

function formatPrice(value) {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    maximumFractionDigits: 0
  }).format(Number(value || 0));
}

function validateOrder(order) {
  if (!order.name || !order.phone) throw new Error('Нужны имя и телефон');
  if (!Array.isArray(order.items) || order.items.length === 0) throw new Error('Корзина пустая');
  if (order.delivery === 'Доставка' && !order.address) throw new Error('Нужен адрес доставки');
}

function orderMessage(order) {
  const items = order.items.map((item, index) => {
    const details = item.details ? `\n   ${html(item.details)}` : '';
    return `${index + 1}. ${html(item.name)} x ${item.qty || 1} — ${formatPrice((item.price || 0) * (item.qty || 1))}${details}`;
  }).join('\n');

  return [
    `<b>Новый заказ ${html(order.id)}</b>`,
    '',
    `<b>Клиент:</b> ${html(order.name)}`,
    `<b>Телефон:</b> ${html(order.phone)}`,
    `<b>Получение:</b> ${html(order.delivery)}`,
    order.address ? `<b>Адрес:</b> ${html(order.address)}` : '',
    `<b>Оплата:</b> ${html(order.payment)}`,
    order.comment ? `<b>Комментарий:</b> ${html(order.comment)}` : '',
    order.promo ? `<b>Промокод:</b> ${html(order.promo)}` : '',
    '',
    '<b>Состав заказа:</b>',
    items,
    '',
    `<b>Товары:</b> ${formatPrice(order.subtotal)}`,
    Number(order.discount) > 0 ? `<b>Скидка:</b> −${formatPrice(order.discount)}` : '',
    `<b>Итого:</b> ${formatPrice(order.total)}`
  ].filter(Boolean).join('\n');
}

function statusKeyboard(order, index = 0) {
  const pickup = ['Принять заказ', 'Готовим', 'Ожидает самовывоза', 'Выдан', 'Завершить'];
  const delivery = ['Принять заказ', 'Готовим', 'Передать курьеру', 'В пути', 'Завершить'];
  const flow = order.delivery === 'Доставка' ? 'delivery' : 'pickup';
  const steps = flow === 'delivery' ? delivery : pickup;
  const next = steps[index] ? [[{
    text: steps[index],
    callback_data: `o:${order.id}:${flow}:${index + 1}`
  }]] : [];

  return {
    inline_keyboard: [
      ...next,
      [{ text: 'Отменить заказ', callback_data: `o:${order.id}:${flow}:cancel` }]
    ]
  };
}

async function telegram(method, payload) {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error('TELEGRAM_BOT_TOKEN не задан');

  const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!data.ok) throw new Error(data.description || 'Telegram API error');
  return data.result;
}

function telegramChatIds() {
  const raw = process.env.TELEGRAM_CHAT_IDS || process.env.TELEGRAM_CHAT_ID || '';
  return [...new Set(String(raw).split(/[,\s;]+/).map(value => value.trim()).filter(Boolean))];
}

async function sendOrder(order) {
  const chatIds = telegramChatIds();
  if (!chatIds.length) throw new Error('TELEGRAM_CHAT_ID не задан');

  return Promise.all(chatIds.map(chatId => telegram('sendMessage', {
      chat_id: chatId,
      text: orderMessage(order),
      parse_mode: 'HTML',
      reply_markup: statusKeyboard(order)
    })
  ));
}

async function handleTelegramWebhook(req, res) {
  const update = await readJson(req);
  const query = update.callback_query;
  if (!query?.data?.startsWith('o:')) return sendJson(res, 200, { ok: true });

  const [, orderId, flow, step] = query.data.split(':');
  const pickup = ['Заказ принят', 'Готовим', 'Ожидает самовывоза', 'Выдан', 'Завершён'];
  const delivery = ['Заказ принят', 'Готовим', 'Передан курьеру', 'В пути', 'Завершён'];
  const labels = flow === 'delivery' ? delivery : pickup;
  const canceled = step === 'cancel';
  const index = Number(step);
  const text = canceled ? `Заказ ${orderId} отменён` : `Статус ${orderId}: ${labels[index - 1] || 'обновлён'}`;

  await telegram('answerCallbackQuery', { callback_query_id: query.id, text });
  if (query.message && !canceled) {
    await telegram('editMessageReplyMarkup', {
      chat_id: query.message.chat.id,
      message_id: query.message.message_id,
      reply_markup: statusKeyboard({ id: orderId, delivery: flow === 'delivery' ? 'Доставка' : 'Самовывоз' }, index)
    });
  }
  return sendJson(res, 200, { ok: true });
}

function serveStatic(req, res) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const file = path.normalize(path.join(ROOT, pathname));
  if (!file.startsWith(ROOT)) {
    res.writeHead(403);
    return res.end('Forbidden');
  }
  fs.readFile(file, (error, content) => {
    if (error) {
      res.writeHead(404);
      return res.end('Not found');
    }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file).toLowerCase()] || 'application/octet-stream' });
    res.end(content);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (req.method === 'POST' && req.url === '/api/order') {
      const order = await readJson(req);
      validateOrder(order);
      await sendOrder(order);
      return sendJson(res, 200, { ok: true });
    }
    if (req.method === 'POST' && req.url === '/api/telegram-webhook') {
      return handleTelegramWebhook(req, res);
    }
    if (req.method === 'GET') return serveStatic(req, res);
    sendJson(res, 405, { ok: false, error: 'Method not allowed' });
  } catch (error) {
    sendJson(res, 500, { ok: false, error: error.message });
  }
});

server.listen(PORT, () => {
  console.log(`JELANI site: http://localhost:${PORT}`);
});
