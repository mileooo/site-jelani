/* ================================================================
   JELANI — временное меню и логика заказа.
   Все цены, составы и опции лежат в верхней части файла.
   Потом меняем только данные, не трогая интерфейс.
================================================================ */

const RUB = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const formatPrice = value => RUB.format(value);

const sauces = [
  'Томатный', 'Чесночный', 'Аджика', '1000 островов', 'Кавказский',
  'Чили', 'Сырный', 'Кисло-сладкий', 'Мацони', 'Наршараб'
];

const drinks = ['Кола 0.5', 'Лимонад 0.5', 'Сок 0.3', 'Чай', 'Американо', 'Морс'];

const categoryMeta = [
  { id: 'all', label: 'Всё меню' },
  { id: 'shawarma', label: 'Шаурма и донер' },
  { id: 'sandwiches', label: 'Бургеры и сэндвичи' },
  { id: 'snacks', label: 'Закуски' },
  { id: 'salads', label: 'Салаты' },
  { id: 'desserts', label: 'Десерты' },
  { id: 'drinks', label: 'Напитки' },
  { id: 'sauces', label: 'Соусы' }
];

const menuItems = [
  { id:'shawarma-small-chicken', category:'shawarma', name:'Шаурма маленькая', description:'Курица, овощи, 1–2 соуса на выбор.', price:190, emoji:'🌯', visual:'orange', tags:['курица','хит'] },
  { id:'shawarma-standard', category:'shawarma', name:'Шаурма стандартная', description:'Выбирай курицу или говядину, овощи и соусы.', price:240, emoji:'🌯', visual:'orange', tags:['курица','говядина','хит'] },
  { id:'shawarma-large', category:'shawarma', name:'Шаурма большая', description:'Для настоящего голода: больше основы и начинки.', price:290, emoji:'🌯', visual:'dark', tags:['курица','говядина'] },
  { id:'doner-chicken', category:'shawarma', name:'Донер с курицей', description:'Сочный донер, свежие овощи и соус.', price:230, emoji:'🥙', visual:'yellow', tags:['курица'] },
  { id:'doner-beef', category:'shawarma', name:'Донер с говядиной', description:'Говядина, овощи, яркий соус.', price:270, emoji:'🥙', visual:'dark', tags:['говядина'] },
  { id:'gyres', category:'shawarma', name:'Гирес', description:'Мясо, свежая зелень, овощи и мацони.', price:250, emoji:'🫓', visual:'green', tags:['курица','говядина'] },
  { id:'pita', category:'shawarma', name:'Пита', description:'Тёплая пита с мясом, овощами и соусом.', price:240, emoji:'🫓', visual:'pink', tags:['курица','говядина'] },
  { id:'open-shawarma', category:'shawarma', name:'Открытая шаурма', description:'Больше видно начинки, больше удовольствия.', price:320, emoji:'🍽️', visual:'orange', tags:['курица','говядина'] },
  { id:'tantuni', category:'shawarma', name:'Тантуни с сумахом', description:'Говядина или курица, томаты, лук и сумах.', price:260, emoji:'🌮', visual:'pink', tags:['курица','говядина'] },
  { id:'quesadilla', category:'shawarma', name:'Кесадилья', description:'Сыр, мясо, овощи и соус в хрустящей лепёшке.', price:290, emoji:'🫔', visual:'yellow', tags:['курица','говядина','сыр'] },

  { id:'jelani-burger', category:'sandwiches', name:'Бургер JELANI', description:'Сочная котлета из говядины, сыр, салат, томаты, соус.', price:270, emoji:'🍔', visual:'orange', tags:['говядина','сыр'] },
  { id:'chicken-caesar-baguette', category:'sandwiches', name:'Багет «Цезарь»', description:'Курица, сыр, айсберг, томаты и соус «Цезарь».', price:260, emoji:'🥖', visual:'green', tags:['курица','цезарь'] },
  { id:'club-sandwich', category:'sandwiches', name:'Клаб-сэндвич', description:'Тостовый хлеб, курица, сыр, овощи, яйцо и соус.', price:280, emoji:'🥪', visual:'pink', tags:['курица','тост'] },
  { id:'philly-beef', category:'sandwiches', name:'Чиабатта «Philly»', description:'Говядина, сыр, грибы, лук, перец и чесночный соус.', price:330, emoji:'🥪', visual:'dark', tags:['говядина','грибы','сыр'] },
  { id:'hot-chicken', category:'sandwiches', name:'Горячий сэндвич', description:'Курица, сыр, огурчики, салат и сладкий чили.', price:270, emoji:'🍞', visual:'yellow', tags:['курица','чили'] },
  { id:'american-sandwich', category:'sandwiches', name:'Американский сэндвич', description:'Говядина, сыр, томаты, лук, огурчики и 1000 островов.', price:310, emoji:'🥪', visual:'orange', tags:['говядина','сыр'] },
  { id:'fried-sandwich', category:'sandwiches', name:'Жареный сэндвич', description:'Тостовый хлеб, курица, сыр и соус — обжаренный до хруста.', price:230, emoji:'🍞', visual:'dark', tags:['курица','сыр'] },
  { id:'gulliver-sandwich', category:'sandwiches', name:'Сэндвич «Гулливер»', description:'Большой сэндвич с курицей, сыром, овощами и соусом.', price:290, emoji:'🥪', visual:'green', tags:['курица'] },
  { id:'pyaterochka-sandwich', category:'sandwiches', name:'Сэндвич «Пятёрочка»', description:'Быстрый, понятный, с курицей, сыром и овощами.', price:190, emoji:'🥪', visual:'pink', tags:['курица'] },
  { id:'ciabatta-sandwich', category:'sandwiches', name:'Чиабатта-сэндвич', description:'Хрустящая чиабатта, мясо, сыр и свежие овощи.', price:290, emoji:'🥖', visual:'yellow', tags:['курица','говядина'] },
  { id:'hotdog', category:'sandwiches', name:'Хот-дог', description:'Булочка, сосиска, огурчики, лук, кетчуп и соус.', price:180, emoji:'🌭', visual:'orange', tags:[] },

  { id:'fries', category:'snacks', name:'Картофель фри', description:'Золотистый, хрустящий, горячий.', price:110, emoji:'🍟', visual:'yellow', tags:['хит'] },
  { id:'nuggets6', category:'snacks', name:'Наггетсы 6 шт.', description:'Куриные, хрустящие, с соусом на выбор.', price:160, emoji:'🍗', visual:'orange', tags:['курица'] },
  { id:'nuggets9', category:'snacks', name:'Наггетсы 9 шт.', description:'Больше хруста для большой компании.', price:220, emoji:'🍗', visual:'pink', tags:['курица'] },
  { id:'onion-rings', category:'snacks', name:'Луковые кольца', description:'Хрустящие кольца в панировке.', price:130, emoji:'🧅', visual:'yellow', tags:[] },
  { id:'wings', category:'snacks', name:'Крылышки', description:'Сочные крылья с соусом на выбор.', price:240, emoji:'🍗', visual:'dark', tags:['курица'] },
  { id:'garlic-croutons', category:'snacks', name:'Гренки с чесночным соусом', description:'Чесночные гренки и холодный соус.', price:130, emoji:'🧄', visual:'green', tags:[] },
  { id:'fish-nuggets', category:'snacks', name:'Рыбные наггетсы', description:'Нежная рыба в хрустящей панировке.', price:190, emoji:'🐟', visual:'pink', tags:[] },

  { id:'caesar-salad', category:'salads', name:'Салат «Цезарь»', description:'Курица, салат, томаты, сыр, сухарики, соус.', price:230, emoji:'🥗', visual:'green', tags:['курица'] },
  { id:'caucasian-salad', category:'salads', name:'Кавказский салат', description:'Томаты, огурцы, зелень, лук и яркая заправка.', price:180, emoji:'🥗', visual:'pink', tags:[] },
  { id:'big-hit-salad', category:'salads', name:'Салат «Биг Хит»', description:'Сытный салат с курицей, сыром, овощами и соусом.', price:250, emoji:'🥗', visual:'orange', tags:['курица','сыр'] },
  { id:'chips-salad', category:'salads', name:'Салат в пачке чипсов', description:'Необычная подача: салат, соус и хруст чипсов.', price:230, emoji:'🥔', visual:'yellow', tags:[] },

  { id:'waffle', category:'desserts', name:'Венская вафля', description:'Тёплая вафля с топпингом на выбор.', price:170, emoji:'🧇', visual:'yellow', tags:[] },
  { id:'syrniki', category:'desserts', name:'Сырники', description:'Нежные сырники со сметаной или топпингом.', price:190, emoji:'🥞', visual:'pink', tags:[] },
  { id:'baklava-icecream', category:'desserts', name:'Пахлава с мороженым', description:'Восточная сладость и холодное мороженое.', price:220, emoji:'🍨', visual:'orange', tags:[] },
  { id:'napoleon', category:'desserts', name:'Торт «Наполеон»', description:'Классический слоёный кусок торта.', price:160, emoji:'🍰', visual:'yellow', tags:[] },
  { id:'medovik', category:'desserts', name:'Торт «Медовик»', description:'Медовые коржи и нежный крем.', price:160, emoji:'🍰', visual:'pink', tags:[] },
  { id:'donuts', category:'desserts', name:'Пончики', description:'Сахарная пудра или сладкий топпинг.', price:130, emoji:'🍩', visual:'orange', tags:[] },

  { id:'smoothie', category:'drinks', name:'Смузи', description:'Фруктовый заряд свежести.', price:170, emoji:'🥤', visual:'green', tags:[] },
  { id:'milkshake', category:'drinks', name:'Коктейль', description:'Молочный коктейль, густой и холодный.', price:160, emoji:'🥛', visual:'pink', tags:[] },
  { id:'soda', category:'drinks', name:'Газировка 0.5', description:'Кола, лимонад или другая газировка.', price:90, emoji:'🥤', visual:'orange', tags:[] },
  { id:'juice', category:'drinks', name:'Сок 0.3', description:'Яблоко, апельсин, мультифрукт.', price:80, emoji:'🧃', visual:'yellow', tags:[] },
  { id:'tea', category:'drinks', name:'Чай', description:'Чёрный, зелёный или фруктовый.', price:70, emoji:'🍵', visual:'green', tags:[] },
  { id:'coffee', category:'drinks', name:'Кофе', description:'Американо, капучино или латте.', price:110, emoji:'☕', visual:'dark', tags:[] },

  ...sauces.map((name, index) => ({ id:`sauce-${index}`, category:'sauces', name:`Соус «${name}»`, description:'Порция соуса к любому блюду.', price:35, emoji:'🥣', visual:['orange','green','pink','yellow'][index % 4], tags:[name.toLowerCase()] }))
];

const combos = [
  { id:'shawarma-combo', name:'Шаурма Комбо', description:'Шаурма стандартная + фри + напиток + соус.', price:390, emoji:'🌯', visual:'orange', flags:['мясо','напиток','соус'] },
  { id:'big-hunger', name:'Большой голод', description:'Шаурма большая + фри + 6 наггетсов + напиток + 2 соуса.', price:590, emoji:'🌯', visual:'dark', flags:['мясо','напиток','twoSauces'] },
  { id:'burger-combo', name:'Бургер Комбо', description:'Бургер + фри + напиток + соус.', price:430, emoji:'🍔', visual:'pink', flags:['drink','sauce'] },
  { id:'wings-combo', name:'Крылья Комбо', description:'Крылышки + фри/кольца + напиток + 2 соуса.', price:490, emoji:'🍗', visual:'yellow', flags:['side','drink','twoSauces'] },
  { id:'doner-combo', name:'Донер Комбо', description:'Донер + фри + напиток + соус.', price:410, emoji:'🥙', visual:'green', flags:['мясо','drink','sauce'] },
  { id:'gyres-combo', name:'Гирес Комбо', description:'Гирес + фри + напиток + мацони/чесночный.', price:410, emoji:'🫓', visual:'orange', flags:['meat','drink','gyresSauce'] },
  { id:'tantuni-combo', name:'Тантуни Комбо', description:'Тантуни + фри/кольца + напиток + соус.', price:420, emoji:'🌮', visual:'pink', flags:['meat','side','drink','sauce'] },
  { id:'sandwich-combo', name:'Сэндвич Комбо', description:'Сэндвич + фри + напиток + соус.', price:400, emoji:'🥪', visual:'dark', flags:['sandwich','drink','sauce'] },
  { id:'fish-combo', name:'Рыбный Комбо', description:'Рыбные наггетсы + фри + напиток + соус.', price:390, emoji:'🐟', visual:'green', flags:['drink','fishSauce'] },
  { id:'quesadilla-combo', name:'Кесадилья Комбо', description:'Кесадилья + 4 наггетса/кольца + напиток + соус.', price:440, emoji:'🫔', visual:'yellow', flags:['side','drink','sauce'] },
  { id:'morning-combo', name:'Утреннее комбо', description:'Сырники или вафля + кофе/чай + мини-смузи/сок.', price:320, emoji:'☕', visual:'pink', flags:['morning'] },
  { id:'sweet-combo', name:'Сладкое комбо', description:'Десерт на выбор + кофе или чай.', price:280, emoji:'🍰', visual:'orange', flags:['sweet'] }
];

const sets = [
  { id:'duet', name:'Сет «Дуэт»', size:'НА ДВОИХ', description:'2 стандартные шаурмы, большая фри, 6 наггетсов, 2 напитка и 2 соуса.', price:890, emoji:'🌯' },
  { id:'shawarma-party', name:'Сет «Шаурма Party»', size:'НА 3–4', description:'3 стандартные шаурмы, 2 большие фри, 12 наггетсов, кольца, напитки и 4 соуса.', price:1590, emoji:'🎉' },
  { id:'burger-band', name:'Сет «Бургер Банда»', size:'НА 2–3', description:'2 бургера, 2 фри, крылышки, 6 наггетсов, напитки и соусы.', price:1280, emoji:'🍔' },
  { id:'east', name:'Сет «Восточный»', size:'НА 2–3', description:'Донер, гирес, тантуни, фри, кольца, 3 напитка и 3 соуса.', price:1260, emoji:'🫓' },
  { id:'friends-evening', name:'Сет «Вечер с друзьями»', size:'НА 4–5', description:'2 большие шаурмы, 2 бургера, крылышки, 12 наггетсов, фри, кольца, гренки, напитки и соусы.', price:2290, emoji:'🔥' },
  { id:'crispy', name:'Сет «Хрустящий»', size:'НА 2–3', description:'Крылышки, 9 наггетсов, рыбные наггетсы, кольца, гренки, фри, 3 напитка и 4 соуса.', price:1390, emoji:'🍗' },
  { id:'family', name:'Сет «Семейный»', size:'НА 4', description:'4 маленькие шаурмы или 4 сэндвича, 2 большие фри, 12 наггетсов, салат, напитки и соусы.', price:1690, emoji:'👨‍👩‍👧‍👦' },
  { id:'sweet-table', name:'Сет «Сладкий стол»', size:'НА КОМПАНИЮ', description:'Вафли, сырники, пончики, пахлава с мороженым, 2 куска торта и чай/кофе.', price:1190, emoji:'🍩' }
];

const builderBase = {
  shawarma: {
    title: 'Собери свою шаурму', icon: '🌯', label: 'Шаурма',
    sizes: [{ name:'Маленькая', price:190 }, { name:'Стандартная', price:240 }, { name:'Большая', price:290 }],
    breads: [],
    proteinPrices: { 'Курица': 0, 'Говядина': 35 },
    veggies: ['Капуста', 'Огурец', 'Томат', 'Красный лук', 'Зелень'],
    extras: [{ name:'Сыр', price:35 }, { name:'Двойное мясо', price:80 }, { name:'Фри внутрь', price:35 }, { name:'Халапеньо', price:30 }, { name:'Грибы', price:40 }]
  },
  sandwich: {
    title: 'Собери свой сэндвич', icon: '🥪', label: 'Сэндвич',
    sizes: [{ name:'Багет', price:210 }, { name:'Тостовый хлеб', price:190 }, { name:'Чиабатта', price:240 }, { name:'Батон', price:200 }],
    breads: ['Багет','Тостовый хлеб','Чиабатта','Батон'],
    proteinPrices: { 'Курица': 0, 'Говядина': 45 },
    veggies: ['Айсберг', 'Огурец', 'Томат', 'Маринованный огурец', 'Красный лук'],
    extras: [{ name:'Сыр', price:35 }, { name:'Двойное мясо', price:85 }, { name:'Фри внутрь', price:35 }, { name:'Халапеньо', price:30 }, { name:'Грибы', price:40 }]
  }
};

let cart = JSON.parse(localStorage.getItem('jelani_cart') || '[]');
let promoCode = localStorage.getItem('jelani_promo') || '';
let currentCategory = 'all';
let activeSearchFilter = '';
let currentBuilderType = 'shawarma';
let currentCombo = null;
let builderState = null;
let orderStatusTimer = null;

const PROFILE_KEY = 'jelani_profile';
const ACTIVE_ORDERS_KEY = 'jelani_active_orders';
const TRACKER_HIDE_DELAY = 14000;
const STATUS_STEPS = {
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

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

function safeJson(key, fallback){
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}
function saveCart(){ localStorage.setItem('jelani_cart', JSON.stringify(cart)); }
function cartSubtotal(){ return cart.reduce((sum,item)=>sum + item.price * item.qty,0); }
function normalizedPromo(){ return promoCode.trim().toUpperCase(); }
function firstOrderPromoAvailable(){ return !localStorage.getItem('jelani_first_order_used') && safeJson('jelani_orders', []).length === 0; }
function promoDiscount(){ return isAuthorized() && normalizedPromo() === 'JELANI10' && firstOrderPromoAvailable() ? Math.round(cartSubtotal() * 0.1) : 0; }
function cartTotal(){ return Math.max(0, cartSubtotal() - promoDiscount()); }
function esc(value){ return String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[char])); }
function showToast(text){ const el=$('#toast'); el.textContent=text; el.classList.add('show'); clearTimeout(showToast.timeout); showToast.timeout=setTimeout(()=>el.classList.remove('show'),2200); }
function syncPageScroll(){
  const menuOpen = $('#mobile-menu')?.classList.contains('is-open');
  const overlayOpen = $$('.overlay.open').length > 0;

  document.body.style.overflow = (overlayOpen || menuOpen) ? 'hidden' : '';
  document.body.classList.toggle('has-open-overlay', overlayOpen);
  document.body.classList.toggle('has-open-mobile-menu', Boolean(menuOpen));
}
function openOverlay(id){ $(id).classList.add('open'); $(id).setAttribute('aria-hidden','false'); syncPageScroll(); }
function closeOverlay(id){ $(id).classList.remove('open'); $(id).setAttribute('aria-hidden','true'); syncPageScroll(); }
function closeOverlays(ids){
  ids.forEach(id => {
    const overlay = $(id);
    if(overlay?.classList.contains('open')) closeOverlay(id);
  });
}
function openMobileMenu(){
  const menu = $('#mobile-menu'); const toggle = $('#mobile-menu-toggle');
  if(!menu || !toggle) return;
  menu.classList.add('is-open'); menu.setAttribute('aria-hidden','false');
  toggle.classList.add('is-open'); toggle.setAttribute('aria-expanded','true');
  syncPageScroll();
}
function closeMobileMenu(){
  const menu = $('#mobile-menu'); const toggle = $('#mobile-menu-toggle');
  if(!menu || !toggle) return;
  menu.classList.remove('is-open'); menu.setAttribute('aria-hidden','true');
  toggle.classList.remove('is-open'); toggle.setAttribute('aria-expanded','false');
  syncPageScroll();
}
function toggleMobileMenu(){ $('#mobile-menu')?.classList.contains('is-open') ? closeMobileMenu() : openMobileMenu(); }
function visualClass(visual){ return `visual-${visual || 'orange'}`; }

function getProfile(){
  const profile = safeJson(PROFILE_KEY, null);
  return profile && typeof profile === 'object' ? profile : null;
}

function isAuthorized(){
  const profile = getProfile();
  return Boolean(profile?.name && isRussianMobilePhone(profile.phone));
}

function profilePayload(){
  const profile = getProfile();
  return {
    authorized: isAuthorized(),
    name: profile?.name || '',
    phone: profile?.phone || ''
  };
}

function saveProfile(profile){
  const name = String(profile?.name || '').trim();
  const phone = String(profile?.phone || '').trim();
  if(!name) throw new Error('Введите имя');
  if(!isRussianMobilePhone(phone)) throw new Error('Введите российский мобильный номер');

  localStorage.setItem(PROFILE_KEY, JSON.stringify({
    name,
    phone: formatRussianPhone(phone),
    updatedAt: new Date().toISOString()
  }));
}

function createTrackingToken(){
  const bytes = new Uint8Array(16);
  if(window.crypto?.getRandomValues) window.crypto.getRandomValues(bytes);
  else bytes.forEach((_, index)=>{ bytes[index] = Math.floor(Math.random() * 256); });
  return [...bytes].map(byte=>byte.toString(16).padStart(2,'0')).join('');
}

function flowForDelivery(delivery){
  return String(delivery || '').toLowerCase().includes('достав') ? 'delivery' : 'pickup';
}

function activeOrders(){
  return safeJson(ACTIVE_ORDERS_KEY, []);
}

function saveActiveOrders(list){
  localStorage.setItem(ACTIVE_ORDERS_KEY, JSON.stringify(list.slice(0,5)));
}

function currentActiveOrders(){
  const now = Date.now();
  const list = activeOrders();
  const filtered = list.filter(order => !order.hideAfter || order.hideAfter > now);
  if(filtered.length !== list.length) saveActiveOrders(filtered);
  return filtered;
}

function localStatusFromOrder(order){
  const flow = flowForDelivery(order.delivery);
  return {
    id: order.id,
    flow,
    delivery: order.delivery,
    statusIndex: 0,
    status: 'Заказ создан',
    detail: 'Заказ ушел на кухню.',
    steps: STATUS_STEPS[flow],
    terminal: false,
    canceled: false,
    total: order.total || 0,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
}

function normalizeStatus(status, trackingToken=''){
  const flow = status?.flow === 'delivery' ? 'delivery' : 'pickup';
  return {
    ...status,
    flow,
    steps: Array.isArray(status?.steps) ? status.steps : STATUS_STEPS[flow],
    trackingToken: trackingToken || status?.trackingToken || ''
  };
}

function updateStoredOrderStatus(status){
  if(!status?.id) return;
  const orders = safeJson('jelani_orders', []);
  const next = orders.map(order => order.id === status.id ? {
    ...order,
    status: status.status,
    statusDetail: status.detail,
    statusIndex: status.statusIndex,
    terminal: status.terminal,
    canceled: status.canceled,
    updatedAt: status.updatedAt
  } : order);
  localStorage.setItem('jelani_orders', JSON.stringify(next));
}

function upsertActiveOrder(status, trackingToken=''){
  if(!status?.id) return;
  const normalized = normalizeStatus(status, trackingToken);
  const existing = activeOrders().find(order => order.id === normalized.id);
  const nextOrder = {
    ...existing,
    ...normalized,
    trackingToken: normalized.trackingToken || existing?.trackingToken || '',
    hideAfter: normalized.terminal ? Date.now() + TRACKER_HIDE_DELAY : null
  };
  const next = [nextOrder, ...activeOrders().filter(order => order.id !== normalized.id)];
  saveActiveOrders(next);
  updateStoredOrderStatus(nextOrder);
  renderOrderTracker();
  renderAccount();
}

function dismissActiveOrder(orderId){
  const list = currentActiveOrders().filter(order => order.id !== orderId);
  saveActiveOrders(list);
  renderOrderTracker();
  renderAccount();
}

function renderOrderTracker(){
  const tracker = $('#order-tracker');
  if(!tracker) return;

  const order = currentActiveOrders()[0];
  tracker.hidden = !order;
  if(!order) return;

  const steps = order.steps || STATUS_STEPS[order.flow] || STATUS_STEPS.pickup;
  $('#tracker-title').textContent = `Заказ ${order.id}`;
  $('#tracker-status').textContent = order.status || 'Заказ создан';
  $('#tracker-detail').textContent = order.detail || 'Статус обновляется автоматически.';
  $('#tracker-steps').innerHTML = steps.map((step, index)=>{
    const done = index < Number(order.statusIndex);
    const current = index === Number(order.statusIndex);
    return `<li class="${done ? 'is-done' : current ? 'is-current' : ''}"><span>${index + 1}</span><strong>${esc(step.label)}</strong></li>`;
  }).join('');
  $('#tracker-received').hidden = !order.terminal;

  if(order.terminal && order.hideAfter){
    window.setTimeout(renderOrderTracker, Math.max(300, order.hideAfter - Date.now() + 50));
  }
}

async function syncActiveOrderStatuses(){
  const orders = currentActiveOrders().filter(order => order.trackingToken && !order.terminal);
  if(!orders.length) return;

  await Promise.all(orders.map(async order => {
    try {
      const response = await fetch(`/api/order-status?id=${encodeURIComponent(order.id)}&track=${encodeURIComponent(order.trackingToken)}`);
      if(!response.ok) return;
      const data = await response.json();
      if(data.ok && data.status) upsertActiveOrder(data.status, order.trackingToken);
    } catch {
      // Статус обновится при следующем опросе.
    }
  }));
}

function startStatusPolling(){
  if(orderStatusTimer) window.clearInterval(orderStatusTimer);
  syncActiveOrderStatuses();
  orderStatusTimer = window.setInterval(syncActiveOrderStatuses, 10000);
}

function accountStatsTemplate(){
  const orders = safeJson('jelani_orders', []);
  const favorites = safeJson('jelani_favorites', []);
  const spent = orders.reduce((sum, order)=>sum + Number(order.total || 0), 0);
  return [
    ['Заказы', orders.length],
    ['Потрачено', formatPrice(spent)],
    ['Любимые', favorites.length]
  ].map(([label, value])=>`<div class="account-stat"><span>${label}</span><strong>${value}</strong></div>`).join('');
}

function renderAccount(){
  const form = $('#account-form');
  if(!form) return;

  const profile = getProfile();
  const nameInput = $('#account-name');
  const phoneInput = $('#account-phone');

  if(nameInput && document.activeElement !== nameInput) nameInput.value = profile?.name || '';
  if(phoneInput && document.activeElement !== phoneInput) phoneInput.value = profile?.phone || '';

  $('#account-state').textContent = isAuthorized()
    ? 'Профиль сохранен. Промокоды доступны.'
    : 'Сохраните имя и российский номер, чтобы использовать промокоды.';
  $('#account-stats').innerHTML = accountStatsTemplate();

  const active = currentActiveOrders()[0];
  const activeEl = $('#account-active');
  if(activeEl){
    activeEl.hidden = !active;
    activeEl.innerHTML = active ? `<strong>${esc(active.id)} - ${esc(active.status || 'Заказ создан')}</strong><p>${esc(active.detail || 'Статус обновляется автоматически.')}</p>` : '';
  }

  const orders = safeJson('jelani_orders', []);
  $('#history-list').innerHTML = orders.length
    ? orders.map(o=>historyTemplate(o)).join('')
    : '<div class="history-empty">Заказов пока нет.<br>Оформленные заказы появятся здесь.</div>';
}

function renderCategories(){
  $('#category-tabs').innerHTML = categoryMeta.map(c=>`<button class="category-tab ${currentCategory===c.id?'active':''}" data-category="${c.id}" type="button">${c.label}</button>`).join('');
}
function cardTemplate(item, type='menu'){
  const action = type==='combo' ? `data-combo="${item.id}"` : type==='set' ? `data-set="${item.id}"` : `data-add="${item.id}"`;
  const label = type==='combo' ? 'Выбрать' : type==='set' ? 'В корзину' : 'В корзину';
  if(type==='set') return `<article class="set-card"><span class="set-size">${item.size}</span><h3>${item.name}</h3><p>${item.description}</p><div class="set-price">${formatPrice(item.price)}</div><button type="button" ${action} aria-label="${label}">+</button></article>`;
  return `<article class="food-card ${type==='menu'?'menu-card':''}">
    <div class="food-card__visual ${visualClass(item.visual)}"><span>${item.emoji}</span>${type==='combo'?'<span class="food-card__badge">ВЫБОР ВНУТРИ</span>':''}</div>
    <div class="food-card__body"><h3 class="food-card__title">${item.name}</h3><p class="food-card__desc">${item.description}</p><div class="food-card__footer"><strong class="price">${formatPrice(item.price)}</strong><button class="card-add" type="button" ${action} aria-label="${label}" title="${label}">+</button></div></div>
  </article>`;
}
function renderCombos(){ $('#combo-grid').innerHTML = combos.map(item=>cardTemplate(item,'combo')).join(''); }
function renderSets(){ $('#sets-grid').innerHTML = sets.map(item=>cardTemplate(item,'set')).join(''); }
function renderMenu(){
  const list = menuItems.filter(item=>currentCategory==='all'||item.category===currentCategory);
  $('#menu-grid').innerHTML = list.map(item=>cardTemplate(item,'menu')).join('');
}
function findMenuItem(id){ return menuItems.find(item=>item.id===id); }
function findCombo(id){ return combos.find(item=>item.id===id); }
function findSet(id){ return sets.find(item=>item.id===id); }
function makeCartItem({ id, name, price, emoji, details='' }){ return { cartId:`${id}-${Date.now()}-${Math.random().toString(16).slice(2)}`, id, name, price, emoji, details, qty:1 }; }
function addCart(item){ cart.push(item); saveCart(); renderCart(); showToast('Добавлено в корзину'); }
function promoMessage(){
  if(!normalizedPromo()) return '';
  if(!isAuthorized()) return 'Войдите в личный кабинет, чтобы применить промокод';
  if(normalizedPromo() !== 'JELANI10') return 'Такой промокод не найден';
  if(!firstOrderPromoAvailable()) return 'JELANI10 действует только на первый заказ';
  return `Скидка ${formatPrice(promoDiscount())} применена`;
}
function syncPromoInputs(){
  const cartInput = $('#promo-code');
  const checkoutInput = $('#checkout-promo');
  const applyButton = $('#apply-promo');
  const locked = !isAuthorized();
  if(cartInput && document.activeElement !== cartInput) cartInput.value = normalizedPromo();
  if(checkoutInput && document.activeElement !== checkoutInput) checkoutInput.value = normalizedPromo();
  if(cartInput){
    cartInput.disabled = locked;
    cartInput.placeholder = locked ? 'Войдите в кабинет' : 'JELANI10';
  }
  if(checkoutInput){
    checkoutInput.disabled = locked;
    checkoutInput.placeholder = locked ? 'Доступен после входа' : 'JELANI10';
  }
  if(applyButton) applyButton.textContent = locked ? 'Войти' : 'Применить';
  $('#cart-promo')?.classList.toggle('is-locked', locked);
  const message = $('#promo-message');
  if(message) message.textContent = promoMessage();
}
function applyPromo(code){
  if(!isAuthorized()){
    promoCode = '';
    localStorage.removeItem('jelani_promo');
    syncPromoInputs();
    openHistory();
    showToast('Промокод доступен после входа в личный кабинет');
    return;
  }
  promoCode = String(code || '').trim().toUpperCase();
  if(promoCode) localStorage.setItem('jelani_promo', promoCode);
  else localStorage.removeItem('jelani_promo');
  renderCart();
}
function updateCartCount(){
  const count=cart.reduce((sum,item)=>sum+item.qty,0);
  $('#cart-count').textContent=count;
  $('#mobile-cart-total').textContent=cart.length?formatPrice(cartTotal()):'Корзина пуста';
  $('#mobile-cart')?.classList.toggle('is-visible', count > 0);
  document.body.classList.toggle('has-cart', count > 0);
}
function renderCart(){
  const wrapper=$('#cart-items'), empty=$('#cart-empty'), subtotal=cartSubtotal(), discount=promoDiscount(), total=cartTotal();
  updateCartCount();
  $('#cart-subtotal').textContent=formatPrice(subtotal);
  $('#cart-total').textContent=formatPrice(total);
  $('#checkout-total').textContent=formatPrice(total);
  $('#cart-discount').textContent=`−${formatPrice(discount)}`;
  $('#cart-discount-row').hidden = discount <= 0;
  $('#cart-upsells').hidden = cart.length === 0;
  syncPromoInputs();
  empty.hidden=cart.length>0;
  wrapper.innerHTML=cart.map(item=>`<article class="cart-row"><div class="cart-row__icon">${item.emoji||'🍽️'}</div><div><div class="cart-row__name">${esc(item.name)}</div>${item.details?`<div class="cart-row__details">${esc(item.details)}</div>`:''}</div><div class="cart-row__right"><div class="cart-row__price">${formatPrice(item.price*item.qty)}</div><div class="cart-qty"><button class="qty-button" data-cart-decrease="${item.cartId}" type="button">−</button><span>${item.qty}</span><button class="qty-button" data-cart-increase="${item.cartId}" type="button">+</button></div><button class="cart-remove" data-cart-remove="${item.cartId}" type="button">убрать</button></div></article>`).join('');
  $('#checkout-btn').disabled=!cart.length;
}
function changeCart(id, delta){ const item=cart.find(x=>x.cartId===id); if(!item)return; item.qty+=delta; if(item.qty<=0)cart=cart.filter(x=>x.cartId!==id); saveCart();renderCart(); }

function choiceControl(group, option, checked, type='radio', price=''){
  const role = type === 'radio' ? 'radio' : 'checkbox';
  return `<div class="choice-option ${checked ? 'is-selected' : ''}" role="${role}" aria-checked="${checked ? 'true' : 'false'}" tabindex="0" data-choice-control>
    <input type="${type}" name="${group}" value="${option}" ${checked ? 'checked' : ''} tabindex="-1" aria-hidden="true">
    <span>${option}</span>${price ? `<small class="option-price">${price}</small>` : ''}
  </div>`;
}

function getComboControl(label, options, key, type='radio', required=true){
  const name=`combo-${key}`;
  return `<div class="choice-group"><h3>${label}</h3><div class="option-grid option-grid--2">${options.map((option,index)=>{
    const checked = type === 'checkbox' && key === 'twoSauces'
      ? index < 2
      : required && index === 0;
    return choiceControl(name, option, checked, type);
  }).join('')}</div></div>`;
}
function openCombo(id){
  currentCombo=findCombo(id); if(!currentCombo)return;
  const f=currentCombo.flags||[]; let html=`<p style="margin:0;color:var(--muted);font-size:13px">${currentCombo.description}</p>`;
  if(f.includes('мясо')||f.includes('meat')) html+=getComboControl('Выбери мясо',['Курица','Говядина'],'meat');
  if(f.includes('side')) html+=getComboControl('Гарнир',['Картофель фри','Луковые кольца'],'side');
  if(f.includes('sandwich')) html+=getComboControl('Сэндвич',['Жареный','Американский','Чиабатта-сэндвич'],'sandwich');
  if(f.includes('morning')){html+=getComboControl('Основа',['Сырники','Венская вафля'],'morningBase');html+=getComboControl('Горячий напиток',['Кофе','Чай'],'morningHot');html+=getComboControl('Холодный напиток',['Мини-смузи','Сок'],'morningCold');}
  if(f.includes('sweet')){html+=getComboControl('Десерт',['Пахлава с мороженым','Пончики','Наполеон','Медовик'],'sweetBase');html+=getComboControl('Напиток',['Кофе','Чай'],'sweetDrink');}
  if(f.includes('drink')||f.includes('напиток')) html+=getComboControl('Напиток',drinks,'drink');
  if(f.includes('gyresSauce')) html+=getComboControl('Соус',['Мацони','Чесночный'],'sauce');
  else if(f.includes('fishSauce')) html+=getComboControl('Соус',['Кисло-сладкий','Чесночный'],'sauce');
  else if(f.includes('sauce')||f.includes('соус')) html+=getComboControl('Соус',sauces,'sauce');
  if(f.includes('twoSauces')) html+=getComboControl('Два соуса',sauces,'twoSauces','checkbox',false);
  $('#combo-title').textContent=currentCombo.name;
  $('#combo-form').innerHTML=html;
  $('#combo-price').textContent=formatPrice(currentCombo.price);
  syncChoiceOptions($('#combo-form'));
  openOverlay('#combo-overlay');
}
function valuesByName(name){ return $$(`input[name="${name}"]:checked`).map(el=>el.value); }
function addCombo(){
  if(!currentCombo)return; const data=[]; const f=currentCombo.flags||[];
  const possible=['meat','side','sandwich','morningBase','morningHot','morningCold','sweetBase','sweetDrink','drink','sauce','twoSauces'];
  possible.forEach(key=>{const list=valuesByName(`combo-${key}`);if(list.length)data.push(list.join(', '));});
  addCart(makeCartItem({id:currentCombo.id,name:currentCombo.name,price:currentCombo.price,emoji:currentCombo.emoji,details:data.join(' · ')})); closeOverlay('#combo-overlay');
}

function initialBuilderState(type){
  const base=builderBase[type];
  return { type, size:base.sizes[1]?.name||base.sizes[0].name, meat:'Курица', veggies:[...base.veggies], sauces:['Чесночный'], extras:[] };
}
function radioOption(group, option, checked, price=''){
  return choiceControl(group, option, checked, 'radio', price);
}
function checkboxOption(group, option, checked, price=''){
  return choiceControl(group, option, checked, 'checkbox', price);
}

function syncChoiceOptions(scope=document){
  const root = scope || document;
  root.querySelectorAll?.('[data-choice-control]').forEach(control => {
    const input = control.querySelector('input');
    if(!input) return;
    control.classList.toggle('is-selected', input.checked);
    control.setAttribute('aria-checked', input.checked ? 'true' : 'false');
  });
}

function activateChoiceOption(control){
  const input = control?.querySelector('input');
  if(!input || input.disabled) return;

  if(input.type === 'radio'){
    $$('[data-choice-control] input').filter(item => item.name === input.name).forEach(item => { item.checked = false; });
    input.checked = true;
  } else {
    input.checked = !input.checked;
  }

  input.dispatchEvent(new Event('change', { bubbles:true }));
  syncChoiceOptions(document);
}
function renderBuilder(){
  const base=builderBase[currentBuilderType]; builderState ||= initialBuilderState(currentBuilderType);
  $('#builder-title').textContent=base.title; $('#builder-summary-title').textContent=builderState.size+' '+base.label; $('#builder-preview').textContent=base.icon;
  const sizes=base.sizes.map(s=>radioOption('builder-size',s.name,builderState.size===s.name,formatPrice(s.price))).join('');
  const meats=Object.entries(base.proteinPrices).map(([name,price])=>radioOption('builder-meat',name,builderState.meat===name,price?`+${formatPrice(price)}`:'в базе')).join('');
  const vegetables=base.veggies.map(v=>checkboxOption('builder-veggies',v,builderState.veggies.includes(v),'')).join('');
  const sauceList=sauces.map(s=>checkboxOption('builder-sauces',s,builderState.sauces.includes(s),'')).join('');
  const extras=base.extras.map(e=>checkboxOption('builder-extras',e.name,builderState.extras.includes(e.name),`+${formatPrice(e.price)}`)).join('');
  $('#builder-form').innerHTML=`
    <section class="form-block"><h3>${currentBuilderType==='sandwich'?'Выбери хлеб':'Выбери размер'}</h3><div class="option-grid">${sizes}</div></section>
    <section class="form-block"><h3>Мясо</h3><div class="option-grid option-grid--2">${meats}</div></section>
    <section class="form-block"><h3>Овощи и зелень</h3><p class="form-hint">Сними галочки с того, чего не хочешь.</p><div class="option-grid">${vegetables}</div></section>
    <section class="form-block"><h3>Соусы</h3><p class="form-hint">До 2 соусов — бесплатно. Каждый следующий +35 ₽.</p><div class="option-grid">${sauceList}</div></section>
    <section class="form-block"><h3>Добавить в ${currentBuilderType==='sandwich'?'сэндвич':'шаурму'}</h3><div class="option-grid option-grid--2">${extras}</div></section>`;
  syncChoiceOptions($('#builder-form'));
  updateBuilderSummary();
}
function readBuilder(){
  builderState.size=$('input[name="builder-size"]:checked')?.value||builderState.size;
  builderState.meat=$('input[name="builder-meat"]:checked')?.value||builderState.meat;
  builderState.veggies=valuesByName('builder-veggies');
  builderState.sauces=valuesByName('builder-sauces');
  builderState.extras=valuesByName('builder-extras');
}
function builderPrice(){
  const base=builderBase[currentBuilderType];
  const size=base.sizes.find(s=>s.name===builderState.size); const meat=base.proteinPrices[builderState.meat]||0;
  const extras=builderState.extras.reduce((sum,name)=>sum+(base.extras.find(e=>e.name===name)?.price||0),0);
  const extraSauces=Math.max(0,builderState.sauces.length-2)*35;
  return (size?.price||0)+meat+extras+extraSauces;
}
function updateBuilderSummary(){
  const price=builderPrice();
  const phrase=[builderState.meat, builderState.veggies.length?builderState.veggies.join(', '):'без овощей', builderState.sauces.length?`соусы: ${builderState.sauces.join(', ')}`:'без соуса', builderState.extras.length?`добавки: ${builderState.extras.join(', ')}`:''].filter(Boolean).join(' · ');
  $('#builder-summary-text').textContent=phrase; $('#builder-price').textContent=formatPrice(price);
}
function openBuilder(type){ currentBuilderType=type; builderState=initialBuilderState(type); renderBuilder(); openOverlay('#builder-overlay'); }
function addBuilder(){
  const base=builderBase[currentBuilderType]; const price=builderPrice(); const details=[builderState.meat, builderState.veggies.length?builderState.veggies.join(', '):'без овощей', builderState.sauces.length?builderState.sauces.join(', '):'без соуса', builderState.extras.join(', ')].filter(Boolean).join(' · ');
  addCart(makeCartItem({id:`custom-${currentBuilderType}`,name:`${base.label} — своя сборка`,price,emoji:base.icon,details})); closeOverlay('#builder-overlay');
}

function addUpsell(kind){
  const upsells = {
    fries: { id:'upsell-fries', name:'Картофель фри к заказу', price:79, emoji:'🍟', details:'допродажа' },
    drink: { id:'upsell-drink', name:'Напиток 0.5', price:69, emoji:'🥤', details:'допродажа' },
    sauce: { id:'upsell-sauce', name:'Соус на выбор', price:35, emoji:'🥣', details:'допродажа' },
    cheese: { id:'upsell-cheese', name:'Добавка: сыр', price:35, emoji:'🧀', details:'к основному блюду' }
  };
  if(upsells[kind]) addCart(makeCartItem(upsells[kind]));
}
function snapshotItems(items=cart){
  return items.map(item=>({ id:item.id, name:item.name, price:item.price, emoji:item.emoji, details:item.details, qty:item.qty }));
}
function restoreCart(items){
  cart = (items || []).map(item => ({ ...makeCartItem(item), qty:item.qty || 1 }));
  saveCart();
  renderCart();
  closeOverlays(['#history-overlay', '#favorites-overlay', '#search-overlay']);
  openOverlay('#cart-overlay');
  showToast('Заказ добавлен в корзину');
}
function saveFavoriteFromCart(){
  if(!cart.length){ showToast('Корзина пока пустая'); return; }
  const favorites = safeJson('jelani_favorites', []);
  favorites.unshift({ id:`FAV-${Date.now().toString().slice(-6)}`, date:new Date().toLocaleString('ru-RU'), total:cartTotal(), items:snapshotItems() });
  localStorage.setItem('jelani_favorites', JSON.stringify(favorites.slice(0,20)));
  showToast('Добавлено в любимые заказы');
}
function saveFavoriteOrder(orderId){
  const order = safeJson('jelani_orders', []).find(item=>item.id===orderId);
  if(!order) return;
  const favorites = safeJson('jelani_favorites', []);
  favorites.unshift({ id:`FAV-${Date.now().toString().slice(-6)}`, date:new Date().toLocaleString('ru-RU'), total:order.total, items:snapshotItems(order.items) });
  localStorage.setItem('jelani_favorites', JSON.stringify(favorites.slice(0,20)));
  showToast('Заказ добавлен в избранное');
}
function updateDeliveryFields(){
  const select = $('#delivery-select');
  const field = $('#address-field');
  const input = field?.querySelector('input');
  const needsAddress = select?.value === 'Доставка';
  if(field) field.hidden = !needsAddress;
  if(input) input.required = needsAddress;
}
function normalizeRussianPhone(phone){
  const digits = String(phone || '').replace(/\D/g, '');
  if(digits.length === 11 && digits.startsWith('8')) return `7${digits.slice(1)}`;
  return digits;
}
function isRussianMobilePhone(phone){
  return /^79\d{9}$/.test(normalizeRussianPhone(phone));
}
function formatRussianPhone(phone){
  const normalized = normalizeRussianPhone(phone);
  if(!/^79\d{9}$/.test(normalized)) return phone;
  return `+7 ${normalized.slice(1,4)} ${normalized.slice(4,7)}-${normalized.slice(7,9)}-${normalized.slice(9)}`;
}
function validatePhoneField(input){
  if(!input) return false;
  const valid = isRussianMobilePhone(input.value);
  input.setCustomValidity(valid ? '' : 'Введите российский мобильный номер: +7 9XX XXX-XX-XX');
  return valid;
}
function openCheckout(){
  if(!cart.length){showToast('Сначала добавь позиции в корзину');return;}
  $('#checkout-total').textContent=formatPrice(cartTotal());
  const profile = getProfile();
  const form = $('#checkout-form');
  if(profile && form){
    const nameInput = form.querySelector('input[name="name"]');
    const phoneInput = form.querySelector('input[name="phone"]');
    if(nameInput && !nameInput.value) nameInput.value = profile.name || '';
    if(phoneInput && !phoneInput.value) phoneInput.value = profile.phone || '';
  }
  syncPromoInputs();
  updateDeliveryFields();
  closeOverlay('#cart-overlay');
  openOverlay('#checkout-overlay');
}
async function sendOrderToServer(order){
  const response = await fetch('/api/order', {
    method:'POST',
    headers:{ 'Content-Type':'application/json' },
    body:JSON.stringify(order)
  });
  const data = await response.json().catch(()=>({ ok:false }));
  if(!response.ok || data.ok === false) throw new Error(data.error || 'Telegram не подключён');
  return data;
}
async function completeCheckout(event){
  event.preventDefault();
  const formEl = event.currentTarget;
  const submit = formEl.querySelector('button[type="submit"]');
  const form = new FormData(formEl);
  const phoneInput = formEl.querySelector('input[name="phone"]');
  if(!validatePhoneField(phoneInput)){
    phoneInput.reportValidity();
    showToast('Введите российский мобильный номер');
    return;
  }
  phoneInput.value = formatRussianPhone(phoneInput.value);
  const customerName = String(form.get('name') || '').trim();
  try {
    saveProfile({ name: customerName, phone: phoneInput.value });
  } catch {
    // Форма уже проверяет обязательные поля; профиль просто не сохранится при ручной подмене.
  }
  promoCode = String(form.get('promo') || promoCode || '').trim().toUpperCase();
  if(promoCode && !isAuthorized()){
    promoCode = '';
    localStorage.removeItem('jelani_promo');
    syncPromoInputs();
    openHistory();
    showToast('Сначала сохраните профиль для промокода');
    return;
  }
  if(promoCode) localStorage.setItem('jelani_promo', promoCode);
  else localStorage.removeItem('jelani_promo');
  const discount = promoDiscount();
  const trackingToken = createTrackingToken();
  const order = {
    id:`JL-${Date.now().toString().slice(-7)}`,
    status:'Заказ создан',
    date:new Date().toLocaleString('ru-RU'),
    name:customerName,
    phone:phoneInput.value,
    delivery:form.get('delivery'),
    address:form.get('address') || '',
    payment:form.get('payment'),
    comment:form.get('comment') || '',
    promo:normalizedPromo(),
    subtotal:cartSubtotal(),
    discount,
    total:cartTotal(),
    items:snapshotItems(),
    trackingToken,
    profile:profilePayload()
  };

  submit.disabled = true;
  submit.textContent = 'Отправляем заказ...';
  let telegramSent = false;
  try {
    const data = await sendOrderToServer(order);
    telegramSent = true;
    const status = data.status || localStatusFromOrder(order);
    order.status = status.status;
    order.statusDetail = status.detail;
    order.tracking = Boolean(data.tracking);
    upsertActiveOrder(status, trackingToken);
  } catch (error) {
    order.status = 'Сохранён локально';
    order.telegramError = error.message;
  }

  const orders=safeJson('jelani_orders', []);
  orders.unshift(order);
  localStorage.setItem('jelani_orders', JSON.stringify(orders.slice(0,30)));
  if(discount > 0 && normalizedPromo() === 'JELANI10') localStorage.setItem('jelani_first_order_used','true');
  promoCode='';
  localStorage.removeItem('jelani_promo');
  cart=[];
  saveCart();
  renderCart();
  formEl.reset();
  updateDeliveryFields();
  renderAccount();
  submit.disabled = false;
  submit.innerHTML = 'Подтвердить заказ <span>→</span>';
  closeOverlay('#checkout-overlay');
  showToast(telegramSent ? `Заказ ${order.id} принят` : `Заказ ${order.id} сохранён на устройстве`);
}
function orderSummary(order){
  const count=(order.items||[]).reduce((sum,item)=>sum+(item.qty||1),0);
  const delivery = order.delivery ? ` · ${esc(order.delivery)}` : '';
  const status = order.status || (order.delivery ? 'Заказ создан' : 'Любимый заказ');
  return `${order.date}${delivery} · ${count} поз. · ${esc(status)}`;
}
function historyTemplate(order, favorite=false){
  return `<article class="history-item">
    <div class="history-item__top"><span>${esc(order.id)}</span><span>${formatPrice(order.total)}</span></div>
    <p>${orderSummary(order)}</p>
    ${order.statusDetail ? `<div class="history-item__status">${esc(order.statusDetail)}</div>` : ''}
    <div class="history-item__actions">
      <button type="button" data-repeat-${favorite ? 'favorite' : 'order'}="${order.id}">Заказать снова</button>
      ${favorite ? '' : `<button type="button" data-favorite-order="${order.id}">В избранное</button>`}
    </div>
  </article>`;
}
function openHistory(){
  renderAccount();
  closeOverlays(['#favorites-overlay', '#cart-overlay']);
  openOverlay('#history-overlay');
}
function openFavorites(){
  const favorites=safeJson('jelani_favorites', []);
  $('#favorites-list').innerHTML=favorites.length?favorites.map(o=>historyTemplate(o,true)).join(''):'<div class="history-empty">Любимых заказов пока нет.<br>Сохрани корзину или заказ из истории.</div>';
  closeOverlays(['#history-overlay', '#cart-overlay']);
  openOverlay('#favorites-overlay');
}
function repeatOrder(orderId){
  const order = safeJson('jelani_orders', []).find(item=>item.id===orderId);
  if(order) restoreCart(order.items);
}
function repeatFavorite(orderId){
  const order = safeJson('jelani_favorites', []).find(item=>item.id===orderId);
  if(order) restoreCart(order.items);
}
function searchMatches(item, clean){
  return !clean || `${item.name} ${item.description || ''} ${item.category || ''} ${(item.tags||[]).join(' ')}`.toLowerCase().includes(clean);
}
function filterMenuItem(item, filter){
  const text = `${item.name} ${item.description} ${(item.tags||[]).join(' ')}`.toLowerCase();
  if(filter === 'spicy') return text.includes('чили') || text.includes('халапеньо') || text.includes('остр');
  if(filter === 'beef') return text.includes('говядин');
  if(filter === 'under300') return item.price <= 300;
  if(filter === 'meatless') return !/(куриц|говядин|мяс|крыл|наггет|бургер|донер|шаурм|бекон)/.test(text);
  return true;
}
function renderSearch(query=''){
  const clean=query.trim().toLowerCase();
  let list;
  if(activeSearchFilter === 'combo') list = combos.filter(item=>searchMatches(item, clean)).map(item=>({...item,type:'combo'}));
  else if(activeSearchFilter === 'duo') list = sets.filter(item=>searchMatches(item, clean)).map(item=>({...item,type:'set'}));
  else list = menuItems.filter(item=>searchMatches(item, clean) && filterMenuItem(item, activeSearchFilter)).slice(0, clean || activeSearchFilter ? 40 : 8).map(item=>({...item,type:'menu'}));

  $$('#search-filters button').forEach(button=>button.classList.toggle('active', button.dataset.searchFilter === activeSearchFilter));
  $('#search-results').innerHTML=list.length?list.map(item=>{
    const meta = item.type === 'combo' ? 'Комбо' : item.type === 'set' ? 'Сет' : (categoryMeta.find(x=>x.id===item.category)?.label||'');
    const action = item.type === 'combo' ? `data-combo="${item.id}"` : item.type === 'set' ? `data-set="${item.id}"` : `data-add="${item.id}"`;
    return `<article class="search-item"><div class="search-item__main"><div class="search-item__icon">${item.emoji}</div><div><div class="search-item__name">${item.name}</div><div class="search-item__category">${meta} · ${formatPrice(item.price)}</div></div></div><button type="button" ${action}>+</button></article>`;
  }).join(''):'<div class="history-empty">Ничего не нашли. Попробуй другое слово или фильтр.</div>';
}

function updateStoreStatus(){
  const now = new Date();
  const minutes = now.getHours() * 60 + now.getMinutes();
  const openAt = 9 * 60;
  const closeAt = 21 * 60 + 45;
  const text = minutes >= openAt && minutes < closeAt ? 'Открыто до 21:45' : 'Заказы принимаем с 9:00';
  $$('[data-store-status]').forEach(item=>{ item.textContent = text; });
}


/* ========== HERO CAROUSEL ========== */
let heroSlideIndex = 0;
let heroSlideTimer = null;

function setHeroSlide(index) {
  const slides = $$('.hero-slide');
  const dots = $$('.hero-dot');
  if (!slides.length) return;

  heroSlideIndex = (Number(index) + slides.length) % slides.length;

  slides.forEach((slide, slideIndex) => {
    const active = slideIndex === heroSlideIndex;
    slide.classList.toggle('is-active', active);
    slide.setAttribute('aria-hidden', active ? 'false' : 'true');
  });

  dots.forEach((dot, dotIndex) => {
    const active = dotIndex === heroSlideIndex;
    dot.classList.toggle('is-active', active);
    dot.setAttribute('aria-current', active ? 'true' : 'false');
  });
}

function stopHeroCarousel() {
  if (heroSlideTimer) {
    window.clearInterval(heroSlideTimer);
    heroSlideTimer = null;
  }
}

function startHeroCarousel() {
  const slides = $$('.hero-slide');
  if (slides.length < 2 || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

  stopHeroCarousel();
  heroSlideTimer = window.setInterval(() => {
    setHeroSlide(heroSlideIndex + 1);
  }, 5200);
}

function initHeroCarousel() {
  const hero = $('.hero');
  const activeSlide = $('.hero-slide.is-active');
  if (!hero || !activeSlide) return;

  setHeroSlide(activeSlide.dataset.slideIndex || 0);
  startHeroCarousel();

  hero.addEventListener('mouseenter', stopHeroCarousel);
  hero.addEventListener('mouseleave', startHeroCarousel);
  hero.addEventListener('focusin', stopHeroCarousel);
  hero.addEventListener('focusout', event => {
    if (!hero.contains(event.relatedTarget)) startHeroCarousel();
  });
}

function bindEvents(){
  // Выбор внутри комбо и конструктора делаем явным через JS.
  // Так карточки выбора одинаково надёжно работают на iPhone, Android и компьютере.
  document.addEventListener('click', event => {
    const control = event.target.closest('[data-choice-control]');
    if(!control) return;
    event.preventDefault();
    activateChoiceOption(control);
  });

  document.addEventListener('keydown', event => {
    const control = event.target.closest?.('[data-choice-control]');
    if(!control || (event.key !== 'Enter' && event.key !== ' ')) return;
    event.preventDefault();
    activateChoiceOption(control);
  });

  document.addEventListener('click',event=>{
    const target=event.target.closest('button,[data-open-builder],[data-combo],[data-quick-combo],[data-add],[data-set],[data-category],[data-hero-slide]'); if(!target)return;
    if(target.dataset.heroSlide !== undefined){ setHeroSlide(target.dataset.heroSlide); startHeroCarousel(); }
    if(target.dataset.openCart !== undefined) openOverlay('#cart-overlay');
    if(target.dataset.openBuilder) openBuilder(target.dataset.openBuilder);
    if(target.dataset.combo) openCombo(target.dataset.combo);
    if(target.dataset.quickCombo) openCombo(target.dataset.quickCombo);
    if(target.dataset.category){currentCategory=target.dataset.category;renderCategories();renderMenu();}
    if(target.dataset.add){const item=findMenuItem(target.dataset.add);if(item)addCart(makeCartItem({id:item.id,name:item.name,price:item.price,emoji:item.emoji,details:''}));}
    if(target.dataset.set){const item=findSet(target.dataset.set);if(item)addCart(makeCartItem({id:item.id,name:item.name,price:item.price,emoji:item.emoji,details:item.size}));}
    if(target.dataset.upsell) addUpsell(target.dataset.upsell);
    if(target.dataset.repeatOrder) repeatOrder(target.dataset.repeatOrder);
    if(target.dataset.repeatFavorite) repeatFavorite(target.dataset.repeatFavorite);
    if(target.dataset.favoriteOrder) saveFavoriteOrder(target.dataset.favoriteOrder);
    if(target.dataset.openFavorites !== undefined){closeMobileMenu();openFavorites();}
    if(target.dataset.searchFilter){activeSearchFilter = activeSearchFilter === target.dataset.searchFilter ? '' : target.dataset.searchFilter; renderSearch($('#search-input').value);}
    if(target.dataset.reviewAction) showToast('Отзывы можно собирать через Telegram или форму после запуска');
    if(target.dataset.cartIncrease)changeCart(target.dataset.cartIncrease,1);
    if(target.dataset.cartDecrease)changeCart(target.dataset.cartDecrease,-1);
    if(target.dataset.cartRemove){cart=cart.filter(item=>item.cartId!==target.dataset.cartRemove);saveCart();renderCart();}
  });
  $('#open-cart').addEventListener('click',()=>openOverlay('#cart-overlay')); $('#mobile-cart').addEventListener('click',()=>openOverlay('#cart-overlay')); $('#close-cart').addEventListener('click',()=>closeOverlay('#cart-overlay'));
  $('#mobile-menu-toggle')?.addEventListener('click',toggleMobileMenu);
  $('#close-mobile-menu')?.addEventListener('click',closeMobileMenu);
  $$('.mobile-menu a').forEach(link=>link.addEventListener('click',closeMobileMenu));
  $$('[data-open-history]').forEach(button=>button.addEventListener('click',()=>{closeMobileMenu();openHistory();}));
  $('#favorites-btn')?.addEventListener('click',openFavorites);
  $('#close-builder').addEventListener('click',()=>closeOverlay('#builder-overlay')); $('#close-combo').addEventListener('click',()=>closeOverlay('#combo-overlay')); $('#close-checkout').addEventListener('click',()=>closeOverlay('#checkout-overlay')); $('#close-history').addEventListener('click',()=>closeOverlay('#history-overlay')); $('#close-favorites').addEventListener('click',()=>closeOverlay('#favorites-overlay')); $('#close-search').addEventListener('click',()=>closeOverlay('#search-overlay'));
  $('#checkout-btn').addEventListener('click',openCheckout); $('#save-favorite-btn').addEventListener('click',saveFavoriteFromCart); $('#add-combo-to-cart').addEventListener('click',addCombo); $('#add-builder-to-cart').addEventListener('click',addBuilder); $('#checkout-form').addEventListener('submit',completeCheckout); $('#order-history-btn').addEventListener('click',openHistory);
  $('#apply-promo').addEventListener('click',()=>applyPromo($('#promo-code').value));
  $('#promo-code').addEventListener('keydown',event=>{ if(event.key === 'Enter'){ event.preventDefault(); applyPromo(event.currentTarget.value); } });
  $('#checkout-promo').addEventListener('input',event=>applyPromo(event.currentTarget.value));
  $('#account-form')?.addEventListener('submit', event=>{
    event.preventDefault();
    try {
      saveProfile({ name:$('#account-name').value, phone:$('#account-phone').value });
      renderAccount();
      syncPromoInputs();
      renderCart();
      showToast('Профиль сохранен');
    } catch (error) {
      showToast(error.message);
    }
  });
  $('#tracker-close')?.addEventListener('click',()=>{
    const order = currentActiveOrders()[0];
    if(order) dismissActiveOrder(order.id);
  });
  $('#tracker-received')?.addEventListener('click',()=>{
    const order = currentActiveOrders()[0];
    if(order) dismissActiveOrder(order.id);
  });
  $('#delivery-select').addEventListener('change',updateDeliveryFields);
  const phoneInput = $('#checkout-form input[name="phone"]');
  phoneInput.addEventListener('input',event=>{ event.currentTarget.setCustomValidity(''); });
  phoneInput.addEventListener('blur',event=>{
    if(isRussianMobilePhone(event.currentTarget.value)) event.currentTarget.value = formatRussianPhone(event.currentTarget.value);
  });
  $('#account-phone')?.addEventListener('blur',event=>{
    if(isRussianMobilePhone(event.currentTarget.value)) event.currentTarget.value = formatRussianPhone(event.currentTarget.value);
  });
  $('#open-search').addEventListener('click',()=>{renderSearch();openOverlay('#search-overlay');setTimeout(()=>$('#search-input').focus(),100)}); $('#search-input').addEventListener('input',e=>renderSearch(e.target.value));
  $('#builder-form').addEventListener('change',()=>{readBuilder();renderBuilder();});
  $('#combo-form').addEventListener('change', event => {
    const input = event.target;
    if (input.name === 'combo-twoSauces' && input.checked && valuesByName('combo-twoSauces').length > 2) {
      input.checked = false;
      showToast('В этом комбо можно выбрать только 2 соуса');
    }
    syncChoiceOptions($('#combo-form'));
  });
  $$('.overlay').forEach(overlay=>overlay.addEventListener('click',e=>{if(e.target===overlay)closeOverlay('#'+overlay.id)}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMobileMenu();$$('.overlay.open').forEach(el=>closeOverlay('#'+el.id));}});
}
function init(){
  renderCategories();
  renderCombos();
  renderSets();
  renderMenu();
  renderCart();
  renderAccount();
  renderOrderTracker();
  updateDeliveryFields();
  updateStoreStatus();
  bindEvents();
  initHeroCarousel();
  startStatusPolling();
  window.setInterval(updateStoreStatus, 60000);
}
init();
