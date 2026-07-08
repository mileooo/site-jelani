const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS
  });
}

class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
    this.status = 400;
  }
}

function escapeHtml(value = '') {
  return String(value).replace(/[&<>"']/g, char => ({
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

function validateRussianPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  const normalized = digits.length === 11 && digits.startsWith('8')
    ? `7${digits.slice(1)}`
    : digits;

  return /^79\d{9}$/.test(normalized);
}

function validateOrder(order) {
  if (!order || typeof order !== 'object') throw new ValidationError('Некорректный заказ');
  if (!order.name) throw new ValidationError('Нужно указать имя');
  if (!validateRussianPhone(order.phone)) throw new ValidationError('Укажите российский мобильный номер в формате +7 9XX XXX-XX-XX');
  if (!Array.isArray(order.items) || order.items.length === 0) throw new ValidationError('Корзина пустая');
  if (order.delivery === 'Доставка' && !order.address) throw new ValidationError('Нужен адрес доставки');
}

function orderMessage(order) {
  const items = order.items.map((item, index) => {
    const qty = Number(item.qty || 1);
    const details = item.details ? `\n   ${escapeHtml(item.details)}` : '';
    return `${index + 1}. ${escapeHtml(item.name)} x ${qty} — ${formatPrice(Number(item.price || 0) * qty)}${details}`;
  }).join('\n');

  return [
    `<b>Новый заказ ${escapeHtml(order.id)}</b>`,
    '',
    `<b>Клиент:</b> ${escapeHtml(order.name)}`,
    `<b>Телефон:</b> ${escapeHtml(order.phone)}`,
    `<b>Получение:</b> ${escapeHtml(order.delivery)}`,
    order.address ? `<b>Адрес:</b> ${escapeHtml(order.address)}` : '',
    `<b>Оплата:</b> ${escapeHtml(order.payment)}`,
    order.comment ? `<b>Комментарий:</b> ${escapeHtml(order.comment)}` : '',
    order.promo ? `<b>Промокод:</b> ${escapeHtml(order.promo)}` : '',
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

async function telegram(env, method, payload) {
  if (!env.TELEGRAM_BOT_TOKEN) throw new Error('TELEGRAM_BOT_TOKEN не задан');

  const response = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(payload)
  });
  const data = await response.json();
  if (!data.ok) throw new Error(data.description || 'Telegram API error');
  return data.result;
}

export async function onRequestPost({ request, env }) {
  try {
    const order = await request.json();
    validateOrder(order);

    if (!env.TELEGRAM_CHAT_ID) throw new Error('TELEGRAM_CHAT_ID не задан');

    const result = await telegram(env, 'sendMessage', {
      chat_id: env.TELEGRAM_CHAT_ID,
      text: orderMessage(order),
      parse_mode: 'HTML',
      reply_markup: statusKeyboard(order)
    });

    return json({ ok: true, messageId: result.message_id });
  } catch (error) {
    const status = error instanceof SyntaxError ? 400 : error.status || 500;
    return json({ ok: false, error: error.message }, status);
  }
}

export function onRequest() {
  return json({ ok: false, error: 'Method not allowed' }, 405);
}
