const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8'
};

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

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS
  });
}

function orderKey(orderId) {
  return `order:${orderId}`;
}

function statusPayload(record) {
  const flow = record.flow === 'delivery' ? 'delivery' : 'pickup';
  return {
    id: record.id,
    flow,
    delivery: flow === 'delivery' ? 'Доставка' : 'Самовывоз',
    statusIndex: record.statusIndex,
    status: record.status,
    detail: record.detail,
    steps: FLOW_STEPS[flow],
    terminal: Boolean(record.terminal),
    canceled: Boolean(record.canceled),
    createdAt: record.createdAt,
    updatedAt: record.updatedAt,
    total: record.total || 0
  };
}

export async function onRequestGet({ request, env }) {
  if (!env.ORDER_STATUS) {
    return json({ ok: false, error: 'ORDER_STATUS storage is not configured' }, 503);
  }

  const url = new URL(request.url);
  const orderId = url.searchParams.get('id');
  const trackToken = url.searchParams.get('track');

  if (!orderId || !trackToken) {
    return json({ ok: false, error: 'Нужен номер заказа и код отслеживания' }, 400);
  }

  const raw = await env.ORDER_STATUS.get(orderKey(orderId));
  if (!raw) return json({ ok: false, error: 'Заказ не найден' }, 404);

  const record = JSON.parse(raw);
  if (record.trackToken && record.trackToken !== trackToken) {
    return json({ ok: false, error: 'Нет доступа к заказу' }, 403);
  }

  return json({ ok: true, status: statusPayload(record) });
}

export function onRequest() {
  return json({ ok: false, error: 'Method not allowed' }, 405);
}
