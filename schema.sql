CREATE TABLE IF NOT EXISTS customers (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  phone TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  first_seen_at TEXT NOT NULL,
  last_seen_at TEXT NOT NULL,
  order_count INTEGER NOT NULL DEFAULT 0,
  total_spent INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS orders (
  id TEXT PRIMARY KEY,
  tracking_token TEXT NOT NULL,
  customer_id INTEGER,
  customer_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  flow TEXT NOT NULL,
  delivery_method TEXT NOT NULL,
  address TEXT NOT NULL DEFAULT '',
  payment_method TEXT NOT NULL,
  comment TEXT NOT NULL DEFAULT '',
  promo_code TEXT NOT NULL DEFAULT '',
  subtotal INTEGER NOT NULL DEFAULT 0,
  discount INTEGER NOT NULL DEFAULT 0,
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

CREATE INDEX IF NOT EXISTS idx_orders_phone ON orders(phone);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON orders(created_at);
CREATE INDEX IF NOT EXISTS idx_status_events_order ON order_status_events(order_id);
