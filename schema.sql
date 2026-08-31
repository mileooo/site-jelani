CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  order_count INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0,
  bonus_points INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
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
  offer_version TEXT NOT NULL DEFAULT '',
  offer_accepted_at TEXT NOT NULL DEFAULT '',
  personal_data_consent_version TEXT NOT NULL DEFAULT '',
  personal_data_consent_at TEXT NOT NULL DEFAULT '',
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
  delivery_fee INTEGER NOT NULL DEFAULT 0,
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
);

CREATE TABLE IF NOT EXISTS order_items (
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
);

CREATE TABLE IF NOT EXISTS order_status_events (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  order_id TEXT NOT NULL,
  status_index INTEGER NOT NULL,
  status TEXT NOT NULL,
  detail TEXT NOT NULL,
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_messages (
  order_id TEXT NOT NULL,
  chat_id TEXT NOT NULL,
  message_id INTEGER NOT NULL,
  PRIMARY KEY (order_id, chat_id, message_id),
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS saved_orders (
  owner_token_hash TEXT NOT NULL,
  id TEXT NOT NULL,
  name TEXT NOT NULL,
  items_json TEXT NOT NULL,
  total INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  PRIMARY KEY (owner_token_hash, id)
);

CREATE TABLE IF NOT EXISTS bonus_definitions (
  type TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  conditions TEXT NOT NULL DEFAULT '',
  enabled INTEGER NOT NULL DEFAULT 1,
  weight INTEGER NOT NULL DEFAULT 1,
  validity_days INTEGER NOT NULL DEFAULT 14,
  min_order_total INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS user_bonuses (
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
);

CREATE TABLE IF NOT EXISTS drops (
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
);

CREATE TABLE IF NOT EXISTS taste_profiles (
  owner_token_hash TEXT PRIMARY KEY,
  order_count INTEGER NOT NULL DEFAULT 0,
  summary_json TEXT NOT NULL DEFAULT '{}',
  overrides_json TEXT NOT NULL DEFAULT '{}',
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS app_users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  phone TEXT UNIQUE,
  avatar_url TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  deleted_at TEXT
);

CREATE TABLE IF NOT EXISTS auth_identities (
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
);

CREATE TABLE IF NOT EXISTS auth_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  device_token_hash TEXT NOT NULL DEFAULT '',
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  revoked_at TEXT,
  FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS auth_otps (
  id TEXT PRIMARY KEY,
  phone TEXT NOT NULL,
  code_hash TEXT NOT NULL,
  attempts INTEGER NOT NULL DEFAULT 0,
  requested_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  consumed_at TEXT,
  ip_hash TEXT NOT NULL DEFAULT '',
  device_token_hash TEXT NOT NULL DEFAULT ''
);

CREATE TABLE IF NOT EXISTS oauth_states (
  state_hash TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  code_verifier TEXT NOT NULL DEFAULT '',
  link_user_id TEXT NOT NULL DEFAULT '',
  device_token_hash TEXT NOT NULL DEFAULT '',
  redirect_uri TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  used_at TEXT
);

CREATE TABLE IF NOT EXISTS user_addresses (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  label TEXT NOT NULL DEFAULT '',
  address TEXT NOT NULL,
  is_default INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES app_users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS payment_events (
  event_key TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  provider_object_id TEXT NOT NULL,
  order_id TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '',
  created_at TEXT NOT NULL,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS refunds (
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
);

CREATE TRIGGER IF NOT EXISTS prevent_drop_oversell
BEFORE UPDATE OF sold_count ON drops
WHEN NEW.quantity > 0 AND NEW.sold_count > NEW.quantity
BEGIN
  SELECT RAISE(ABORT, 'DROP sold out');
END;

CREATE TRIGGER IF NOT EXISTS validate_order_bonus
BEFORE INSERT ON orders
WHEN NEW.applied_bonus_id <> '' AND NOT EXISTS (
  SELECT 1 FROM user_bonuses
  WHERE id = NEW.applied_bonus_id
    AND owner_token_hash = NEW.owner_token_hash
    AND used_at IS NULL
    AND canceled_at IS NULL
    AND julianday(expires_at) > julianday('now')
)
BEGIN
  SELECT RAISE(ABORT, 'Bonus unavailable');
END;

INSERT OR IGNORE INTO bonus_definitions
  (type, title, description, conditions, enabled, weight, validity_days, min_order_total, updated_at)
VALUES
  ('free_sauce', 'Бесплатный фирменный соус', 'Добавим один фирменный соус бесплатно.', 'Действует на один следующий заказ.', 1, 30, 14, 0, CURRENT_TIMESTAMP),
  ('free_cheese', 'Бесплатный сыр', 'Добавим сыр в одну позицию бесплатно.', 'Действует на один следующий заказ.', 1, 25, 14, 0, CURRENT_TIMESTAMP),
  ('double_points', 'Двойные бонусные баллы', 'Начислим в два раза больше баллов за следующий заказ.', 'Баллы появятся после выполнения заказа.', 1, 15, 14, 0, CURRENT_TIMESTAMP),
  ('discount_5', 'Скидка 5%', 'Скидка 5% на следующий заказ.', 'Не суммируется с другими скидками.', 1, 20, 10, 0, CURRENT_TIMESTAMP),
  ('free_drink', 'Бесплатный напиток', 'Один напиток бесплатно при заказе от 700 ₽.', 'Минимальная сумма заказа 700 ₽.', 1, 10, 14, 700, CURRENT_TIMESTAMP);

INSERT OR IGNORE INTO drops
  (id, name, description, composition_json, image_url, price, starts_at, ends_at, quantity, sold_count, enabled, updated_at)
VALUES
  ('drop-2026-07-fire', 'Огненная шаурма DROP', 'Курица, халапеньо, сыр и яркий соус Чили. Только на этой неделе.',
   '["Курица","Сыр","Халапеньо","Соус Чили","Свежие овощи"]', '/images/hero-slide-3.png', 349,
   '2026-07-12T06:00:00.000Z', '2026-07-19T17:45:00.000Z', 80, 0, 1, CURRENT_TIMESTAMP);

CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_status_events_order ON order_status_events(order_id);
CREATE INDEX IF NOT EXISTS idx_saved_orders_owner ON saved_orders(owner_token_hash, updated_at);
CREATE INDEX IF NOT EXISTS idx_user_bonuses_owner ON user_bonuses(owner_token_hash, expires_at);
CREATE INDEX IF NOT EXISTS idx_drops_schedule ON drops(starts_at, ends_at);
CREATE INDEX IF NOT EXISTS idx_orders_owner ON orders(owner_token_hash, created_at);
CREATE INDEX IF NOT EXISTS idx_orders_account ON orders(account_user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_auth_identities_user ON auth_identities(user_id);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_user ON auth_sessions(user_id, expires_at);
CREATE INDEX IF NOT EXISTS idx_auth_otps_phone ON auth_otps(phone, requested_at);
CREATE INDEX IF NOT EXISTS idx_user_addresses_user ON user_addresses(user_id, updated_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_orders_provider_payment ON orders(provider_payment_id) WHERE provider_payment_id <> '';
CREATE INDEX IF NOT EXISTS idx_orders_payment_status ON orders(payment_status, created_at);
CREATE INDEX IF NOT EXISTS idx_payment_events_order ON payment_events(order_id, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS idx_refunds_provider_id ON refunds(provider_refund_id) WHERE provider_refund_id <> '';
