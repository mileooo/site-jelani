const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8'
};

const ORDER_TTL_SECONDS = 60 * 60 * 24 * 3;

const FLOW_STEPS = {
  pickup: [
    { label: 'Заказ создан', detail: 'Заказ ушел на кухню.' },
    { label: 'Принят', detail: 'Команда JELANI подтвердила заказ.' },
    { label: 'Готовим', detail: 'Заказ сейчас готовится.' },
    { label: 'Готов к самовывозу', detail: 'Заказ можно забирать.' },
    { label: 'Получен', detail: 'Заказ выдан клиенту.', terminal: true }
  ],
  delivery: [
    { label: 'Заказ создан', detail: 'Заказ ушел на кухню.' },
    { label: 'Принят', detail: 'Команда JELANI подтвердила заказ.' },
    { label: 'Готовим', detail: 'Заказ сейчас готовится.' },
    { label: 'Передан курьеру', detail: 'Заказ передан в доставку.' },
    { label: 'В пути', detail: 'Курьер едет к клиенту.' },
    { label: 'Получен', detail: 'Заказ доставлен клиенту.', terminal: true }
  ]
};

const ADMIN_ACTIONS = {
  pickup: ['Принять заказ', 'Готовим', 'Готов к самовывозу', 'Выдан клиенту'],
  delivery: ['Принять заказ', 'Готовим', 'Передан курьеру', 'В пути', 'Доставлен']
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

function normalizeRussianPhone(phone) {
  const digits = String(phone || '').replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('8')
    ? `7${digits.slice(1)}`
    : digits;
}

function validateRussianPhone(phone) {
  return /^79\d{9}$/.test(normalizeRussianPhone(phone));
}

function orderFlow(delivery) {
  return String(delivery || '').toLowerCase().includes('достав') ? 'delivery' : 'pickup';
}

function flowDelivery(flow) {
  return flow === 'delivery' ? 'Доставка' : 'Самовывоз';
}

function flowSteps(flow) {
  return FLOW_STEPS[flow] || FLOW_STEPS.pickup;
}

function statusFromStep(flow, step) {
  if (step === 'cancel') {
    return {
      statusIndex: -1,
      status: 'Отменен',
      detail: 'Заказ отменен.',
      canceled: true,
      terminal: true
    };
  }

  const steps = flowSteps(flow);
  const index = Math.max(0, Math.min(Number(step) || 0, steps.length - 1));
  const current = steps[index] || steps[0];

  return {
    statusIndex: index,
    status: current.label,
    detail: current.detail,
    canceled: false,
    terminal: Boolean(current.terminal)
  };
}

function statusPayload(record) {
  return {
    id: record.id,
    flow: record.flow,
    delivery: flowDelivery(record.flow),
    statusIndex: record.statusIndex,
    status: record.status,
    detail: record.detail,
    steps: flowSteps(record.flow),
    terminal: Boolean(record.terminal),
    canceled: Boolean(record.canceled),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    total: record.total || 0
  };
}

function orderKey(orderId) {
  return `order:${orderId}`;
}

async function readOrderStatus(env, orderId) {
  if (!env.ORDER_STATUS) return null;
  const raw = await env.ORDER_STATUS.get(orderKey(orderId));
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

async function saveOrderStatus(env, record) {
  if (!env.ORDER_STATUS) return false;
  await env.ORDER_STATUS.put(orderKey(record.id), JSON.stringify(record), {
    expirationTtl: ORDER_TTL_SECONDS
  });
  return true;
}

function validateOrder(order) {
  if (!order || typeof order !== 'object') throw new ValidationError('Некорректный заказ');
  if (!order.name) throw new ValidationError('Нужно указать имя');
  if (!validateRussianPhone(order.phone)) throw new ValidationError('Укажите российский мобильный номер в формате +7 9XX XXX-XX-XX');
  if (!Array.isArray(order.items) || order.items.length === 0) throw new ValidationError('Корзина пустая');
  if (order.delivery === 'Доставка' && !order.address) throw new ValidationError('Нужен адрес доставки');
  if (order.promo) {
    const profilePhone = normalizeRussianPhone(order.profile?.phone);
    const orderPhone = normalizeRussianPhone(order.phone);
    if (!order.profile?.authorized || !validateRussianPhone(profilePhone) || profilePhone !== orderPhone) {
      throw new ValidationError('Промокод доступен только после входа в личный кабинет');
    }
  }
}

function orderMessage(order) {
  const items = order.items.map((item, index) => {
    const qty = Number(item.qty || 1);
    const details = item.details ? `\n   ${escapeHtml(item.details)}` : '';
    return `${index + 1}. ${escapeHtml(item.name)} x ${qty} - ${formatPrice(Number(item.price || 0) * qty)}${details}`;
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
    Number(order.discount) > 0 ? `<b>Скидка:</b> -${formatPrice(order.discount)}` : '',
    `<b>Итого:</b> ${formatPrice(order.total)}`
  ].filter(Boolean).join('\n');
}

function statusKeyboard(order, selectedIndex = 0) {
  const flow = order.flow || orderFlow(order.delivery);
  const orderId = order.id;
  const actions = ADMIN_ACTIONS[flow] || ADMIN_ACTIONS.pickup;
  const rows = actions.map((label, index) => {
    const step = index + 1;
    const active = Number(selectedIndex) === step;
    return [{
      text: `${active ? '✓ ' : ''}${label}`,
      callback_data: `o:${orderId}:${flow}:${step}`
    }];
  });

  return {
    inline_keyboard: [
      ...rows,
      [{ text: 'Отменить заказ', callback_data: `o:${orderId}:${flow}:cancel` }]
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

function telegramChatIds(env) {
  const raw = [env.TELEGRAM_CHAT_ID, env.TELEGRAM_CHAT_IDS].filter(Boolean).join(',');
  return [...new Set(String(raw).split(/[,\s;]+/).map(value => value.trim()).filter(Boolean))];
}

async function sendOrderMessages(env, order) {
  const chatIds = telegramChatIds(env);
  if (!chatIds.length) throw new Error('TELEGRAM_CHAT_ID не задан');

  const messages = [];
  for (const chatId of chatIds) {
    const result = await telegram(env, 'sendMessage', {
      chat_id: chatId,
      text: orderMessage(order),
      parse_mode: 'HTML',
      reply_markup: statusKeyboard(order)
    });
    messages.push({ chatId: String(chatId), messageId: result.message_id });
  }
  return messages;
}

function messageRefs(previous, query) {
  const refs = Array.isArray(previous?.messages) ? [...previous.messages] : [];
  if (query?.message?.chat?.id && query?.message?.message_id) {
    refs.push({ chatId: String(query.message.chat.id), messageId: query.message.message_id });
  }

  const seen = new Set();
  return refs.filter(ref => {
    const key = `${ref.chatId}:${ref.messageId}`;
    if (!ref.chatId || !ref.messageId || seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

async function editOrderMessages(env, record, query) {
  const refs = messageRefs(record, query);
  const replyMarkup = record.terminal
    ? { inline_keyboard: [] }
    : statusKeyboard({ id: record.id, flow: record.flow }, record.statusIndex);

  await Promise.all(refs.map(async ref => {
    try {
      await telegram(env, 'editMessageReplyMarkup', {
        chat_id: ref.chatId,
        message_id: ref.messageId,
        reply_markup: replyMarkup
      });
    } catch {
      // One unavailable chat must not block status updates for the other chats.
    }
  }));
}

async function ensureTelegramWebhook(request, env) {
  if (env.TELEGRAM_AUTO_WEBHOOK === 'off') return;

  const origin = new URL(request.url).origin;
  const webhookUrl = `${origin}/api/telegram-webhook`;

  try {
    await telegram(env, 'setWebhook', {
      url: webhookUrl,
      allowed_updates: ['callback_query']
    });
  } catch {
    // Заказ не должен падать, если Telegram временно не дал обновить webhook.
  }
}

function createOrderRecord(order, messages) {
  const flow = orderFlow(order.delivery);
  const now = new Date().toISOString();
  const status = statusFromStep(flow, 0);

  return {
    id: order.id,
    flow,
    messageId: messages[0]?.messageId,
    messages,
    trackToken: order.trackingToken || '',
    total: Number(order.total || 0),
    createdAt: now,
    updatedAt: now,
    ...status
  };
}

async function handleOrder(request, env) {
  const order = await request.json();
  validateOrder(order);

  await ensureTelegramWebhook(request, env);

  const messages = await sendOrderMessages(env, order);
  const record = createOrderRecord(order, messages);
  const tracking = await saveOrderStatus(env, record);

  return json({
    ok: true,
    messageId: messages[0]?.messageId,
    messages,
    recipients: messages.length,
    tracking,
    status: statusPayload(record)
  });
}

async function handleOrderStatus(request, env) {
  if (!env.ORDER_STATUS) {
    return json({ ok: false, error: 'ORDER_STATUS storage is not configured' }, 503);
  }

  const url = new URL(request.url);
  const orderId = url.searchParams.get('id');
  const trackToken = url.searchParams.get('track');

  if (!orderId || !trackToken) {
    throw new ValidationError('Нужен номер заказа и код отслеживания');
  }

  const record = await readOrderStatus(env, orderId);
  if (!record) return json({ ok: false, error: 'Заказ не найден' }, 404);
  if (record.trackToken && record.trackToken !== trackToken) {
    return json({ ok: false, error: 'Нет доступа к заказу' }, 403);
  }

  return json({ ok: true, status: statusPayload(record) });
}

async function handleTelegramWebhook(request, env) {
  const update = await request.json();
  const query = update.callback_query;

  if (!query?.data?.startsWith('o:')) {
    return json({ ok: true });
  }

  const [, orderId, rawFlow, step] = query.data.split(':');
  const flow = rawFlow === 'delivery' ? 'delivery' : 'pickup';
  const updateStatus = statusFromStep(flow, step);
  const previous = await readOrderStatus(env, orderId);
  const record = {
    id: orderId,
    flow,
    trackToken: previous?.trackToken || '',
    messageId: previous?.messageId || query.message?.message_id,
    messages: messageRefs(previous, query),
    total: previous?.total || 0,
    createdAt: previous?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    ...updateStatus
  };

  await saveOrderStatus(env, record);

  await telegram(env, 'answerCallbackQuery', {
    callback_query_id: query.id,
    text: `Статус ${orderId}: ${record.status}`
  });

  await editOrderMessages(env, record, query);

  return json({ ok: true, status: statusPayload(record) });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname === '/api/order') {
        if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);
        return await handleOrder(request, env);
      }

      if (url.pathname === '/api/order-status') {
        if (request.method !== 'GET') return json({ ok: false, error: 'Method not allowed' }, 405);
        return await handleOrderStatus(request, env);
      }

      if (url.pathname === '/api/telegram-webhook') {
        if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);
        return await handleTelegramWebhook(request, env);
      }

      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }

      return new Response('Not found', { status: 404 });
    } catch (error) {
      const status = error instanceof SyntaxError ? 400 : error.status || 500;
      return json({ ok: false, error: error.message }, status);
    }
  }
};
