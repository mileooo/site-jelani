const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8'
};

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: JSON_HEADERS
  });
}

function statusKeyboard(orderId, flow, index = 0) {
  const pickup = ['Принять заказ', 'Готовим', 'Ожидает самовывоза', 'Выдан', 'Завершить'];
  const delivery = ['Принять заказ', 'Готовим', 'Передать курьеру', 'В пути', 'Завершить'];
  const steps = flow === 'delivery' ? delivery : pickup;
  const next = steps[index] ? [[{
    text: steps[index],
    callback_data: `o:${orderId}:${flow}:${index + 1}`
  }]] : [];

  return {
    inline_keyboard: [
      ...next,
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

    const [, orderId, flow, step] = query.data.split(':');
    const pickup = ['Заказ принят', 'Готовим', 'Ожидает самовывоза', 'Выдан', 'Завершён'];
    const delivery = ['Заказ принят', 'Готовим', 'Передан курьеру', 'В пути', 'Завершён'];
    const labels = flow === 'delivery' ? delivery : pickup;
    const canceled = step === 'cancel';
    const index = Number(step);
    const text = canceled ? `Заказ ${orderId} отменён` : `Статус ${orderId}: ${labels[index - 1] || 'обновлён'}`;

    await telegram(env, 'answerCallbackQuery', {
      callback_query_id: query.id,
      text
    });

    if (query.message && !canceled) {
      await telegram(env, 'editMessageReplyMarkup', {
        chat_id: query.message.chat.id,
        message_id: query.message.message_id,
        reply_markup: statusKeyboard(orderId, flow, index)
      });
    }

    return json({ ok: true });
  } catch (error) {
    return json({ ok: false, error: error.message }, 500);
  }
}

export function onRequest() {
  return json({ ok: false, error: 'Method not allowed' }, 405);
}
