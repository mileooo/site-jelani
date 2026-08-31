import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';

import worker, {
  buildTasteProfileFromItems,
  bonusDiscountValue,
  maxCheckString,
  moneyKopecks,
  normalizeOAuthProfile,
  paymentAmountValue,
  priceOrder,
  sanitizeSavedItems,
  serverItemPrice,
  statusFromStep,
  telegramCheckString,
  telegramOperatorAllowed,
  telegramWebAppCheckString,
  verifyMaxWebAppData,
  verifyTelegramPayload,
  verifyTelegramWebAppData,
  verifyYookassaPayment,
  yookassaPaymentPayload,
  yookassaReceiptItems
} from '../_worker.js';

const LEGAL_CONSENT = Object.freeze({
  offerAccepted:true,
  offerVersion:'2026-08-23',
  personalDataAccepted:true,
  personalDataConsentVersion:'2026-08-31'
});

class TestD1Statement {
  constructor(database,sql) {
    this.database=database;
    this.sql=sql;
    this.values=[];
  }

  bind(...values) {
    this.values=values;
    return this;
  }

  run() {
    const result=this.database.prepare(this.sql).run(...this.values);
    return { success:true,meta:{ changes:Number(result.changes || 0) } };
  }

  first() {
    return this.database.prepare(this.sql).get(...this.values) || null;
  }

  all() {
    return { results:this.database.prepare(this.sql).all(...this.values) };
  }
}

class TestD1 {
  constructor() {
    this.database=new DatabaseSync(':memory:');
    this.database.exec('PRAGMA foreign_keys = ON');
  }

  prepare(sql) {
    return new TestD1Statement(this.database,sql);
  }

  batch(statements) {
    return statements.map(statement=>statement.run());
  }

  value(sql) {
    return this.database.prepare(sql).get();
  }

  close() {
    this.database.close();
  }
}

async function signTelegramPayload(payload, botToken) {
  const secret = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(botToken));
  const key = await crypto.subtle.importKey('raw',secret,{ name:'HMAC',hash:'SHA-256' },false,['sign']);
  const signature = await crypto.subtle.sign('HMAC',key,new TextEncoder().encode(telegramCheckString(payload)));
  return [...new Uint8Array(signature)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
}

async function signTelegramWebAppData(payload, botToken) {
  const unsigned = new URLSearchParams(Object.entries(payload).map(([key,value])=>[key,String(value)])).toString();
  const encoder = new TextEncoder();
  const firstKey = await crypto.subtle.importKey('raw',encoder.encode('WebAppData'),{ name:'HMAC',hash:'SHA-256' },false,['sign']);
  const secret = await crypto.subtle.sign('HMAC',firstKey,encoder.encode(botToken));
  const signatureKey = await crypto.subtle.importKey('raw',secret,{ name:'HMAC',hash:'SHA-256' },false,['sign']);
  const signature = await crypto.subtle.sign('HMAC',signatureKey,encoder.encode(telegramWebAppCheckString(unsigned)));
  const hash = [...new Uint8Array(signature)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
  return `${unsigned}&hash=${hash}`;
}

async function signMaxWebAppData(payload, botToken) {
  const unsigned = new URLSearchParams(Object.entries(payload).map(([key,value])=>[key,String(value)])).toString();
  const encoder = new TextEncoder();
  const firstKey = await crypto.subtle.importKey('raw',encoder.encode('WebAppData'),{ name:'HMAC',hash:'SHA-256' },false,['sign']);
  const secret = await crypto.subtle.sign('HMAC',firstKey,encoder.encode(botToken));
  const signatureKey = await crypto.subtle.importKey('raw',secret,{ name:'HMAC',hash:'SHA-256' },false,['sign']);
  const signature = await crypto.subtle.sign('HMAC',signatureKey,encoder.encode(maxCheckString(unsigned)));
  const hash = [...new Uint8Array(signature)].map(byte=>byte.toString(16).padStart(2,'0')).join('');
  return `${unsigned}&hash=${hash}`;
}

test('server prices fixed menu items and ignores browser price', async () => {
  const order = await priceOrder({}, {
    phone: '+7 900 000-00-00',
    promo: '',
    items: [{ id: 'sandwich-jelani', name: 'Сэндвич JELANI', price: 1, qty: 2 }]
  });

  assert.equal(serverItemPrice(order.items[0]), 259);
  assert.equal(order.subtotal, 518);
  assert.equal(order.total, 518);
});

test('delivery orders enforce the 579 ruble food minimum on trusted server prices', async () => {
  await assert.rejects(
    () => priceOrder({}, {
      phone:'+7 900 000-00-00',
      delivery:'Доставка',
      promo:'',
      items:[{ id:'shawarma-regular',name:'Шаурма обычная',price:9999,qty:2 }]
    }),
    /579 ₽/
  );

  const order=await priceOrder({}, {
    phone:'+7 900 000-00-00',
    delivery:'Доставка',
    promo:'',
    items:[{ id:'shawarma-regular',name:'Шаурма обычная',price:1,qty:3 }]
  });
  assert.equal(order.subtotal,717);
  assert.equal(order.deliveryFee,149);
  assert.equal(order.total,866);
});

test('server prices both official combos and rejects the retired builder', () => {
  assert.equal(serverItemPrice({
    id: 'student-combo',
    name: 'Студенческое комбо',
    options: { size: 'Комбо', main: 'Донер', side: 'Луковые кольца 9 шт.' }
  }), 399);

  assert.equal(serverItemPrice({
    id: 'jelani-combo',
    name: 'JELANI комбо',
    options: { size: 'Комбо', side: 'Картофель фри маленький' }
  }), 410);

  assert.throws(() => serverItemPrice({
    id: 'custom-shawarma',
    name: 'Шаурма — своя сборка',
    options: { size: 'Стандартная' }
  }), /Конструктор временно недоступен/);
});

test('unknown products are rejected as unavailable', () => {
  assert.throws(
    () => serverItemPrice({ id: 'unknown', name: 'Неизвестный товар' }),
    /сейчас недоступна/
  );
});

test('unsupported combo modifiers are rejected', () => {
  assert.throws(() => serverItemPrice({
    id: 'student-combo',
    name: 'Студенческое комбо',
    options: { size: 'Комбо', main: 'Донер', side: 'Несуществующий' }
  }), /Состав комбо изменился/);
  assert.throws(() => serverItemPrice({
    id: 'jelani-combo',
    name: 'JELANI комбо',
    options: { size: 'Комбо', side: 'Картофель фри маленький', sauce: 'Сырный' }
  }), /Состав комбо изменился/);
});

test('saved orders are repriced and validated on the server', () => {
  const saved = sanitizeSavedItems([
    { id:'sandwich-jelani', name:'Сэндвич JELANI', price:1, qty:2 },
    { id:'student-combo', name:'Студенческое комбо', price:1, qty:1, options:{
      size:'Комбо', main:'Шаурма обычная', side:'Картофель фри средний'
    } }
  ]);

  assert.equal(saved.items[0].price,259);
  assert.equal(saved.items[1].price,399);
  assert.equal(saved.total,917);
  assert.throws(()=>sanitizeSavedItems([{ id:'missing', name:'Нет в меню', qty:1 }]),/сейчас недоступна/);
});

test('bonus discounts are calculated on the server', () => {
  assert.equal(bonusDiscountValue('discount_5',1000),50);
  assert.equal(bonusDiscountValue('free_sauce',500),19);
  assert.equal(bonusDiscountValue('free_drink',500),90);
  assert.equal(bonusDiscountValue('double_points',500),0);
});

test('taste profile is formed from real modifiers', () => {
  const profile=buildTasteProfileFromItems([
    { productId:'custom-shawarma', name:'Шаурма — своя сборка', quantity:2, optionsJson:JSON.stringify({
      meat:'Курица',size:'Большая',sauces:['Чили','Чесночный','Сырный'],
      veggies:['Капуста','Огурец','Томат','Зелень'],extras:['Сыр','Двойное мясо']
    }) },
    { productId:'fries',name:'Картофель фри',quantity:1,optionsJson:'{}' }
  ],3);

  assert.equal(profile.stage,'formed');
  assert.deepEqual(profile.proteins,['Курица']);
  assert.ok(profile.traits.includes('spicy'));
  assert.ok(profile.traits.includes('no_onion'));
  assert.ok(profile.traits.includes('more_meat'));
  assert.deepEqual(profile.sides,['Картофель фри']);
});

test('status flow uses customer-facing statuses', () => {
  assert.equal(statusFromStep('pickup', 1).status, 'Принят');
  assert.equal(statusFromStep('pickup', 4).status, 'Выдан');
  assert.equal(statusFromStep('delivery', 4).status, 'Передан курьеру');
  assert.equal(statusFromStep('pickup', 'cancel').status, 'Отменён');
});

test('only configured Telegram operators can change status', () => {
  const env = { TELEGRAM_OPERATOR_IDS: '123, 456' };
  assert.equal(telegramOperatorAllowed(env, { from: { id: 123 } }), true);
  assert.equal(telegramOperatorAllowed(env, { from: { id: 999 } }), false);
  assert.equal(telegramOperatorAllowed({}, { from: { id: 123 } }), false);
});

test('Telegram login payload is sorted, signed and expires', async () => {
  const now = 1_800_000_000;
  const payload = { username:'emil', id:'42', first_name:'Эмиль', auth_date:String(now - 30) };
  assert.equal(telegramCheckString({ ...payload, hash:'ignored' }),
    `auth_date=${now - 30}\nfirst_name=Эмиль\nid=42\nusername=emil`);

  const botToken = '123456:telegram-test-token';
  payload.hash = await signTelegramPayload(payload,botToken);
  assert.equal(await verifyTelegramPayload(payload,botToken,now),true);
  assert.equal(await verifyTelegramPayload(payload,botToken,now + 700),false);
  assert.equal(await verifyTelegramPayload({ ...payload, first_name:'Другой' },botToken,now),false);
});

test('OAuth profiles are normalized for VK, OK, Mail.ru and Yandex ID', () => {
  const vk = normalizeOAuthProfile('vk',{}, {
    user:{ user_id:77,first_name:'Эмиль',last_name:'М.',phone:'+7 999 123-45-67',email:'e@example.ru' }
  });
  assert.equal(vk.providerUserId,'77');
  assert.equal(vk.name,'Эмиль М.');
  assert.equal(vk.phone,'79991234567');

  const ok = normalizeOAuthProfile('ok',{}, {
    user:{ user_id:88,first_name:'Ирина',last_name:'К.',image:'https://example.ru/avatar.jpg' }
  });
  assert.equal(ok.providerUserId,'88');
  assert.equal(ok.name,'Ирина К.');
  assert.equal(ok.avatarUrl,'https://example.ru/avatar.jpg');

  const mail = normalizeOAuthProfile('mail',{ x_mailru_vid:'mail-42' },{});
  assert.equal(mail.providerUserId,'mail-42');
  assert.equal(mail.name,'MAIL пользователь');

  const yandex = normalizeOAuthProfile('yandex',{}, {
    id:'ya-42',first_name:'Анна',last_name:'Яндекс',default_email:'anna@yandex.ru',
    default_phone:{ number:'+7 999 765-43-21' },default_avatar_id:'avatar-42',is_avatar_empty:false,
    sex:'female',birthday:'1994-05-21'
  });
  assert.equal(yandex.providerUserId,'ya-42');
  assert.equal(yandex.name,'Анна Яндекс');
  assert.equal(yandex.email,'anna@yandex.ru');
  assert.equal(yandex.phone,'79997654321');
  assert.equal(yandex.avatarUrl,'https://avatars.yandex.net/get-yapic/avatar-42/islands-200');
  assert.equal(yandex.raw.gender,'female');
  assert.equal(yandex.raw.birthday,'1994-05-21');
});

test('auth config exposes availability without provider secrets', async () => {
  const d1=new TestD1();
  try {
    const response = await worker.fetch(new Request('https://jjelani.ru/api/auth/config'), {
      DB:d1,
      PERSONAL_DATA_LOCALIZED:'true',
      AUTH_SECRET:'0123456789abcdef0123456789abcdef',
      SMSRU_API_ID:'sms-secret',
      TELEGRAM_BOT_TOKEN:'telegram-secret',
      TELEGRAM_BOT_USERNAME:'jelani_bot',
      YANDEX_CLIENT_ID:'yandex-public-id',
      YANDEX_CLIENT_SECRET:'yandex-secret',
      VK_CLIENT_ID:'vk-public-id',
      VK_CLIENT_SECRET:'vk-secret',
      OK_CLIENT_ID:'ok-public-id',
      OK_CLIENT_SECRET:'ok-secret',
      MAILRU_CLIENT_ID:'mail-public-id',
      MAILRU_CLIENT_SECRET:'mail-secret',
      MAX_BOT_TOKEN:'max-secret',
      MAX_MINI_APP_URL:'https://max.ru/jelani'
    });
    const body = await response.json();
    assert.equal(body.personalDataLocalized,true);
    assert.equal(body.providers.phone.available,true);
    assert.equal(body.providers.telegram.available,true);
    assert.equal(body.providers.telegram.miniApp,true);
    assert.equal(body.providers.yandex.available,true);
    assert.equal(body.providers.vk.available,true);
    assert.equal(body.providers.ok.available,true);
    assert.equal(body.providers.mail.available,true);
    assert.equal(body.providers.max.available,true);
    assert.equal(body.providers.max.mode,'miniapp');
    assert.equal(JSON.stringify(body).includes('secret'),false);
  } finally {
    d1.close();
  }
});

test('production social login stays closed until personal data is localized in Russia', async () => {
  const d1=new TestD1();
  try {
    const env={ DB:d1,YANDEX_CLIENT_ID:'yandex-public-id' };
    const configResponse=await worker.fetch(new Request('https://jjelani.ru/api/auth/config'),env);
    const config=await configResponse.json();
    assert.equal(config.personalDataLocalized,false);
    assert.equal(config.providers.yandex.available,false);
    const startResponse=await worker.fetch(new Request('https://jjelani.ru/api/auth/oauth/start?provider=yandex'),env);
    assert.equal(startResponse.status,503);
    assert.match((await startResponse.json()).error,/хранения данных в России/);
  } finally {
    d1.close();
  }
});

test('Yandex ID OAuth uses PKCE and the recommended profile authorization header', async () => {
  const d1=new TestD1();
  const originalFetch=globalThis.fetch;
  let tokenBody='';
  let profileAuthorization='';
  try {
    const env={ DB:d1,YANDEX_CLIENT_ID:'yandex-public-id' };
    env.PERSONAL_DATA_LOCALIZED='true';
    const startResponse=await worker.fetch(new Request('https://jjelani.ru/api/auth/oauth/start?provider=yandex'),env);
    assert.equal(startResponse.status,200);
    const start=await startResponse.json();
    const authorize=new URL(start.url);
    assert.equal(authorize.origin,'https://oauth.yandex.ru');
    assert.equal(authorize.pathname,'/authorize');
    assert.equal(authorize.searchParams.get('client_id'),'yandex-public-id');
    assert.equal(authorize.searchParams.get('scope'),'login:info login:email login:avatar login:default_phone login:birthday');
    assert.equal(authorize.searchParams.get('code_challenge_method'),'S256');
    const state=authorize.searchParams.get('state');
    assert.ok(state);

    globalThis.fetch=async (url,options={})=>{
      const target=String(url);
      if(target==='https://oauth.yandex.ru/token'){
        tokenBody=String(options.body||'');
        return Response.json({ access_token:'yandex-access-token',token_type:'bearer' });
      }
      if(target==='https://login.yandex.ru/info'){
        profileAuthorization=String(options.headers?.authorization||'');
        return Response.json({ id:'ya-8800',first_name:'Анна',last_name:'Яндекс',default_email:'anna@yandex.ru' });
      }
      throw new Error(`Unexpected URL: ${target}`);
    };
    const callback=await worker.fetch(new Request(`https://jjelani.ru/api/auth/oauth/callback/yandex?code=ya-code&state=${encodeURIComponent(state)}`),env);
    assert.equal(callback.status,302);
    assert.match(tokenBody,/code_verifier=/);
    assert.doesNotMatch(tokenBody,/redirect_uri=/);
    assert.equal(profileAuthorization,'OAuth yandex-access-token');
    const cookie=String(callback.headers.get('set-cookie')||'').split(';')[0];
    const session=await worker.fetch(new Request('https://jjelani.ru/api/auth/session',{ headers:{ cookie } }),env);
    const sessionBody=await session.json();
    assert.equal(sessionBody.authenticated,true);
    assert.equal(sessionBody.profile.name,'Анна Яндекс');
    assert.deepEqual(sessionBody.profile.loginMethods,['yandex']);
  } finally {
    globalThis.fetch=originalFetch;
    d1.close();
  }
});

test('OK OAuth start uses state and PKCE and callback creates a session', async () => {
  const d1=new TestD1();
  const originalFetch=globalThis.fetch;
  let tokenBody='';
  try {
    const env={ DB:d1,OK_CLIENT_ID:'ok-public-id',PERSONAL_DATA_LOCALIZED:'true' };
    const startResponse=await worker.fetch(new Request('https://jjelani.ru/api/auth/oauth/start?provider=ok'),env);
    assert.equal(startResponse.status,200);
    const start=await startResponse.json();
    const authorize=new URL(start.url);
    assert.equal(authorize.origin,'https://id.vk.ru');
    assert.equal(authorize.searchParams.get('client_id'),'ok-public-id');
    assert.equal(authorize.searchParams.get('code_challenge_method'),'S256');
    assert.ok((authorize.searchParams.get('code_challenge')||'').length >= 43);
    const state=authorize.searchParams.get('state');
    assert.ok(state);
    const stored=d1.value('SELECT provider,code_verifier AS verifier FROM oauth_states');
    assert.equal(stored.provider,'ok');
    assert.ok(stored.verifier.length >= 43);

    globalThis.fetch=async (url,options={})=>{
      const target=String(url);
      if(target==='https://id.vk.ru/oauth2/auth'){
        tokenBody=String(options.body||'');
        return Response.json({ access_token:'ok-access-token' });
      }
      if(target==='https://id.vk.ru/oauth2/user_info'){
        return Response.json({ user:{ user_id:8800,first_name:'Ирина',last_name:'ОК' } });
      }
      throw new Error(`Unexpected URL: ${target}`);
    };
    const callbackUrl=`https://jjelani.ru/api/auth/oauth/callback/ok?code=ok-code&state=${encodeURIComponent(state)}&device_id=ok-device`;
    const callback=await worker.fetch(new Request(callbackUrl),env);
    assert.equal(callback.status,302);
    assert.match(tokenBody,/code_verifier=/);
    assert.match(tokenBody,/device_id=ok-device/);
    const cookie=String(callback.headers.get('set-cookie')||'').split(';')[0];
    assert.match(cookie,/^jelani_session=js_/);
    const session=await worker.fetch(new Request('https://jjelani.ru/api/auth/session',{ headers:{ cookie } }),env);
    const sessionBody=await session.json();
    assert.equal(sessionBody.authenticated,true);
    assert.deepEqual(sessionBody.profile.loginMethods,['ok']);
  } finally {
    globalThis.fetch=originalFetch;
    d1.close();
  }
});

test('verified phone profile links an additional social identity without duplication', async () => {
  const d1=new TestD1();
  const originalFetch=globalThis.fetch;
  try {
    const env={
      DB:d1,
      DEVELOPMENT_MODE:'true',
      AUTH_SECRET:'0123456789abcdef0123456789abcdef',
      OK_CLIENT_ID:'ok-public-id'
    };
    const deviceHeaders={ 'content-type':'application/json','x-device-token':'c'.repeat(64) };
    const requested=await worker.fetch(new Request('http://127.0.0.1/api/auth/phone/request',{
      method:'POST',headers:deviceHeaders,body:JSON.stringify({ phone:'+7 999 111-22-33',name:'Эмиль' })
    }),env);
    const requestedBody=await requested.json();
    assert.match(requestedBody.debugCode,/^\d{6}$/);
    const verified=await worker.fetch(new Request('http://127.0.0.1/api/auth/phone/verify',{
      method:'POST',headers:deviceHeaders,body:JSON.stringify({ phone:'+7 999 111-22-33',code:requestedBody.debugCode,name:'Эмиль' })
    }),env);
    assert.equal(verified.status,200);
    const phoneProfile=await verified.json();
    assert.deepEqual(phoneProfile.profile.loginMethods,['phone']);
    const phoneCookie=String(verified.headers.get('set-cookie')||'').split(';')[0];

    const oauthStart=await worker.fetch(new Request('http://127.0.0.1/api/auth/oauth/start?provider=ok&mode=link',{
      headers:{ cookie:phoneCookie,'x-device-token':'c'.repeat(64) }
    }),env);
    const authorize=new URL((await oauthStart.json()).url);
    const state=authorize.searchParams.get('state');
    globalThis.fetch=async url=>{
      if(String(url)==='https://id.vk.ru/oauth2/auth')return Response.json({ access_token:'linked-ok-token' });
      if(String(url)==='https://id.vk.ru/oauth2/user_info')return Response.json({ user:{ user_id:9911,first_name:'Эмиль',last_name:'ОК' } });
      throw new Error(`Unexpected URL: ${url}`);
    };
    const callback=await worker.fetch(new Request(`http://127.0.0.1/api/auth/oauth/callback/ok?code=linked&state=${encodeURIComponent(state)}&device_id=linked-device`),env);
    assert.equal(callback.status,302);
    const linkedCookie=String(callback.headers.get('set-cookie')||'').split(';')[0];
    const session=await worker.fetch(new Request('http://127.0.0.1/api/auth/session',{ headers:{ cookie:linkedCookie } }),env);
    const linked=await session.json();
    assert.deepEqual(linked.profile.loginMethods,['phone','ok']);
    assert.equal(Number(d1.value('SELECT COUNT(*) AS count FROM app_users WHERE deleted_at IS NULL').count),1);
    assert.equal(Number(d1.value('SELECT COUNT(*) AS count FROM auth_identities').count),2);
  } finally {
    globalThis.fetch=originalFetch;
    d1.close();
  }
});

test('Telegram WebApp initData is signed, expires and creates a server session', async () => {
  const d1=new TestD1();
  try {
    const now=Math.floor(Date.now()/1000);
    const botToken='123456:telegram-webapp-token';
    const initData=await signTelegramWebAppData({
      auth_date:now,
      query_id:'telegram-query-1',
      user:JSON.stringify({ id:4242,first_name:'Emil',last_name:'JELANI',username:'jelaniuser',photo_url:'https://example.ru/avatar.jpg' })
    },botToken);
    assert.equal(await verifyTelegramWebAppData(initData,botToken,now),true);
    assert.equal(await verifyTelegramWebAppData(initData,botToken,now+700),false);
    assert.equal(await verifyTelegramWebAppData(initData.replace('telegram-query-1','telegram-query-2'),botToken,now),false);

    const response=await worker.fetch(new Request('https://jjelani.ru/api/auth/telegram-webapp',{
      method:'POST',
      headers:{ 'content-type':'application/json','x-device-token':'c'.repeat(64) },
      body:JSON.stringify({ initData })
    }),{ DB:d1,PERSONAL_DATA_LOCALIZED:'true',TELEGRAM_BOT_TOKEN:botToken });
    assert.equal(response.status,200);
    const body=await response.json();
    assert.equal(body.profile.name,'Emil JELANI');
    assert.deepEqual(body.profile.loginMethods,['telegram']);
    assert.match(String(response.headers.get('set-cookie')||''),/HttpOnly/);
  } finally {
    d1.close();
  }
});

test('MAX WebAppData is signed, expires and creates a server session', async () => {
  const d1=new TestD1();
  try {
    const now=Math.floor(Date.now()/1000);
    const botToken='max-test-bot-token';
    const initData=await signMaxWebAppData({
      auth_date:now,
      query_id:'max-query-1',
      user:JSON.stringify({ id:9900,first_name:'Максим',last_name:'JELANI',username:'maxjelani' })
    },botToken);
    assert.equal(await verifyMaxWebAppData(initData,botToken,now),true);
    assert.equal(await verifyMaxWebAppData(initData,botToken,now+700),false);
    assert.equal(await verifyMaxWebAppData(initData.replace('max-query-1','max-query-2'),botToken,now),false);

    const response=await worker.fetch(new Request('https://jjelani.ru/api/auth/max',{
      method:'POST',headers:{ 'content-type':'application/json','x-device-token':'b'.repeat(64) },body:JSON.stringify({ initData })
    }),{ DB:d1,PERSONAL_DATA_LOCALIZED:'true',MAX_BOT_TOKEN:botToken });
    assert.equal(response.status,200);
    const body=await response.json();
    assert.equal(body.profile.name,'Максим JELANI');
    assert.deepEqual(body.profile.loginMethods,['max']);
    assert.match(String(response.headers.get('set-cookie')||''),/HttpOnly/);
  } finally {
    d1.close();
  }
});

test('YooKassa payload supports card and SBP without exposing credentials', () => {
  const order = {
    id:'JL-7654321',providerPaymentId:'pay-test-1',paymentCode:'bank_card',total:485,
    items:[{ name:'Бургер',price:270,qty:1 },{ name:'Картофель фри',price:125,qty:1 },{ name:'Напиток',price:90,qty:1 }]
  };
  const card = yookassaPaymentPayload(order,'https://jjelani.ru/?payment=return',{});
  const sbp = yookassaPaymentPayload({ ...order,paymentCode:'sbp' },'https://jjelani.ru/?payment=return',{});

  assert.equal(card.capture,true);
  assert.equal(card.payment_method_data.type,'bank_card');
  assert.equal(sbp.payment_method_data.type,'sbp');
  assert.equal(card.amount.value,'485.00');
  assert.equal(card.metadata.order_id,order.id);
  assert.equal(JSON.stringify(card).includes('secret'),false);
});

test('electronic receipt keeps the exact discounted order total', () => {
  const order = {
    id:'JL-7654322',paymentCode:'bank_card',email:'client@example.ru',total:460,
    items:[{ name:'Бургер',price:270,qty:1 },{ name:'Картофель фри',price:125,qty:1 },{ name:'Напиток',price:90,qty:1 }]
  };
  const env = { YOOKASSA_RECEIPTS:'true',YOOKASSA_VAT_CODE:'1',YOOKASSA_PAYMENT_SUBJECT:'commodity' };
  const items = yookassaReceiptItems(order,env);
  const receiptTotal = items.reduce((sum,item)=>sum+moneyKopecks(item.amount.value)*Number(item.quantity),0);
  const payload = yookassaPaymentPayload(order,'https://jjelani.ru/?payment=return',env);

  assert.equal(receiptTotal,46000);
  assert.equal(payload.receipt.customer.email,'client@example.ru');
  assert.ok(payload.receipt.items.every(item=>item.vat_code===1 && item.payment_mode==='full_prepayment'));
  assert.throws(()=>yookassaPaymentPayload({ ...order,email:'' },'https://jjelani.ru/',env),/email/);
});

test('YooKassa receipt adds the fixed delivery fee as a separate service', () => {
  const order={
    id:'JL-7654324',paymentCode:'sbp',email:'client@example.ru',deliveryFee:149,total:609,
    items:[{ name:'Бургер',price:270,qty:1 },{ name:'Картофель фри',price:125,qty:1 },{ name:'Напиток',price:90,qty:1 }]
  };
  const env={ YOOKASSA_RECEIPTS:'true',YOOKASSA_VAT_CODE:'1',YOOKASSA_PAYMENT_SUBJECT:'commodity' };
  const items=yookassaReceiptItems(order,env);
  const receiptTotal=items.reduce((sum,item)=>sum+moneyKopecks(item.amount.value)*Number(item.quantity),0);
  const delivery=items.find(item=>item.description==='Доставка заказа');

  assert.equal(receiptTotal,60900);
  assert.equal(delivery.amount.value,'149.00');
  assert.equal(delivery.payment_subject,'service');
  assert.equal(delivery.vat_code,1);
});

test('provider payment is accepted only for the same order, RUB amount and provider id', () => {
  const order = { id:'JL-7654323',providerPaymentId:'pay-test-3',total:510 };
  const payment = {
    id:'pay-test-3',status:'succeeded',paid:true,
    metadata:{ order_id:'JL-7654323' },amount:{ value:'510.00',currency:'RUB' }
  };

  assert.equal(verifyYookassaPayment(order,payment),true);
  assert.equal(moneyKopecks('510.00'),51000);
  assert.equal(paymentAmountValue(510),'510.00');
  assert.throws(()=>verifyYookassaPayment(order,{ ...payment,id:'another-payment' }),/сверить/);
  assert.throws(()=>verifyYookassaPayment(order,{ ...payment,amount:{ value:'511.00',currency:'RUB' } }),/не совпадает/);
  assert.throws(()=>verifyYookassaPayment(order,{ ...payment,metadata:{ order_id:'JL-OTHER' } }),/другому заказу/);
});

test('payment config exposes methods but never YooKassa secret', async () => {
  const response = await worker.fetch(new Request('https://jjelani.ru/api/payment/config'), {
    DB:{},
    PERSONAL_DATA_LOCALIZED:'true',
    YOOKASSA_SHOP_ID:'shop-42',
    YOOKASSA_SECRET_KEY:'yoo-secret',
    YOOKASSA_PAYMENT_METHODS:'bank_card,sbp',
    TELEGRAM_BOT_TOKEN:'telegram-secret',
    TELEGRAM_CHAT_ID:'123456'
  });
  const body = await response.json();

  assert.equal(body.available,true);
  assert.equal(body.methods.bankCard,true);
  assert.equal(body.methods.sbp,true);
  assert.equal(body.methods.cash,true);
  assert.equal(JSON.stringify(body).includes('yoo-secret'),false);
});

test('payment config keeps ordering closed until Russian data localization is confirmed', async () => {
  const response=await worker.fetch(new Request('https://jjelani.ru/api/payment/config'),{
    DB:{},
    YOOKASSA_SHOP_ID:'shop-42',
    YOOKASSA_SECRET_KEY:'yoo-secret',
    TELEGRAM_BOT_TOKEN:'telegram-secret',
    TELEGRAM_CHAT_ID:'123456'
  });
  const body=await response.json();
  assert.equal(body.personalDataLocalized,false);
  assert.equal(body.available,false);
  assert.deepEqual(body.methods,{ bankCard:false,sbp:false,cash:false });
});

test('health reports configured auth providers and online payment readiness', async () => {
  const d1=new TestD1();
  try {
    const response=await worker.fetch(new Request('https://jjelani.ru/api/health'),{
      DB:d1,
      PERSONAL_DATA_LOCALIZED:'true',
      AUTH_SECRET:'0123456789abcdef0123456789abcdef',
      SMSRU_API_ID:'sms-secret',
      TELEGRAM_BOT_TOKEN:'telegram-secret',
      TELEGRAM_BOT_USERNAME:'jelani_bot',
      TELEGRAM_CHAT_ID:'123456',
      YANDEX_CLIENT_ID:'yandex-client',
      VK_CLIENT_ID:'vk-client',
      OK_CLIENT_ID:'ok-client',
      MAILRU_CLIENT_ID:'mail-client',
      MAILRU_CLIENT_SECRET:'mail-secret',
      MAX_BOT_TOKEN:'max-secret',
      YOOKASSA_SHOP_ID:'shop-42',
      YOOKASSA_SECRET_KEY:'yoo-secret',
      YOOKASSA_PAYMENT_METHODS:'bank_card,sbp'
    });
    const body=await response.json();
    assert.equal(body.database,true);
    assert.equal(body.personalDataLocalized,true);
    assert.deepEqual(body.authProviders,{ phone:true,telegram:true,vk:true,ok:true,mail:true,yandex:true,max:true });
    assert.equal(body.telegramWebAppConfigured,true);
    assert.equal(body.onlinePaymentConfigured,true);
    assert.equal(body.orderingAvailable,true);
    assert.equal(body.paymentProvider,'yookassa');
    assert.deepEqual(body.paymentMethods,['bank_card','sbp','cash']);
    assert.equal(JSON.stringify(body).includes('secret'),false);
  } finally {
    d1.close();
  }
});

test('paid webhook and full refund stay idempotent end to end', async () => {
  const d1=new TestD1();
  const originalFetch=globalThis.fetch;
  let telegramMessages=0;
  let refundCreates=0;
  let failNextPayment=false;
  let payment={
    id:'pay-integration-1',status:'pending',paid:false,
    amount:{ value:'239.00',currency:'RUB' },
    refunded_amount:{ value:'0.00',currency:'RUB' },
    metadata:{ order_id:'JL-1234567-0421' },
    confirmation:{ type:'redirect',confirmation_url:'https://yookassa.test/confirm' }
  };
  let refund=null;
  const env={
    DB:d1,
    PERSONAL_DATA_LOCALIZED:'true',
    YOOKASSA_SHOP_ID:'shop-integration',
    YOOKASSA_SECRET_KEY:'secret-integration',
    YOOKASSA_PAYMENT_METHODS:'bank_card,sbp',
    TELEGRAM_BOT_TOKEN:'telegram-integration',
    TELEGRAM_CHAT_ID:'10001',
    ADMIN_API_TOKEN:'b'.repeat(64)
  };

  globalThis.fetch=async (input,init={})=>{
    const url=String(input);
    if(url==='https://api.yookassa.ru/v3/payments' && init.method==='POST'){
      if(failNextPayment){
        failNextPayment=false;
        return Response.json({ type:'server_error',code:'temporarily_unavailable' },{ status:503 });
      }
      const body=JSON.parse(init.body);
      assert.equal(body.amount.value,'239.00');
      assert.equal(body.metadata.order_id,'JL-1234567-0421');
      return Response.json(payment);
    }
    if(url.endsWith('/v3/payments/pay-integration-1')) return Response.json(payment);
    if(url==='https://api.yookassa.ru/v3/refunds' && init.method==='POST'){
      refundCreates+=1;
      refund={
        id:'refund-integration-1',payment_id:'pay-integration-1',status:'succeeded',
        amount:{ value:'239.00',currency:'RUB' },
        metadata:{ request_id:'refund-test-0001',order_id:'JL-1234567-0421' }
      };
      payment={ ...payment,refunded_amount:{ value:'239.00',currency:'RUB' } };
      return Response.json(refund);
    }
    if(url.endsWith('/v3/refunds/refund-integration-1')) return Response.json(refund);
    if(url.includes('/sendMessage')){
      telegramMessages+=1;
      return Response.json({ ok:true,result:{ message_id:700+telegramMessages } });
    }
    if(url.includes('/setWebhook')) return Response.json({ ok:true,result:true });
    throw new Error(`Unexpected fetch: ${url}`);
  };

  try {
    const orderResponse=await worker.fetch(new Request('https://jjelani.ru/api/order',{
      method:'POST',
      headers:{ 'content-type':'application/json','x-device-token':'a'.repeat(64) },
      body:JSON.stringify({
        id:'JL-1234567-0421',trackingToken:'0123456789abcdef0123456789abcdef',
        name:'Тест',phone:'+7 900 000-00-00',delivery:'Самовывоз',payment:'bank_card',
        legalConsent:LEGAL_CONSENT,
        items:[{ id:'shawarma-regular',name:'Шаурма обычная',qty:1 }]
      })
    }),env);
    const pending=await orderResponse.json();
    assert.equal(orderResponse.status,200);
    assert.equal(pending.payment.status,'pending');
    assert.equal(telegramMessages,0);
    assert.equal(d1.value("SELECT payment_status AS status FROM orders WHERE id = 'JL-1234567-0421'").status,'pending');
    assert.equal(Number(d1.value('SELECT order_count AS count FROM customers').count),0);

    payment={ ...payment,status:'succeeded',paid:true,captured_at:'2026-07-17T18:00:00.000Z' };
    const notification=JSON.stringify({ event:'payment.succeeded',object:{ id:payment.id } });
    const webhookRequest=()=>new Request('https://jjelani.ru/api/yookassa-webhook',{
      method:'POST',headers:{ 'content-type':'application/json' },body:notification
    });
    assert.equal((await worker.fetch(webhookRequest(),env)).status,200);
    assert.equal(telegramMessages,1);
    assert.equal(d1.value("SELECT payment_status AS status FROM orders WHERE id = 'JL-1234567-0421'").status,'succeeded');
    assert.equal(Number(d1.value('SELECT order_count AS count FROM customers').count),1);
    assert.equal(Number(d1.value('SELECT COUNT(*) AS count FROM order_messages').count),1);

    assert.equal((await worker.fetch(webhookRequest(),env)).status,200);
    assert.equal(telegramMessages,1);
    assert.equal(Number(d1.value('SELECT order_count AS count FROM customers').count),1);
    assert.equal(Number(d1.value('SELECT COUNT(*) AS count FROM payment_events').count),1);

    failNextPayment=true;
    const failedPaymentResponse=await worker.fetch(new Request('https://jjelani.ru/api/order',{
      method:'POST',
      headers:{ 'content-type':'application/json','x-device-token':'a'.repeat(64) },
      body:JSON.stringify({
        id:'JL-1234568-0422',trackingToken:'1123456789abcdef0123456789abcdef',
        name:'Тест',phone:'+7 900 000-00-00',delivery:'Самовывоз',payment:'bank_card',
        legalConsent:LEGAL_CONSENT,
        items:[{ id:'shawarma-regular',name:'Шаурма обычная',qty:1 }]
      })
    }),env);
    const failedPayment=await failedPaymentResponse.json();
    assert.equal(failedPaymentResponse.status,503);
    assert.equal(failedPayment.error,'Платёжный сервис временно недоступен. Попробуйте ещё раз.');
    assert.equal(telegramMessages,1);
    assert.equal(d1.value("SELECT payment_error AS error FROM orders WHERE id = 'JL-1234568-0422'").error,'provider_unavailable');

    d1.database.prepare("UPDATE orders SET created_at = '2026-07-17T10:00:00.000Z',updated_at = '2026-07-17T10:00:00.000Z' WHERE id = 'JL-1234568-0422'").run();
    const adminHeaders={ 'content-type':'application/json',authorization:`Bearer ${'b'.repeat(64)}` };
    const reconciliation=await (await worker.fetch(new Request('https://jjelani.ru/api/admin/payments',{
      method:'POST',headers:adminHeaders,body:JSON.stringify({ action:'reconcile' })
    }),env)).json();
    assert.equal(reconciliation.ok,true);
    assert.equal(reconciliation.summary.released,1);
    assert.equal(d1.value("SELECT payment_status AS status FROM orders WHERE id = 'JL-1234568-0422'").status,'canceled');

    const expiredRetry=await worker.fetch(new Request('https://jjelani.ru/api/order',{
      method:'POST',
      headers:{ 'content-type':'application/json','x-device-token':'a'.repeat(64) },
      body:JSON.stringify({
        id:'JL-1234568-0422',trackingToken:'1123456789abcdef0123456789abcdef',
        name:'Тест',phone:'+7 900 000-00-00',delivery:'Самовывоз',payment:'bank_card',
        legalConsent:LEGAL_CONSENT,
        items:[{ id:'shawarma-regular',name:'Шаурма обычная',qty:1 }]
      })
    }),env);
    assert.equal(expiredRetry.status,400);
    assert.equal((await expiredRetry.json()).error,'Время оплаты истекло. Оформите заказ заново.');

    const canceledPayments=await (await worker.fetch(new Request('https://jjelani.ru/api/admin/payments?status=canceled',{
      headers:{ authorization:`Bearer ${'b'.repeat(64)}` }
    }),env)).json();
    assert.equal(canceledPayments.ok,true);
    assert.equal(canceledPayments.orders.some(order=>order.id==='JL-1234568-0422'),true);

    const refundRequest=()=>new Request('https://jjelani.ru/api/admin/refunds',{
      method:'POST',
      headers:{ 'content-type':'application/json',authorization:`Bearer ${'b'.repeat(64)}` },
      body:JSON.stringify({ orderId:'JL-1234567-0421',requestId:'refund-test-0001',reason:'Отмена клиентом' })
    });
    const firstRefund=await (await worker.fetch(refundRequest(),env)).json();
    assert.equal(firstRefund.ok,true);
    assert.equal(firstRefund.duplicate,false);
    assert.equal(firstRefund.refundedAmount,239);
    assert.equal(refundCreates,1);
    assert.equal(d1.value("SELECT payment_status AS status FROM orders WHERE id = 'JL-1234567-0421'").status,'refunded');

    const duplicateRefund=await (await worker.fetch(refundRequest(),env)).json();
    assert.equal(duplicateRefund.ok,true);
    assert.equal(duplicateRefund.duplicate,true);
    assert.equal(refundCreates,1);
    assert.equal(Number(d1.value('SELECT COUNT(*) AS count FROM refunds').count),1);

    const cashOrderBody={
      id:'JL-1234569-0423',trackingToken:'2123456789abcdef0123456789abcdef',
      name:'Тест',phone:'+7 900 000-00-00',delivery:'Самовывоз',payment:'cash',
      legalConsent:LEGAL_CONSENT,
      items:[{ id:'shawarma-regular',name:'Шаурма обычная',qty:1 }]
    };
    const createCashOrder=()=>worker.fetch(new Request('https://jjelani.ru/api/order',{
      method:'POST',
      headers:{ 'content-type':'application/json','x-device-token':'a'.repeat(64) },
      body:JSON.stringify(cashOrderBody)
    }),env);
    const cashResponse=await createCashOrder();
    const cashResult=await cashResponse.json();
    assert.equal(cashResponse.status,200);
    assert.equal(cashResult.payment.status,'cash_on_pickup');
    assert.equal(cashResult.payment.provider,'cash');
    assert.equal(telegramMessages,2);
    assert.equal(d1.value("SELECT payment_status AS status FROM orders WHERE id = 'JL-1234569-0423'").status,'cash_on_pickup');
    assert.equal(Number(d1.value('SELECT order_count AS count FROM customers').count),2);

    const duplicateCash=await (await createCashOrder()).json();
    assert.equal(duplicateCash.duplicate,true);
    assert.equal(telegramMessages,2);
    assert.equal(Number(d1.value('SELECT order_count AS count FROM customers').count),2);
  } finally {
    globalThis.fetch=originalFetch;
    d1.close();
  }
});

test('session endpoint is anonymous when D1 is not bound', async () => {
  const response = await worker.fetch(new Request('https://jjelani.ru/api/auth/session'),{});
  assert.equal(response.status,200);
  assert.deepEqual(await response.json(),{ ok:true,authenticated:false });
});

test('order endpoint rejects a combined or missing legal consent before processing', async () => {
  const response=await worker.fetch(new Request('https://jjelani.ru/api/order',{
    method:'POST',
    headers:{ 'content-type':'application/json' },
    body:JSON.stringify({
      id:'JL-1234571',trackingToken:'4123456789abcdef0123456789abcdef',
      name:'Тест',phone:'+7 900 000-00-00',delivery:'Самовывоз',payment:'cash',
      items:[{ id:'shawarma-regular',name:'Шаурма обычная',qty:1 }]
    })
  }),{ PERSONAL_DATA_LOCALIZED:'true' });
  assert.equal(response.status,400);
  assert.equal((await response.json()).error,'Нужно отдельно принять оферту и согласие на обработку персональных данных.');
});

test('cash is rejected for delivery before an order is created', async () => {
  const response=await worker.fetch(new Request('https://jjelani.ru/api/order',{
    method:'POST',headers:{ 'content-type':'application/json' },
    body:JSON.stringify({
      id:'JL-1234570',trackingToken:'3123456789abcdef0123456789abcdef',
      name:'Тест',phone:'+7 900 000-00-00',delivery:'Доставка',address:'Улица, 1',payment:'cash',
      legalConsent:LEGAL_CONSENT,
      items:[{ id:'shawarma-regular',name:'Шаурма обычная',qty:1 }]
    })
  }),{ PERSONAL_DATA_LOCALIZED:'true' });
  assert.equal(response.status,400);
  assert.equal((await response.json()).error,'Оплата наличными доступна только при самовывозе.');
});

test('production order endpoint stays blocked until ordering backend is configured', async () => {
  const response = await worker.fetch(new Request('https://jjelani.ru/api/order', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      id: 'JL-1234567',
      trackingToken: '0123456789abcdef0123456789abcdef',
      name: 'Тест',
      phone: '+7 900 000-00-00',
      delivery: 'Самовывоз',
      payment: 'bank_card',
      legalConsent: LEGAL_CONSENT,
      items: [{ id: 'shawarma-regular', name: 'Шаурма обычная', qty: 1 }]
    })
  }), { PERSONAL_DATA_LOCALIZED:'true' });

  assert.equal(response.status, 503);
  assert.deepEqual(await response.json(), {
    ok: false,
    error: 'Приём заказов временно недоступен. Попробуйте позже.'
  });
});
