const JSON_HEADERS = {
  'content-type': 'application/json; charset=utf-8'
};

const ORDER_TTL_SECONDS = 60 * 60 * 24 * 3;
const AUTH_SESSION_SECONDS = 60 * 60 * 24 * 30;
const AUTH_OTP_SECONDS = 5 * 60;
const AUTH_OTP_MAX_ATTEMPTS = 5;
const AUTH_PROVIDER_PAYLOAD_SECONDS = 10 * 60;

const databaseSchemaReady = new WeakMap();

const DATABASE_SCHEMA = [
  `CREATE TABLE IF NOT EXISTS customers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    phone TEXT NOT NULL UNIQUE,
    name TEXT NOT NULL,
    first_seen_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    order_count INTEGER NOT NULL DEFAULT 0,
    total_spent INTEGER NOT NULL DEFAULT 0,
    bonus_points INTEGER NOT NULL DEFAULT 0
  )`,
  `CREATE TABLE IF NOT EXISTS orders (
    id TEXT PRIMARY KEY,
    tracking_token TEXT NOT NULL,
    owner_token_hash TEXT NOT NULL DEFAULT '',
    account_user_id TEXT NOT NULL DEFAULT '',
    customer_id INTEGER,
    customer_name TEXT NOT NULL,
    phone TEXT NOT NULL,
    flow TEXT NOT NULL,
    delivery_method TEXT NOT NULL,
    address TEXT NOT NULL DEFAULT '',
    customer_email TEXT NOT NULL DEFAULT '',
    payment_method TEXT NOT NULL,
    payment_provider TEXT NOT NULL DEFAULT '',
    payment_status TEXT NOT NULL DEFAULT 'pending',
    provider_payment_id TEXT NOT NULL DEFAULT '',
    payment_confirmation_url TEXT NOT NULL DEFAULT '',
    payment_idempotence_key TEXT NOT NULL DEFAULT '',
    payment_expires_at TEXT NOT NULL DEFAULT '',
    payment_confirmed_at TEXT NOT NULL DEFAULT '',
    payment_error TEXT NOT NULL DEFAULT '',
    fulfillment_applied_at TEXT NOT NULL DEFAULT '',
    kitchen_sent_at TEXT NOT NULL DEFAULT '',
    inventory_reserved_at TEXT NOT NULL DEFAULT '',
    inventory_released_at TEXT NOT NULL DEFAULT '',
    inventory_committed_at TEXT NOT NULL DEFAULT '',
    refunded_amount INTEGER NOT NULL DEFAULT 0,
    refund_status TEXT NOT NULL DEFAULT '',
    comment TEXT NOT NULL DEFAULT '',
    promo_code TEXT NOT NULL DEFAULT '',
    subtotal INTEGER NOT NULL DEFAULT 0,
    discount INTEGER NOT NULL DEFAULT 0,
    applied_bonus_id TEXT NOT NULL DEFAULT '',
    bonus_discount INTEGER NOT NULL DEFAULT 0,
    points_earned INTEGER NOT NULL DEFAULT 0,
    points_awarded INTEGER NOT NULL DEFAULT 0,
    total INTEGER NOT NULL DEFAULT 0,
    status_index INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL,
    status_detail TEXT NOT NULL,
    canceled INTEGER NOT NULL DEFAULT 0,
    terminal INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (customer_id) REFERENCES customers(id)
  )`,
  `CREATE TABLE IF NOT EXISTS order_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    product_id TEXT NOT NULL DEFAULT '',
    name TEXT NOT NULL,
    details TEXT NOT NULL DEFAULT '',
    options_json TEXT NOT NULL DEFAULT '{}',
    unit_price INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    line_total INTEGER NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS order_status_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    order_id TEXT NOT NULL,
    status_index INTEGER NOT NULL,
    status TEXT NOT NULL,
    detail TEXT NOT NULL,
    created_at TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS order_messages (
    order_id TEXT NOT NULL,
    chat_id TEXT NOT NULL,
    message_id INTEGER NOT NULL,
    PRIMARY KEY (order_id, chat_id, message_id),
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS saved_orders (
    owner_token_hash TEXT NOT NULL,
    id TEXT NOT NULL,
    name TEXT NOT NULL,
    items_json TEXT NOT NULL,
    total INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (owner_token_hash, id)
  )`,
  `CREATE TABLE IF NOT EXISTS bonus_definitions (
    type TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    conditions TEXT NOT NULL DEFAULT '',
    enabled INTEGER NOT NULL DEFAULT 1,
    weight INTEGER NOT NULL DEFAULT 1,
    validity_days INTEGER NOT NULL DEFAULT 14,
    min_order_total INTEGER NOT NULL DEFAULT 0,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS user_bonuses (
    id TEXT PRIMARY KEY,
    owner_token_hash TEXT NOT NULL,
    source_order_id TEXT NOT NULL UNIQUE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    conditions TEXT NOT NULL DEFAULT '',
    expires_at TEXT NOT NULL,
    used_at TEXT,
    used_order_id TEXT NOT NULL DEFAULT '',
    reserved_order_id TEXT NOT NULL DEFAULT '',
    reserved_at TEXT,
    canceled_at TEXT,
    created_at TEXT NOT NULL,
    FOREIGN KEY (source_order_id) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (type) REFERENCES bonus_definitions(type)
  )`,
  `CREATE TABLE IF NOT EXISTS drops (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    composition_json TEXT NOT NULL DEFAULT '[]',
    image_url TEXT NOT NULL,
    price INTEGER NOT NULL,
    starts_at TEXT NOT NULL,
    ends_at TEXT NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    sold_count INTEGER NOT NULL DEFAULT 0,
    enabled INTEGER NOT NULL DEFAULT 1,
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS taste_profiles (
    owner_token_hash TEXT PRIMARY KEY,
    order_count INTEGER NOT NULL DEFAULT 0,
    summary_json TEXT NOT NULL DEFAULT '{}',
    overrides_json TEXT NOT NULL DEFAULT '{}',
    updated_at TEXT NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS app_users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL DEFAULT '',
    phone TEXT UNIQUE,
    avatar_url TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    deleted_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS auth_identities (
    provider TEXT NOT NULL,
    provider_user_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    email TEXT NOT NULL DEFAULT '',
    phone TEXT NOT NULL DEFAULT '',
    profile_json TEXT NOT NULL DEFAULT '{}',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    PRIMARY KEY (provider, provider_user_id),
    FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS auth_sessions (
    token_hash TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    device_token_hash TEXT NOT NULL DEFAULT '',
    expires_at TEXT NOT NULL,
    created_at TEXT NOT NULL,
    last_seen_at TEXT NOT NULL,
    revoked_at TEXT,
    FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS auth_otps (
    id TEXT PRIMARY KEY,
    phone TEXT NOT NULL,
    code_hash TEXT NOT NULL,
    attempts INTEGER NOT NULL DEFAULT 0,
    requested_at TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    consumed_at TEXT,
    ip_hash TEXT NOT NULL DEFAULT '',
    device_token_hash TEXT NOT NULL DEFAULT ''
  )`,
  `CREATE TABLE IF NOT EXISTS oauth_states (
    state_hash TEXT PRIMARY KEY,
    provider TEXT NOT NULL,
    code_verifier TEXT NOT NULL DEFAULT '',
    link_user_id TEXT NOT NULL DEFAULT '',
    device_token_hash TEXT NOT NULL DEFAULT '',
    redirect_uri TEXT NOT NULL,
    expires_at TEXT NOT NULL,
    used_at TEXT
  )`,
  `CREATE TABLE IF NOT EXISTS user_addresses (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    label TEXT NOT NULL DEFAULT '',
    address TEXT NOT NULL,
    is_default INTEGER NOT NULL DEFAULT 0,
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS payment_events (
    event_key TEXT PRIMARY KEY,
    event_type TEXT NOT NULL,
    provider_object_id TEXT NOT NULL,
    order_id TEXT NOT NULL DEFAULT '',
    status TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  )`,
  `CREATE TABLE IF NOT EXISTS refunds (
    id TEXT PRIMARY KEY,
    order_id TEXT NOT NULL,
    provider_refund_id TEXT NOT NULL DEFAULT '',
    idempotence_key TEXT NOT NULL UNIQUE,
    amount INTEGER NOT NULL,
    status TEXT NOT NULL,
    reason TEXT NOT NULL DEFAULT '',
    created_at TEXT NOT NULL,
    updated_at TEXT NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
  )`,
  `CREATE TRIGGER IF NOT EXISTS prevent_drop_oversell
    BEFORE UPDATE OF sold_count ON drops
    WHEN NEW.quantity > 0 AND NEW.sold_count > NEW.quantity
    BEGIN SELECT RAISE(ABORT, 'DROP sold out'); END`,
  `CREATE TRIGGER IF NOT EXISTS validate_order_bonus
    BEFORE INSERT ON orders
    WHEN NEW.applied_bonus_id <> '' AND NOT EXISTS (
      SELECT 1 FROM user_bonuses
      WHERE id = NEW.applied_bonus_id
        AND owner_token_hash = NEW.owner_token_hash
        AND used_at IS NULL
        AND canceled_at IS NULL
        AND julianday(expires_at) > julianday('now')
    )
    BEGIN SELECT RAISE(ABORT, 'Bonus unavailable'); END`,
  'CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone)',
  'CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at)',
  'CREATE INDEX IF NOT EXISTS idx_status_events_order ON order_status_events(order_id)',
  'CREATE INDEX IF NOT EXISTS idx_saved_orders_owner ON saved_orders(owner_token_hash, updated_at)',
  'CREATE INDEX IF NOT EXISTS idx_user_bonuses_owner ON user_bonuses(owner_token_hash, expires_at)',
  'CREATE INDEX IF NOT EXISTS idx_drops_schedule ON drops(starts_at, ends_at)',
  'CREATE INDEX IF NOT EXISTS idx_orders_owner ON orders(owner_token_hash, created_at)',
  'CREATE INDEX IF NOT EXISTS idx_orders_account ON orders(account_user_id, created_at)',
  'CREATE INDEX IF NOT EXISTS idx_auth_identities_user ON auth_identities(user_id)',
  'CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id, expires_at)',
  'CREATE INDEX IF NOT EXISTS idx_auth_otps_phone ON auth_otps(phone, requested_at)',
  'CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON user_addresses(user_id, updated_at)'
  ,'CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_provider_payment ON orders(provider_payment_id) WHERE provider_payment_id <> \'\''
  ,'CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status, created_at)'
  ,'CREATE INDEX IF NOT EXISTS idx_payment_events_order ON payment_events(order_id, created_at)'
  ,'CREATE UNIQUE INDEX IF NOT EXISTS idx_refunds_provider_id ON refunds(provider_refund_id) WHERE provider_refund_id <> \'\''
];

const DATABASE_MIGRATIONS = [
  "ALTER TABLE order_items ADD COLUMN options_json TEXT NOT NULL DEFAULT '{}'",
  "ALTER TABLE orders ADD COLUMN owner_token_hash TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE orders ADD COLUMN account_user_id TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE orders ADD COLUMN applied_bonus_id TEXT NOT NULL DEFAULT ''",
  "ALTER TABLE orders ADD COLUMN bonus_discount INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE orders ADD COLUMN points_earned INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE orders ADD COLUMN points_awarded INTEGER NOT NULL DEFAULT 0",
  "ALTER TABLE customers ADD COLUMN bonus_points INTEGER NOT NULL DEFAULT 0"
  ,"ALTER TABLE orders ADD COLUMN customer_email TEXT NOT NULL DEFAULT ''"
  ,"ALTER TABLE orders ADD COLUMN payment_provider TEXT NOT NULL DEFAULT ''"
  ,"ALTER TABLE orders ADD COLUMN payment_status TEXT NOT NULL DEFAULT 'succeeded'"
  ,"ALTER TABLE orders ADD COLUMN provider_payment_id TEXT NOT NULL DEFAULT ''"
  ,"ALTER TABLE orders ADD COLUMN payment_confirmation_url TEXT NOT NULL DEFAULT ''"
  ,"ALTER TABLE orders ADD COLUMN payment_idempotence_key TEXT NOT NULL DEFAULT ''"
  ,"ALTER TABLE orders ADD COLUMN payment_expires_at TEXT NOT NULL DEFAULT ''"
  ,"ALTER TABLE orders ADD COLUMN payment_confirmed_at TEXT NOT NULL DEFAULT ''"
  ,"ALTER TABLE orders ADD COLUMN payment_error TEXT NOT NULL DEFAULT ''"
  ,"ALTER TABLE orders ADD COLUMN fulfillment_applied_at TEXT NOT NULL DEFAULT ''"
  ,"ALTER TABLE orders ADD COLUMN kitchen_sent_at TEXT NOT NULL DEFAULT ''"
  ,"ALTER TABLE orders ADD COLUMN inventory_reserved_at TEXT NOT NULL DEFAULT ''"
  ,"ALTER TABLE orders ADD COLUMN inventory_released_at TEXT NOT NULL DEFAULT ''"
  ,"ALTER TABLE orders ADD COLUMN inventory_committed_at TEXT NOT NULL DEFAULT ''"
  ,"ALTER TABLE orders ADD COLUMN refunded_amount INTEGER NOT NULL DEFAULT 0"
  ,"ALTER TABLE orders ADD COLUMN refund_status TEXT NOT NULL DEFAULT ''"
  ,"ALTER TABLE user_bonuses ADD COLUMN reserved_order_id TEXT NOT NULL DEFAULT ''"
  ,"ALTER TABLE user_bonuses ADD COLUMN reserved_at TEXT"
];

const DATABASE_SEEDS = [
  ['free_sauce','Бесплатный фирменный соус','Добавим один фирменный соус бесплатно.','Действует на один следующий заказ.',30,14,0],
  ['free_cheese','Бесплатный сыр','Добавим сыр в одну позицию бесплатно.','Действует на один следующий заказ.',25,14,0],
  ['double_points','Двойные бонусные баллы','Начислим в два раза больше баллов за следующий заказ.','Баллы появятся после выполнения заказа.',15,14,0],
  ['discount_5','Скидка 5%','Скидка 5% на следующий заказ.','Не суммируется с другими скидками.',20,10,0],
  ['free_drink','Бесплатный напиток','Один напиток бесплатно при заказе от 700 ₽.','Минимальная сумма заказа 700 ₽.',10,14,700]
];

const DROP_SEED = {
  id:'drop-2026-07-fire',
  name:'Огненная шаурма DROP',
  description:'Курица, халапеньо, сыр и яркий соус Чили. Только на этой неделе.',
  composition:['Курица','Сыр','Халапеньо','Соус Чили','Свежие овощи'],
  imageUrl:'/images/hero-slide-3.png',
  price:349,
  startsAt:'2026-07-12T06:00:00.000Z',
  endsAt:'2026-07-19T17:45:00.000Z',
  quantity:80
};

const FLOW_STEPS = {
  pickup: [
    { label: 'Новый', detail: 'Заказ передан на кухню.' },
    { label: 'Принят', detail: 'Команда JELANI подтвердила заказ.' },
    { label: 'Готовится', detail: 'Заказ сейчас готовится.' },
    { label: 'Готов', detail: 'Заказ можно забирать.' },
    { label: 'Выдан', detail: 'Заказ выдан клиенту.', terminal: true }
  ],
  delivery: [
    { label: 'Новый', detail: 'Заказ передан на кухню.' },
    { label: 'Принят', detail: 'Команда JELANI подтвердила заказ.' },
    { label: 'Готовится', detail: 'Заказ сейчас готовится.' },
    { label: 'Готов', detail: 'Заказ ожидает передачи курьеру.' },
    { label: 'Передан курьеру', detail: 'Заказ передан в доставку.', terminal: true }
  ]
};

const ADMIN_ACTIONS = {
  pickup: ['Принят', 'Готовится', 'Готов', 'Выдан'],
  delivery: ['Принят', 'Готовится', 'Готов', 'Передан курьеру']
};

const FIXED_ITEM_PRICES = Object.freeze({
  burger: 270,
  'shawarma-small-chicken': 190,
  'shawarma-small-beef': 225,
  'shawarma-standard-chicken': 240,
  'shawarma-standard-beef': 275,
  'shawarma-large-chicken': 290,
  'shawarma-large-beef': 325,
  'doner-chicken': 230,
  'doner-beef': 270,
  gyros: 250,
  pita: 240,
  'open-shawarma': 320,
  quesadilla: 290,
  'sandwich-chicken': 240,
  'sandwich-ham': 230,
  'fried-sandwich': 230,
  'american-sandwich': 310,
  'cross-sandwich-chicken': 260,
  'cross-sandwich-ham': 250,
  'ciabatta-sandwich': 290,
  'fried-toasties': 190,
  hotdog: 180,
  fries: 110,
  nuggets: 160,
  'onion-rings': 130,
  wings: 240,
  'garlic-croutons': 130,
  'fish-nuggets': 190,
  'caesar-salad': 230,
  'caucasian-salad': 180,
  'big-hit-salad': 250,
  'chips-salad': 230,
  'vienna-waffle': 170,
  syrniki: 190,
  'baklava-icecream': 220,
  napoleon: 160,
  medovik: 160,
  donuts: 130,
  smoothie: 170,
  milkshake: 160,
  soda: 90,
  juice: 80,
  tea: 70,
  coffee: 110,
  duet: 890,
  'burger-pair': 960,
  'sandwich-box': 1390,
  east: 1290,
  crispy: 1390,
  family: 1790,
  'salad-lunch': 790,
  'sweet-table': 1190,
  'upsell-fries': 79,
  'upsell-drink': 69,
  'upsell-sauce': 35,
  'upsell-cheese': 35
});

const COMBO_PRICES = Object.freeze({
  'shawarma-combo': { 'Стандартный': 410, 'Большой': 490 },
  'burger-combo': { 'Стандартный': 430, 'Большой': 510 },
  'doner-combo': { 'Стандартный': 410, 'Большой': 490 },
  'wings-combo': { '6 крыльев': 490, '9 крыльев': 620 },
  'gyros-combo': { 'Стандартный': 420, 'Большой': 500 },
  'sandwich-combo': { 'Стандартный': 400, 'Большой': 480 },
  'hotdog-combo': { 'Стандартный': 330, 'Большой': 410 },
  'fish-combo': { '6 наггетсов': 390, '9 наггетсов': 470 },
  'quesadilla-combo': { 'Стандартный': 440, 'Большой': 540 },
  'morning-combo': { 'Стандартный': 320 },
  'sweet-combo': { 'Стандартный': 280 },
  'mega-combo': { 'На двоих': 890 }
});

const BUILDER_PRICES = Object.freeze({
  shawarma: {
    sizes: { 'Маленькая': 190, 'Стандартная': 240, 'Большая': 290 },
    meats: { 'Курица': 0, 'Говядина': 35 },
    extras: { 'Сыр': 35, 'Двойное мясо': 80, 'Фри внутрь': 35, 'Халапеньо': 30, 'Грибы': 40 }
  },
  sandwich: {
    sizes: { 'Сэндвич': 210, 'Жареный сэндвич': 230, 'Американский сэндвич': 260, 'Перекрестный сэндвич': 240, 'Чиабатта-сэндвич': 260 },
    meats: { 'Курица': 0, 'Ветчина': 0, 'Говядина': 45 },
    extras: { 'Сыр': 35, 'Двойное мясо': 85, 'Фри внутрь': 35, 'Халапеньо': 30, 'Грибы': 40 }
  }
});

const SERVER_SAUCES = new Set([
  'Томатный', 'Чесночный', 'Аджика', '1000 островов', 'Кавказский',
  'Чили', 'Сырный', 'Кисло-сладкий', 'Мацони', 'Наршараб'
]);

const SERVER_DRINKS = new Set(['Смузи', 'Коктейль', 'Газировка', 'Сок', 'Чай', 'Кофе']);
const SERVER_MEATS = new Set(['Курица', 'Говядина']);
const SERVER_SANDWICHES = new Set([
  'Сэндвич с курицей', 'Сэндвич с ветчиной', 'Жареный сэндвич',
  'Американский сэндвич', 'Перекрестный с курицей',
  'Перекрестный с ветчиной', 'Чиабатта-сэндвич'
]);

const COMBO_OPTION_RULES = {
  'shawarma-combo': {
    meat: [SERVER_MEATS, 1, 1], drink: [SERVER_DRINKS, 1, 1],
    shawarmaSauces: [SERVER_SAUCES, 0, 10], friesSauce: [SERVER_SAUCES, 1, 1]
  },
  'burger-combo': { drink: [SERVER_DRINKS, 1, 1], sauce: [SERVER_SAUCES, 1, 1] },
  'doner-combo': { meat: [SERVER_MEATS, 1, 1], drink: [SERVER_DRINKS, 1, 1], sauce: [SERVER_SAUCES, 1, 1] },
  'wings-combo': { drink: [SERVER_DRINKS, 1, 1], twoSauces: [SERVER_SAUCES, 2, 2] },
  'gyros-combo': { drink: [SERVER_DRINKS, 1, 1], sauce: [new Set(['Мацони', 'Чесночный']), 1, 1] },
  'sandwich-combo': { sandwich: [SERVER_SANDWICHES, 1, 1], drink: [SERVER_DRINKS, 1, 1], sauce: [SERVER_SAUCES, 1, 1] },
  'hotdog-combo': { drink: [SERVER_DRINKS, 1, 1], sauce: [SERVER_SAUCES, 1, 1] },
  'fish-combo': { drink: [SERVER_DRINKS, 1, 1], sauce: [new Set(['Кисло-сладкий', 'Чесночный']), 1, 1] },
  'quesadilla-combo': { side: [new Set(['Картофель фри', 'Луковые кольца']), 1, 1], drink: [SERVER_DRINKS, 1, 1], sauce: [SERVER_SAUCES, 1, 1] },
  'morning-combo': {
    morningBase: [new Set(['Сырники', 'Венские вафли']), 1, 1],
    morningHot: [new Set(['Кофе', 'Чай']), 1, 1],
    morningCold: [new Set(['Смузи', 'Сок']), 1, 1]
  },
  'sweet-combo': {
    sweetBase: [new Set(['Пахлава с мороженым', 'Пончики', 'Наполеон', 'Медовик']), 1, 1],
    sweetDrink: [new Set(['Кофе', 'Чай']), 1, 1]
  },
  'mega-combo': { meat: [SERVER_MEATS, 1, 1], drink: [SERVER_DRINKS, 1, 1], twoSauces: [SERVER_SAUCES, 2, 2] }
};

const BUILDER_VEGETABLES = {
  shawarma: new Set(['Капуста', 'Огурец', 'Томат', 'Красный лук', 'Зелень']),
  sandwich: new Set(['Айсберг', 'Огурец', 'Томат', 'Маринованный огурец', 'Красный лук'])
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

class ServiceUnavailableError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ServiceUnavailableError';
    this.status = 503;
  }
}

class ForbiddenError extends ValidationError {
  constructor(message = 'Нет доступа') {
    super(message);
    this.name = 'ForbiddenError';
    this.status = 403;
  }
}

class UnauthorizedError extends ValidationError {
  constructor(message = 'Войдите в личный кабинет') {
    super(message);
    this.name = 'UnauthorizedError';
    this.status = 401;
  }
}

class RateLimitError extends ValidationError {
  constructor(message) {
    super(message);
    this.name = 'RateLimitError';
    this.status = 429;
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

function formatRussianPhone(phone) {
  const value = normalizeRussianPhone(phone);
  return /^79\d{9}$/.test(value)
    ? `+7 ${value.slice(1,4)} ${value.slice(4,7)}-${value.slice(7,9)}-${value.slice(9,11)}`
    : String(phone || '');
}

function formatOrderDate(value) {
  return new Intl.DateTimeFormat('ru-RU', {
    dateStyle: 'short',
    timeStyle: 'short',
    timeZone: 'Europe/Astrakhan'
  }).format(new Date(value || Date.now()));
}

function optionValue(options, key) {
  const value = options?.[key];
  return Array.isArray(value) ? value[0] : value;
}

function optionList(options, key) {
  const value = options?.[key];
  if (Array.isArray(value)) return value.map(String);
  return value ? [String(value)] : [];
}

function validateOptionList(values, allowed, min, max) {
  const unique = new Set(values);
  return values.length >= min && values.length <= max && unique.size === values.length &&
    values.every(value => allowed.has(value));
}

function validateComboOptions(id, options) {
  const rules = COMBO_OPTION_RULES[id] || {};
  for (const [key, [allowed, min, max]] of Object.entries(rules)) {
    if (!validateOptionList(optionList(options, key), allowed, min, max)) {
      throw new ValidationError('Состав комбо изменился. Соберите его заново.');
    }
  }
}

function comboSizeFromDetails(details = '') {
  const match = String(details).match(/(?:^|·\s*)Размер:\s*([^·]+)/);
  return match?.[1]?.trim() || '';
}

function serverItemPrice(item) {
  const id = String(item?.id || '');
  if (Object.prototype.hasOwnProperty.call(FIXED_ITEM_PRICES, id)) {
    return FIXED_ITEM_PRICES[id];
  }
  if (/^sauce-(?:[0-9])$/.test(id)) return 35;

  const combo = COMBO_PRICES[id];
  if (combo) {
    const size = optionValue(item.options, 'size') || comboSizeFromDetails(item.details);
    if (!Object.prototype.hasOwnProperty.call(combo, size)) {
      throw new ValidationError(`Выбранный размер для «${String(item.name || 'Комбо')}» больше недоступен`);
    }
    validateComboOptions(id, item.options);
    return combo[size];
  }

  if (id === 'custom-shawarma' || id === 'custom-sandwich') {
    const type = id.slice('custom-'.length);
    const pricing = BUILDER_PRICES[type];
    const options = item.options || {};
    const size = optionValue(options, 'size');
    const meat = optionValue(options, 'meat');
    const sauces = optionList(options, 'sauces');
    const extras = optionList(options, 'extras');
    const veggies = optionList(options, 'veggies');

    if (!Object.prototype.hasOwnProperty.call(pricing.sizes, size) ||
        !Object.prototype.hasOwnProperty.call(pricing.meats, meat) ||
        !validateOptionList(sauces, SERVER_SAUCES, 0, SERVER_SAUCES.size) ||
        !validateOptionList(veggies, BUILDER_VEGETABLES[type], 0, BUILDER_VEGETABLES[type].size) ||
        !validateOptionList(extras, new Set(Object.keys(pricing.extras)), 0, Object.keys(pricing.extras).length)) {
      throw new ValidationError('Состав позиции изменился. Соберите её заново.');
    }

    const extrasTotal = extras.reduce((sum, extra) => sum + pricing.extras[extra], 0);
    const extraSauces = Math.max(0, sauces.length - 2) * 35;
    return pricing.sizes[size] + pricing.meats[meat] + extrasTotal + extraSauces;
  }

  throw new ValidationError(`Позиция «${String(item?.name || id)}» сейчас недоступна`);
}

function requestDeviceToken(request) {
  const explicit = String(request.headers.get('x-device-token') || '');
  if (/^[a-f0-9]{64}$/i.test(explicit)) return explicit;
  const authorization = String(request.headers.get('authorization') || '');
  const bearer = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  return /^[a-f0-9]{64}$/i.test(bearer) ? bearer : '';
}

async function hashDeviceToken(token) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(token));
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

async function deviceTokenHash(request) {
  const token = requestDeviceToken(request);
  if (!/^[a-f0-9]{64}$/i.test(token)) {
    throw new ValidationError('Сохранённые заказы недоступны. Обновите страницу и попробуйте ещё раз.');
  }
  return hashDeviceToken(token);
}

async function optionalDeviceTokenHash(request) {
  const token = requestDeviceToken(request);
  return /^[a-f0-9]{64}$/i.test(token) ? hashDeviceToken(token) : '';
}

function randomHex(bytes = 32) {
  const value = new Uint8Array(bytes);
  crypto.getRandomValues(value);
  return [...value].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function randomDigits(length = 6) {
  const limit = 10 ** length;
  const value = new Uint32Array(1);
  crypto.getRandomValues(value);
  return String(value[0] % limit).padStart(length, '0');
}

function bytesToBase64Url(bytes) {
  let binary = '';
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

async function sha256Base64Url(value) {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return bytesToBase64Url(new Uint8Array(digest));
}

function constantTimeEqual(left, right) {
  const a = String(left || '');
  const b = String(right || '');
  if (a.length !== b.length) return false;
  let result = 0;
  for (let index = 0; index < a.length; index += 1) result |= a.charCodeAt(index) ^ b.charCodeAt(index);
  return result === 0;
}

function cookieValue(request, name) {
  const cookies = String(request.headers.get('cookie') || '').split(';');
  for (const cookie of cookies) {
    const [key, ...parts] = cookie.trim().split('=');
    if (key === name) return decodeURIComponent(parts.join('='));
  }
  return '';
}

function sessionTokenFromRequest(request) {
  const cookieToken = cookieValue(request, 'jelani_session');
  if (/^js_[a-f0-9]{64}$/i.test(cookieToken)) return cookieToken;
  const authorization = String(request.headers.get('authorization') || '');
  const bearer = authorization.startsWith('Bearer ') ? authorization.slice(7).trim() : '';
  return /^js_[a-f0-9]{64}$/i.test(bearer) ? bearer : '';
}

function sessionCookie(request, token, maxAge = AUTH_SESSION_SECONDS) {
  const secure = new URL(request.url).protocol === 'https:' ? '; Secure' : '';
  return `jelani_session=${encodeURIComponent(token)}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secure}`;
}

function jsonWithSession(data, request, token, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...JSON_HEADERS, 'set-cookie': sessionCookie(request, token) }
  });
}

function redirectWithSession(url, request, token) {
  return new Response(null, {
    status: 302,
    headers: { location:url, 'set-cookie':sessionCookie(request, token) }
  });
}

function clearSessionResponse(data, request) {
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: { ...JSON_HEADERS, 'set-cookie':sessionCookie(request, '', 0) }
  });
}

async function accountOwnerHash(userId) {
  return hashDeviceToken(`user:${userId}`);
}

async function currentSession(request, env) {
  if (!env.DB) return null;
  const token = sessionTokenFromRequest(request);
  if (!token) return null;
  await ensureDatabase(env);
  const tokenHash = await hashDeviceToken(token);
  const now = new Date().toISOString();
  const row = await env.DB.prepare(`SELECT s.token_hash AS tokenHash, s.user_id AS userId,
    s.device_token_hash AS deviceHash, s.expires_at AS expiresAt, s.last_seen_at AS lastSeenAt,
    u.name, u.phone, u.avatar_url AS avatarUrl
    FROM auth_sessions s JOIN app_users u ON u.id = s.user_id
    WHERE s.token_hash = ? AND s.revoked_at IS NULL AND s.expires_at > ? AND u.deleted_at IS NULL`)
    .bind(tokenHash,now).first();
  if (!row) return null;
  if (Date.now() - new Date(row.lastSeenAt).getTime() > 3600000) {
    await env.DB.prepare('UPDATE auth_sessions SET last_seen_at = ? WHERE token_hash = ?').bind(now,tokenHash).run();
  }
  return row;
}

async function requireSession(request, env) {
  const session = await currentSession(request,env);
  if (!session) throw new UnauthorizedError();
  return session;
}

async function createAuthSession(env, userId, deviceHash = '') {
  const token = `js_${randomHex(32)}`;
  const tokenHash = await hashDeviceToken(token);
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + AUTH_SESSION_SECONDS * 1000).toISOString();
  await env.DB.prepare(`INSERT INTO auth_sessions
    (token_hash, user_id, device_token_hash, expires_at, created_at, last_seen_at, revoked_at)
    VALUES (?, ?, ?, ?, ?, ?, NULL)`)
    .bind(tokenHash,userId,deviceHash,expiresAt,createdAt,createdAt).run();
  return token;
}

async function attachDeviceDataToUser(env, deviceHash, userId) {
  if (!env.DB || !deviceHash || !userId) return accountOwnerHash(userId);
  const owner = await accountOwnerHash(userId);
  if (owner === deviceHash) return owner;
  const now = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare(`INSERT OR IGNORE INTO saved_orders
      (owner_token_hash, id, name, items_json, total, created_at, updated_at)
      SELECT ?, id, name, items_json, total, created_at, updated_at
      FROM saved_orders WHERE owner_token_hash = ?`).bind(owner,deviceHash),
    env.DB.prepare('DELETE FROM saved_orders WHERE owner_token_hash = ?').bind(deviceHash),
    env.DB.prepare('UPDATE orders SET owner_token_hash = ?, account_user_id = ? WHERE owner_token_hash = ?')
      .bind(owner,userId,deviceHash),
    env.DB.prepare('UPDATE orders SET account_user_id = ? WHERE owner_token_hash = ? AND account_user_id = ?')
      .bind(userId,owner,''),
    env.DB.prepare('UPDATE user_bonuses SET owner_token_hash = ? WHERE owner_token_hash = ?').bind(owner,deviceHash),
    env.DB.prepare(`INSERT OR IGNORE INTO taste_profiles
      (owner_token_hash, order_count, summary_json, overrides_json, updated_at)
      SELECT ?, order_count, summary_json, overrides_json, ?
      FROM taste_profiles WHERE owner_token_hash = ?`).bind(owner,now,deviceHash),
    env.DB.prepare('DELETE FROM taste_profiles WHERE owner_token_hash = ?').bind(deviceHash)
  ]);
  return owner;
}

async function ownerContext(request, env, optional = false) {
  const session = await currentSession(request,env);
  const deviceHash = await optionalDeviceTokenHash(request);
  if (session) {
    const owner = await attachDeviceDataToUser(env,deviceHash || session.deviceHash,session.userId);
    return { owner, userId:session.userId, session };
  }
  if (deviceHash) return { owner:deviceHash, userId:'', session:null };
  if (optional) return { owner:'', userId:'', session:null };
  throw new ValidationError('Обновите страницу и попробуйте ещё раз.');
}

function sanitizeAccountName(value, fallback = 'Гость JELANI') {
  const name = String(value || '').trim().replace(/\s+/g, ' ').slice(0,80);
  return name || fallback;
}

async function createAccountUser(env, profile = {}) {
  const id = `USER-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const phone = validateRussianPhone(profile.phone) ? normalizeRussianPhone(profile.phone) : null;
  await env.DB.prepare(`INSERT INTO app_users
    (id, name, phone, avatar_url, created_at, updated_at, deleted_at)
    VALUES (?, ?, ?, ?, ?, ?, NULL)`)
    .bind(id,sanitizeAccountName(profile.name),phone,String(profile.avatarUrl || '').slice(0,500),now,now).run();
  return id;
}

async function mergeAccounts(env, primaryUserId, secondaryUserId) {
  if (!env.DB || !primaryUserId || !secondaryUserId || primaryUserId === secondaryUserId) return primaryUserId;
  const primary = await env.DB.prepare('SELECT * FROM app_users WHERE id = ? AND deleted_at IS NULL').bind(primaryUserId).first();
  const secondary = await env.DB.prepare('SELECT * FROM app_users WHERE id = ? AND deleted_at IS NULL').bind(secondaryUserId).first();
  if (!primary || !secondary) throw new ValidationError('Не удалось объединить профили.');
  const primaryOwner = await accountOwnerHash(primaryUserId);
  const secondaryOwner = await accountOwnerHash(secondaryUserId);
  const now = new Date().toISOString();
  const name = primary.name || secondary.name || 'Гость JELANI';
  const phone = primary.phone || secondary.phone || null;
  const avatar = primary.avatar_url || secondary.avatar_url || '';
  await env.DB.batch([
    env.DB.prepare('UPDATE app_users SET phone = NULL, deleted_at = ?, updated_at = ? WHERE id = ?').bind(now,now,secondaryUserId),
    env.DB.prepare('UPDATE app_users SET name = ?, phone = ?, avatar_url = ?, updated_at = ? WHERE id = ?')
      .bind(name,phone,avatar,now,primaryUserId),
    env.DB.prepare('UPDATE auth_identities SET user_id = ?, updated_at = ? WHERE user_id = ?').bind(primaryUserId,now,secondaryUserId),
    env.DB.prepare('UPDATE user_addresses SET user_id = ?, updated_at = ? WHERE user_id = ?').bind(primaryUserId,now,secondaryUserId),
    env.DB.prepare(`INSERT OR IGNORE INTO saved_orders
      (owner_token_hash, id, name, items_json, total, created_at, updated_at)
      SELECT ?, id, name, items_json, total, created_at, updated_at
      FROM saved_orders WHERE owner_token_hash = ?`).bind(primaryOwner,secondaryOwner),
    env.DB.prepare('DELETE FROM saved_orders WHERE owner_token_hash = ?').bind(secondaryOwner),
    env.DB.prepare('UPDATE orders SET owner_token_hash = ?, account_user_id = ? WHERE owner_token_hash = ? OR account_user_id = ?')
      .bind(primaryOwner,primaryUserId,secondaryOwner,secondaryUserId),
    env.DB.prepare('UPDATE user_bonuses SET owner_token_hash = ? WHERE owner_token_hash = ?').bind(primaryOwner,secondaryOwner),
    env.DB.prepare('DELETE FROM taste_profiles WHERE owner_token_hash = ?').bind(secondaryOwner),
    env.DB.prepare('UPDATE auth_sessions SET revoked_at = ? WHERE user_id = ? AND revoked_at IS NULL').bind(now,secondaryUserId)
  ]);
  await recalculateTasteProfile(env,primaryOwner);
  return primaryUserId;
}

async function resolveIdentityUser(env, provider, providerUserId, profile = {}, linkUserId = '') {
  const identity = await env.DB.prepare(`SELECT user_id AS userId FROM auth_identities
    WHERE provider = ? AND provider_user_id = ?`).bind(provider,providerUserId).first();
  let userId = linkUserId || identity?.userId || '';
  if (linkUserId && identity?.userId && identity.userId !== linkUserId) {
    userId = await mergeAccounts(env,linkUserId,identity.userId);
  }

  const verifiedPhone = validateRussianPhone(profile.phone) ? normalizeRussianPhone(profile.phone) : '';
  if (verifiedPhone) {
    const phoneUser = await env.DB.prepare('SELECT id FROM app_users WHERE phone = ? AND deleted_at IS NULL').bind(verifiedPhone).first();
    if (phoneUser?.id && userId && phoneUser.id !== userId) userId = await mergeAccounts(env,userId,phoneUser.id);
    else if (phoneUser?.id && !userId) userId = phoneUser.id;
  }
  if (!userId) userId = await createAccountUser(env,profile);

  const now = new Date().toISOString();
  await env.DB.prepare(`INSERT INTO auth_identities
    (provider, provider_user_id, user_id, email, phone, profile_json, created_at, updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(provider, provider_user_id) DO UPDATE SET
      user_id = excluded.user_id, email = excluded.email, phone = excluded.phone,
      profile_json = excluded.profile_json, updated_at = excluded.updated_at`)
    .bind(provider,providerUserId,userId,String(profile.email || '').slice(0,160),verifiedPhone,
      JSON.stringify(profile.raw || {}),now,now).run();

  const user = await env.DB.prepare('SELECT * FROM app_users WHERE id = ?').bind(userId).first();
  const nextName = user?.name && user.name !== 'Гость JELANI' ? user.name : sanitizeAccountName(profile.name);
  const nextPhone = user?.phone || verifiedPhone || null;
  const nextAvatar = user?.avatar_url || String(profile.avatarUrl || '').slice(0,500);
  await env.DB.prepare('UPDATE app_users SET name = ?, phone = ?, avatar_url = ?, updated_at = ? WHERE id = ?')
    .bind(nextName,nextPhone,nextAvatar,now,userId).run();
  return userId;
}

async function accountOrders(env, owner) {
  const ordersResult = await env.DB.prepare(`SELECT id, customer_name AS customerName, phone, customer_email AS email,
    delivery_method AS delivery, address, payment_method AS payment, payment_status AS paymentStatus,
    refunded_amount AS refundedAmount, refund_status AS refundStatus,
    comment, promo_code AS promo, subtotal, discount, total,
    status_index AS statusIndex, status, status_detail AS statusDetail, canceled, terminal,
    created_at AS createdAt, updated_at AS updatedAt
    FROM orders WHERE owner_token_hash = ? ORDER BY created_at DESC LIMIT 50`).bind(owner).all();
  const itemsResult = await env.DB.prepare(`SELECT oi.order_id AS orderId, oi.product_id AS productId, oi.name,
    oi.details, oi.options_json AS optionsJson, oi.unit_price AS unitPrice, oi.quantity
    FROM order_items oi JOIN orders o ON o.id = oi.order_id
    WHERE o.owner_token_hash = ? ORDER BY oi.id`).bind(owner).all();
  const itemsByOrder = new Map();
  for (const row of itemsResult.results || []) {
    if (!itemsByOrder.has(row.orderId)) itemsByOrder.set(row.orderId,[]);
    itemsByOrder.get(row.orderId).push({
      id:row.productId,
      name:row.name,
      details:row.details || '',
      options:parseJson(row.optionsJson,{}),
      price:Number(row.unitPrice || 0),
      qty:Number(row.quantity || 1)
    });
  }
  return (ordersResult.results || []).map(row=>({
    id:row.id,
    date:formatOrderDate(row.createdAt),
    createdAt:row.createdAt,
    updatedAt:row.updatedAt,
    name:row.customerName,
    phone:row.phone,
    email:row.email || '',
    delivery:row.delivery,
    address:row.address || '',
    payment:row.payment,
    paymentStatus:row.paymentStatus || '',
    refundedAmount:Number(row.refundedAmount || 0),
    refundStatus:row.refundStatus || '',
    comment:row.comment || '',
    promo:row.promo || '',
    subtotal:Number(row.subtotal || 0),
    discount:Number(row.discount || 0),
    total:Number(row.total || 0),
    statusIndex:Number(row.statusIndex || 0),
    status:row.status,
    statusDetail:row.statusDetail,
    canceled:Boolean(row.canceled),
    terminal:Boolean(row.terminal),
    items:itemsByOrder.get(row.id) || []
  }));
}

async function accountProfile(env, userId) {
  const user = await env.DB.prepare(`SELECT id, name, phone, avatar_url AS avatarUrl,
    created_at AS createdAt, updated_at AS updatedAt FROM app_users
    WHERE id = ? AND deleted_at IS NULL`).bind(userId).first();
  if (!user) throw new UnauthorizedError();
  const identities = await env.DB.prepare(`SELECT provider, email, phone, created_at AS createdAt
    FROM auth_identities WHERE user_id = ? ORDER BY created_at`).bind(userId).all();
  const addresses = await env.DB.prepare(`SELECT id, label, address, is_default AS isDefault
    FROM user_addresses WHERE user_id = ? ORDER BY is_default DESC, updated_at DESC LIMIT 5`).bind(userId).all();
  const owner = await accountOwnerHash(userId);
  const stats = await env.DB.prepare(`SELECT COUNT(*) AS orderCount, COALESCE(SUM(total),0) AS totalSpent
    FROM orders WHERE owner_token_hash = ? AND canceled = 0 AND payment_status IN ('succeeded','cash_on_pickup')`).bind(owner).first();
  const saved = await env.DB.prepare('SELECT COUNT(*) AS savedCount FROM saved_orders WHERE owner_token_hash = ?').bind(owner).first();
  return {
    id:user.id,
    name:user.name,
    phone:user.phone ? formatRussianPhone(user.phone) : '',
    avatarUrl:user.avatarUrl || '',
    createdAt:user.createdAt,
    updatedAt:user.updatedAt,
    loginMethods:(identities.results || []).map(identity=>identity.provider),
    identities:identities.results || [],
    addresses:(addresses.results || []).map(address=>({ ...address, isDefault:Boolean(address.isDefault) })),
    stats:{ orderCount:Number(stats?.orderCount || 0), totalSpent:Number(stats?.totalSpent || 0), savedCount:Number(saved?.savedCount || 0) }
  };
}

function authDevelopmentMode(request, env) {
  const hostname = new URL(request.url).hostname;
  return env.DEVELOPMENT_MODE === 'true' && ['localhost','127.0.0.1'].includes(hostname);
}

function requireAuthSecret(env) {
  const secret = String(env.AUTH_SECRET || '');
  if (secret.length < 32) throw new ServiceUnavailableError('Вход по телефону пока настраивается.');
  return secret;
}

function requestIp(request) {
  return String(request.headers.get('cf-connecting-ip') || request.headers.get('x-forwarded-for') || '').split(',')[0].trim();
}

async function sendSmsCode(env, phone, code, ip) {
  if (!env.SMSRU_API_ID) return false;
  const body = new URLSearchParams({
    api_id:String(env.SMSRU_API_ID),
    to:phone,
    msg:`JELANI: код входа ${code}. Никому его не сообщайте.`,
    json:'1',
    ttl:'5'
  });
  if (env.SMSRU_FROM) body.set('from',String(env.SMSRU_FROM));
  if (ip) body.set('ip',ip);
  const response = await fetch('https://sms.ru/sms/send', {
    method:'POST',
    headers:{ 'content-type':'application/x-www-form-urlencoded' },
    body
  });
  const data = await response.json().catch(()=>null);
  return Boolean(response.ok && data?.status === 'OK' && data?.sms?.[phone]?.status === 'OK');
}

async function handlePhoneCodeRequest(request, env) {
  if (request.method !== 'POST') return json({ ok:false, error:'Method not allowed' },405);
  if (!env.DB) throw new ServiceUnavailableError('Вход по телефону временно недоступен.');
  const secret = requireAuthSecret(env);
  await ensureDatabase(env);
  const body = await request.json();
  const phone = normalizeRussianPhone(body.phone);
  if (!validateRussianPhone(phone)) throw new ValidationError('Введите российский мобильный номер.');
  const now = Date.now();
  const recent = await env.DB.prepare(`SELECT requested_at AS requestedAt FROM auth_otps
    WHERE phone = ? ORDER BY requested_at DESC LIMIT 1`).bind(phone).first();
  if (recent && now - new Date(recent.requestedAt).getTime() < 60000) {
    throw new RateLimitError('Новый код можно запросить через минуту.');
  }
  const dayStart = new Date(now - 86400000).toISOString();
  const phoneCount = await env.DB.prepare('SELECT COUNT(*) AS count FROM auth_otps WHERE phone = ? AND requested_at > ?')
    .bind(phone,dayStart).first();
  if (Number(phoneCount?.count || 0) >= 5) throw new RateLimitError('Слишком много запросов. Попробуйте завтра.');
  const ip = requestIp(request);
  const ipHash = ip ? await hashDeviceToken(`ip:${ip}`) : '';
  if (ipHash) {
    const hourStart = new Date(now - 3600000).toISOString();
    const ipCount = await env.DB.prepare('SELECT COUNT(*) AS count FROM auth_otps WHERE ip_hash = ? AND requested_at > ?')
      .bind(ipHash,hourStart).first();
    if (Number(ipCount?.count || 0) >= 20) throw new RateLimitError('Слишком много запросов. Попробуйте позже.');
  }

  const code = randomDigits(6);
  const id = `OTP-${crypto.randomUUID()}`;
  const requestedAt = new Date(now).toISOString();
  const expiresAt = new Date(now + AUTH_OTP_SECONDS * 1000).toISOString();
  const codeHash = await hashDeviceToken(`${id}:${code}:${secret}`);
  const deviceHash = await optionalDeviceTokenHash(request);
  await env.DB.prepare(`INSERT INTO auth_otps
    (id, phone, code_hash, attempts, requested_at, expires_at, consumed_at, ip_hash, device_token_hash)
    VALUES (?, ?, ?, 0, ?, ?, NULL, ?, ?)`)
    .bind(id,phone,codeHash,requestedAt,expiresAt,ipHash,deviceHash).run();

  const development = authDevelopmentMode(request,env);
  const delivered = development || await sendSmsCode(env,phone,code,ip);
  if (!delivered) {
    await env.DB.prepare('DELETE FROM auth_otps WHERE id = ?').bind(id).run();
    throw new ServiceUnavailableError('Не удалось отправить код. Попробуйте ещё раз.');
  }
  return json({ ok:true, expiresIn:AUTH_OTP_SECONDS, retryAfter:60, ...(development ? { debugCode:code } : {}) });
}

async function handlePhoneCodeVerify(request, env) {
  if (request.method !== 'POST') return json({ ok:false, error:'Method not allowed' },405);
  if (!env.DB) throw new ServiceUnavailableError('Вход по телефону временно недоступен.');
  const secret = requireAuthSecret(env);
  await ensureDatabase(env);
  const body = await request.json();
  const phone = normalizeRussianPhone(body.phone);
  const code = String(body.code || '').replace(/\D/g,'');
  if (!validateRussianPhone(phone) || !/^\d{6}$/.test(code)) throw new ValidationError('Проверьте номер и код из SMS.');
  const now = new Date().toISOString();
  const otp = await env.DB.prepare(`SELECT id, code_hash AS codeHash, attempts, expires_at AS expiresAt
    FROM auth_otps WHERE phone = ? AND consumed_at IS NULL ORDER BY requested_at DESC LIMIT 1`).bind(phone).first();
  if (!otp || otp.expiresAt <= now || Number(otp.attempts) >= AUTH_OTP_MAX_ATTEMPTS) {
    throw new ValidationError('Код истёк. Запросите новый.');
  }
  const expected = await hashDeviceToken(`${otp.id}:${code}:${secret}`);
  const nextAttempts = Number(otp.attempts || 0) + 1;
  if (!constantTimeEqual(expected,otp.codeHash)) {
    await env.DB.prepare(`UPDATE auth_otps SET attempts = ?, consumed_at = CASE WHEN ? >= ? THEN ? ELSE consumed_at END
      WHERE id = ?`).bind(nextAttempts,nextAttempts,AUTH_OTP_MAX_ATTEMPTS,now,otp.id).run();
    throw new ValidationError(nextAttempts >= AUTH_OTP_MAX_ATTEMPTS ? 'Код заблокирован. Запросите новый.' : 'Неверный код из SMS.');
  }
  await env.DB.prepare('UPDATE auth_otps SET attempts = ?, consumed_at = ? WHERE id = ?')
    .bind(nextAttempts,now,otp.id).run();

  const existingSession = await currentSession(request,env);
  const userId = await resolveIdentityUser(env,'phone',phone,{
    name:sanitizeAccountName(body.name),
    phone,
    raw:{ verifiedAt:now }
  },existingSession?.userId || '');
  const deviceHash = await optionalDeviceTokenHash(request);
  await attachDeviceDataToUser(env,deviceHash,userId);
  const token = await createAuthSession(env,userId,deviceHash);
  return jsonWithSession({ ok:true, profile:await accountProfile(env,userId) },request,token);
}

function telegramCheckString(payload) {
  return Object.entries(payload || {})
    .filter(([key,value])=>key !== 'hash' && value !== undefined && value !== null && value !== '')
    .sort(([left],[right])=>left.localeCompare(right))
    .map(([key,value])=>`${key}=${value}`)
    .join('\n');
}

async function hmacSha256Bytes(keyBytes, value) {
  const key = await crypto.subtle.importKey('raw',keyBytes,{ name:'HMAC',hash:'SHA-256' },false,['sign']);
  const data = typeof value === 'string' ? new TextEncoder().encode(value) : value;
  return new Uint8Array(await crypto.subtle.sign('HMAC',key,data));
}

async function hmacSha256Hex(keyBytes, value) {
  const signature = await hmacSha256Bytes(keyBytes,value);
  return [...signature].map(byte=>byte.toString(16).padStart(2,'0')).join('');
}

async function verifyTelegramPayload(payload, botToken, nowSeconds = Math.floor(Date.now()/1000)) {
  if (!payload?.id || !payload?.hash || !payload?.auth_date || !botToken) return false;
  const age = nowSeconds - Number(payload.auth_date);
  if (!Number.isFinite(age) || age < -60 || age > 600) return false;
  const secret = await crypto.subtle.digest('SHA-256',new TextEncoder().encode(botToken));
  const expected = await hmacSha256Hex(new Uint8Array(secret),telegramCheckString(payload));
  return constantTimeEqual(expected.toLowerCase(),String(payload.hash).toLowerCase());
}

async function handleTelegramAuth(request, env) {
  if (request.method !== 'POST') return json({ ok:false, error:'Method not allowed' },405);
  if (!env.DB || !env.TELEGRAM_BOT_TOKEN) throw new ServiceUnavailableError('Вход через Telegram пока настраивается.');
  await ensureDatabase(env);
  const payload = await request.json();
  if (!await verifyTelegramPayload(payload,env.TELEGRAM_BOT_TOKEN)) throw new ValidationError('Не удалось подтвердить вход через Telegram.');
  const existingSession = await currentSession(request,env);
  const name = [payload.first_name,payload.last_name].filter(Boolean).join(' ');
  const userId = await resolveIdentityUser(env,'telegram',String(payload.id),{
    name:sanitizeAccountName(name || payload.username),
    avatarUrl:String(payload.photo_url || ''),
    raw:{ id:String(payload.id), username:String(payload.username || ''), authDate:Number(payload.auth_date) }
  },existingSession?.userId || '');
  const deviceHash = await optionalDeviceTokenHash(request);
  await attachDeviceDataToUser(env,deviceHash,userId);
  const token = await createAuthSession(env,userId,deviceHash);
  return jsonWithSession({ ok:true, profile:await accountProfile(env,userId) },request,token);
}

function webAppEntries(initData) {
  const source = String(initData || '');
  if (!source || source.length > 20000) return [];
  const entries = [];
  const keys = new Set();
  try {
    for (const part of source.split('&')) {
      const separator = part.indexOf('=');
      if (separator < 1) return [];
      const key = decodeURIComponent(part.slice(0,separator).replace(/\+/g,' '));
      const value = decodeURIComponent(part.slice(separator+1).replace(/\+/g,' '));
      if (!key || keys.has(key)) return [];
      keys.add(key);
      entries.push([key,value]);
    }
  } catch {
    return [];
  }
  return entries;
}

function webAppCheckString(initData) {
  return webAppEntries(initData)
    .filter(([key])=>key !== 'hash')
    .sort(([left],[right])=>left < right ? -1 : left > right ? 1 : 0)
    .map(([key,value])=>`${key}=${value}`)
    .join('\n');
}

function telegramWebAppEntries(initData) {
  return webAppEntries(initData);
}

function telegramWebAppCheckString(initData) {
  return webAppCheckString(initData);
}

function telegramWebAppUser(initData) {
  const value = telegramWebAppEntries(initData).find(([key])=>key === 'user')?.[1] || '';
  try { return JSON.parse(value); } catch { return null; }
}

async function verifyTelegramWebAppData(initData, botToken, nowSeconds = Math.floor(Date.now()/1000)) {
  if (!botToken) return false;
  const entries = telegramWebAppEntries(initData);
  const hash = entries.find(([key])=>key === 'hash')?.[1] || '';
  const authDate = Number(entries.find(([key])=>key === 'auth_date')?.[1]);
  const user = telegramWebAppUser(initData);
  const age = nowSeconds - authDate;
  if (!/^[a-f0-9]{64}$/i.test(hash) || !user?.id || !Number.isFinite(age) || age < -60 || age > AUTH_PROVIDER_PAYLOAD_SECONDS) {
    return false;
  }
  const encoder = new TextEncoder();
  const secret = await hmacSha256Bytes(encoder.encode('WebAppData'),encoder.encode(botToken));
  const expected = await hmacSha256Hex(secret,telegramWebAppCheckString(initData));
  return constantTimeEqual(expected.toLowerCase(),hash.toLowerCase());
}

async function handleTelegramWebAppAuth(request, env) {
  if (request.method !== 'POST') return json({ ok:false, error:'Method not allowed' },405);
  if (!env.DB || !env.TELEGRAM_BOT_TOKEN) throw new ServiceUnavailableError('Вход через Telegram пока настраивается.');
  await ensureDatabase(env);
  const body = await request.json().catch(()=>({}));
  const initData = String(body.initData || '');
  if (!await verifyTelegramWebAppData(initData,env.TELEGRAM_BOT_TOKEN)) throw new ValidationError('Не удалось подтвердить вход через Telegram.');
  const payload = telegramWebAppUser(initData);
  const existingSession = await currentSession(request,env);
  const name = [payload.first_name,payload.last_name].filter(Boolean).join(' ');
  const userId = await resolveIdentityUser(env,'telegram',String(payload.id),{
    name:sanitizeAccountName(name || payload.username),
    avatarUrl:String(payload.photo_url || ''),
    raw:{
      id:String(payload.id),
      username:String(payload.username || ''),
      authDate:Number(telegramWebAppEntries(initData).find(([key])=>key === 'auth_date')?.[1] || 0),
      source:'telegram_webapp'
    }
  },existingSession?.userId || '');
  const deviceHash = await optionalDeviceTokenHash(request);
  await attachDeviceDataToUser(env,deviceHash,userId);
  const token = await createAuthSession(env,userId,deviceHash);
  return jsonWithSession({ ok:true, profile:await accountProfile(env,userId) },request,token);
}

function maxWebAppEntries(initData) {
  return webAppEntries(initData);
}

function maxCheckString(initData) {
  return webAppCheckString(initData);
}

function maxWebAppUser(initData) {
  const value = maxWebAppEntries(initData).find(([key])=>key === 'user')?.[1] || '';
  try { return JSON.parse(value); } catch { return null; }
}

async function verifyMaxWebAppData(initData, botToken, nowSeconds = Math.floor(Date.now()/1000)) {
  if (!botToken) return false;
  const entries = maxWebAppEntries(initData);
  const hash = entries.find(([key])=>key === 'hash')?.[1] || '';
  const authDate = Number(entries.find(([key])=>key === 'auth_date')?.[1]);
  const user = maxWebAppUser(initData);
  const age = nowSeconds - authDate;
  if (!/^[a-f0-9]{64}$/i.test(hash) || !user?.id || !Number.isFinite(age) || age < -60 || age > AUTH_PROVIDER_PAYLOAD_SECONDS) {
    return false;
  }
  const encoder = new TextEncoder();
  const secret = await hmacSha256Bytes(encoder.encode('WebAppData'),encoder.encode(botToken));
  const expected = await hmacSha256Hex(secret,maxCheckString(initData));
  return constantTimeEqual(expected.toLowerCase(),hash.toLowerCase());
}

async function handleMaxAuth(request, env) {
  if (request.method !== 'POST') return json({ ok:false, error:'Method not allowed' },405);
  if (!env.DB || !env.MAX_BOT_TOKEN) throw new ServiceUnavailableError('Вход через MAX пока настраивается.');
  await ensureDatabase(env);
  const body = await request.json().catch(()=>({}));
  const initData = String(body.initData || '');
  if (!await verifyMaxWebAppData(initData,env.MAX_BOT_TOKEN)) throw new ValidationError('Не удалось подтвердить вход через MAX.');
  const payload = maxWebAppUser(initData);
  const existingSession = await currentSession(request,env);
  const name = [payload.first_name,payload.last_name].filter(Boolean).join(' ');
  const userId = await resolveIdentityUser(env,'max',String(payload.id),{
    name:sanitizeAccountName(name || payload.username),
    avatarUrl:String(payload.photo_url || ''),
    raw:{ id:String(payload.id), username:String(payload.username || ''), authDate:Number(maxWebAppEntries(initData).find(([key])=>key === 'auth_date')?.[1] || 0) }
  },existingSession?.userId || '');
  const deviceHash = await optionalDeviceTokenHash(request);
  await attachDeviceDataToUser(env,deviceHash,userId);
  const token = await createAuthSession(env,userId,deviceHash);
  return jsonWithSession({ ok:true, profile:await accountProfile(env,userId) },request,token);
}

function oauthProvider(env, provider) {
  const configs = {
    vk:{
      label:'VK',
      clientId:String(env.VK_CLIENT_ID || ''),
      clientSecret:String(env.VK_CLIENT_SECRET || ''),
      authUrl:String(env.VK_AUTH_URL || 'https://id.vk.ru/authorize'),
      tokenUrl:String(env.VK_TOKEN_URL || 'https://id.vk.ru/oauth2/auth'),
      userInfoUrl:String(env.VK_USERINFO_URL || 'https://id.vk.ru/oauth2/user_info'),
      scope:String(env.VK_SCOPE || 'phone email'),
      pkce:true,
      userInfoMethod:'form'
    },
    ok:{
      label:'Одноклассники',
      clientId:String(env.OK_CLIENT_ID || ''),
      clientSecret:String(env.OK_CLIENT_SECRET || ''),
      authUrl:String(env.OK_AUTH_URL || 'https://id.vk.ru/authorize'),
      tokenUrl:String(env.OK_TOKEN_URL || 'https://id.vk.ru/oauth2/auth'),
      userInfoUrl:String(env.OK_USERINFO_URL || 'https://id.vk.ru/oauth2/user_info'),
      scope:String(env.OK_SCOPE || 'phone email'),
      pkce:true,
      userInfoMethod:'form'
    },
    mail:{
      label:'Mail.ru',
      clientId:String(env.MAILRU_CLIENT_ID || ''),
      clientSecret:String(env.MAILRU_CLIENT_SECRET || ''),
      authUrl:String(env.MAILRU_AUTH_URL || 'https://oauth.mail.ru/login'),
      tokenUrl:String(env.MAILRU_TOKEN_URL || 'https://oauth.mail.ru/token'),
      userInfoUrl:String(env.MAILRU_USERINFO_URL || 'https://oauth.mail.ru/userinfo'),
      scope:String(env.MAILRU_SCOPE || 'userinfo'),
      pkce:false,
      userInfoMethod:'bearer'
    },
    max:{
      label:'MAX',
      clientId:String(env.MAX_CLIENT_ID || ''),
      clientSecret:String(env.MAX_CLIENT_SECRET || ''),
      authUrl:String(env.MAX_AUTH_URL || ''),
      tokenUrl:String(env.MAX_TOKEN_URL || ''),
      userInfoUrl:String(env.MAX_USERINFO_URL || ''),
      scope:String(env.MAX_SCOPE || 'openid profile phone'),
      pkce:true,
      userInfoMethod:'bearer'
    }
  };
  const config = configs[provider];
  if (!config) return null;
  const available = Boolean(config.clientId && config.authUrl && config.tokenUrl && (['vk','ok'].includes(provider) || config.clientSecret));
  return { ...config, provider, available };
}

function handleAuthConfig(request, env) {
  const development = authDevelopmentMode(request,env);
  return json({
    ok:true,
    providers:{
      phone:{ available:Boolean(env.SMSRU_API_ID || development) && String(env.AUTH_SECRET || '').length >= 32 },
      telegram:{
        available:Boolean(env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_BOT_USERNAME),
        botUsername:String(env.TELEGRAM_BOT_USERNAME || ''),
        miniApp:Boolean(env.TELEGRAM_BOT_TOKEN)
      },
      vk:{ available:Boolean(oauthProvider(env,'vk')?.available) },
      ok:{ available:Boolean(oauthProvider(env,'ok')?.available) },
      mail:{ available:Boolean(oauthProvider(env,'mail')?.available) },
      max:{
        available:Boolean(env.MAX_BOT_TOKEN || oauthProvider(env,'max')?.available),
        mode:env.MAX_BOT_TOKEN ? 'miniapp' : 'oauth',
        launchUrl:String(env.MAX_MINI_APP_URL || '')
      }
    }
  });
}

async function handleOAuthStart(request, env) {
  if (request.method !== 'GET') return json({ ok:false, error:'Method not allowed' },405);
  if (!env.DB) throw new ServiceUnavailableError('Этот способ входа временно недоступен.');
  await ensureDatabase(env);
  const url = new URL(request.url);
  const provider = String(url.searchParams.get('provider') || '');
  const config = oauthProvider(env,provider);
  if (!config?.available) throw new ServiceUnavailableError(`Вход через ${config?.label || 'этот сервис'} пока настраивается.`);
  const mode = url.searchParams.get('mode') === 'link' ? 'link' : 'login';
  const session = mode === 'link' ? await requireSession(request,env) : null;
  const deviceHash = await optionalDeviceTokenHash(request);
  const state = randomHex(32);
  const stateHash = await hashDeviceToken(state);
  const verifierBytes = new Uint8Array(32);
  crypto.getRandomValues(verifierBytes);
  const codeVerifier = bytesToBase64Url(verifierBytes);
  const callbackUrl = `${url.origin}/api/auth/oauth/callback/${provider}`;
  const expiresAt = new Date(Date.now() + 600000).toISOString();
  await env.DB.prepare(`INSERT INTO oauth_states
    (state_hash, provider, code_verifier, link_user_id, device_token_hash, redirect_uri, expires_at, used_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`)
    .bind(stateHash,provider,config.pkce ? codeVerifier : '',session?.userId || '',deviceHash,callbackUrl,expiresAt).run();
  const authorize = new URL(config.authUrl);
  authorize.searchParams.set('client_id',config.clientId);
  authorize.searchParams.set('response_type','code');
  authorize.searchParams.set('redirect_uri',callbackUrl);
  authorize.searchParams.set('state',state);
  if (config.scope) authorize.searchParams.set('scope',config.scope);
  if (config.pkce) {
    authorize.searchParams.set('code_challenge',await sha256Base64Url(codeVerifier));
    authorize.searchParams.set('code_challenge_method','S256');
  }
  return json({ ok:true, url:authorize.toString() });
}

async function exchangeOAuthCode(config, callbackUrl, code, codeVerifier, query) {
  const body = new URLSearchParams({
    grant_type:'authorization_code',
    client_id:config.clientId,
    code,
    redirect_uri:callbackUrl
  });
  if (config.clientSecret) body.set('client_secret',config.clientSecret);
  if (codeVerifier) body.set('code_verifier',codeVerifier);
  if (query.get('device_id')) body.set('device_id',query.get('device_id'));
  const response = await fetch(config.tokenUrl,{
    method:'POST',
    headers:{ 'content-type':'application/x-www-form-urlencoded', accept:'application/json' },
    body
  });
  const data = await response.json().catch(()=>null);
  if (!response.ok || !data || data.error) throw new ValidationError('Не удалось подтвердить вход.');
  return data;
}

async function oauthUserInfo(config, token) {
  if (!config.userInfoUrl || !token.access_token) return {};
  let response;
  if (config.userInfoMethod === 'form') {
    response = await fetch(config.userInfoUrl,{
      method:'POST',
      headers:{ 'content-type':'application/x-www-form-urlencoded', accept:'application/json' },
      body:new URLSearchParams({ access_token:String(token.access_token), client_id:config.clientId })
    });
  } else {
    response = await fetch(config.userInfoUrl,{ headers:{ authorization:`Bearer ${token.access_token}`, accept:'application/json' } });
  }
  if (!response.ok) throw new ValidationError('Не удалось загрузить профиль.');
  return await response.json().catch(()=>({}));
}

function normalizeOAuthProfile(provider, token, info) {
  const value = info?.user || info?.response?.[0] || info?.data || info || {};
  const providerUserId = String(value.user_id || value.id || value.sub || token.user_id || token.x_mailru_vid || '');
  if (!providerUserId) throw new ValidationError('Сервис не вернул идентификатор профиля.');
  const name = [value.first_name,value.last_name].filter(Boolean).join(' ') || value.name || value.display_name || value.email || `${provider.toUpperCase()} пользователь`;
  return {
    providerUserId,
    name:sanitizeAccountName(name),
    phone:validateRussianPhone(value.phone || value.phone_number) ? normalizeRussianPhone(value.phone || value.phone_number) : '',
    email:String(value.email || '').slice(0,160),
    avatarUrl:String(value.avatar || value.avatar_url || value.picture || value.image || value.photo_200 || value.pic128x128 || '').slice(0,500),
    raw:{ id:providerUserId, email:String(value.email || '') }
  };
}

async function handleOAuthCallback(request, env, provider) {
  const home = new URL('/',request.url);
  try {
    if (!env.DB) throw new Error('db');
    await ensureDatabase(env);
    const url = new URL(request.url);
    const state = String(url.searchParams.get('state') || '');
    const code = String(url.searchParams.get('code') || '');
    if (!state || !code || url.searchParams.get('error')) throw new Error('oauth');
    const stateHash = await hashDeviceToken(state);
    const row = await env.DB.prepare(`SELECT provider, code_verifier AS codeVerifier,
      link_user_id AS linkUserId, device_token_hash AS deviceHash, redirect_uri AS redirectUri,
      expires_at AS expiresAt, used_at AS usedAt FROM oauth_states WHERE state_hash = ?`).bind(stateHash).first();
    if (!row || row.provider !== provider || row.usedAt || row.expiresAt <= new Date().toISOString()) throw new Error('state');
    await env.DB.prepare('UPDATE oauth_states SET used_at = ? WHERE state_hash = ? AND used_at IS NULL')
      .bind(new Date().toISOString(),stateHash).run();
    const config = oauthProvider(env,provider);
    if (!config?.available) throw new Error('config');
    const tokenData = await exchangeOAuthCode(config,row.redirectUri,code,row.codeVerifier,url.searchParams);
    const info = await oauthUserInfo(config,tokenData);
    const profile = normalizeOAuthProfile(provider,tokenData,info);
    const userId = await resolveIdentityUser(env,provider,profile.providerUserId,profile,row.linkUserId || '');
    await attachDeviceDataToUser(env,row.deviceHash,userId);
    const sessionToken = await createAuthSession(env,userId,row.deviceHash);
    home.searchParams.set('auth','success');
    home.searchParams.set('provider',provider);
    home.hash = 'account';
    return redirectWithSession(home.toString(),request,sessionToken);
  } catch {
    home.searchParams.set('auth','error');
    home.hash = 'account';
    return Response.redirect(home.toString(),302);
  }
}

async function sessionPayload(request, env, session) {
  const deviceHash = await optionalDeviceTokenHash(request);
  const owner = await attachDeviceDataToUser(env,deviceHash || session.deviceHash,session.userId);
  return {
    ok:true,
    authenticated:true,
    profile:await accountProfile(env,session.userId),
    orders:await accountOrders(env,owner)
  };
}

async function handleAuthSession(request, env) {
  if (!env.DB) return json({ ok:true, authenticated:false });
  if (request.method === 'GET') {
    const session = await currentSession(request,env);
    return session ? json(await sessionPayload(request,env,session)) : json({ ok:true, authenticated:false });
  }
  if (request.method === 'DELETE' || request.method === 'POST') {
    const session = await currentSession(request,env);
    if (session) await env.DB.prepare('UPDATE auth_sessions SET revoked_at = ? WHERE token_hash = ?')
      .bind(new Date().toISOString(),session.tokenHash).run();
    return clearSessionResponse({ ok:true, authenticated:false },request);
  }
  return json({ ok:false, error:'Method not allowed' },405);
}

function sanitizeAddresses(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0,5).map((item,index)=>{
    const address = String(item?.address || '').trim().replace(/\s+/g,' ').slice(0,240);
    if (!address) throw new ValidationError('Заполните адрес или удалите пустую строку.');
    return {
      id:/^ADDR-[a-zA-Z0-9-]{6,60}$/.test(String(item?.id || '')) ? String(item.id) : `ADDR-${crypto.randomUUID()}`,
      label:String(item?.label || `Адрес ${index+1}`).trim().slice(0,40),
      address,
      isDefault:Boolean(item?.isDefault || index === 0)
    };
  });
}

async function handleAccount(request, env) {
  if (!env.DB) throw new ServiceUnavailableError('Личный кабинет временно недоступен.');
  await ensureDatabase(env);
  const session = await requireSession(request,env);
  const deviceHash = await optionalDeviceTokenHash(request);
  const owner = await attachDeviceDataToUser(env,deviceHash || session.deviceHash,session.userId);
  if (request.method === 'GET') return json(await sessionPayload(request,env,session));
  if (request.method === 'PATCH') {
    const body = await request.json();
    const name = sanitizeAccountName(body.name);
    const addresses = body.addresses == null ? null : sanitizeAddresses(body.addresses);
    const now = new Date().toISOString();
    const statements = [env.DB.prepare('UPDATE app_users SET name = ?, updated_at = ? WHERE id = ?').bind(name,now,session.userId)];
    if (addresses) {
      statements.push(env.DB.prepare('DELETE FROM user_addresses WHERE user_id = ?').bind(session.userId));
      addresses.forEach((address,index)=>statements.push(env.DB.prepare(`INSERT INTO user_addresses
        (id, user_id, label, address, is_default, created_at, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?)`)
        .bind(address.id,session.userId,address.label,address.address,address.isDefault && index === 0 ? 1 : 0,now,now)));
    }
    await env.DB.batch(statements);
    return json({ ok:true, profile:await accountProfile(env,session.userId) });
  }
  if (request.method === 'DELETE') {
    const body = await request.json().catch(()=>({}));
    if (String(body.confirmation || '').toUpperCase() !== 'УДАЛИТЬ') throw new ValidationError('Подтвердите удаление профиля.');
    const now = new Date().toISOString();
    await env.DB.batch([
      env.DB.prepare('DELETE FROM auth_identities WHERE user_id = ?').bind(session.userId),
      env.DB.prepare('DELETE FROM user_addresses WHERE user_id = ?').bind(session.userId),
      env.DB.prepare('UPDATE auth_sessions SET revoked_at = ? WHERE user_id = ?').bind(now,session.userId),
      env.DB.prepare('DELETE FROM saved_orders WHERE owner_token_hash = ?').bind(owner),
      env.DB.prepare('DELETE FROM user_bonuses WHERE owner_token_hash = ?').bind(owner),
      env.DB.prepare('DELETE FROM taste_profiles WHERE owner_token_hash = ?').bind(owner),
      env.DB.prepare("UPDATE orders SET owner_token_hash = '', account_user_id = '' WHERE owner_token_hash = ?").bind(owner),
      env.DB.prepare("UPDATE app_users SET name = '', phone = NULL, avatar_url = '', deleted_at = ?, updated_at = ? WHERE id = ?")
        .bind(now,now,session.userId)
    ]);
    return clearSessionResponse({ ok:true, deleted:true },request);
  }
  return json({ ok:false, error:'Method not allowed' },405);
}

function sanitizeSavedItems(items) {
  if (!Array.isArray(items) || items.length < 1 || items.length > 50) {
    throw new ValidationError('В сохранённом заказе должен быть хотя бы один товар.');
  }

  const priced = items.map(item => {
    const qty = Number(item?.qty || 1);
    if (!Number.isInteger(qty) || qty < 1 || qty > 20) {
      throw new ValidationError('Проверьте количество товаров в сохранённом заказе.');
    }
    return {
      id: String(item?.id || '').slice(0, 80),
      name: String(item?.name || 'Позиция').slice(0, 160),
      price: serverItemPrice(item),
      emoji: String(item?.emoji || '🍽️').slice(0, 12),
      details: String(item?.details || '').slice(0, 1000),
      options: item?.options && typeof item.options === 'object' ? item.options : null,
      qty
    };
  });

  return {
    items: priced,
    total: priced.reduce((sum, item) => sum + item.price * item.qty, 0)
  };
}

function savedOrderId(value) {
  const id = String(value || '');
  if (!/^SAVED-[A-Za-z0-9-]{6,40}$/.test(id)) throw new ValidationError('Не удалось определить сохранённый заказ.');
  return id;
}

function savedOrderName(value) {
  const name = String(value || '').trim();
  if (!name || name.length > 60) throw new ValidationError('Название заказа должно содержать от 1 до 60 символов.');
  return name;
}

function savedOrderFromRow(row) {
  let items = [];
  try { items = JSON.parse(row.itemsJson || '[]'); } catch {}
  return {
    id: row.id,
    name: row.name,
    items,
    total: Number(row.total || 0),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    date: formatOrderDate(row.createdAt)
  };
}

async function handleSavedOrders(request, env, orderId = '') {
  if (!env.DB) throw new ServiceUnavailableError('Не удалось синхронизировать сохранённые заказы. Попробуйте позже.');
  await ensureDatabase(env);
  const { owner } = await ownerContext(request,env);

  if (request.method === 'GET' && !orderId) {
    const result = await env.DB.prepare(`SELECT id, name, items_json AS itemsJson, total,
      created_at AS createdAt, updated_at AS updatedAt
      FROM saved_orders WHERE owner_token_hash = ? ORDER BY updated_at DESC LIMIT 30`)
      .bind(owner).all();
    return json({ ok: true, orders: (result.results || []).map(savedOrderFromRow) });
  }

  if (request.method === 'POST' && !orderId) {
    const body = await request.json();
    const id = savedOrderId(body.id);
    const name = savedOrderName(body.name);
    const priced = sanitizeSavedItems(body.items);
    const requestedCreatedAt = new Date(body.createdAt || Date.now());
    const createdAt = Number.isNaN(requestedCreatedAt.getTime()) ? new Date().toISOString() : requestedCreatedAt.toISOString();
    const updatedAt = new Date().toISOString();
    await env.DB.prepare(`INSERT INTO saved_orders
      (owner_token_hash, id, name, items_json, total, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(owner_token_hash, id) DO UPDATE SET
        name = excluded.name,
        items_json = excluded.items_json,
        total = excluded.total,
        updated_at = excluded.updated_at`)
      .bind(owner, id, name, JSON.stringify(priced.items), priced.total, createdAt, updatedAt).run();
    return json({ ok: true, order:savedOrderFromRow({ id, name, itemsJson:JSON.stringify(priced.items), total:priced.total, createdAt, updatedAt }) });
  }

  if (request.method === 'PATCH' && orderId) {
    const id = savedOrderId(orderId);
    const body = await request.json();
    const name = savedOrderName(body.name);
    const updatedAt = new Date().toISOString();
    await env.DB.prepare('UPDATE saved_orders SET name = ?, updated_at = ? WHERE owner_token_hash = ? AND id = ?')
      .bind(name, updatedAt, owner, id).run();
    return json({ ok: true, id, name, updatedAt });
  }

  if (request.method === 'DELETE' && orderId) {
    const id = savedOrderId(orderId);
    await env.DB.prepare('DELETE FROM saved_orders WHERE owner_token_hash = ? AND id = ?')
      .bind(owner, id).run();
    return json({ ok: true, id });
  }

  return json({ ok: false, error: 'Method not allowed' }, 405);
}

function parseJson(value, fallback) {
  try { return JSON.parse(value || JSON.stringify(fallback)); }
  catch { return fallback; }
}

function requireAdmin(request, env) {
  const expected = String(env.ADMIN_API_TOKEN || '');
  const actual = requestDeviceToken(request);
  if (!expected || actual !== expected) throw new ForbiddenError();
}

function bonusFromRow(row) {
  if (!row) return null;
  return {
    id:row.id,
    type:row.type,
    title:row.title,
    description:row.description,
    conditions:row.conditions || '',
    sourceOrderId:row.sourceOrderId,
    expiresAt:row.expiresAt,
    usedAt:row.usedAt || null,
    canceledAt:row.canceledAt || null,
    createdAt:row.createdAt
  };
}

async function activeBonuses(env, owner) {
  if (!owner || !env.DB) return [];
  await ensureDatabase(env);
  const now = new Date().toISOString();
  const result = await env.DB.prepare(`SELECT id, type, title, description, conditions,
    source_order_id AS sourceOrderId, expires_at AS expiresAt, used_at AS usedAt,
    canceled_at AS canceledAt, created_at AS createdAt
    FROM user_bonuses
    WHERE owner_token_hash = ? AND expires_at > ? AND used_at IS NULL AND canceled_at IS NULL
      AND reserved_order_id = ''
    ORDER BY expires_at ASC`).bind(owner, now).all();
  return (result.results || []).map(bonusFromRow);
}

function weightedChoice(definitions) {
  const total = definitions.reduce((sum, item) => sum + Math.max(0, Number(item.weight || 0)), 0);
  if (!total) return null;
  const random = new Uint32Array(1);
  crypto.getRandomValues(random);
  let cursor = (random[0] / 0xffffffff) * total;
  for (const definition of definitions) {
    cursor -= Math.max(0, Number(definition.weight || 0));
    if (cursor <= 0) return definition;
  }
  return definitions[definitions.length - 1] || null;
}

async function awardBonusForOrder(env, owner, order) {
  if (!env.DB || !owner) return null;
  await ensureDatabase(env);
  const existing = await env.DB.prepare(`SELECT id, type, title, description, conditions,
    source_order_id AS sourceOrderId, expires_at AS expiresAt, used_at AS usedAt,
    canceled_at AS canceledAt, created_at AS createdAt
    FROM user_bonuses WHERE source_order_id = ?`).bind(order.id).first();
  if (existing) return bonusFromRow(existing);

  const definitions = await env.DB.prepare(`SELECT type, title, description, conditions, weight,
    validity_days AS validityDays, min_order_total AS minOrderTotal
    FROM bonus_definitions WHERE enabled = 1 AND weight > 0 AND min_order_total <= ?`)
    .bind(Number(order.total || 0)).all();
  const selected = weightedChoice(definitions.results || []);
  if (!selected) return null;

  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + Math.max(1, Number(selected.validityDays || 14)) * 86400000).toISOString();
  const bonus = {
    id:`BONUS-${crypto.randomUUID()}`,
    type:selected.type,
    title:selected.title,
    description:selected.description,
    conditions:selected.conditions || '',
    sourceOrderId:order.id,
    expiresAt,
    usedAt:null,
    canceledAt:null,
    createdAt
  };
  await env.DB.prepare(`INSERT INTO user_bonuses
    (id, owner_token_hash, source_order_id, type, title, description, conditions,
     expires_at, used_at, used_order_id, canceled_at, created_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, '', NULL, ?)`)
    .bind(bonus.id, owner, order.id, bonus.type, bonus.title, bonus.description,
      bonus.conditions, bonus.expiresAt, bonus.createdAt).run();
  return bonus;
}

function bonusDiscountValue(type, subtotal) {
  if (type === 'discount_5') return Math.round(subtotal * 0.05);
  if (type === 'free_sauce' || type === 'free_cheese') return Math.min(35, subtotal);
  if (type === 'free_drink') return Math.min(90, subtotal);
  return 0;
}

async function applyBonusToOrder(env, owner, order) {
  const bonusId = String(order.bonusId || '');
  if (!bonusId) return { ...order, appliedBonus:null, bonusDiscount:0 };
  if (!env.DB || !owner) throw new ValidationError('Войдите в профиль, чтобы применить бонус.');
  await ensureDatabase(env);
  const now = new Date().toISOString();
  const bonus = await env.DB.prepare(`SELECT ub.id, ub.type, ub.title, ub.description, ub.conditions,
    ub.source_order_id AS sourceOrderId, ub.expires_at AS expiresAt, ub.used_at AS usedAt,
    ub.reserved_order_id AS reservedOrderId, ub.canceled_at AS canceledAt, ub.created_at AS createdAt,
    bd.min_order_total AS minOrderTotal
    FROM user_bonuses ub JOIN bonus_definitions bd ON bd.type = ub.type
    WHERE ub.id = ? AND ub.owner_token_hash = ?`).bind(bonusId, owner).first();
  if (!bonus || bonus.usedAt || bonus.canceledAt || bonus.expiresAt <= now ||
      (bonus.reservedOrderId && bonus.reservedOrderId !== order.id)) {
    throw new ValidationError('Этот бонус больше недоступен.');
  }
  if (Number(order.subtotal || 0) < Number(bonus.minOrderTotal || 0)) {
    throw new ValidationError(`Для этого бонуса сумма заказа должна быть от ${formatPrice(bonus.minOrderTotal)}.`);
  }
  if (bonus.type === 'discount_5' && Number(order.discount || 0) > 0) {
    throw new ValidationError('Скидка 5% не суммируется с промокодом.');
  }
  const bonusDiscount = bonusDiscountValue(bonus.type,Number(order.subtotal || 0));
  return {
    ...order,
    appliedBonus:bonusFromRow(bonus),
    bonusDiscount,
    discount:Number(order.discount || 0) + bonusDiscount,
    total:Math.max(0,Number(order.subtotal || 0) - Number(order.discount || 0) - bonusDiscount)
  };
}

async function cancelOrderBonuses(env, orderId) {
  if (!env.DB) return;
  const now = new Date().toISOString();
  await env.DB.batch([
    env.DB.prepare(`UPDATE user_bonuses SET canceled_at = ?
      WHERE source_order_id = ? AND used_at IS NULL AND canceled_at IS NULL`).bind(now,orderId),
    env.DB.prepare(`UPDATE user_bonuses SET used_at = NULL, used_order_id = '', reserved_order_id = '', reserved_at = NULL
      WHERE used_order_id = ? AND canceled_at IS NULL`).bind(orderId)
  ]);
}

async function cancelOrderEngagement(env,orderId) {
  if (!env.DB) return;
  await cancelOrderBonuses(env,orderId);
  const ownerRow=await env.DB.prepare('SELECT owner_token_hash AS owner FROM orders WHERE id = ?').bind(orderId).first();
  const dropItems=await env.DB.prepare(`SELECT product_id AS productId, quantity FROM order_items
    WHERE order_id = ? AND product_id LIKE 'drop:%'`).bind(orderId).all();
  if ((dropItems.results || []).length) {
    await env.DB.batch((dropItems.results || []).map(item=>env.DB.prepare(`UPDATE drops
      SET sold_count = MAX(0, sold_count - ?), updated_at = ? WHERE id = ?`)
      .bind(Number(item.quantity || 0),new Date().toISOString(),String(item.productId).slice('drop:'.length))));
  }
  if (ownerRow?.owner) await recalculateTasteProfile(env,ownerRow.owner);
}

async function awardPointsForCompletedOrder(env,orderId) {
  if (!env.DB) return 0;
  const row=await env.DB.prepare(`SELECT o.customer_id AS customerId, o.total, o.applied_bonus_id AS bonusId,
    o.points_awarded AS pointsAwarded, ub.type AS bonusType
    FROM orders o LEFT JOIN user_bonuses ub ON ub.id = o.applied_bonus_id WHERE o.id = ?`).bind(orderId).first();
  if (!row?.customerId || Number(row.pointsAwarded)) return 0;
  const base=Math.max(0,Math.floor(Number(row.total || 0)/10));
  const points=row.bonusType==='double_points'?base*2:base;
  await env.DB.batch([
    env.DB.prepare(`UPDATE customers SET bonus_points = bonus_points + ? WHERE id = ?
      AND EXISTS (SELECT 1 FROM orders WHERE id = ? AND points_awarded = 0)`).bind(points,row.customerId,orderId),
    env.DB.prepare('UPDATE orders SET points_earned = ?, points_awarded = 1 WHERE id = ? AND points_awarded = 0').bind(points,orderId)
  ]);
  return points;
}

async function handleBonuses(request, env) {
  if (!env.DB) throw new ServiceUnavailableError('Не удалось загрузить бонусы. Попробуйте позже.');
  const { owner } = await ownerContext(request,env);
  const points=await env.DB.prepare(`SELECT c.bonus_points AS points FROM customers c
    JOIN orders o ON o.customer_id = c.id WHERE o.owner_token_hash = ?
    ORDER BY o.created_at DESC LIMIT 1`).bind(owner).first();
  return json({ ok:true, bonuses:await activeBonuses(env,owner), points:Number(points?.points || 0) });
}

async function handleAdminBonuses(request, env) {
  requireAdmin(request,env);
  await ensureDatabase(env);
  if (request.method === 'GET') {
    const result = await env.DB.prepare(`SELECT type, title, description, conditions, enabled, weight,
      validity_days AS validityDays, min_order_total AS minOrderTotal, updated_at AS updatedAt
      FROM bonus_definitions ORDER BY type`).all();
    return json({ ok:true, bonuses:result.results || [] });
  }
  if (request.method === 'PATCH') {
    const body = await request.json();
    const type = String(body.type || '');
    const current = await env.DB.prepare('SELECT * FROM bonus_definitions WHERE type = ?').bind(type).first();
    if (!current) throw new ValidationError('Бонус не найден.');
    const enabled = body.enabled == null ? Number(current.enabled) : body.enabled ? 1 : 0;
    const weight = Math.max(0,Math.min(10000,Number(body.weight ?? current.weight)));
    const validityDays = Math.max(1,Math.min(365,Number(body.validityDays ?? current.validity_days)));
    const minOrderTotal = Math.max(0,Number(body.minOrderTotal ?? current.min_order_total));
    const title = String(body.title ?? current.title).trim().slice(0,80);
    const description = String(body.description ?? current.description).trim().slice(0,240);
    const conditions = String(body.conditions ?? current.conditions).trim().slice(0,240);
    const updatedAt = new Date().toISOString();
    await env.DB.prepare(`UPDATE bonus_definitions SET title = ?, description = ?, conditions = ?,
      enabled = ?, weight = ?, validity_days = ?, min_order_total = ?, updated_at = ? WHERE type = ?`)
      .bind(title,description,conditions,enabled,weight,validityDays,minOrderTotal,updatedAt,type).run();
    return json({ ok:true, type, enabled:Boolean(enabled), weight, validityDays, minOrderTotal, updatedAt });
  }
  return json({ ok:false, error:'Method not allowed' },405);
}

function dropFromRow(row) {
  if (!row) return null;
  const quantity = Number(row.quantity || 0);
  const soldCount = Number(row.soldCount || 0);
  return {
    id:row.id,
    name:row.name,
    description:row.description,
    composition:parseJson(row.compositionJson,[]),
    imageUrl:row.imageUrl,
    price:Number(row.price || 0),
    startsAt:row.startsAt,
    endsAt:row.endsAt,
    quantity,
    soldCount,
    remaining:quantity > 0 ? Math.max(0,quantity-soldCount) : null,
    available:Boolean(row.enabled) && (quantity <= 0 || soldCount < quantity)
  };
}

async function currentDrop(env) {
  if (!env.DB) return null;
  await ensureDatabase(env);
  const now = new Date().toISOString();
  const row = await env.DB.prepare(`SELECT id, name, description, composition_json AS compositionJson,
    image_url AS imageUrl, price, starts_at AS startsAt, ends_at AS endsAt,
    quantity, sold_count AS soldCount, enabled
    FROM drops WHERE enabled = 1 AND starts_at <= ? AND ends_at > ?
    ORDER BY starts_at DESC LIMIT 1`).bind(now,now).first();
  return dropFromRow(row);
}

async function serverDropPrice(env,item) {
  if (!env.DB) throw new ServiceUnavailableError('Не удалось проверить JELANI DROP. Попробуйте позже.');
  await ensureDatabase(env);
  const id = String(item?.id || '').replace(/^drop:/,'');
  const now = new Date().toISOString();
  const row = await env.DB.prepare(`SELECT id, price, quantity, sold_count AS soldCount
    FROM drops WHERE id = ? AND enabled = 1 AND starts_at <= ? AND ends_at > ?`).bind(id,now,now).first();
  if (!row || (Number(row.quantity || 0) > 0 && Number(row.soldCount || 0) + Number(item.qty || 1) > Number(row.quantity))) {
    throw new ValidationError('Этот JELANI DROP уже закончился или распродан.');
  }
  return Number(row.price || 0);
}

function sanitizeDrop(body,current={}) {
  const id = String(body.id ?? current.id ?? '').trim();
  if (!/^drop-[a-z0-9-]{4,60}$/.test(id)) throw new ValidationError('Некорректный ID DROP.');
  const startsAt = new Date(body.startsAt ?? current.starts_at ?? current.startsAt);
  const endsAt = new Date(body.endsAt ?? current.ends_at ?? current.endsAt);
  if (Number.isNaN(startsAt.getTime()) || Number.isNaN(endsAt.getTime()) || endsAt <= startsAt) {
    throw new ValidationError('Проверьте даты начала и окончания DROP.');
  }
  const imageUrl = String(body.imageUrl ?? current.image_url ?? current.imageUrl ?? '').trim();
  if (!imageUrl.startsWith('/images/') && !/^https:\/\//.test(imageUrl)) throw new ValidationError('Укажите изображение DROP.');
  return {
    id,
    name:String(body.name ?? current.name ?? '').trim().slice(0,100),
    description:String(body.description ?? current.description ?? '').trim().slice(0,500),
    composition:Array.isArray(body.composition) ? body.composition.map(item=>String(item).slice(0,80)).slice(0,20) : parseJson(current.composition_json || current.compositionJson,[]),
    imageUrl,
    price:Math.max(1,Number(body.price ?? current.price ?? 0)),
    startsAt:startsAt.toISOString(),
    endsAt:endsAt.toISOString(),
    quantity:Math.max(0,Number(body.quantity ?? current.quantity ?? 0)),
    enabled:body.enabled == null ? Boolean(Number(current.enabled ?? 1)) : Boolean(body.enabled)
  };
}

async function handleDrop(request,env) {
  if (!env.DB) throw new ServiceUnavailableError('JELANI DROP временно недоступен.');
  return json({ ok:true, drop:await currentDrop(env) });
}

async function handleAdminDrops(request,env,dropId='') {
  requireAdmin(request,env);
  await ensureDatabase(env);
  if (request.method === 'GET' && !dropId) {
    const result = await env.DB.prepare(`SELECT id, name, description, composition_json AS compositionJson,
      image_url AS imageUrl, price, starts_at AS startsAt, ends_at AS endsAt,
      quantity, sold_count AS soldCount, enabled FROM drops ORDER BY starts_at DESC`).all();
    return json({ ok:true, drops:(result.results || []).map(dropFromRow) });
  }
  if (request.method === 'POST' && !dropId) {
    const drop = sanitizeDrop(await request.json());
    const updatedAt = new Date().toISOString();
    await env.DB.prepare(`INSERT INTO drops
      (id, name, description, composition_json, image_url, price, starts_at, ends_at,
       quantity, sold_count, enabled, updated_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, ?, ?)`)
      .bind(drop.id,drop.name,drop.description,JSON.stringify(drop.composition),drop.imageUrl,drop.price,
        drop.startsAt,drop.endsAt,drop.quantity,drop.enabled?1:0,updatedAt).run();
    return json({ ok:true, drop:{...drop,soldCount:0,remaining:drop.quantity || null,available:drop.enabled} });
  }
  if (request.method === 'PATCH' && dropId) {
    const current = await env.DB.prepare('SELECT * FROM drops WHERE id = ?').bind(dropId).first();
    if (!current) throw new ValidationError('DROP не найден.');
    const drop = sanitizeDrop({ ...(await request.json()), id:dropId },current);
    const updatedAt = new Date().toISOString();
    await env.DB.prepare(`UPDATE drops SET name = ?, description = ?, composition_json = ?, image_url = ?,
      price = ?, starts_at = ?, ends_at = ?, quantity = ?, enabled = ?, updated_at = ? WHERE id = ?`)
      .bind(drop.name,drop.description,JSON.stringify(drop.composition),drop.imageUrl,drop.price,
        drop.startsAt,drop.endsAt,drop.quantity,drop.enabled?1:0,updatedAt,drop.id).run();
    return json({ ok:true, drop });
  }
  return json({ ok:false, error:'Method not allowed' },405);
}

function addCount(map,value,amount=1) {
  if (!value) return;
  map.set(String(value), (map.get(String(value)) || 0) + amount);
}

function topCounts(map,limit=3) {
  return [...map.entries()].sort((a,b)=>b[1]-a[1] || a[0].localeCompare(b[0],'ru')).slice(0,limit).map(([value])=>value);
}

function buildTasteProfileFromItems(rows,orderCount=0) {
  const proteins=new Map(), saucesCount=new Map(), extrasCount=new Map(), sizes=new Map(), sides=new Map(), drinksCount=new Map(), traits=new Map();
  let customizable=0, noOnion=0;
  for (const row of rows || []) {
    const qty=Math.max(1,Number(row.quantity || row.qty || 1));
    const id=String(row.productId || row.id || '').toLowerCase();
    const name=String(row.name || '').toLowerCase();
    const options=typeof row.options === 'object' ? row.options : parseJson(row.optionsJson,{});
    const meat=optionValue(options,'meat');
    if (meat) addCount(proteins,meat,qty);
    else if (id.includes('chicken') || name.includes('куриц')) addCount(proteins,'Курица',qty);
    else if (id.includes('beef') || name.includes('говядин')) addCount(proteins,'Говядина',qty);
    optionList(options,'sauces').concat(optionList(options,'shawarmaSauces'),optionList(options,'friesSauce'),optionList(options,'sauce'),optionList(options,'twoSauces')).forEach(value=>addCount(saucesCount,value,qty));
    optionList(options,'extras').forEach(value=>addCount(extrasCount,value,qty));
    const size=optionValue(options,'size'); if(size) addCount(sizes,size,qty);
    const drink=optionValue(options,'drink'); if(drink) addCount(drinksCount,drink,qty);
    if (id==='smoothie') addCount(drinksCount,'Смузи',qty);
    if (id==='milkshake') addCount(drinksCount,'Коктейль',qty);
    if (['soda','juice','tea','coffee'].includes(id)) addCount(drinksCount,{soda:'Газировка',juice:'Сок',tea:'Чай',coffee:'Кофе'}[id],qty);
    if (id.includes('fries')) addCount(sides,'Картофель фри',qty);
    if (id.includes('nuggets')) addCount(sides,'Наггетсы',qty);
    if (id.includes('rings')) addCount(sides,'Луковые кольца',qty);
    const extras=optionList(options,'extras');
    if (extras.includes('Двойное мясо')) addCount(traits,'more_meat',qty);
    if (extras.includes('Сыр') || name.includes('сыр')) addCount(traits,'cheese',qty);
    if (extras.includes('Халапеньо') || [...saucesCount.keys()].some(value=>['Чили','Аджика'].includes(value))) addCount(traits,'spicy',qty);
    const veggies=optionList(options,'veggies');
    if (id.startsWith('custom-')) {
      customizable += qty;
      if (!veggies.some(value=>value.toLowerCase().includes('лук'))) noOnion += qty;
      if (veggies.length >= 4) addCount(traits,'more_vegetables',qty);
    }
    if (optionList(options,'sauces').length + optionList(options,'shawarmaSauces').length >= 3) addCount(traits,'more_sauce',qty);
  }
  if (customizable && noOnion/customizable >= 0.6) addCount(traits,'no_onion',noOnion);
  if (!traits.has('spicy') && orderCount > 0) addCount(traits,'mild',1);
  if (![...traits.keys()].some(value=>['more_meat','more_vegetables','more_sauce'].includes(value))) addCount(traits,'balanced',1);
  return {
    stage:Number(orderCount) >= 3 ? 'formed' : 'emerging',
    orderCount:Number(orderCount || 0),
    proteins:topCounts(proteins,2),
    sauces:topCounts(saucesCount,3),
    extras:topCounts(extrasCount,3),
    sizes:topCounts(sizes,2),
    sides:topCounts(sides,3),
    drinks:topCounts(drinksCount,3),
    traits:topCounts(traits,8)
  };
}

function tasteProfileFromRow(row) {
  if (!row) return null;
  return {
    ...parseJson(row.summaryJson,{}),
    orderCount:Number(row.orderCount || 0),
    overrides:parseJson(row.overridesJson,{}),
    updatedAt:row.updatedAt
  };
}

async function recalculateTasteProfile(env,owner) {
  if (!env.DB || !owner) return null;
  await ensureDatabase(env);
  const countRow = await env.DB.prepare(`SELECT COUNT(*) AS orderCount FROM orders
    WHERE owner_token_hash = ? AND canceled = 0 AND payment_status IN ('succeeded','cash_on_pickup')`).bind(owner).first();
  const rows = await env.DB.prepare(`SELECT oi.product_id AS productId, oi.name, oi.options_json AS optionsJson,
    oi.quantity FROM order_items oi JOIN orders o ON o.id = oi.order_id
    WHERE o.owner_token_hash = ? AND o.canceled = 0 AND o.payment_status IN ('succeeded','cash_on_pickup')
    ORDER BY o.created_at DESC LIMIT 500`).bind(owner).all();
  const summary = buildTasteProfileFromItems(rows.results || [],Number(countRow?.orderCount || 0));
  const current = await env.DB.prepare('SELECT overrides_json AS overridesJson FROM taste_profiles WHERE owner_token_hash = ?').bind(owner).first();
  const overridesJson = current?.overridesJson || '{}';
  const updatedAt = new Date().toISOString();
  await env.DB.prepare(`INSERT INTO taste_profiles
    (owner_token_hash, order_count, summary_json, overrides_json, updated_at)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(owner_token_hash) DO UPDATE SET order_count = excluded.order_count,
      summary_json = excluded.summary_json, updated_at = excluded.updated_at`)
    .bind(owner,summary.orderCount,JSON.stringify(summary),overridesJson,updatedAt).run();
  return { ...summary, overrides:parseJson(overridesJson,{}), updatedAt };
}

const TASTE_TRAITS = new Set(['more_meat','balanced','more_vegetables','more_sauce','spicy','mild','no_onion','cheese']);

async function handleTasteProfile(request,env) {
  if (!env.DB) throw new ServiceUnavailableError('Не удалось загрузить вкусовой профиль.');
  const { owner }=await ownerContext(request,env);
  await ensureDatabase(env);
  if (request.method === 'GET') {
    let row=await env.DB.prepare(`SELECT order_count AS orderCount, summary_json AS summaryJson,
      overrides_json AS overridesJson, updated_at AS updatedAt FROM taste_profiles WHERE owner_token_hash = ?`).bind(owner).first();
    if (!row) return json({ ok:true, profile:await recalculateTasteProfile(env,owner) });
    return json({ ok:true, profile:tasteProfileFromRow(row) });
  }
  if (request.method === 'PATCH') {
    const body=await request.json();
    const overrides={
      traits:Array.isArray(body.traits) ? [...new Set(body.traits.map(String).filter(value=>TASTE_TRAITS.has(value)))].slice(0,8) : [],
      protein:['Курица','Говядина',''].includes(String(body.protein || '')) ? String(body.protein || '') : '',
      size:String(body.size || '').slice(0,40)
    };
    const updatedAt=new Date().toISOString();
    await env.DB.prepare(`INSERT INTO taste_profiles
      (owner_token_hash, order_count, summary_json, overrides_json, updated_at)
      VALUES (?, 0, '{}', ?, ?)
      ON CONFLICT(owner_token_hash) DO UPDATE SET overrides_json = excluded.overrides_json, updated_at = excluded.updated_at`)
      .bind(owner,JSON.stringify(overrides),updatedAt).run();
    return json({ ok:true, overrides, updatedAt });
  }
  if (request.method === 'DELETE') {
    await env.DB.prepare('DELETE FROM taste_profiles WHERE owner_token_hash = ?').bind(owner).run();
    return json({ ok:true });
  }
  return json({ ok:false, error:'Method not allowed' },405);
}

async function priceOrder(env, order) {
  const items = await Promise.all(order.items.map(async item => ({
    ...item,
    price:String(item?.id || '').startsWith('drop:') ? await serverDropPrice(env,item) : serverItemPrice(item)
  })));
  const subtotal = items.reduce((sum, item) => sum + item.price * Number(item.qty || 1), 0);
  let discount = 0;
  const promo = String(order.promo || '').trim().toUpperCase();

  if (promo) {
    if (promo !== 'JELANI10') throw new ValidationError('Такой промокод не найден');
    if (!env.DB) throw new ServiceUnavailableError('Не удалось проверить промокод. Попробуйте позже.');
    await ensureDatabase(env);
    const customer = await env.DB.prepare('SELECT order_count AS orderCount FROM customers WHERE phone = ?')
      .bind(normalizeRussianPhone(order.phone)).first();
    if (Number(customer?.orderCount || 0) > 0) {
      throw new ValidationError('JELANI10 действует только на первый заказ');
    }
    discount = Math.round(subtotal * 0.1);
  }

  return { ...order, items, subtotal, discount, total: subtotal - discount, promo };
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
      status: 'Отменён',
      detail: 'Заказ отменён.',
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
  const payload = {
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
    total: record.total || 0,
    paymentStatus:record.paymentStatus || '',
    paymentMethod:record.paymentMethod || '',
    refundedAmount:Number(record.refundedAmount || 0),
    refundStatus:record.refundStatus || ''
  };
  return payload;
}

function paymentMethodLabel(method) {
  return method === 'sbp' ? 'СБП'
    : method === 'bank_card' ? 'Банковская карта'
      : method === 'cash' ? 'Наличными при получении'
        : '';
}

function yookassaConfigured(env) {
  return Boolean(env.YOOKASSA_SHOP_ID && env.YOOKASSA_SECRET_KEY);
}

function yookassaMethods(env) {
  const configured = new Set(String(env.YOOKASSA_PAYMENT_METHODS || 'bank_card,sbp')
    .split(/[\s,;]+/).map(value=>value.trim()).filter(Boolean));
  return ['bank_card','sbp'].filter(method=>configured.has(method));
}

function moneyKopecks(value) {
  const match = String(value ?? '').trim().match(/^(\d+)(?:\.(\d{1,2}))?$/);
  if (!match) return NaN;
  return Number(match[1]) * 100 + Number((match[2] || '').padEnd(2,'0'));
}

function paymentAmountValue(rubles) {
  return `${Math.max(0,Math.round(Number(rubles || 0)))}.00`;
}

function receiptSubject(env) {
  const value = String(env.YOOKASSA_PAYMENT_SUBJECT || 'commodity');
  return ['commodity','service'].includes(value) ? value : 'commodity';
}

function yookassaReceiptItems(order, env) {
  const vatCode = Number(env.YOOKASSA_VAT_CODE);
  if (!Number.isInteger(vatCode) || vatCode < 1 || vatCode > 12) {
    throw new ServiceUnavailableError('Онлайн-касса пока настраивается.');
  }
  const rows = order.items.map(item=>({
    name:String(item.name || 'Позиция').trim().slice(0,100),
    quantity:Math.max(1,Number(item.qty || 1)),
    subtotal:Math.max(0,Number(item.price || 0) * Math.max(1,Number(item.qty || 1)))
  }));
  const sourceTotal = rows.reduce((sum,row)=>sum+row.subtotal,0);
  let remaining = Number(order.total || 0);
  const result = [];
  rows.forEach((row,index)=>{
    const target = index === rows.length - 1
      ? remaining
      : Math.max(0,Math.floor(Number(order.total || 0) * row.subtotal / Math.max(1,sourceTotal)));
    remaining -= target;
    const base = Math.floor(target / row.quantity);
    const expensiveUnits = target - base * row.quantity;
    const groups = [
      { quantity:row.quantity-expensiveUnits, amount:base },
      { quantity:expensiveUnits, amount:base+1 }
    ].filter(group=>group.quantity > 0 && group.amount > 0);
    groups.forEach(group=>result.push({
      description:`${row.name}${row.quantity > 1 ? ` (${row.quantity} шт.)` : ''}`.slice(0,128),
      quantity:group.quantity,
      amount:{ value:paymentAmountValue(group.amount),currency:'RUB' },
      vat_code:vatCode,
      payment_mode:'full_prepayment',
      payment_subject:receiptSubject(env),
      measure:'piece'
    }));
  });
  if (!result.length || result.length > 80) throw new ValidationError('Не удалось подготовить чек для этого заказа.');
  return result;
}

function yookassaPaymentPayload(order, returnUrl, env = {}) {
  const method = String(order.paymentCode || order.payment || '');
  if (!['bank_card','sbp'].includes(method)) throw new ValidationError('Выберите оплату картой или через СБП.');
  const payload = {
    amount:{ value:paymentAmountValue(order.total),currency:'RUB' },
    capture:true,
    payment_method_data:{ type:method },
    confirmation:{ type:'redirect',return_url:returnUrl },
    description:`Заказ JELANI ${order.id}`.slice(0,128),
    metadata:{ order_id:order.id }
  };
  if (env.YOOKASSA_RECEIPTS === 'true') {
    const email = String(order.email || '').trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new ValidationError('Укажите email для электронного чека.');
    payload.receipt = { customer:{ email },items:yookassaReceiptItems(order,env) };
  }
  return payload;
}

async function yookassaRequest(env, path, options = {}) {
  if (!yookassaConfigured(env)) throw new ServiceUnavailableError('Онлайн-оплата пока настраивается.');
  const authorization = `Basic ${btoa(`${env.YOOKASSA_SHOP_ID}:${env.YOOKASSA_SECRET_KEY}`)}`;
  const headers = { authorization,accept:'application/json' };
  if (options.body) headers['content-type'] = 'application/json';
  if (options.idempotenceKey) headers['Idempotence-Key'] = String(options.idempotenceKey).slice(0,64);
  const response = await fetch(`https://api.yookassa.ru/v3${path}`,{
    method:options.method || 'GET',
    headers,
    ...(options.body ? { body:JSON.stringify(options.body) } : {})
  });
  const data = await response.json().catch(()=>null);
  if (!response.ok || !data) {
    console.error('YooKassa request failed',response.status,data?.code || data?.type || 'invalid_response');
    throw new ServiceUnavailableError('Платёжный сервис временно недоступен. Попробуйте ещё раз.');
  }
  return data;
}

function verifyYookassaPayment(order, payment) {
  if (!order || !payment || String(payment.id || '') !== String(order.providerPaymentId || order.provider_payment_id || '')) {
    throw new ValidationError('Не удалось сверить платёж.');
  }
  const expectedOrderId = String(order.id || '');
  if (String(payment.metadata?.order_id || '') !== expectedOrderId) throw new ValidationError('Платёж относится к другому заказу.');
  if (payment.amount?.currency !== 'RUB' || moneyKopecks(payment.amount?.value) !== Number(order.total || 0) * 100) {
    throw new ValidationError('Сумма платежа не совпадает с заказом.');
  }
  return true;
}

function orderKey(orderId) {
  return `order:${orderId}`;
}

async function ensureDatabase(env) {
  if (!env.DB) return false;
  let ready = databaseSchemaReady.get(env.DB);
  if (!ready) {
    ready = (async () => {
      const deferredSchema = [];
      for (const statement of DATABASE_SCHEMA) {
        try {
          await env.DB.prepare(statement).run();
        } catch (error) {
          const message = String(error?.message || '').toLowerCase();
          if (message.includes('no such column')) deferredSchema.push(statement);
          else throw error;
        }
      }
      for (const statement of DATABASE_MIGRATIONS) {
        try {
          await env.DB.prepare(statement).run();
        } catch (error) {
          if (!String(error?.message || '').toLowerCase().includes('duplicate column')) throw error;
        }
      }
      for (const statement of deferredSchema) await env.DB.prepare(statement).run();
      const seededAt = new Date().toISOString();
      await env.DB.batch(DATABASE_SEEDS.map(definition => env.DB.prepare(`INSERT OR IGNORE INTO bonus_definitions
        (type, title, description, conditions, enabled, weight, validity_days, min_order_total, updated_at)
        VALUES (?, ?, ?, ?, 1, ?, ?, ?, ?)`).bind(...definition, seededAt)));
      await env.DB.prepare(`INSERT OR IGNORE INTO drops
        (id, name, description, composition_json, image_url, price, starts_at, ends_at,
         quantity, sold_count, enabled, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 1, ?)`)
        .bind(DROP_SEED.id, DROP_SEED.name, DROP_SEED.description, JSON.stringify(DROP_SEED.composition),
          DROP_SEED.imageUrl, DROP_SEED.price, DROP_SEED.startsAt, DROP_SEED.endsAt,
          DROP_SEED.quantity, seededAt).run();
    })().catch(error => {
      databaseSchemaReady.delete(env.DB);
      throw error;
    });
    databaseSchemaReady.set(env.DB,ready);
  }
  await ready;
  return true;
}

function databaseStatusRecord(row, messages = []) {
  if (!row) return null;
  return {
    id: row.id,
    flow: row.flow,
    trackToken: row.trackToken,
    statusIndex: Number(row.statusIndex),
    status: row.status,
    detail: row.detail,
    canceled: Boolean(row.canceled),
    terminal: Boolean(row.terminal),
    total: Number(row.total || 0),
    paymentStatus:row.paymentStatus || '',
    paymentMethod:row.paymentMethod || '',
    refundedAmount:Number(row.refundedAmount || 0),
    refundStatus:row.refundStatus || '',
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    messages,
    storage: 'd1'
  };
}

async function readOrderStatus(env, orderId) {
  if (env.DB) {
    await ensureDatabase(env);
    const row = await env.DB.prepare(`SELECT
      id,
      flow,
      tracking_token AS trackToken,
      status_index AS statusIndex,
      status,
      status_detail AS detail,
      canceled,
      terminal,
      total,
      payment_status AS paymentStatus,
      payment_method AS paymentMethod,
      refunded_amount AS refundedAmount,
      refund_status AS refundStatus,
      created_at AS createdAt,
      updated_at AS updatedAt
      FROM orders WHERE id = ?`).bind(orderId).first();
    if (row) {
      const { results = [] } = await env.DB.prepare(`SELECT
        chat_id AS chatId,
        message_id AS messageId
        FROM order_messages WHERE order_id = ?`).bind(orderId).all();
      return databaseStatusRecord(row, results);
    }
  }

  if (!env.ORDER_STATUS) return null;
  const raw = await env.ORDER_STATUS.get(orderKey(orderId));
  if (!raw) return null;
  try {
    return { ...JSON.parse(raw), storage: 'kv' };
  } catch {
    return null;
  }
}

async function saveOrderStatus(env, record) {
  if (env.DB && record.storage !== 'kv') {
    await ensureDatabase(env);
    const statements = [
      env.DB.prepare(`UPDATE orders SET
        status_index = ?, status = ?, status_detail = ?, canceled = ?, terminal = ?, updated_at = ?
        WHERE id = ?`).bind(
        Number(record.statusIndex), record.status, record.detail,
        record.canceled ? 1 : 0, record.terminal ? 1 : 0, record.updatedAt, record.id
      ),
      env.DB.prepare(`INSERT INTO order_status_events
        (order_id, status_index, status, detail, created_at)
        VALUES (?, ?, ?, ?, ?)`).bind(
        record.id, Number(record.statusIndex), record.status, record.detail, record.updatedAt
      )
    ];
    for (const message of record.messages || []) {
      statements.push(env.DB.prepare(`INSERT OR IGNORE INTO order_messages
        (order_id, chat_id, message_id) VALUES (?, ?, ?)`).bind(
        record.id, String(message.chatId), Number(message.messageId)
      ));
    }
    await env.DB.batch(statements);
    return true;
  }

  if (!env.ORDER_STATUS) return false;
  await env.ORDER_STATUS.put(orderKey(record.id), JSON.stringify(record), {
    expirationTtl: ORDER_TTL_SECONDS
  });
  return true;
}

async function createDatabaseOrder(env, order, record) {
  if (!env.DB) return false;
  await ensureDatabase(env);

  const phone = normalizeRussianPhone(order.phone);
  const statements = [];
  if (order.appliedBonus?.id) {
    statements.push(env.DB.prepare(`UPDATE user_bonuses SET reserved_order_id = ?, reserved_at = ?
      WHERE id = ? AND owner_token_hash = ? AND used_at IS NULL AND canceled_at IS NULL
        AND reserved_order_id = '' AND expires_at > ?`)
      .bind(order.id,record.createdAt,order.appliedBonus.id,String(order.ownerHash || ''),record.createdAt));
  }
  statements.push(
    env.DB.prepare(`INSERT INTO customers
      (phone, name, first_seen_at, last_seen_at, order_count, total_spent)
      VALUES (?, ?, ?, ?, 0, 0)
      ON CONFLICT(phone) DO UPDATE SET
        name = excluded.name,
        last_seen_at = excluded.last_seen_at`).bind(
      phone, String(order.name).trim(), record.createdAt, record.createdAt
    ),
    env.DB.prepare(`INSERT INTO orders
      (id, tracking_token, owner_token_hash, account_user_id, customer_id, customer_name, phone, flow, delivery_method,
       address, customer_email, payment_method, payment_provider, payment_status, provider_payment_id,
       payment_confirmation_url, payment_idempotence_key, payment_expires_at, payment_confirmed_at,
       payment_error, fulfillment_applied_at, kitchen_sent_at, inventory_reserved_at,
       inventory_released_at, inventory_committed_at, refunded_amount, refund_status,
       comment, promo_code, subtotal, discount, applied_bonus_id, bonus_discount, total,
       status_index, status, status_detail, canceled, terminal, created_at, updated_at)
      VALUES (?, ?, ?, ?, (SELECT id FROM customers WHERE phone = ?), ?, ?, ?, ?, ?, ?, ?, ?, ?, '', '', ?, '', '',
        '', '', '', ?, '', '', 0, '', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
      order.id, record.trackToken, String(order.ownerHash || ''), String(order.userId || ''), phone, String(order.name).trim(), phone,
      record.flow, flowDelivery(record.flow), String(order.address || ''), String(order.email || ''),
      paymentMethodLabel(order.paymentCode), order.paymentCode === 'cash' ? 'cash' : 'yookassa', 'pending', String(order.paymentIdempotenceKey || ''), record.createdAt,
      String(order.comment || ''), String(order.promo || ''), Number(order.subtotal || 0),
      Number(order.discount || 0), String(order.appliedBonus?.id || ''), Number(order.bonusDiscount || 0),
      Number(order.total || 0), Number(record.statusIndex),
      record.status, record.detail, record.canceled ? 1 : 0, record.terminal ? 1 : 0,
      record.createdAt, record.updatedAt
    ),
    env.DB.prepare(`INSERT INTO order_status_events
      (order_id, status_index, status, detail, created_at)
      VALUES (?, ?, ?, ?, ?)`).bind(
      record.id, Number(record.statusIndex), record.status, record.detail, record.createdAt
    )
  );

  for (const item of order.items) {
    const quantity = Math.max(1, Number(item.qty || 1));
    const unitPrice = Math.max(0, Number(item.price || 0));
    statements.push(env.DB.prepare(`INSERT INTO order_items
      (order_id, product_id, name, details, options_json, unit_price, quantity, line_total)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`).bind(
      record.id, String(item.id || ''), String(item.name || ''), String(item.details || ''),
      JSON.stringify(item.options || {}), unitPrice, quantity, unitPrice * quantity
    ));
    if (String(item.id || '').startsWith('drop:')) {
      statements.push(env.DB.prepare('UPDATE drops SET sold_count = sold_count + ?, updated_at = ? WHERE id = ?')
        .bind(quantity,record.createdAt,String(item.id).slice('drop:'.length)));
    }
  }

  if (order.appliedBonus?.id) {
    // The bonus remains reserved until YooKassa confirms the payment.
  }

  await env.DB.batch(statements);
  if (order.appliedBonus?.id) {
    const reservation = await env.DB.prepare('SELECT reserved_order_id AS orderId FROM user_bonuses WHERE id = ?')
      .bind(order.appliedBonus.id).first();
    if (reservation?.orderId !== order.id) {
      const dropItems = order.items.filter(item=>String(item.id || '').startsWith('drop:'));
      const cleanup = dropItems.map(item=>env.DB.prepare(`UPDATE drops SET sold_count = MAX(0,sold_count - ?), updated_at = ? WHERE id = ?`)
        .bind(Number(item.qty || 1),record.createdAt,String(item.id).slice('drop:'.length)));
      cleanup.push(env.DB.prepare('DELETE FROM orders WHERE id = ?').bind(order.id));
      await env.DB.batch(cleanup);
      throw new ValidationError('Этот бонус уже используется в другом заказе.');
    }
  }
  return true;
}

async function saveMessageRefs(env, record) {
  for (const message of record.messages || []) {
    await saveMessageRef(env, record, message);
  }
}

async function saveMessageRef(env, record, message) {
  if (env.DB) {
    await ensureDatabase(env);
    await env.DB.prepare(`INSERT OR IGNORE INTO order_messages
      (order_id, chat_id, message_id) VALUES (?, ?, ?)`).bind(
      record.id, String(message.chatId), Number(message.messageId)
    ).run();
    return;
  }

  if (env.ORDER_STATUS) {
    await env.ORDER_STATUS.put(orderKey(record.id), JSON.stringify(record), {
      expirationTtl: ORDER_TTL_SECONDS
    });
  }
}

function validateOrder(order) {
  if (!order || typeof order !== 'object') throw new ValidationError('Некорректный заказ');
  if (!/^JL-\d{7}(?:-\d{4})?$/.test(String(order.id || ''))) throw new ValidationError('Некорректный номер заказа');
  if (!/^[a-f0-9]{32}$/.test(String(order.trackingToken || ''))) throw new ValidationError('Некорректный код отслеживания');
  if (!String(order.name || '').trim() || String(order.name).length > 80) throw new ValidationError('Нужно указать имя');
  if (!validateRussianPhone(order.phone)) throw new ValidationError('Укажите российский мобильный номер в формате +7 9XX XXX-XX-XX');
  if (!Array.isArray(order.items) || order.items.length === 0 || order.items.length > 60) throw new ValidationError('Корзина пустая или слишком большая');
  if (!['Самовывоз', 'Доставка'].includes(order.delivery)) throw new ValidationError('Некорректный способ получения');
  if (!['bank_card','sbp','cash'].includes(String(order.payment || ''))) throw new ValidationError('Выберите способ оплаты.');
  if (order.payment === 'cash' && order.delivery !== 'Самовывоз') {
    throw new ValidationError('Оплата наличными доступна только при самовывозе.');
  }
  if (String(order.email || '').length > 160 || (order.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(order.email)))) {
    throw new ValidationError('Проверьте email для электронного чека.');
  }
  if (order.delivery === 'Доставка' && !String(order.address || '').trim()) throw new ValidationError('Нужен адрес доставки');
  if (String(order.address || '').length > 300 || String(order.comment || '').length > 500) throw new ValidationError('Слишком длинный адрес или комментарий');
  for (const item of order.items) {
    const quantity = Number(item?.qty || 1);
    if (!item?.id || !item?.name || String(item.name).length > 160 || String(item.details || '').length > 1000 ||
        !Number.isInteger(quantity) || quantity < 1 || quantity > 30) {
      throw new ValidationError('В заказе есть некорректная позиция');
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
    `<b>Дата и время:</b> ${escapeHtml(formatOrderDate(order.createdAt))}`,
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

function telegramOperatorIds(env) {
  return [...new Set(String(env.TELEGRAM_OPERATOR_IDS || '')
    .split(/[,\s;]+/)
    .map(value => value.trim())
    .filter(Boolean))];
}

function telegramOperatorAllowed(env, query) {
  const allowed = telegramOperatorIds(env);
  return allowed.length > 0 && allowed.includes(String(query?.from?.id || ''));
}

async function sendOrderMessages(env, order, record) {
  const chatIds = telegramChatIds(env);
  if (!chatIds.length) throw new Error('TELEGRAM_CHAT_ID не задан');

  const messages = Array.isArray(record.messages) ? [...record.messages] : [];
  const sentChats = new Set(messages.map(message => String(message.chatId)));
  for (const chatId of chatIds) {
    if (sentChats.has(String(chatId))) continue;
    const result = await telegram(env, 'sendMessage', {
      chat_id: chatId,
      text: orderMessage(order),
      parse_mode: 'HTML',
      reply_markup: statusKeyboard(order)
    });
    const message = { chatId: String(chatId), messageId: result.message_id };
    messages.push(message);
    record.messages = messages;
    record.messageId ||= result.message_id;
    await saveMessageRef(env, record, message);
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
      allowed_updates: ['callback_query'],
      secret_token: await telegramWebhookSecret(env)
    });
  } catch {
    // Заказ не должен падать, если Telegram временно не дал обновить webhook.
  }
}

async function telegramWebhookSecret(env) {
  if (!env.TELEGRAM_BOT_TOKEN) return '';
  const bytes = new TextEncoder().encode(env.TELEGRAM_BOT_TOKEN);
  const digest = await crypto.subtle.digest('SHA-256', bytes);
  return [...new Uint8Array(digest)].map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function createOrderRecord(order, messages) {
  const flow = orderFlow(order.delivery);
  const now = new Date().toISOString();
  const status = {
    statusIndex:0,
    status:'Ожидает оплаты',
    detail:'Завершите оплату, после этого заказ сразу поступит на кухню.',
    canceled:false,
    terminal:false
  };

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
  const rawOrder = await request.json();
  validateOrder(rawOrder);
  const cashOrder = rawOrder.payment === 'cash';
  if (!env.DB) {
    throw new ServiceUnavailableError('Приём заказов временно недоступен. Попробуйте позже.');
  }
  if (!cashOrder && (!yookassaConfigured(env) || !yookassaMethods(env).length)) {
    throw new ServiceUnavailableError('Онлайн-оплата пока настраивается.');
  }
  if (!env.TELEGRAM_BOT_TOKEN || !telegramChatIds(env).length) {
    throw new ServiceUnavailableError('Приём заказов временно недоступен. Попробуйте позже.');
  }
  await ensureDatabase(env);
  const existing = await env.DB.prepare(`SELECT tracking_token AS trackToken, provider_payment_id AS providerPaymentId,
    payment_status AS paymentStatus
    FROM orders WHERE id = ?`).bind(rawOrder.id).first();
  if (existing?.trackToken && existing.trackToken !== rawOrder.trackingToken) {
    throw new ValidationError('Заказ с таким номером уже существует.');
  }
  if (existing?.paymentStatus === 'canceled') {
    throw new ValidationError('Время оплаты истекло. Оформите заказ заново.');
  }

  let order;
  let duplicate = Boolean(existing);
  if (existing) {
    order = await databasePaymentOrder(env,rawOrder.id);
  } else {
    const orderOwner = await ownerContext(request,env,true);
    order = await priceOrder(env,rawOrder);
    order.ownerHash = orderOwner.owner;
    order.userId = orderOwner.userId;
    order.paymentCode = String(rawOrder.payment || '');
    order.email = String(rawOrder.email || '').trim().toLowerCase();
    order.paymentIdempotenceKey = `${order.paymentCode === 'cash' ? 'cash' : 'pay'}-${order.id}-${order.paymentCode}`;
    order = await applyBonusToOrder(env,order.ownerHash,order);
    const record = createOrderRecord(order,[]);
    order.createdAt = record.createdAt;
    await createDatabaseOrder(env,order,record);
  }

  if (order.paymentCode === 'cash') {
    if (order.delivery !== 'Самовывоз') throw new ValidationError('Оплата наличными доступна только при самовывозе.');
    order = await databasePaymentOrder(env,order.id);
    const result = await finalizeCashOrder(request,env,order);
    return json({ ...result,duplicate });
  }
  if (!yookassaMethods(env).includes(order.paymentCode)) throw new ValidationError('Этот способ оплаты сейчас недоступен.');
  let payment;
  if (order.providerPaymentId) {
    payment = await yookassaRequest(env,`/payments/${encodeURIComponent(order.providerPaymentId)}`);
  } else {
    const returnUrl = new URL('/',request.url);
    returnUrl.searchParams.set('payment','return');
    returnUrl.searchParams.set('order',order.id);
    returnUrl.searchParams.set('track',order.trackingToken);
    returnUrl.hash = 'order';
    const payload = yookassaPaymentPayload(order,returnUrl.toString(),env);
    const creationStartedAt = new Date().toISOString();
    await env.DB.prepare(`UPDATE orders SET payment_status = 'creating',updated_at = ?
      WHERE id = ? AND provider_payment_id = '' AND payment_status <> 'canceled'`)
      .bind(creationStartedAt,order.id).run();
    const creationState = await env.DB.prepare('SELECT payment_status AS paymentStatus FROM orders WHERE id = ?')
      .bind(order.id).first();
    if (creationState?.paymentStatus === 'canceled') {
      throw new ValidationError('Время оплаты истекло. Оформите заказ заново.');
    }
    try {
      payment = await yookassaRequest(env,'/payments',{
        method:'POST',
        idempotenceKey:order.paymentIdempotenceKey,
        body:payload
      });
      await env.DB.prepare(`UPDATE orders SET provider_payment_id = ?, payment_confirmation_url = ?,
        payment_expires_at = ?, payment_status = ?, payment_error = '', updated_at = ?
        WHERE id = ? AND payment_status <> 'canceled'`)
        .bind(String(payment.id || ''),String(payment.confirmation?.confirmation_url || ''),String(payment.expires_at || ''),
          String(payment.status || 'pending'),new Date().toISOString(),order.id).run();
      order.providerPaymentId = String(payment.id || '');
      order.paymentConfirmationUrl = String(payment.confirmation?.confirmation_url || '');
    } catch (error) {
      await env.DB.prepare(`UPDATE orders SET payment_status = 'pending',payment_error = ?,updated_at = ?
        WHERE id = ? AND provider_payment_id = '' AND payment_status <> 'canceled'`)
        .bind('provider_unavailable',new Date().toISOString(),order.id).run();
      throw error;
    }
  }
  const result = await processYookassaPayment(request,env,order,payment);
  return json({ ...result,duplicate });
}

async function databasePaymentOrder(env, orderId) {
  const row = await env.DB.prepare(`SELECT o.id, o.tracking_token AS trackingToken,
    o.owner_token_hash AS ownerHash, o.account_user_id AS userId, o.customer_id AS customerId,
    o.customer_name AS name, o.phone, o.customer_email AS email, o.flow,
    o.delivery_method AS delivery, o.address, o.payment_method AS paymentMethod,
    o.payment_provider AS paymentProvider,
    o.payment_status AS paymentStatus, o.provider_payment_id AS providerPaymentId,
    o.payment_confirmation_url AS paymentConfirmationUrl, o.payment_idempotence_key AS paymentIdempotenceKey,
    o.payment_confirmed_at AS paymentConfirmedAt, o.fulfillment_applied_at AS fulfillmentAppliedAt,
    o.kitchen_sent_at AS kitchenSentAt, o.inventory_reserved_at AS inventoryReservedAt,
    o.inventory_released_at AS inventoryReleasedAt, o.inventory_committed_at AS inventoryCommittedAt,
    o.refunded_amount AS refundedAmount, o.refund_status AS refundStatus,
    o.comment, o.promo_code AS promo, o.subtotal, o.discount,
    o.applied_bonus_id AS appliedBonusId, o.bonus_discount AS bonusDiscount, o.total,
    o.created_at AS createdAt, o.updated_at AS updatedAt
    FROM orders o WHERE o.id = ?`).bind(orderId).first();
  if (!row) return null;
  const items = await env.DB.prepare(`SELECT product_id AS id, name, details, options_json AS optionsJson,
    unit_price AS price, quantity AS qty FROM order_items WHERE order_id = ? ORDER BY id`).bind(orderId).all();
  const paymentCode = row.paymentMethod === 'СБП' ? 'sbp'
    : row.paymentMethod === 'Наличными при получении' ? 'cash'
      : 'bank_card';
  return {
    ...row,
    paymentCode,
    payment:row.paymentMethod,
    appliedBonus:row.appliedBonusId ? { id:row.appliedBonusId } : null,
    items:(items.results || []).map(item=>({ ...item,options:parseJson(item.optionsJson,{}) }))
  };
}

async function paymentResultPayload(env, order, record, extra = {}) {
  const accepted = ['succeeded','cash_on_pickup'].includes(record.paymentStatus);
  const awardedBonus = accepted
    ? await awardBonusForOrder(env,order.ownerHash,order)
    : null;
  return {
    ok:true,
    tracking:accepted,
    storage:'d1',
    payment:{
      provider:order.paymentProvider || (order.paymentCode === 'cash' ? 'cash' : 'yookassa'),
      status:record.paymentStatus || 'pending',
      method:order.paymentCode,
      confirmationUrl:order.paymentConfirmationUrl || '',
      refundedAmount:Number(record.refundedAmount || 0),
      refundStatus:record.refundStatus || ''
    },
    awardedBonus,
    activeBonuses:await activeBonuses(env,order.ownerHash),
    status:statusPayload(record),
    order:{
      items:order.items,
      subtotal:Number(order.subtotal || 0),
      discount:Number(order.discount || 0),
      bonusDiscount:Number(order.bonusDiscount || 0),
      total:Number(order.total || 0)
    },
    ...extra
  };
}

async function finalizeOrderForKitchen(request, env, order, paymentStatus, paidAt, detail) {
  const claim = `FUL-${crypto.randomUUID()}`;
  const statements = [
    env.DB.prepare(`UPDATE orders SET payment_status = CASE WHEN refunded_amount >= total AND total > 0 THEN 'refunded' ELSE ? END,
      payment_confirmed_at = CASE WHEN ? = 'succeeded' THEN ? ELSE payment_confirmed_at END, payment_error = '',
      status_index = 0, status = 'Новый', status_detail = ?, canceled = 0, terminal = 0,
      fulfillment_applied_at = CASE WHEN fulfillment_applied_at = '' THEN ? ELSE fulfillment_applied_at END,
      inventory_committed_at = CASE WHEN inventory_committed_at = '' THEN ? ELSE inventory_committed_at END,
      updated_at = ? WHERE id = ?`).bind(paymentStatus,paymentStatus,paidAt,detail,claim,paidAt,paidAt,order.id),
    env.DB.prepare(`UPDATE customers SET order_count = order_count + 1, total_spent = total_spent + ?
      WHERE id = ? AND EXISTS (SELECT 1 FROM orders WHERE id = ? AND fulfillment_applied_at = ?)`)
      .bind(Number(order.total || 0),order.customerId,order.id,claim),
    env.DB.prepare(`INSERT INTO order_status_events (order_id,status_index,status,detail,created_at)
      SELECT ?,0,'Новый',?,? WHERE EXISTS
      (SELECT 1 FROM orders WHERE id = ? AND fulfillment_applied_at = ?)`)
      .bind(order.id,detail,paidAt,order.id,claim)
  ];
  if (order.appliedBonusId) {
    statements.push(env.DB.prepare(`UPDATE user_bonuses SET used_at = ?, used_order_id = ?,
      reserved_order_id = '', reserved_at = NULL WHERE id = ? AND reserved_order_id = ?
      AND EXISTS (SELECT 1 FROM orders WHERE id = ? AND fulfillment_applied_at = ?)`)
      .bind(paidAt,order.id,order.appliedBonusId,order.id,order.id,claim));
  }
  await env.DB.batch(statements);
  const claimed = await env.DB.prepare('SELECT fulfillment_applied_at AS marker FROM orders WHERE id = ?').bind(order.id).first();
  if (claimed?.marker === claim && order.ownerHash) await recalculateTasteProfile(env,order.ownerHash);

  order = await databasePaymentOrder(env,order.id);
  let record = await readOrderStatus(env,order.id);
  if (!order.kitchenSentAt || String(order.kitchenSentAt).startsWith('sending:')) {
    const sendClaim = `sending:${Date.now()}:${crypto.randomUUID()}`;
    const staleBefore = Date.now() - 120000;
    await env.DB.prepare(`UPDATE orders SET kitchen_sent_at = ? WHERE id = ? AND
      (kitchen_sent_at = '' OR (kitchen_sent_at LIKE 'sending:%' AND CAST(substr(kitchen_sent_at,9,13) AS INTEGER) < ?))`)
      .bind(sendClaim,order.id,staleBefore).run();
    const claimedSend = await env.DB.prepare('SELECT kitchen_sent_at AS marker FROM orders WHERE id = ?').bind(order.id).first();
    if (claimedSend?.marker === sendClaim) {
      try {
        await ensureTelegramWebhook(request,env);
        const messages = await sendOrderMessages(env,order,record);
        record.messages = messages;
        await saveMessageRefs(env,record);
        const sentAt = new Date().toISOString();
        await env.DB.prepare("UPDATE orders SET kitchen_sent_at = ?, payment_error = '', updated_at = ? WHERE id = ? AND kitchen_sent_at = ?")
          .bind(sentAt,sentAt,order.id,sendClaim).run();
        order.kitchenSentAt = sentAt;
      } catch (error) {
        await env.DB.prepare("UPDATE orders SET kitchen_sent_at = '', payment_error = 'kitchen_delivery_failed', updated_at = ? WHERE id = ? AND kitchen_sent_at = ?")
          .bind(new Date().toISOString(),order.id,sendClaim).run();
        throw error;
      }
    }
  }
  record = await readOrderStatus(env,order.id);
  return paymentResultPayload(env,order,record,{ recipients:(record.messages || []).length });
}

async function finalizePaidOrder(request, env, order, payment) {
  verifyYookassaPayment(order,payment);
  return finalizeOrderForKitchen(
    request,env,order,'succeeded',
    String(payment.captured_at || new Date().toISOString()),
    'Оплата подтверждена. Заказ передан на кухню.'
  );
}

async function finalizeCashOrder(request, env, order) {
  return finalizeOrderForKitchen(
    request,env,order,'cash_on_pickup',new Date().toISOString(),
    'Заказ принят. Оплата наличными при самовывозе.'
  );
}

async function cancelPendingPayment(env, order, payment, options = {}) {
  const claim = `REL-${crypto.randomUUID()}`;
  const now = new Date().toISOString();
  const reason = String(payment.cancellation_details?.reason || 'payment_canceled').slice(0,120);
  const drops = order.items.filter(item=>String(item.id || '').startsWith('drop:'));
  const staleUpdatedAt = String(options.uncreatedUpdatedAt || '');
  const updateArguments = [reason,claim,now,order.id];
  const staleGuard = staleUpdatedAt ? " AND provider_payment_id = '' AND updated_at = ?" : '';
  if (staleUpdatedAt) updateArguments.push(staleUpdatedAt);
  const statements = [
    env.DB.prepare(`UPDATE orders SET payment_status = 'canceled', payment_error = ?, status_index = -1,
      status = 'Отменён', status_detail = 'Оплата не завершена. Заказ не передан на кухню.',
      canceled = 1, terminal = 1,
      inventory_released_at = CASE WHEN inventory_released_at = '' AND inventory_committed_at = '' THEN ? ELSE inventory_released_at END,
      updated_at = ? WHERE id = ? AND payment_status NOT IN ('succeeded','refunded','canceled')${staleGuard}`).bind(...updateArguments),
    env.DB.prepare(`UPDATE user_bonuses SET reserved_order_id = '', reserved_at = NULL
      WHERE reserved_order_id = ? AND used_at IS NULL
        AND EXISTS (SELECT 1 FROM orders WHERE id = ? AND inventory_released_at = ?)`)
      .bind(order.id,order.id,claim),
    env.DB.prepare(`INSERT INTO order_status_events (order_id,status_index,status,detail,created_at)
      SELECT ?,-1,'Отменён','Оплата не завершена. Заказ не передан на кухню.',?
      WHERE EXISTS (SELECT 1 FROM orders WHERE id = ? AND inventory_released_at = ?)`)
      .bind(order.id,now,order.id,claim)
  ];
  drops.forEach(item=>statements.push(env.DB.prepare(`UPDATE drops SET sold_count = MAX(0,sold_count - ?), updated_at = ?
    WHERE id = ? AND EXISTS (SELECT 1 FROM orders WHERE id = ? AND inventory_released_at = ?)`)
    .bind(Number(item.qty || 1),now,String(item.id).slice('drop:'.length),order.id,claim)));
  await env.DB.batch(statements);
  const record = await readOrderStatus(env,order.id);
  const current = await databasePaymentOrder(env,order.id);
  return paymentResultPayload(env,current,record,{ releaseClaimed:current?.inventoryReleasedAt === claim });
}

async function processYookassaPayment(request, env, order, payment) {
  verifyYookassaPayment(order,payment);
  if (payment.status === 'succeeded' && payment.paid === true) return finalizePaidOrder(request,env,order,payment);
  if (payment.status === 'canceled') return cancelPendingPayment(env,order,payment);
  const now = new Date().toISOString();
  await env.DB.prepare(`UPDATE orders SET payment_status = ?, payment_error = '', updated_at = ?
    WHERE id = ? AND payment_status <> 'succeeded'`).bind(String(payment.status || 'pending'),now,order.id).run();
  const current = await databasePaymentOrder(env,order.id);
  const record = await readOrderStatus(env,order.id);
  return paymentResultPayload(env,current,record);
}

function handlePaymentConfig(env) {
  const methods = yookassaMethods(env);
  const kitchenAvailable = Boolean(env.DB && env.TELEGRAM_BOT_TOKEN && telegramChatIds(env).length);
  const onlineAvailable = Boolean(kitchenAvailable && yookassaConfigured(env) && methods.length);
  return json({
    ok:true,
    provider:onlineAvailable ? 'yookassa' : kitchenAvailable ? 'cash' : 'none',
    available:kitchenAvailable,
    methods:{
      bankCard:onlineAvailable && methods.includes('bank_card'),
      sbp:onlineAvailable && methods.includes('sbp'),
      cash:kitchenAvailable
    },
    receiptEmailRequired:onlineAvailable && env.YOOKASSA_RECEIPTS === 'true'
  });
}

async function handlePaymentStatus(request, env) {
  if (!env.DB || !yookassaConfigured(env)) throw new ServiceUnavailableError('Онлайн-оплата пока настраивается.');
  await ensureDatabase(env);
  const url = new URL(request.url);
  const orderId = String(url.searchParams.get('id') || '');
  const track = String(url.searchParams.get('track') || '');
  const order = await databasePaymentOrder(env,orderId);
  if (!order) return json({ ok:false,error:'Заказ не найден' },404);
  if (!track || order.trackingToken !== track) return json({ ok:false,error:'Нет доступа к заказу' },403);
  if (!order.providerPaymentId) throw new ServiceUnavailableError('Платёж ещё не создан. Повторите попытку.');
  const payment = await yookassaRequest(env,`/payments/${encodeURIComponent(order.providerPaymentId)}`);
  return json(await processYookassaPayment(request,env,order,payment));
}

async function recordPaymentEvent(env,event,object,orderId,status) {
  const key = await hashDeviceToken(`${event}:${object.id}:${status}:${object.refunded_amount?.value || ''}`);
  await env.DB.prepare(`INSERT OR IGNORE INTO payment_events
    (event_key,event_type,provider_object_id,order_id,status,created_at) VALUES (?, ?, ?, ?, ?, ?)`)
    .bind(key,event,String(object.id || ''),String(orderId || ''),String(status || ''),new Date().toISOString()).run();
}

async function syncRefund(env, refund) {
  const stored = await env.DB.prepare(`SELECT id, order_id AS orderId FROM refunds
    WHERE provider_refund_id = ? OR id = ? LIMIT 1`).bind(String(refund.id || ''),String(refund.metadata?.request_id || '')).first();
  let order = stored?.orderId ? await databasePaymentOrder(env,stored.orderId) : null;
  if (!order) {
    const row = await env.DB.prepare('SELECT id FROM orders WHERE provider_payment_id = ?')
      .bind(String(refund.payment_id || '')).first();
    if (row?.id) order = await databasePaymentOrder(env,row.id);
  }
  if (!order) return null;
  const payment = await yookassaRequest(env,`/payments/${encodeURIComponent(order.providerPaymentId)}`);
  verifyYookassaPayment(order,payment);
  const refundedKopecks = moneyKopecks(payment.refunded_amount?.value || '0.00');
  const refundedAmount = Number.isFinite(refundedKopecks) ? Math.round(refundedKopecks / 100) : 0;
  const refundStatus = String(refund.status || 'pending');
  const now = new Date().toISOString();
  const localRefundId = stored?.id || `REF-PROVIDER-${String(refund.id || crypto.randomUUID())}`;
  const localIdempotenceKey = stored?.id ? '' : `provider-${String(refund.id || crypto.randomUUID())}`;
  await env.DB.batch([
    env.DB.prepare(`INSERT OR IGNORE INTO refunds
      (id,order_id,provider_refund_id,idempotence_key,amount,status,reason,created_at,updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`)
      .bind(localRefundId,order.id,String(refund.id || ''),localIdempotenceKey,
        Math.max(0,Math.round(moneyKopecks(refund.amount?.value || '0.00') / 100) || 0),refundStatus,
        String(refund.description || 'Возврат из YooKassa').slice(0,240),now,now),
    env.DB.prepare(`UPDATE refunds SET provider_refund_id = ?, status = ?, updated_at = ?
      WHERE id = ? OR provider_refund_id = ?`).bind(String(refund.id || ''),refundStatus,now,localRefundId,String(refund.id || '')),
    env.DB.prepare(`UPDATE orders SET refunded_amount = ?, refund_status = ?,
      payment_status = CASE WHEN ? >= total THEN 'refunded' ELSE payment_status END, updated_at = ? WHERE id = ?`)
      .bind(refundedAmount,refundStatus,refundedAmount,now,order.id)
  ]);
  if (refundedAmount >= Number(order.total || 0)) await cancelOrderBonuses(env,order.id);
  return { orderId:order.id,status:refundStatus,refundedAmount };
}

async function handleYookassaWebhook(request, env) {
  if (request.method !== 'POST') return json({ ok:false,error:'Method not allowed' },405);
  if (!env.DB || !yookassaConfigured(env)) throw new ServiceUnavailableError('Платёжный сервис не настроен.');
  await ensureDatabase(env);
  const notification = await request.json();
  const event = String(notification.event || '');
  const objectId = String(notification.object?.id || '');
  if (!objectId || !['payment.succeeded','payment.canceled','refund.succeeded','refund.canceled'].includes(event)) {
    return json({ ok:true });
  }
  if (event.startsWith('payment.')) {
    const payment = await yookassaRequest(env,`/payments/${encodeURIComponent(objectId)}`);
    const order = await env.DB.prepare('SELECT id FROM orders WHERE provider_payment_id = ?').bind(objectId).first();
    if (!order?.id) return json({ ok:true });
    const stored = await databasePaymentOrder(env,order.id);
    await processYookassaPayment(request,env,stored,payment);
    await recordPaymentEvent(env,event,payment,order.id,payment.status);
  } else {
    const refund = await yookassaRequest(env,`/refunds/${encodeURIComponent(objectId)}`);
    const synced = await syncRefund(env,refund);
    if (synced) await recordPaymentEvent(env,event,refund,synced.orderId,refund.status);
  }
  return json({ ok:true });
}

async function handleAdminRefunds(request, env) {
  requireAdmin(request,env);
  if (request.method !== 'POST') return json({ ok:false,error:'Method not allowed' },405);
  if (!env.DB || !yookassaConfigured(env)) throw new ServiceUnavailableError('Возвраты пока не настроены.');
  await ensureDatabase(env);
  const body = await request.json();
  const orderId = String(body.orderId || '');
  const requestId = String(body.requestId || '');
  if (!/^[A-Za-z0-9-]{8,48}$/.test(requestId)) throw new ValidationError('Укажите уникальный requestId для возврата.');
  const idempotenceKey = `refund-${requestId}`;
  const existing = await env.DB.prepare(`SELECT id,provider_refund_id AS providerRefundId,status,amount
    FROM refunds WHERE idempotence_key = ?`).bind(idempotenceKey).first();
  if (existing?.providerRefundId) {
    const current = await yookassaRequest(env,`/refunds/${encodeURIComponent(existing.providerRefundId)}`);
    const synced = await syncRefund(env,current);
    return json({ ok:true,duplicate:true,refund:{ id:current.id,status:current.status,amount:existing.amount },...synced });
  }
  const order = await databasePaymentOrder(env,orderId);
  if (!order || !order.providerPaymentId || !['succeeded','refunded'].includes(order.paymentStatus)) {
    throw new ValidationError('Для этого заказа возврат недоступен.');
  }
  const remaining = Number(order.total || 0) - Number(order.refundedAmount || 0);
  if (remaining <= 0) throw new ValidationError('Оплата уже возвращена полностью.');
  if (body.amount != null && Number(body.amount) !== remaining) {
    throw new ValidationError('Через этот маршрут выполняется только полный возврат остатка.');
  }
  const refund = await yookassaRequest(env,'/refunds',{
    method:'POST',
    idempotenceKey,
    body:{
      payment_id:order.providerPaymentId,
      amount:{ value:paymentAmountValue(remaining),currency:'RUB' },
      description:`Возврат заказа ${order.id}`.slice(0,128),
      metadata:{ request_id:requestId,order_id:order.id }
    }
  });
  const now = new Date().toISOString();
  await env.DB.prepare(`INSERT INTO refunds
    (id,order_id,provider_refund_id,idempotence_key,amount,status,reason,created_at,updated_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON CONFLICT(idempotence_key) DO UPDATE SET provider_refund_id = excluded.provider_refund_id,
      status = excluded.status,updated_at = excluded.updated_at`)
    .bind(`REF-${requestId}`,order.id,String(refund.id || ''),idempotenceKey,remaining,String(refund.status || 'pending'),
      String(body.reason || '').slice(0,240),now,now).run();
  const synced = await syncRefund(env,refund);
  return json({ ok:true,duplicate:false,refund:{ id:refund.id,status:refund.status,amount:remaining },...synced });
}

function paymentCreationTimeoutMs(env) {
  const minutes = Number(env.PAYMENT_CREATION_TIMEOUT_MINUTES || 30);
  return Math.max(5,Math.min(Number.isFinite(minutes) ? minutes : 30,120)) * 60000;
}

function paymentReconciliationRequest(env) {
  const configured = String(env.PUBLIC_SITE_URL || 'https://jjelani.ru').trim();
  let origin = 'https://jjelani.ru';
  try { origin = new URL(configured).origin; } catch {}
  return new Request(`${origin}/api/payment/reconcile`);
}

async function reconcilePendingPayments(env) {
  if (!env.DB || !yookassaConfigured(env)) return { checked:0,paid:0,canceled:0,released:0,failed:0 };
  await ensureDatabase(env);
  const pending = await env.DB.prepare(`SELECT id
    FROM orders WHERE payment_provider = 'yookassa'
      AND payment_status NOT IN ('succeeded','refunded','canceled')
    ORDER BY created_at ASC LIMIT 50`).all();
  const summary = { checked:0,paid:0,canceled:0,released:0,failed:0 };
  const request = paymentReconciliationRequest(env);
  const staleBefore = Date.now() - paymentCreationTimeoutMs(env);
  for (const row of pending.results || []) {
    summary.checked += 1;
    try {
      const order = await databasePaymentOrder(env,row.id);
      if (!order) continue;
      if (!order.providerPaymentId) {
        if (Date.parse(order.updatedAt || '') <= staleBefore) {
          const canceled = await cancelPendingPayment(env,order,{
            status:'canceled',
            cancellation_details:{ reason:'payment_not_created' }
          },{ uncreatedUpdatedAt:order.updatedAt });
          if (canceled.releaseClaimed) summary.released += 1;
        }
        continue;
      }
      const payment = await yookassaRequest(env,`/payments/${encodeURIComponent(order.providerPaymentId)}`);
      await processYookassaPayment(request,env,order,payment);
      if (payment.status === 'succeeded' && payment.paid === true) summary.paid += 1;
      else if (payment.status === 'canceled') summary.canceled += 1;
    } catch (error) {
      summary.failed += 1;
      console.error('Payment reconciliation failed',row.id,String(error?.message || error));
    }
  }
  return summary;
}

async function handleAdminPayments(request, env) {
  requireAdmin(request,env);
  if (!env.DB) throw new ServiceUnavailableError('База платежей не подключена.');
  await ensureDatabase(env);
  if (request.method === 'POST') {
    const body = await request.json().catch(()=>({}));
    if (body.action !== 'reconcile') throw new ValidationError('Неизвестное действие с платежами.');
    return json({ ok:true,summary:await reconcilePendingPayments(env) });
  }
  if (request.method === 'GET') {
    const url = new URL(request.url);
    const status = String(url.searchParams.get('status') || '').trim();
    const allowed = new Set(['creating','pending','waiting_for_capture','succeeded','cash_on_pickup','canceled','refunded']);
    if (status && !allowed.has(status)) throw new ValidationError('Неизвестный статус платежа.');
    const result = status
      ? await env.DB.prepare(`SELECT id,customer_name AS customerName,phone,total,payment_method AS paymentMethod,
          payment_status AS paymentStatus,provider_payment_id AS providerPaymentId,refunded_amount AS refundedAmount,
          refund_status AS refundStatus,payment_error AS paymentError,created_at AS createdAt,updated_at AS updatedAt
          FROM orders WHERE payment_status = ? ORDER BY created_at DESC LIMIT 100`).bind(status).all()
      : await env.DB.prepare(`SELECT id,customer_name AS customerName,phone,total,payment_method AS paymentMethod,
          payment_status AS paymentStatus,provider_payment_id AS providerPaymentId,refunded_amount AS refundedAmount,
          refund_status AS refundStatus,payment_error AS paymentError,created_at AS createdAt,updated_at AS updatedAt
          FROM orders ORDER BY created_at DESC LIMIT 100`).all();
    return json({ ok:true,orders:result.results || [] });
  }
  return json({ ok:false,error:'Method not allowed' },405);
}

async function handleOrderStatus(request, env) {
  if (!env.DB && !env.ORDER_STATUS) {
    return json({ ok: false, error: 'Хранилище заказов не подключено' }, 503);
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
  const expectedSecret = await telegramWebhookSecret(env);
  const actualSecret = request.headers.get('x-telegram-bot-api-secret-token') || '';
  if (!expectedSecret || actualSecret !== expectedSecret) {
    return json({ ok: false, error: 'Forbidden' }, 403);
  }

  const update = await request.json();
  const query = update.callback_query;

  if (!query?.data?.startsWith('o:')) {
    return json({ ok: true });
  }

  if (!telegramOperatorAllowed(env, query)) {
    await telegram(env, 'answerCallbackQuery', {
      callback_query_id: query.id,
      text: 'У вас нет доступа к управлению заказами',
      show_alert: true
    });
    return json({ ok: false, error: 'Forbidden' }, 403);
  }

  const [, orderId, rawFlow, step] = query.data.split(':');
  const flow = rawFlow === 'delivery' ? 'delivery' : 'pickup';
  const updateStatus = statusFromStep(flow, step);
  const previous = await readOrderStatus(env, orderId);
  if (!previous) {
    await telegram(env, 'answerCallbackQuery', {
      callback_query_id: query.id,
      text: `Заказ ${orderId} не найден`
    });
    return json({ ok: false, error: 'Заказ не найден' }, 404);
  }
  const record = {
    id: orderId,
    flow,
    trackToken: previous?.trackToken || '',
    messageId: previous?.messageId || query.message?.message_id,
    messages: messageRefs(previous, query),
    total: previous?.total || 0,
    createdAt: previous?.createdAt || new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    storage: previous.storage,
    ...updateStatus
  };

  await saveOrderStatus(env, record);
  if (record.canceled && !previous.canceled) await cancelOrderEngagement(env,orderId);
  if (record.terminal && !record.canceled && !previous.terminal) await awardPointsForCompletedOrder(env,orderId);

  await telegram(env, 'answerCallbackQuery', {
    callback_query_id: query.id,
    text: `Статус ${orderId}: ${record.status}`
  });

  await editOrderMessages(env, record, query);

  return json({ ok: true, status: statusPayload(record) });
}

async function handleHealth(env) {
  let database = false;
  if (env.DB) {
    await ensureDatabase(env);
    await env.DB.prepare('SELECT 1 AS ok').first();
    database = true;
  }

  const paymentMethods = yookassaMethods(env);
  const paymentConfigured = Boolean(database && yookassaConfigured(env) && paymentMethods.length);
  const cashConfigured = Boolean(database && env.TELEGRAM_BOT_TOKEN && telegramChatIds(env).length);
  const authProviders = {
    phone:Boolean(database && env.SMSRU_API_ID && String(env.AUTH_SECRET || '').length >= 32),
    telegram:Boolean(database && env.TELEGRAM_BOT_TOKEN && env.TELEGRAM_BOT_USERNAME),
    vk:Boolean(database && oauthProvider(env,'vk')?.available),
    ok:Boolean(database && oauthProvider(env,'ok')?.available),
    mail:Boolean(database && oauthProvider(env,'mail')?.available),
    max:Boolean(database && (env.MAX_BOT_TOKEN || oauthProvider(env,'max')?.available))
  };
  return json({
    ok: true,
    database,
    statusStorage: database ? 'd1' : env.ORDER_STATUS ? 'kv' : 'none',
    telegram: Boolean(env.TELEGRAM_BOT_TOKEN && telegramChatIds(env).length),
    telegramRecipients: telegramChatIds(env).length,
    telegramOperatorsConfigured: telegramOperatorIds(env).length > 0,
    authentication: database,
    authProviders,
    phoneAuthConfigured: authProviders.phone,
    telegramAuthConfigured: authProviders.telegram,
    telegramWebAppConfigured:Boolean(database && env.TELEGRAM_BOT_TOKEN),
    paymentProvider:paymentConfigured ? 'yookassa' : cashConfigured ? 'cash' : 'none',
    onlinePaymentConfigured:paymentConfigured,
    paymentMethods:[...(paymentConfigured ? paymentMethods : []),...(cashConfigured ? ['cash'] : [])],
    paymentWebhook:'/api/yookassa-webhook',
    authCallbacks:{
      vk:'/api/auth/oauth/callback/vk',
      ok:'/api/auth/oauth/callback/ok',
      mail:'/api/auth/oauth/callback/mail'
    },
    paymentReconciliation:'every_5_minutes',
    orderingAvailable:cashConfigured
  });
}

export { buildTasteProfileFromItems, bonusDiscountValue, maxCheckString, moneyKopecks, normalizeOAuthProfile, paymentAmountValue, priceOrder, sanitizeSavedItems, serverItemPrice, statusFromStep, telegramCheckString, telegramOperatorAllowed, telegramWebAppCheckString, verifyMaxWebAppData, verifyTelegramPayload, verifyTelegramWebAppData, verifyYookassaPayment, yookassaPaymentPayload, yookassaReceiptItems };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    try {
      if (url.pathname === '/api/auth/config') {
        if (request.method !== 'GET') return json({ ok:false, error:'Method not allowed' },405);
        return handleAuthConfig(request,env);
      }

      if (url.pathname === '/api/auth/session') return await handleAuthSession(request,env);
      if (url.pathname === '/api/auth/phone/request') return await handlePhoneCodeRequest(request,env);
      if (url.pathname === '/api/auth/phone/verify') return await handlePhoneCodeVerify(request,env);
      if (url.pathname === '/api/auth/telegram') return await handleTelegramAuth(request,env);
      if (url.pathname === '/api/auth/telegram-webapp') return await handleTelegramWebAppAuth(request,env);
      if (url.pathname === '/api/auth/max') return await handleMaxAuth(request,env);
      if (url.pathname === '/api/auth/oauth/start') return await handleOAuthStart(request,env);
      if (url.pathname.startsWith('/api/auth/oauth/callback/')) {
        const provider = decodeURIComponent(url.pathname.slice('/api/auth/oauth/callback/'.length));
        return await handleOAuthCallback(request,env,provider);
      }
      if (url.pathname === '/api/account') return await handleAccount(request,env);

      if (url.pathname === '/api/payment/config') {
        if (request.method !== 'GET') return json({ ok:false,error:'Method not allowed' },405);
        return handlePaymentConfig(env);
      }

      if (url.pathname === '/api/payment/status') {
        if (request.method !== 'GET') return json({ ok:false,error:'Method not allowed' },405);
        return await handlePaymentStatus(request,env);
      }

      if (url.pathname === '/api/yookassa-webhook') return await handleYookassaWebhook(request,env);

      if (url.pathname === '/api/order') {
        if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);
        return await handleOrder(request, env);
      }

      if (url.pathname === '/api/order-status') {
        if (request.method !== 'GET') return json({ ok: false, error: 'Method not allowed' }, 405);
        return await handleOrderStatus(request, env);
      }

      if (url.pathname === '/api/saved-orders' || url.pathname.startsWith('/api/saved-orders/')) {
        const orderId = url.pathname === '/api/saved-orders'
          ? ''
          : decodeURIComponent(url.pathname.slice('/api/saved-orders/'.length));
        return await handleSavedOrders(request, env, orderId);
      }

      if (url.pathname === '/api/bonuses') {
        if (request.method !== 'GET') return json({ ok:false, error:'Method not allowed' },405);
        return await handleBonuses(request,env);
      }

      if (url.pathname === '/api/drop') {
        if (request.method !== 'GET') return json({ ok:false, error:'Method not allowed' },405);
        return await handleDrop(request,env);
      }

      if (url.pathname === '/api/taste-profile') {
        return await handleTasteProfile(request,env);
      }

      if (url.pathname === '/api/admin/bonuses') {
        return await handleAdminBonuses(request,env);
      }

      if (url.pathname === '/api/admin/refunds') return await handleAdminRefunds(request,env);
      if (url.pathname === '/api/admin/payments') return await handleAdminPayments(request,env);

      if (url.pathname === '/api/admin/drops' || url.pathname.startsWith('/api/admin/drops/')) {
        const dropId=url.pathname === '/api/admin/drops' ? '' : decodeURIComponent(url.pathname.slice('/api/admin/drops/'.length));
        return await handleAdminDrops(request,env,dropId);
      }

      if (url.pathname === '/api/telegram-webhook') {
        if (request.method !== 'POST') return json({ ok: false, error: 'Method not allowed' }, 405);
        return await handleTelegramWebhook(request, env);
      }

      if (url.pathname === '/api/health') {
        if (request.method !== 'GET') return json({ ok: false, error: 'Method not allowed' }, 405);
        return await handleHealth(env);
      }

      if (env.ASSETS) {
        return env.ASSETS.fetch(request);
      }

      return new Response('Not found', { status: 404 });
    } catch (error) {
      const status = error instanceof SyntaxError ? 400 : error.status || 500;
      if (status >= 500 && !(error instanceof ServiceUnavailableError)) console.error(error);
      const message = error instanceof ValidationError || error instanceof ServiceUnavailableError
        ? error.message
        : status === 400
          ? 'Не удалось прочитать данные заказа'
          : 'Не удалось передать заказ на кухню. Попробуйте ещё раз или свяжитесь с нами.';
      return json({ ok: false, error: message }, status);
    }
  },
  async scheduled(_controller,env,ctx) {
    ctx.waitUntil(reconcilePendingPayments(env));
  }
};
