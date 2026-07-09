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
    delivery: record.flow === 'delivery' ? 'Доставка' : 'Самовывоз',
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

function statusKeyboard(orderId, flow, selectedIndex = 0) {
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

export async function onRequestPost({ request, env }) {
  try {
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

    if (query.message) {
      await telegram(env, 'editMessageReplyMarkup', {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
        reply_markup: record.terminal
          ? { inline_keyboard: [] }
          : statusKeyboard(orderId, flow, record.statusIndex)
      });
    }

    return json({ ok: true, status: statusPayload(record) });
  } catch (error) {
    return json({ ok: false, error: error.message }, 500);
  }
}

export function onRequest() {
  return json({ ok: false, error: 'Method not allowed' }, 405);
}
