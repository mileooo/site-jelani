const RUB = new Intl.NumberFormat('ru-RU', { style: 'currency', currency: 'RUB', maximumFractionDigits: 0 });
const formatPrice = value => RUB.format(value);

const sauces = [
  'Томатный', 'Чесночный', 'Аджика', '1000 островов', 'Кавказский',
  'Чили', 'Сырный', 'Кисло-сладкий', 'Мацони', 'Наршараб'
];

const drinks = ['Смузи', 'Коктейль', 'Газировка', 'Сок', 'Чай', 'Кофе'];

const categoryMeta = [
  { id: 'all', label: 'Всё меню' },
  { id: 'burgers', label: 'Бургеры' },
  { id: 'shawarma', label: 'Шаурма и донер' },
  { id: 'sandwiches', label: 'Сэндвичи и хот-доги' },
  { id: 'snacks', label: 'Закуски' },
  { id: 'salads', label: 'Салаты' },
  { id: 'desserts', label: 'Десерты' },
  { id: 'drinks', label: 'Напитки' },
  { id: 'sauces', label: 'Соусы' }
];

const menuItems = [
  { id:'burger', category:'burgers', name:'Бургер', description:'Сочная котлета, сыр, салат, томаты, огурчики и фирменный соус.', price:270, emoji:'🍔', visual:'orange', tags:['бургер','говядина','хит'] },

  { id:'shawarma-small-chicken', category:'shawarma', name:'Шаурма маленькая с курицей', description:'Курица, свежие овощи и 1-2 соуса на выбор.', price:190, emoji:'🌯', visual:'orange', tags:['шаурма','курица'] },
  { id:'shawarma-small-beef', category:'shawarma', name:'Шаурма маленькая с говядиной', description:'Говядина, свежие овощи и 1-2 соуса на выбор.', price:225, emoji:'🌯', visual:'dark', tags:['шаурма','говядина'] },
  { id:'shawarma-standard-chicken', category:'shawarma', name:'Шаурма стандартная с курицей', description:'Курица, овощи, зелень и фирменная соусная сборка.', price:240, emoji:'🌯', visual:'orange', tags:['шаурма','курица','хит'] },
  { id:'shawarma-standard-beef', category:'shawarma', name:'Шаурма стандартная с говядиной', description:'Говядина, овощи, зелень и фирменная соусная сборка.', price:275, emoji:'🌯', visual:'dark', tags:['шаурма','говядина','хит'] },
  { id:'shawarma-large-chicken', category:'shawarma', name:'Шаурма большая с курицей', description:'Большая порция курицы, овощей и соусов для сильного голода.', price:290, emoji:'🌯', visual:'orange', tags:['шаурма','курица'] },
  { id:'shawarma-large-beef', category:'shawarma', name:'Шаурма большая с говядиной', description:'Большая порция говядины, овощей и соусов для сильного голода.', price:325, emoji:'🌯', visual:'dark', tags:['шаурма','говядина'] },
  { id:'doner-chicken', category:'shawarma', name:'Донер с курицей', description:'Курица, овощи, зелень и насыщенный соус в удобной подаче.', price:230, emoji:'🥙', visual:'green', tags:['донер','курица'] },
  { id:'doner-beef', category:'shawarma', name:'Донер с говядиной', description:'Говядина, овощи, зелень и насыщенный соус в удобной подаче.', price:270, emoji:'🥙', visual:'dark', tags:['донер','говядина'] },
  { id:'gyros', category:'shawarma', name:'Гирос', description:'Мясо, свежие овощи, картофель и соус мацони в мягкой лепешке.', price:250, emoji:'🥙', visual:'green', tags:['гирос','курица','говядина'] },
  { id:'pita', category:'shawarma', name:'Пита', description:'Теплая пита с мясом, овощами, зеленью и соусом.', price:240, emoji:'🥙', visual:'pink', tags:['пита','курица','говядина'] },
  { id:'open-shawarma', category:'shawarma', name:'Открытая шаурма', description:'Больше начинки на виду: мясо, овощи, картофель и соусы.', price:320, emoji:'🍽️', visual:'orange', tags:['открытая шаурма','курица','говядина'] },
  { id:'quesadilla', category:'shawarma', name:'Кесадилья', description:'Хрустящая лепешка, мясо, сыр, овощи и соус.', price:290, emoji:'🫔', visual:'yellow', tags:['кесадилья','сыр','курица','говядина'] },

  { id:'sandwich-chicken', category:'sandwiches', name:'Сэндвич с курицей', description:'Курица, сыр, салат, томаты и соус в мягком хлебе.', price:240, emoji:'🥪', visual:'green', tags:['сэндвич','курица'] },
  { id:'sandwich-ham', category:'sandwiches', name:'Сэндвич с ветчиной', description:'Ветчина, сыр, овощи и соус в мягком хлебе.', price:230, emoji:'🥪', visual:'pink', tags:['сэндвич','ветчина'] },
  { id:'fried-sandwich', category:'sandwiches', name:'Жареный сэндвич', description:'Горячий сэндвич с сыром и начинкой, обжаренный до хруста.', price:230, emoji:'🍞', visual:'yellow', tags:['жареный','сыр'] },
  { id:'american-sandwich', category:'sandwiches', name:'Американский сэндвич', description:'Сытный сэндвич с мясом, сыром, огурчиками и соусом 1000 островов.', price:310, emoji:'🥪', visual:'orange', tags:['американский','говядина','сыр'] },
  { id:'cross-sandwich-chicken', category:'sandwiches', name:'Перекрестный сэндвич с курицей', description:'Горячий перекрестный сэндвич с курицей, сыром и соусом.', price:260, emoji:'🥪', visual:'green', tags:['перекрестный','курица'] },
  { id:'cross-sandwich-ham', category:'sandwiches', name:'Перекрестный сэндвич с ветчиной', description:'Горячий перекрестный сэндвич с ветчиной, сыром и соусом.', price:250, emoji:'🥪', visual:'pink', tags:['перекрестный','ветчина'] },
  { id:'ciabatta-sandwich', category:'sandwiches', name:'Чиабатта-сэндвич', description:'Хрустящая чиабатта, мясо, сыр, овощи и соус.', price:290, emoji:'🥖', visual:'yellow', tags:['чиабатта','курица','говядина'] },
  { id:'fried-toasties', category:'sandwiches', name:'Жареные бутерброды', description:'Горячие бутерброды с сыром и начинкой, быстро и сытно.', price:190, emoji:'🍞', visual:'dark', tags:['бутерброды','сыр'] },
  { id:'hotdog', category:'sandwiches', name:'Хот-дог', description:'Булочка, сосиска, огурчики, лук, кетчуп и соус.', price:180, emoji:'🌭', visual:'orange', tags:['хот-дог'] },

  { id:'fries', category:'snacks', name:'Картофель фри', description:'Золотистый, хрустящий, горячий картофель.', price:110, emoji:'🍟', visual:'yellow', tags:['фри','хит'] },
  { id:'nuggets', category:'snacks', name:'Наггетсы', description:'Куриные наггетсы в хрустящей панировке.', price:160, emoji:'🍗', visual:'orange', tags:['наггетсы','курица'] },
  { id:'onion-rings', category:'snacks', name:'Луковые кольца', description:'Хрустящие кольца в панировке.', price:130, emoji:'🧅', visual:'yellow', tags:['кольца'] },
  { id:'wings', category:'snacks', name:'Крылышки', description:'Сочные куриные крылышки с соусом на выбор.', price:240, emoji:'🍗', visual:'dark', tags:['крылышки','курица'] },
  { id:'garlic-croutons', category:'snacks', name:'Гренки', description:'Хрустящие гренки с чесночным соусом.', price:130, emoji:'🧄', visual:'green', tags:['гренки','чеснок'] },
  { id:'fish-nuggets', category:'snacks', name:'Рыбные наггетсы', description:'Нежная рыба в хрустящей панировке.', price:190, emoji:'🐟', visual:'pink', tags:['рыба','наггетсы'] },

  { id:'caesar-salad', category:'salads', name:'Салат «Цезарь»', description:'Курица, салат, томаты, сыр, сухарики и соус.', price:230, emoji:'🥗', visual:'green', tags:['салат','цезарь','курица'] },
  { id:'caucasian-salad', category:'salads', name:'Кавказский салат', description:'Томаты, огурцы, зелень, лук и яркая заправка.', price:180, emoji:'🥗', visual:'pink', tags:['салат','кавказский'] },
  { id:'big-hit-salad', category:'salads', name:'Салат «Биг Хит»', description:'Сытный салат с курицей, сыром, овощами и соусом.', price:250, emoji:'🥗', visual:'orange', tags:['салат','биг хит','курица'] },
  { id:'chips-salad', category:'salads', name:'Салат в пачке чипсов', description:'Салат, соус и хруст чипсов в необычной подаче.', price:230, emoji:'🥔', visual:'yellow', tags:['салат','чипсы'] },

  { id:'vienna-waffle', category:'desserts', name:'Венские вафли', description:'Теплые вафли с топпингом на выбор.', price:170, emoji:'🧇', visual:'yellow', tags:['вафли','десерт'] },
  { id:'syrniki', category:'desserts', name:'Сырники', description:'Нежные сырники со сметаной или топпингом.', price:190, emoji:'🥞', visual:'pink', tags:['сырники','десерт'] },
  { id:'baklava-icecream', category:'desserts', name:'Пахлава с мороженым', description:'Восточная сладость и холодное мороженое.', price:220, emoji:'🍨', visual:'orange', tags:['пахлава','мороженое'] },
  { id:'napoleon', category:'desserts', name:'Торт «Наполеон»', description:'Классический слоеный кусок торта.', price:160, emoji:'🍰', visual:'yellow', tags:['торт','наполеон'] },
  { id:'medovik', category:'desserts', name:'Торт «Медовик»', description:'Медовые коржи и нежный крем.', price:160, emoji:'🍰', visual:'pink', tags:['торт','медовик'] },
  { id:'donuts', category:'desserts', name:'Пончики', description:'Сахарная пудра или сладкий топпинг.', price:130, emoji:'🍩', visual:'orange', tags:['пончики'] },

  { id:'smoothie', category:'drinks', name:'Смузи', description:'Фруктовый заряд свежести.', price:170, emoji:'🥤', visual:'green', tags:['смузи'] },
  { id:'milkshake', category:'drinks', name:'Коктейль', description:'Молочный коктейль, густой и холодный.', price:160, emoji:'🥛', visual:'pink', tags:['коктейль'] },
  { id:'soda', category:'drinks', name:'Газировка', description:'Кола, лимонад или другая газировка 0.5.', price:90, emoji:'🥤', visual:'orange', tags:['газировка'] },
  { id:'juice', category:'drinks', name:'Соки', description:'Яблоко, апельсин, мультифрукт.', price:80, emoji:'🧃', visual:'yellow', tags:['сок','соки'] },
  { id:'tea', category:'drinks', name:'Чай', description:'Черный, зеленый или фруктовый.', price:70, emoji:'🍵', visual:'green', tags:['чай'] },
  { id:'coffee', category:'drinks', name:'Кофе', description:'Американо, капучино или латте.', price:110, emoji:'☕', visual:'dark', tags:['кофе'] },

  ...sauces.map((name, index) => ({ id:`sauce-${index}`, category:'sauces', name:`Соус «${name}»`, description:'Порция соуса к любому блюду.', price:35, emoji:'🥣', visual:['orange','green','pink','yellow'][index % 4], tags:[name.toLowerCase()] }))
];

const comboCategories = [
  { id:'all', label:'Все' },
  { id:'shawarma', label:'Шаурма и донер' },
  { id:'burgers', label:'Бургеры и сэндвичи' },
  { id:'chicken', label:'Курица' },
  { id:'fish', label:'Рыба' },
  { id:'morning', label:'Завтрак' },
  { id:'duo', label:'На двоих' }
];

const combos = [
  { id:'shawarma-combo', categories:['shawarma','chicken'], name:'Шаурма Комбо', description:'Шаурма, хрустящий фри, напиток и соусы на выбор.', price:410, sizes:[{name:'Стандартный',price:410},{name:'Большой',price:490}], saving:85, badge:'ХИТ', image:'images/hero-main.png', emoji:'🌯', flags:['meat','drink','shawarmaSauces','friesSauce'], composition:['Шаурма','Фри','Напиток','Соусы в шаурму','Соус к фри'] },
  { id:'burger-combo', categories:['burgers'], name:'Бургер Комбо', description:'Фирменный бургер, картофель фри, напиток и соус к фри.', price:430, sizes:[{name:'Стандартный',price:430},{name:'Большой',price:510}], saving:75, badge:'ХИТ', image:'images/hero-slide-2.png', emoji:'🍔', flags:['drink','sauce'], sauceLabel:'Соус к картофелю фри — выберите один', composition:['Бургер','Фри','Напиток','Соус к фри'] },
  { id:'doner-combo', categories:['shawarma','chicken'], name:'Донер Комбо', description:'Донер с мясом на выбор, фри, напиток и соус к фри.', price:410, sizes:[{name:'Стандартный',price:410},{name:'Большой',price:490}], saving:80, image:'images/hero-slide-3.png', emoji:'🥙', flags:['meat','drink','sauce'], sauceLabel:'Соус к картофелю фри — выберите один', composition:['Донер','Фри','Напиток','Соус к фри'] },
  { id:'wings-combo', categories:['chicken'], name:'Крылышки Комбо', description:'Крылышки, напиток и два соуса на выбор.', price:490, sizes:[{name:'6 крыльев',price:490},{name:'9 крыльев',price:620}], saving:110, badge:'ВЫГОДНО', image:'images/hero-slide-1.png', emoji:'🍗', flags:['drink','twoSauces'], composition:['Крылышки','Напиток','2 соуса'] },
  { id:'gyros-combo', categories:['shawarma','chicken'], name:'Гирос Комбо', description:'Сочный гирос, фри, напиток и соус к фри.', price:420, sizes:[{name:'Стандартный',price:420},{name:'Большой',price:500}], saving:75, image:'images/hero-main.png', emoji:'🥙', flags:['drink','gyrosSauce'], sauceLabel:'Соус к картофелю фри — выберите один', composition:['Гирос','Фри','Напиток','Соус к фри'] },
  { id:'sandwich-combo', categories:['burgers','chicken'], name:'Сэндвич Комбо', description:'Сэндвич на выбор, напиток и один соус к сэндвичу.', price:400, sizes:[{name:'Стандартный',price:400},{name:'Большой',price:480}], saving:70, image:'images/hero-slide-2.png', emoji:'🥪', flags:['sandwich','drink','sauce'], sauceLabel:'Соус к сэндвичу — выберите один', composition:['Сэндвич','Напиток','Соус'] },
  { id:'hotdog-combo', categories:['burgers'], name:'Хот-дог Комбо', description:'Хот-дог, напиток и один соус на выбор.', price:330, sizes:[{name:'Стандартный',price:330},{name:'Большой',price:410}], saving:65, image:'images/hero-slide-2.png', emoji:'🌭', flags:['drink','sauce'], sauceLabel:'Соус к хот-догу — выберите один', composition:['Хот-дог','Напиток','Соус'] },
  { id:'fish-combo', categories:['fish'], name:'Рыбные наггетсы Комбо', description:'Рыбные наггетсы, напиток и подходящий соус.', price:390, sizes:[{name:'6 наггетсов',price:390},{name:'9 наггетсов',price:470}], saving:70, image:'images/hero-slide-1.png', emoji:'🐟', flags:['drink','fishSauce'], sauceLabel:'Соус к рыбным наггетсам — выберите один', composition:['Наггетсы','Напиток','Соус'] },
  { id:'quesadilla-combo', categories:['shawarma','chicken'], name:'Кесадилья Комбо', description:'Кесадилья, закуска на выбор, напиток и соус.', price:440, sizes:[{name:'Стандартный',price:440},{name:'Большой',price:540}], saving:90, image:'images/hero-slide-3.png', emoji:'🫔', flags:['side','drink','sauce'], composition:['Кесадилья','Закуска','Напиток','Соус'] },
  { id:'morning-combo', categories:['morning'], name:'Утреннее Комбо', description:'Сырники или вафли, горячий напиток и сок или смузи.', price:320, sizes:[{name:'Стандартный',price:320}], saving:60, badge:'ДО 12:00', image:'images/hero-main.png', emoji:'☕', flags:['morning'], composition:['Завтрак','Кофе или чай','Сок или смузи'] },
  { id:'sweet-combo', categories:['morning'], name:'Сладкое Комбо', description:'Любимый десерт и свежесваренный кофе или чай.', price:280, sizes:[{name:'Стандартный',price:280}], saving:45, image:'images/hero-slide-2.png', emoji:'🍰', flags:['sweet'], composition:['Десерт','Кофе или чай'] },
  { id:'mega-combo', categories:['duo','shawarma','chicken'], name:'Мега Комбо на двоих', description:'Две шаурмы, большая порция фри, два напитка и два соуса.', price:890, sizes:[{name:'На двоих',price:890}], saving:170, badge:'НА ДВОИХ', image:'images/hero-slide-1.png', emoji:'🌯', flags:['meat','drink','twoSauces'], composition:['2 шаурмы','Большая фри','2 напитка','2 соуса'] }
];

const sets = [
  { id:'duet', name:'Сет «Дуэт»', size:'НА ДВОИХ', description:'2 стандартные шаурмы, большая фри, наггетсы, 2 напитка и 2 соуса.', price:890, emoji:'🌯' },
  { id:'burger-pair', name:'Сет «Бургер Пара»', size:'НА ДВОИХ', description:'2 бургера, фри, луковые кольца, 2 напитка и 2 соуса.', price:960, emoji:'🍔' },
  { id:'sandwich-box', name:'Сет «Сэндвич Бокс»', size:'НА 3-4', description:'Сэндвич с курицей, сэндвич с ветчиной, американский сэндвич, чиабатта-сэндвич, фри и напитки.', price:1390, emoji:'🥪' },
  { id:'east', name:'Сет «Восточный»', size:'НА 3', description:'Донер, гирос, пита, кесадилья, фри, напитки и 3 соуса.', price:1290, emoji:'🥙' },
  { id:'crispy', name:'Сет «Хрустящий»', size:'НА КОМПАНИЮ', description:'Крылышки, наггетсы, рыбные наггетсы, луковые кольца, гренки, фри и 4 соуса.', price:1390, emoji:'🍗' },
  { id:'family', name:'Сет «Семейный»', size:'НА 4', description:'2 шаурмы, 2 бургера, большая фри, наггетсы, салат «Цезарь», напитки и соусы.', price:1790, emoji:'🍔' },
  { id:'salad-lunch', name:'Сет «Легкий обед»', size:'НА 2-3', description:'Цезарь, кавказский салат, салат «Биг Хит», соки и 2 соуса.', price:790, emoji:'🥗' },
  { id:'sweet-table', name:'Сет «Сладкий стол»', size:'НА КОМПАНИЮ', description:'Венские вафли, сырники, пахлава с мороженым, Наполеон, медовик, пончики и чай/кофе.', price:1190, emoji:'🍩' }
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
    sizes: [{ name:'Сэндвич', price:210 }, { name:'Жареный сэндвич', price:230 }, { name:'Американский сэндвич', price:260 }, { name:'Перекрестный сэндвич', price:240 }, { name:'Чиабатта-сэндвич', price:260 }],
    breads: [],
    proteinPrices: { 'Курица': 0, 'Ветчина': 0, 'Говядина': 45 },
    veggies: ['Айсберг', 'Огурец', 'Томат', 'Маринованный огурец', 'Красный лук'],
    extras: [{ name:'Сыр', price:35 }, { name:'Двойное мясо', price:85 }, { name:'Фри внутрь', price:35 }, { name:'Халапеньо', price:30 }, { name:'Грибы', price:40 }]
  }
};

let cart = JSON.parse(localStorage.getItem('jelani_cart') || '[]');
let promoCode = localStorage.getItem('jelani_promo') || '';
let currentCategory = 'all';
let currentComboCategory = 'all';
let activeSearchFilter = '';
let currentBuilderType = 'shawarma';
let currentCombo = null;
let builderState = null;
let orderStatusTimer = null;
let checkoutSubmitting = false;
let pendingCheckoutOrder = null;
let editingComboCartId = null;
let editingBuilderCartId = null;
let pendingSavedOrder = null;
let pendingRepeatItems = [];
let dropCountdownTimer = null;
let pendingPostOrderSave = null;
let engagementState = { bonuses:[], drop:null, taste:null, points:0 };
let authState = { authenticated:false, profile:null, config:null, linking:false };
let pendingAuthPhone = '';
let paymentConfig = { available:false,methods:{bankCard:false,sbp:false,cash:false},receiptEmailRequired:false };
let pendingPaidFollowup = null;

const PROFILE_KEY = 'jelani_profile';
const ACTIVE_ORDERS_KEY = 'jelani_active_orders';
const SAVED_ORDERS_KEY = 'jelani_saved_orders';
const DEVICE_TOKEN_KEY = 'jelani_device_token';
const LOCAL_TASTE_KEY = 'jelani_taste_overrides';
const LOCAL_BONUSES_KEY = 'jelani_active_bonuses';
const PENDING_PAYMENT_KEY = 'jelani_pending_payment';
const TRACKER_HIDE_DELAY = 14000;
const FALLBACK_DROP = {
  id:'drop-2026-07-fire',
  name:'Огненная шаурма DROP',
  description:'Курица, халапеньо, сыр и яркий соус Чили. Только на этой неделе.',
  composition:['Курица','Сыр','Халапеньо','Соус Чили','Свежие овощи'],
  imageUrl:'images/hero-slide-3.png',
  price:349,
  startsAt:'2026-07-12T06:00:00.000Z',
  endsAt:'2026-07-19T17:45:00.000Z',
  quantity:80,
  soldCount:18,
  remaining:62,
  available:true
};
const STATUS_STEPS = {
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

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];

function safeJson(key, fallback){
  try { return JSON.parse(localStorage.getItem(key) || JSON.stringify(fallback)); }
  catch { return fallback; }
}
function saveCart(){ localStorage.setItem('jelani_cart', JSON.stringify(cart)); pendingCheckoutOrder = null; }
function cartSubtotal(){ return cart.reduce((sum,item)=>sum + item.price * item.qty,0); }
function normalizedPromo(){ return promoCode.trim().toUpperCase(); }
function firstOrderPromoAvailable(){ return !localStorage.getItem('jelani_first_order_used') && safeJson('jelani_orders', []).length === 0; }
function promoDiscount(){ return isAuthorized() && normalizedPromo() === 'JELANI10' && firstOrderPromoAvailable() ? Math.round(cartSubtotal() * 0.1) : 0; }
function cartTotal(){ return Math.max(0, cartSubtotal() - promoDiscount() - activeBonusDiscount()); }
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
  if(authState.authenticated && authState.profile) return authState.profile;
  const profile = safeJson(PROFILE_KEY, null);
  return profile && typeof profile === 'object' ? profile : null;
}

function isAuthorized(){
  return Boolean(authState.authenticated && authState.profile?.id);
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

function savedOrders(){
  const current = safeJson(SAVED_ORDERS_KEY, null);
  if(Array.isArray(current)) return current;

  const legacy = safeJson('jelani_favorites', []);
  const migrated = legacy.map((order, index)=>({
    ...order,
    name: order.name || `Любимый заказ ${index + 1}`,
    createdAt: order.createdAt || new Date().toISOString()
  }));
  localStorage.setItem(SAVED_ORDERS_KEY, JSON.stringify(migrated));
  return migrated;
}

function storeSavedOrders(orders){
  localStorage.setItem(SAVED_ORDERS_KEY, JSON.stringify(orders.slice(0,30)));
}

function deviceToken(){
  let token = localStorage.getItem(DEVICE_TOKEN_KEY) || '';
  if(/^[a-f0-9]{64}$/i.test(token)) return token;
  const bytes = new Uint8Array(32);
  window.crypto.getRandomValues(bytes);
  token = [...bytes].map(byte=>byte.toString(16).padStart(2,'0')).join('');
  localStorage.setItem(DEVICE_TOKEN_KEY,token);
  return token;
}

function apiHeaders(jsonBody=false){
  return {
    'X-Device-Token':deviceToken(),
    ...(jsonBody?{'Content-Type':'application/json'}:{})
  };
}

async function apiRequest(path,{method='GET',body=null}={}){
  const response=await fetch(path,{
    method,
    credentials:'same-origin',
    headers:apiHeaders(body!==null),
    ...(body!==null?{body:JSON.stringify(body)}:{})
  });
  const data=await response.json().catch(()=>({ok:false}));
  if(!response.ok||data.ok===false)throw new Error(data.error||'Не удалось выполнить запрос.');
  return data;
}

function setAuthMessage(message='',error=false){
  const element=$('#auth-message');
  if(!element)return;
  element.textContent=message;
  element.classList.toggle('is-error',Boolean(error));
}

function authMethodLabel(provider){
  return {phone:'Телефон',telegram:'Telegram',vk:'VK',ok:'Одноклассники',mail:'Mail.ru',max:'MAX'}[provider]||provider;
}

function renderTelegramLogin(){
  const slot=$('#telegram-login-slot');
  if(!slot)return;
  const telegram=authState.config?.providers?.telegram;
  if(!telegram?.available||!telegram.botUsername){
    slot.dataset.ready='';
    slot.innerHTML='<button type="button" disabled title="Способ входа пока настраивается"><b>TG</b><span>Telegram</span></button>';
    return;
  }
  if(slot.dataset.ready===telegram.botUsername)return;
  slot.innerHTML='';
  const script=document.createElement('script');
  script.src='https://telegram.org/js/telegram-widget.js?22';
  script.async=true;
  script.setAttribute('data-telegram-login',telegram.botUsername);
  script.setAttribute('data-size','large');
  script.setAttribute('data-radius','8');
  script.setAttribute('data-userpic','false');
  script.setAttribute('data-request-access','write');
  script.setAttribute('data-onauth','onTelegramAuth(user)');
  slot.dataset.ready=telegram.botUsername;
  slot.append(script);
}

function renderAuthProviders(){
  const config=authState.config?.providers||{};
  const phoneButton=$('#phone-request-form button[type="submit"]');
  if(phoneButton){
    phoneButton.disabled=!config.phone?.available;
    phoneButton.title=config.phone?.available?'':'Вход по SMS пока настраивается';
  }
  $$('[data-auth-provider]').forEach(button=>{
    const available=Boolean(config[button.dataset.authProvider]?.available);
    button.disabled=!available;
    button.title=available?'':`${authMethodLabel(button.dataset.authProvider)} пока настраивается`;
  });
  renderTelegramLogin();
  if(!Object.values(config).some(provider=>provider?.available))setAuthMessage('Способы входа появятся после настройки ключей на сервере.');
}

function mergeServerOrders(orders){
  if(!Array.isArray(orders))return;
  const local=safeJson('jelani_orders',[]);
  const merged=new Map(local.map(order=>[order.id,order]));
  orders.forEach(order=>merged.set(order.id,order));
  localStorage.setItem('jelani_orders',JSON.stringify([...merged.values()].sort((a,b)=>String(b.createdAt||'').localeCompare(String(a.createdAt||'')))));
}

function applyAuthPayload(data){
  authState.authenticated=Boolean(data?.authenticated!==false&&data?.profile?.id);
  authState.profile=authState.authenticated?data.profile:null;
  authState.linking=false;
  if(authState.profile){
    localStorage.setItem(PROFILE_KEY,JSON.stringify(authState.profile));
    mergeServerOrders(data.orders);
  }
  renderAccount();
  syncPromoInputs();
  renderCart();
}

async function hydrateAuth(){
  const [config,session]=await Promise.all([
    apiRequest('/api/auth/config').catch(()=>null),
    apiRequest('/api/auth/session').catch(()=>null)
  ]);
  authState.config=config||{providers:{phone:{available:false},telegram:{available:false},vk:{available:false},ok:{available:false},mail:{available:false},max:{available:false}}};
  if(session?.authenticated)applyAuthPayload(session);
  else {
    if(session?.authenticated===false)resetPrivateLocalData();
    authState.authenticated=false;
    authState.profile=null;
    renderAccount();
  }
  renderAuthProviders();
  const params=new URLSearchParams(location.search);
  const authResult=params.get('auth');
  if(authResult){
    if(authResult==='success')showToast('Вход выполнен');
    else showToast('Не удалось выполнить вход');
    history.replaceState({},'',`${location.pathname}${location.hash||''}`);
    openHistory();
  }
}

async function requestPhoneCode(event){
  event.preventDefault();
  const phoneInput=$('#auth-phone');
  const phone=formatRussianPhone(phoneInput.value);
  if(!isRussianMobilePhone(phone)){showToast('Введите российский мобильный номер');return;}
  const submit=event.currentTarget.querySelector('button[type="submit"]');
  submit.disabled=true;
  try{
    const data=await apiRequest('/api/auth/phone/request',{method:'POST',body:{phone,name:$('#auth-name').value}});
    pendingAuthPhone=phone;
    $('#phone-code-title').textContent=`Код отправлен на ${phone}`;
    $('#phone-request-form').hidden=true;
    $('#phone-verify-form').hidden=false;
    $('#auth-code').value=data.debugCode||'';
    $('#auth-code').focus();
    setAuthMessage(data.debugCode?`Код для локальной проверки: ${data.debugCode}`:'Код действует 5 минут.');
  }catch(error){setAuthMessage(error.message,true);showToast(error.message);}
  finally{submit.disabled=!authState.config?.providers?.phone?.available;}
}

async function verifyPhoneCode(event){
  event.preventDefault();
  const code=String($('#auth-code').value||'').replace(/\D/g,'');
  if(!/^\d{6}$/.test(code)){showToast('Введите шесть цифр из SMS');return;}
  const submit=event.currentTarget.querySelector('button[type="submit"]');
  submit.disabled=true;
  try{
    const data=await apiRequest('/api/auth/phone/verify',{method:'POST',body:{phone:pendingAuthPhone,code,name:$('#auth-name').value}});
    applyAuthPayload({...data,authenticated:true});
    await Promise.all([hydrateSavedOrders(),hydrateEngagement()]);
    showToast('Номер подтверждён');
  }catch(error){setAuthMessage(error.message,true);showToast(error.message);}
  finally{submit.disabled=false;}
}

function changeAuthPhone(){
  pendingAuthPhone='';
  $('#phone-request-form').hidden=false;
  $('#phone-verify-form').hidden=true;
  $('#auth-code').value='';
  setAuthMessage('');
}

window.onTelegramAuth=async user=>{
  const linking=authState.linking;
  try{
    const data=await apiRequest('/api/auth/telegram',{method:'POST',body:user});
    applyAuthPayload({...data,authenticated:true});
    await Promise.all([hydrateSavedOrders(),hydrateEngagement()]);
    showToast(linking?'Telegram добавлен':'Вход через Telegram выполнен');
  }catch(error){setAuthMessage(error.message,true);showToast(error.message);}
};

async function startOAuth(provider){
  try{
    const mode=authState.authenticated?'link':'login';
    const data=await apiRequest(`/api/auth/oauth/start?provider=${encodeURIComponent(provider)}&mode=${mode}`);
    location.assign(data.url);
  }catch(error){setAuthMessage(error.message,true);showToast(error.message);}
}

let maxBridgePromise;
function maxInitData(){
  if(typeof window.WebApp?.initData==='string'&&window.WebApp.initData)return window.WebApp.initData;
  try{return new URLSearchParams(location.hash.slice(1)).get('WebAppData')||'';}catch{return '';}
}
function loadMaxBridge(){
  if(window.WebApp)return Promise.resolve(window.WebApp);
  if(maxBridgePromise)return maxBridgePromise;
  maxBridgePromise=new Promise((resolve,reject)=>{
    const script=document.createElement('script');
    script.src='https://st.max.ru/js/max-web-app.js';
    script.async=true;
    script.onload=()=>resolve(window.WebApp||null);
    script.onerror=()=>reject(new Error('Не удалось открыть вход через MAX.'));
    document.head.append(script);
  });
  return maxBridgePromise;
}
async function startMaxAuth(){
  const config=authState.config?.providers?.max||{};
  try{
    await loadMaxBridge().catch(()=>null);
    const initData=maxInitData();
    if(initData){
      const linking=authState.authenticated;
      const data=await apiRequest('/api/auth/max',{method:'POST',body:{initData}});
      applyAuthPayload({...data,authenticated:true});
      await Promise.all([hydrateSavedOrders(),hydrateEngagement()]);
      showToast(linking?'MAX добавлен':'Вход через MAX выполнен');
      return;
    }
    if(config.launchUrl){
      const launchUrl=new URL(config.launchUrl,location.origin);
      if(!['https:','http:'].includes(launchUrl.protocol))throw new Error('Ссылка MAX настроена неверно.');
      location.assign(launchUrl.toString());
      return;
    }
    throw new Error('Вход через MAX доступен при открытии сайта из мини-приложения MAX.');
  }catch(error){setAuthMessage(error.message,true);showToast(error.message);}
}
function startAuthProvider(provider){
  if(provider==='max'&&authState.config?.providers?.max?.mode==='miniapp')return startMaxAuth();
  return startOAuth(provider);
}

function resetPrivateLocalData(){
  localStorage.removeItem(PROFILE_KEY);
  localStorage.removeItem('jelani_orders');
  localStorage.removeItem(SAVED_ORDERS_KEY);
  localStorage.removeItem(LOCAL_TASTE_KEY);
  localStorage.removeItem(LOCAL_BONUSES_KEY);
  engagementState.bonuses=[];
  engagementState.taste=null;
}

async function logoutAccount(){
  try{await apiRequest('/api/auth/session',{method:'DELETE'});}catch{}
  resetPrivateLocalData();
  authState={...authState,authenticated:false,profile:null,linking:false};
  renderAccount();
  renderCart();
  showToast('Вы вышли из профиля');
}

async function deleteAccount(){
  const confirmation=window.prompt('Чтобы удалить профиль, напишите УДАЛИТЬ');
  if(String(confirmation||'').toUpperCase()!=='УДАЛИТЬ')return;
  try{
    await apiRequest('/api/account',{method:'DELETE',body:{confirmation}});
    resetPrivateLocalData();
    authState={...authState,authenticated:false,profile:null,linking:false};
    renderAccount();
    renderCart();
    showToast('Профиль удалён');
  }catch(error){showToast(error.message);}
}

function accountAddressRow(address={},index=0){
  return `<div class="account-address-row" data-account-address-row>
    <input data-address-label maxlength="40" aria-label="Название адреса" placeholder="Дом" value="${esc(address.label||`Адрес ${index+1}`)}">
    <input data-address-value maxlength="240" aria-label="Адрес доставки" placeholder="Улица, дом, квартира" value="${esc(address.address||'')}">
    <button type="button" data-remove-account-address="${index}" aria-label="Удалить адрес">×</button>
  </div>`;
}

function accountAddressesFromForm(){
  return $$('[data-account-address-row]').map((row,index)=>({
    id:authState.profile?.addresses?.[index]?.id||'',
    label:row.querySelector('[data-address-label]').value.trim(),
    address:row.querySelector('[data-address-value]').value.trim(),
    isDefault:index===0
  })).filter(item=>item.address);
}

function renderAccountAddresses(addresses=authState.profile?.addresses||[]){
  const root=$('#account-addresses');
  if(!root||root.contains(document.activeElement))return;
  root.innerHTML=(addresses.length?addresses:[{}]).map(accountAddressRow).join('');
}

function addAccountAddress(){
  const addresses=accountAddressesFromForm();
  if(addresses.length>=5){showToast('Можно сохранить до 5 адресов');return;}
  authState.profile={...authState.profile,addresses:[...addresses,{}]};
  renderAccountAddresses(authState.profile.addresses);
}

function removeAccountAddress(index){
  const addresses=accountAddressesFromForm();
  addresses.splice(Number(index),1);
  authState.profile={...authState.profile,addresses};
  renderAccountAddresses(addresses);
}

async function saveAccountProfile(event){
  event.preventDefault();
  if(!isAuthorized())return;
  try{
    const data=await apiRequest('/api/account',{method:'PATCH',body:{name:$('#account-name').value,addresses:accountAddressesFromForm()}});
    authState.profile=data.profile;
    localStorage.setItem(PROFILE_KEY,JSON.stringify(data.profile));
    renderAccount();
    showToast('Профиль обновлён');
  }catch(error){showToast(error.message);}
}

function openLinkMethods(){
  authState.linking=true;
  changeAuthPhone();
  renderAccount();
  renderAuthProviders();
}

function cancelLinkMethods(){
  authState.linking=false;
  renderAccount();
}

async function savedOrdersRequest(method, path='', body=null){
  try {
    const response = await fetch(`/api/saved-orders${path}`, {
      method,
      credentials:'same-origin',
      headers:apiHeaders(Boolean(body)),
      ...(body ? { body:JSON.stringify(body) } : {})
    });
    if(!response.ok) return null;
    return await response.json();
  } catch { return null; }
}

async function syncSavedOrder(order){
  return savedOrdersRequest('POST','',{
    id:order.id,
    name:order.name,
    items:order.items,
    createdAt:order.createdAt
  });
}

async function hydrateSavedOrders(){
  const data = await savedOrdersRequest('GET');
  if(!data?.ok || !Array.isArray(data.orders)) return;
  const local = savedOrders();
  const remoteIds = new Set(data.orders.map(order=>order.id));
  const merged = new Map(local.map(order=>[order.id,order]));
  data.orders.forEach(order=>merged.set(order.id,order));
  storeSavedOrders([...merged.values()].sort((a,b)=>String(b.updatedAt || b.createdAt || '').localeCompare(String(a.updatedAt || a.createdAt || ''))));
  renderAccount();
  await Promise.all(local.filter(order=>!remoteIds.has(order.id)).map(syncSavedOrder));
}

async function engagementRequest(path,method='GET',body=null){
  try {
    const response=await fetch(path,{
      method,
      credentials:'same-origin',
      headers:apiHeaders(Boolean(body)),
      ...(body ? {body:JSON.stringify(body)} : {})
    });
    if(!response.ok) return null;
    return await response.json();
  } catch { return null; }
}

function addLocalCount(map,value,amount=1){
  if(!value) return;
  map.set(String(value),(map.get(String(value))||0)+amount);
}
function topLocalCounts(map,limit=3){
  return [...map.entries()].sort((a,b)=>b[1]-a[1]).slice(0,limit).map(([value])=>value);
}
function buildLocalTasteProfile(){
  const orders=safeJson('jelani_orders',[]).filter(order=>!order.canceled);
  const proteins=new Map(),saucesCount=new Map(),extrasCount=new Map(),sizes=new Map(),sides=new Map(),drinksCount=new Map(),traits=new Map();
  let customizable=0,noOnion=0;
  orders.flatMap(order=>order.items||[]).forEach(item=>{
    const qty=Math.max(1,Number(item.qty||1));
    const id=String(item.id||'').toLowerCase();
    const name=String(item.name||'').toLowerCase();
    const options=item.options||{};
    const meat=Array.isArray(options.meat)?options.meat[0]:options.meat;
    if(meat)addLocalCount(proteins,meat,qty);
    else if(id.includes('chicken')||name.includes('куриц'))addLocalCount(proteins,'Курица',qty);
    else if(id.includes('beef')||name.includes('говядин'))addLocalCount(proteins,'Говядина',qty);
    const itemSauces=['sauces','shawarmaSauces','friesSauce','sauce','twoSauces'].flatMap(key=>optionList(options[key]));
    itemSauces.forEach(value=>addLocalCount(saucesCount,value,qty));
    optionList(options.extras).forEach(value=>addLocalCount(extrasCount,value,qty));
    if(options.size)addLocalCount(sizes,options.size,qty);
    if(options.drink)addLocalCount(drinksCount,options.drink,qty);
    if(id.includes('fries'))addLocalCount(sides,'Картофель фри',qty);
    if(id.includes('nuggets'))addLocalCount(sides,'Наггетсы',qty);
    if(optionList(options.extras).includes('Двойное мясо'))addLocalCount(traits,'more_meat',qty);
    if(optionList(options.extras).includes('Сыр')||name.includes('сыр'))addLocalCount(traits,'cheese',qty);
    if(optionList(options.extras).includes('Халапеньо')||itemSauces.some(value=>['Чили','Аджика'].includes(value)))addLocalCount(traits,'spicy',qty);
    if(id.startsWith('custom-')){
      customizable+=qty;
      const veggies=optionList(options.veggies);
      if(!veggies.some(value=>value.toLowerCase().includes('лук')))noOnion+=qty;
      if(veggies.length>=4)addLocalCount(traits,'more_vegetables',qty);
    }
    if(itemSauces.length>=3)addLocalCount(traits,'more_sauce',qty);
  });
  if(customizable&&noOnion/customizable>=.6)addLocalCount(traits,'no_onion',noOnion);
  if(!traits.has('spicy')&&orders.length)addLocalCount(traits,'mild',1);
  if(![...traits.keys()].some(value=>['more_meat','more_vegetables','more_sauce'].includes(value)))addLocalCount(traits,'balanced',1);
  return { stage:orders.length>=3?'formed':'emerging',orderCount:orders.length,proteins:topLocalCounts(proteins,2),sauces:topLocalCounts(saucesCount,3),extras:topLocalCounts(extrasCount,3),sizes:topLocalCounts(sizes,2),sides:topLocalCounts(sides,3),drinks:topLocalCounts(drinksCount,3),traits:topLocalCounts(traits,8),overrides:safeJson(LOCAL_TASTE_KEY,{}) };
}

const TASTE_LABELS={more_meat:'больше мяса',balanced:'сбалансированный состав',more_vegetables:'больше овощей',more_sauce:'больше соуса',spicy:'острое',mild:'неострое',no_onion:'без лука',cheese:'с сыром'};

function effectiveTaste(profile=engagementState.taste){
  if(!profile)return null;
  const overrides=profile.overrides||{};
  return { ...profile, proteins:overrides.protein?[overrides.protein]:profile.proteins||[], sizes:overrides.size?[overrides.size]:profile.sizes||[], traits:overrides.traits?.length?overrides.traits:profile.traits||[] };
}
function tasteSummary(profile=effectiveTaste()){
  if(!profile)return '';
  return [...(profile.proteins||[]).slice(0,1),...(profile.sauces||[]).slice(0,2),...(profile.traits||[]).slice(0,3).map(value=>TASTE_LABELS[value]||value),...(profile.sizes||[]).slice(0,1)].filter(Boolean).join(' · ');
}
function recommendedCombos(profile=effectiveTaste()){
  if(!profile)return [];
  const protein=profile.proteins?.[0]||'';
  const traits=new Set(profile.traits||[]);
  return combos.map(item=>{
    const text=`${item.name} ${item.description} ${item.composition.join(' ')}`.toLowerCase();
    let score=item.badge?1:0;
    if(protein==='Курица'&&(item.categories.includes('chicken')||text.includes('куриц')))score+=5;
    if(protein==='Говядина'&&(item.id==='burger-combo'||item.flags.includes('meat')))score+=5;
    if(traits.has('spicy')&&['shawarma-combo','quesadilla-combo','doner-combo'].includes(item.id))score+=4;
    if(traits.has('cheese')&&['burger-combo','sandwich-combo','quesadilla-combo'].includes(item.id))score+=4;
    if(traits.has('more_meat')&&['mega-combo','wings-combo','burger-combo'].includes(item.id))score+=4;
    if(traits.has('more_vegetables')&&['shawarma-combo','gyros-combo','doner-combo'].includes(item.id))score+=2;
    if((profile.sides||[]).includes('Наггетсы')&&['fish-combo','wings-combo'].includes(item.id))score+=2;
    return {item,score};
  }).sort((a,b)=>b.score-a.score).slice(0,3).map(result=>result.item);
}

function activeBonus(){
  const now=Date.now();
  return (engagementState.bonuses||[]).find(bonus=>!bonus.usedAt&&!bonus.canceledAt&&new Date(bonus.expiresAt).getTime()>now)||null;
}
function activeBonusDiscount(){
  const bonus=activeBonus();
  if(!bonus)return 0;
  if(bonus.type==='discount_5')return normalizedPromo()?0:Math.round(cartSubtotal()*.05);
  if(bonus.type==='free_sauce'||bonus.type==='free_cheese')return Math.min(35,cartSubtotal());
  if(bonus.type==='free_drink'&&cartSubtotal()>=700)return Math.min(90,cartSubtotal());
  return 0;
}
function formatShortDate(value){
  const date=new Date(value);
  return Number.isNaN(date.getTime())?'':new Intl.DateTimeFormat('ru-RU',{day:'numeric',month:'long'}).format(date);
}

function renderDrop(){
  const section=$('#drop-section');
  const drop=engagementState.drop;
  if(!section)return;
  const active=drop&&drop.available!==false&&new Date(drop.startsAt).getTime()<=Date.now()&&new Date(drop.endsAt).getTime()>Date.now()&&(drop.remaining==null||drop.remaining>0);
  section.hidden=!active;
  if(!active){if(dropCountdownTimer)clearInterval(dropCountdownTimer);return;}
  $('#drop-image').src=drop.imageUrl;
  $('#drop-image').alt=drop.name;
  $('#drop-name').textContent=drop.name;
  $('#drop-description').textContent=drop.description;
  $('#drop-composition').innerHTML=(drop.composition||[]).map(item=>`<span>${esc(item)}</span>`).join('');
  $('#drop-price').textContent=formatPrice(drop.price);
  $('#drop-availability').textContent=drop.remaining==null?'Доступен ограниченное время':`Осталось: ${drop.remaining}`;
  $('#drop-end-date').textContent=`До ${formatShortDate(drop.endsAt)}`;
  $('#add-drop-btn').disabled=!active;
  updateDropCountdown();
  if(dropCountdownTimer)clearInterval(dropCountdownTimer);
  dropCountdownTimer=setInterval(updateDropCountdown,1000);
}
function updateDropCountdown(){
  const drop=engagementState.drop;
  if(!drop)return;
  const remaining=new Date(drop.endsAt).getTime()-Date.now();
  if(remaining<=0){renderDrop();return;}
  const days=Math.floor(remaining/86400000),hours=Math.floor(remaining%86400000/3600000),minutes=Math.floor(remaining%3600000/60000),seconds=Math.floor(remaining%60000/1000);
  $('#drop-countdown').textContent=`${days?`${days}д `:''}${String(hours).padStart(2,'0')}:${String(minutes).padStart(2,'0')}:${String(seconds).padStart(2,'0')}`;
}
function addCurrentDrop(){
  const drop=engagementState.drop;
  if(!drop||drop.available===false||new Date(drop.endsAt).getTime()<=Date.now()||(drop.remaining!=null&&drop.remaining<=0)){
    showToast('Этот JELANI DROP уже закончился');
    return;
  }
  addCart(makeCartItem({id:`drop:${drop.id}`,name:drop.name,price:drop.price,emoji:'🔥',details:(drop.composition||[]).join(', '),options:{dropId:drop.id}}));
}

function recommendationCard(item){
  return `<article class="taste-recommendation-card"><img src="${item.image}" alt="${esc(item.name)}"><div><span>${item.badge||'ДЛЯ ТЕБЯ'}</span><h3>${esc(item.name)}</h3><p>${esc(item.description)}</p><div><strong>${formatPrice(item.price)}</strong><button type="button" data-combo="${item.id}">Настроить комбо</button></div></div></article>`;
}
function renderTaste(){
  const profile=effectiveTaste();
  const section=$('#taste-section');
  const accountCard=$('#taste-profile-card');
  if(!section||!accountCard)return;
  const visible=isAuthorized()&&profile&&profile.orderCount>0;
  section.hidden=!visible;
  accountCard.hidden=!visible;
  if(!visible)return;
  const formed=profile.stage==='formed'||profile.orderCount>=3;
  $('#taste-title').textContent=formed?'Мы собрали комбо специально под твой вкус':'Кажется, тебе нравится…';
  $('#taste-eyebrow').textContent=formed?'ПЕРСОНАЛЬНАЯ ПОДБОРКА':'ТВОЙ ВКУС ФОРМИРУЕТСЯ';
  $('#taste-summary').textContent=tasteSummary(profile)||'Продолжай заказывать, и рекомендации станут точнее.';
  $('#taste-recommendations').innerHTML=recommendedCombos(profile).map(recommendationCard).join('');
  accountCard.innerHTML=`<div><p class="eyebrow">ТЫ ЧАЩЕ ВЫБИРАЕШЬ</p><h3>${formed?'Твой вкусовой профиль':'Кажется, тебе нравится…'}</h3><p>${esc(tasteSummary(profile)||'Пока собираем предпочтения')}</p><small>Учтено заказов: ${profile.orderCount}</small></div><div><button class="secondary-dark-btn" type="button" data-edit-taste>Изменить</button><button class="taste-reset-button" type="button" data-reset-taste>Сбросить</button></div>`;
}

function renderAccountBonus(){
  const root=$('#account-bonus');
  if(!root)return;
  const bonus=activeBonus();
  root.hidden=!bonus&&!engagementState.points;
  if(!bonus){
    root.innerHTML=`<div><p class="eyebrow">БОНУСНЫЕ БАЛЛЫ</p><strong>${engagementState.points} баллов</strong><span>Баланс обновляется после выполненных заказов.</span></div>`;
    return;
  }
  root.innerHTML=`<div><p class="eyebrow">АКТИВНЫЙ БОНУС</p><strong>${esc(bonus.title)}</strong><span>${esc(bonus.conditions||bonus.description)}</span></div><small>до ${formatShortDate(bonus.expiresAt)}${engagementState.points?` · ${engagementState.points} баллов`:''}</small>`;
}

async function hydrateEngagement(){
  const localTaste=buildLocalTasteProfile();
  const [bonusData,dropData,tasteData]=await Promise.all([
    engagementRequest('/api/bonuses'),
    engagementRequest('/api/drop'),
    engagementRequest('/api/taste-profile')
  ]);
  engagementState.bonuses=bonusData?.ok&&Array.isArray(bonusData.bonuses)?bonusData.bonuses:safeJson(LOCAL_BONUSES_KEY,[]);
  engagementState.points=Number(bonusData?.points||0);
  const serverTaste=tasteData?.ok?tasteData.profile:null;
  engagementState.taste=serverTaste&&Number(serverTaste.orderCount||0)>=localTaste.orderCount?serverTaste:{...localTaste,overrides:serverTaste?.overrides||localTaste.overrides};
  engagementState.drop=dropData?.ok?dropData.drop:(['localhost','127.0.0.1'].includes(location.hostname)?FALLBACK_DROP:null);
  localStorage.setItem(LOCAL_BONUSES_KEY,JSON.stringify(engagementState.bonuses));
  renderDrop();
  renderTaste();
  renderAccountBonus();
  renderCart();
}

function openTasteProfile(){
  const profile=effectiveTaste()||buildLocalTasteProfile();
  const overrides=engagementState.taste?.overrides||{};
  $$('input[name="taste-trait"]').forEach(input=>{input.checked=(overrides.traits||profile.traits||[]).includes(input.value);});
  $('#taste-profile-form select[name="taste-protein"]').value=overrides.protein||profile.proteins?.[0]||'';
  const size=overrides.size||profile.sizes?.[0]||'';
  const sizeSelect=$('#taste-profile-form select[name="taste-size"]');
  sizeSelect.value=[...sizeSelect.options].some(option=>option.value===size)?size:'';
  openOverlay('#taste-profile-overlay');
}

async function saveTasteProfile(event){
  event.preventDefault();
  const form=new FormData(event.currentTarget);
  const overrides={traits:form.getAll('taste-trait'),protein:String(form.get('taste-protein')||''),size:String(form.get('taste-size')||'')};
  localStorage.setItem(LOCAL_TASTE_KEY,JSON.stringify(overrides));
  engagementState.taste={...(engagementState.taste||buildLocalTasteProfile()),overrides};
  void engagementRequest('/api/taste-profile','PATCH',overrides);
  closeOverlay('#taste-profile-overlay');
  renderTaste();
  showToast('Вкусовой профиль обновлён');
}

async function resetTasteProfile(){
  localStorage.removeItem(LOCAL_TASTE_KEY);
  void engagementRequest('/api/taste-profile','DELETE');
  engagementState.taste={...buildLocalTasteProfile(),overrides:{}};
  closeOverlay('#taste-profile-overlay');
  renderTaste();
  showToast('Вкусовой профиль сброшен');
}

function revealBonus(bonus){
  if(!bonus)return;
  $('#bonus-name').textContent=bonus.title;
  $('#bonus-description').textContent=bonus.description;
  $('#bonus-conditions').textContent=bonus.conditions||'Действует на один следующий заказ.';
  $('#bonus-expiry').textContent=`до ${formatShortDate(bonus.expiresAt)}`;
  openOverlay('#bonus-overlay');
}

function closeBonusReveal(){
  closeOverlay('#bonus-overlay');
  if(pendingPostOrderSave){
    const order=pendingPostOrderSave;
    pendingPostOrderSave=null;
    openSaveOrderPrompt(order.items,order.total);
  }
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
    status: 'Новый',
    detail: 'Заказ передан на кухню.',
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
  if(normalized.canceled){
    engagementState.taste={...buildLocalTasteProfile(),overrides:engagementState.taste?.overrides||safeJson(LOCAL_TASTE_KEY,{})};
    void hydrateEngagement();
  }
}
function createOrderId(){
  const random=crypto.getRandomValues(new Uint32Array(1))[0]%10000;
  return `JL-${Date.now().toString().slice(-7)}-${String(random).padStart(4,'0')}`;
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
  $('#tracker-status').textContent = order.status || 'Новый';
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
    } catch {}
  }));
}

function startStatusPolling(){
  if(orderStatusTimer) window.clearInterval(orderStatusTimer);
  syncActiveOrderStatuses();
  orderStatusTimer = window.setInterval(syncActiveOrderStatuses, 10000);
}

function accountStatsTemplate(){
  if(isAuthorized()&&authState.profile?.stats){
    const stats=authState.profile.stats;
    return [
      ['Заказы',Number(stats.orderCount||0)],
      ['Потрачено',formatPrice(stats.totalSpent||0)],
      ['Сохранено',Number(stats.savedCount||0)]
    ].map(([label,value])=>`<div class="account-stat"><span>${label}</span><strong>${value}</strong></div>`).join('');
  }
  const orders = safeJson('jelani_orders', []);
  const favorites = savedOrders();
  const spent = orders.reduce((sum, order)=>sum + Number(order.total || 0), 0);
  return [
    ['Заказы', orders.length],
    ['Потрачено', formatPrice(spent)],
    ['Сохранено', favorites.length]
  ].map(([label, value])=>`<div class="account-stat"><span>${label}</span><strong>${value}</strong></div>`).join('');
}

function renderAccount(){
  const authView=$('#auth-view');
  const profileView=$('#account-profile-view');
  const privateContent=$('#account-private-content');
  if(!authView||!profileView)return;
  const authorized=isAuthorized();
  authView.hidden=authorized&&!authState.linking;
  profileView.hidden=!authorized||authState.linking;
  if(privateContent)privateContent.hidden=!authorized||authState.linking;
  const profile = getProfile();
  const nameInput = $('#account-name');
  const phoneInput = $('#account-phone');
  if(authorized){
    if(nameInput&&document.activeElement!==nameInput)nameInput.value=profile?.name||'';
    if(phoneInput)phoneInput.value=profile?.phone||'Добавьте номер через SMS';
    $('#account-display-name').textContent=profile?.name||'Гость JELANI';
    $('#account-display-phone').textContent=profile?.phone||'Телефон ещё не добавлен';
    $('#account-avatar').textContent=(profile?.name||'J').trim().charAt(0).toUpperCase();
    $('#account-state').textContent='Профиль и адреса синхронизируются автоматически.';
    $('#account-method-list').innerHTML=(profile?.loginMethods||[]).map(method=>`<span>${esc(authMethodLabel(method))}</span>`).join('')||'<span>Способ входа не указан</span>';
    $('#account-stats').innerHTML=accountStatsTemplate();
    renderAccountAddresses(profile?.addresses||[]);
  }else{
    const legacy=safeJson(PROFILE_KEY,null);
    if($('#auth-name')&&document.activeElement!==$('#auth-name'))$('#auth-name').value=legacy?.name||'';
    if($('#auth-phone')&&document.activeElement!==$('#auth-phone'))$('#auth-phone').value=legacy?.phone||'';
  }
  $('#auth-heading-label').textContent=authState.linking?'НОВЫЙ СПОСОБ ВХОДА':'ВХОД В ПРОФИЛЬ';
  $('#auth-heading-title').textContent=authState.linking?'Привяжи ещё один сервис':'Заказы и бонусы на любом устройстве';
  $('#auth-heading-copy').textContent=authState.linking?'Подтверди номер или выбери сервис. Профили объединятся автоматически.':'Войдите по подтверждённому номеру или через удобный сервис.';
  $('#auth-cancel-link').hidden=!authState.linking;

  const active = currentActiveOrders()[0];
  const activeEl = $('#account-active');
  if(activeEl){
    activeEl.hidden = !active;
    activeEl.innerHTML = active ? `<strong>${esc(active.id)} - ${esc(active.status || 'Новый')}</strong><p>${esc(active.detail || 'Статус обновляется автоматически.')}</p>` : '';
  }

  const orders = authorized?safeJson('jelani_orders', []):[];
  $('#history-list').innerHTML = orders.length
    ? orders.map(o=>historyTemplate(o)).join('')
    : '<div class="history-empty">Заказов пока нет.<br>Оформленные заказы появятся здесь.</div>';
  renderQuickOrder();
  renderAccountBonus();
  renderTaste();
}

function renderCategories(){
  $('#category-tabs').innerHTML = categoryMeta.map(c=>`<button class="category-tab ${currentCategory===c.id?'active':''}" data-category="${c.id}" type="button">${c.label}</button>`).join('');
}
function comboCardTemplate(item){
  const priceLabel = item.sizes?.length > 1 ? `от ${formatPrice(item.price)}` : formatPrice(item.price);
  const sizeLabel = item.badge || item.sizes?.[0]?.name || 'КОМБО';
  return `<article class="set-card combo-set-card" data-combo="${item.id}">
    <span class="set-size">${sizeLabel}</span>
    <h3>${item.name}</h3>
    <p>${item.description}</p>
    <div class="combo-set-meta">
      <span class="set-price">${priceLabel}</span>
      <small>Выгода ${formatPrice(item.saving)}</small>
    </div>
    <button type="button" data-combo="${item.id}" aria-label="Выбрать ${item.name}">+</button>
  </article>`;
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
function renderCombos(){
  $('#combo-tabs').innerHTML = comboCategories.map(category=>`<button class="combo-tab ${currentComboCategory===category.id?'active':''}" type="button" role="tab" aria-selected="${currentComboCategory===category.id}" data-combo-category="${category.id}">${category.label}</button>`).join('');
  const list = combos.filter(item=>currentComboCategory==='all'||item.categories.includes(currentComboCategory));
  $('#combo-grid').innerHTML = list.map(comboCardTemplate).join('');
}
function renderSets(){ $('#sets-grid').innerHTML = sets.map(item=>cardTemplate(item,'set')).join(''); }
function renderMenu(){
  const list = menuItems.filter(item=>currentCategory==='all'||item.category===currentCategory);
  $('#menu-grid').innerHTML = list.map(item=>cardTemplate(item,'menu')).join('');
}
function findMenuItem(id){ return menuItems.find(item=>item.id===id); }
function findCombo(id){ return combos.find(item=>item.id===id); }
function findSet(id){ return sets.find(item=>item.id===id); }
function makeCartItem({ id, name, price, emoji, details='', options=null }){ return { cartId:`${id}-${Date.now()}-${Math.random().toString(16).slice(2)}`, id, name, price, emoji, details, options, qty:1 }; }
function addCart(item){ cart.push(item); saveCart(); renderCart(); showToast('Добавлено в корзину'); }
function optionList(value){ return Array.isArray(value) ? value : value ? [value] : []; }

function comboDefaultOptions(combo){
  const flags = combo.flags || [];
  const options = { size:combo.sizes?.[0]?.name };
  if(flags.includes('meat') || flags.includes('мясо')) options.meat = 'Курица';
  if(flags.includes('side')) options.side = 'Картофель фри';
  if(flags.includes('sandwich')) options.sandwich = 'Сэндвич с курицей';
  if(flags.includes('morning')) Object.assign(options, { morningBase:'Сырники', morningHot:'Кофе', morningCold:'Смузи' });
  if(flags.includes('sweet')) Object.assign(options, { sweetBase:'Пахлава с мороженым', sweetDrink:'Кофе' });
  if(flags.includes('shawarmaSauces')) options.shawarmaSauces = [];
  if(flags.includes('friesSauce')) options.friesSauce = sauces[0];
  if(flags.includes('drink') || flags.includes('напиток')) options.drink = drinks[0];
  if(flags.includes('gyrosSauce') || flags.includes('gyresSauce')) options.sauce = 'Мацони';
  else if(flags.includes('fishSauce')) options.sauce = 'Кисло-сладкий';
  else if(flags.includes('sauce') || flags.includes('соус')) options.sauce = sauces[0];
  if(flags.includes('twoSauces')) options.twoSauces = sauces.slice(0,2);
  return options;
}

function comboDetails(options={}){
  const labels = { size:'Размер', meat:'Мясо', side:'Гарнир', sandwich:'Сэндвич', morningBase:'Основа', morningHot:'Горячий напиток', morningCold:'Холодный напиток', sweetBase:'Десерт', sweetDrink:'Напиток', drink:'Напиток', shawarmaSauces:'Соусы в шаурму', friesSauce:'Соус к фри', sauce:'Соус', twoSauces:'Соусы' };
  return Object.entries(labels).flatMap(([key,label])=>{
    const values = optionList(options[key]);
    return values.length ? [`${label}: ${values.join(', ')}`] : [];
  }).join(' · ');
}

function comboCartItem(combo, options=comboDefaultOptions(combo)){
  const size = combo.sizes?.find(item=>item.name===options.size) || combo.sizes?.[0];
  return makeCartItem({ id:combo.id, name:combo.name, price:size?.price ?? combo.price, emoji:combo.emoji, details:comboDetails(options), options });
}

function builderPriceForOptions(type, options){
  const base = builderBase[type];
  if(!base || !options) return null;
  const size = base.sizes.find(item=>item.name===options.size);
  if(!size || !Object.prototype.hasOwnProperty.call(base.proteinPrices, options.meat)) return null;
  const extras = optionList(options.extras);
  const selectedSauces = optionList(options.sauces);
  if(extras.some(name=>!base.extras.some(item=>item.name===name)) || selectedSauces.some(name=>!sauces.includes(name))) return null;
  return size.price + base.proteinPrices[options.meat] + extras.reduce((sum,name)=>sum+(base.extras.find(item=>item.name===name)?.price || 0),0) + Math.max(0,selectedSauces.length-2)*35;
}

function builderDetails(options={}){
  return [
    options.meat,
    optionList(options.veggies).length ? optionList(options.veggies).join(', ') : 'без овощей',
    optionList(options.sauces).length ? optionList(options.sauces).join(', ') : 'без соуса',
    optionList(options.extras).join(', ')
  ].filter(Boolean).join(' · ');
}

function repriceCartItem(item){
  if(String(item.id||'').startsWith('drop:')){
    const drop=engagementState.drop;
    const expectedId=String(item.id).slice('drop:'.length);
    const active=drop&&drop.id===expectedId&&drop.available!==false&&new Date(drop.endsAt).getTime()>Date.now()&&(drop.remaining==null||drop.remaining>=Number(item.qty||1));
    return active?{available:true,item:{...item,name:drop.name,price:drop.price,details:(drop.composition||[]).join(', ')}}:{available:false,item,reason:'предложение закончилось или распродано'};
  }
  const menuItem = findMenuItem(item.id);
  if(menuItem) return { available:true, item:{ ...item, name:menuItem.name, price:menuItem.price, emoji:menuItem.emoji } };

  const set = findSet(item.id);
  if(set) return { available:true, item:{ ...item, name:set.name, price:set.price, emoji:set.emoji, details:set.size } };

  const combo = findCombo(item.id);
  if(combo){
    const options = item.options || comboDefaultOptions(combo);
    const size = combo.sizes?.find(value=>value.name===options.size);
    if(!size) return { available:false, item, reason:'выбранный размер больше недоступен' };
    const selectedValues = [options.drink, options.friesSauce, options.sauce, ...optionList(options.shawarmaSauces), ...optionList(options.twoSauces)].filter(Boolean);
    const knownValues = new Set([...drinks, ...sauces, 'Мацони', 'Кисло-сладкий']);
    if(selectedValues.some(value=>!knownValues.has(value))) return { available:false, item, reason:'выбранный вариант больше недоступен' };
    return { available:true, item:{ ...item, name:combo.name, price:size.price, emoji:combo.emoji, details:comboDetails(options), options } };
  }

  if(item.id === 'custom-shawarma' || item.id === 'custom-sandwich'){
    const type = item.id.replace('custom-','');
    const price = builderPriceForOptions(type,item.options);
    if(price == null) return { available:false, item, reason:'состав изменился' };
    return { available:true, item:{ ...item, price, details:builderDetails(item.options) } };
  }

  const upsells = { 'upsell-fries':79, 'upsell-drink':69, 'upsell-sauce':35, 'upsell-cheese':35 };
  if(Object.prototype.hasOwnProperty.call(upsells,item.id)) return { available:true, item:{ ...item, price:upsells[item.id] } };
  return { available:false, item, reason:'позиции больше нет в меню' };
}

function repriceSnapshot(items=[]){
  const checked = items.map(repriceCartItem);
  const available = checked.filter(result=>result.available).map(result=>({ ...result.item, qty:result.item.qty || 1 }));
  const unavailable = checked.filter(result=>!result.available);
  return { available, unavailable, total:available.reduce((sum,item)=>sum+item.price*item.qty,0) };
}

function itemNames(items=[]){
  return items.map(item=>`${item.name}${Number(item.qty || 1) > 1 ? ` × ${item.qty}` : ''}`).join(' · ');
}

function quickOrderCard(ref){
  const item = ref.type === 'menu' ? findMenuItem(ref.id) : ref.type === 'combo' ? findCombo(ref.id) : findSet(ref.id);
  if(!item) return '';
  const description = ref.type === 'combo' ? item.composition.join(' · ') : item.description;
  return `<article class="quick-order-card">
    <div class="quick-order-card__icon" aria-hidden="true">${item.emoji}</div>
    <div class="quick-order-card__body">
      <h3>${esc(item.name)}</h3>
      <p>${esc(description)}</p>
      <strong>${formatPrice(item.price)}</strong>
    </div>
    <button class="primary-btn" type="button" data-quick-add="${ref.type}:${item.id}">Добавить за один клик</button>
    ${ref.type === 'combo' ? `<button class="quick-edit-button" type="button" data-quick-edit="combo:${item.id}">Изменить состав</button>` : ref.type === 'menu' ? '<button class="quick-edit-button" type="button" data-quick-edit="builder:shawarma">Изменить состав</button>' : ''}
  </article>`;
}

function renderQuickOrder(){
  const root = $('#quick-order-content');
  if(!root) return;
  const orders = safeJson('jelani_orders', []);
  const lastOrder = isAuthorized() ? orders[0] : null;

  if(lastOrder){
    const checked = repriceSnapshot(lastOrder.items || []);
    const firstName = String(getProfile()?.name || 'Гость').trim().split(/\s+/)[0];
    const action = checked.unavailable.length ? 'Проверить прошлый заказ' : `Повторить за ${formatPrice(checked.total)}`;
    root.innerHTML = `<div class="quick-order-personal">
      <div class="quick-order-personal__copy">
        <p class="eyebrow">КАК В ПРОШЛЫЙ РАЗ</p>
        <h2>${esc(firstName)}, повторить твой прошлый заказ?</h2>
        <p>${esc(itemNames(lastOrder.items || []))}</p>
        ${checked.unavailable.length ? '<span class="quick-order-warning">Есть позиции, которым нужна замена</span>' : ''}
      </div>
      <div class="quick-order-personal__actions">
        <button class="primary-btn" type="button" data-quick-repeat-order="${esc(lastOrder.id)}">${action}</button>
        <button class="secondary-dark-btn" type="button" data-quick-edit-order="${esc(lastOrder.id)}">Изменить состав</button>
      </div>
    </div>`;
    return;
  }

  const refs = [
    { type:'menu', id:'shawarma-standard-chicken' },
    { type:'combo', id:'shawarma-combo' },
    { type:'set', id:'duet' }
  ];
  root.innerHTML = `<div class="quick-order-heading"><div><p class="eyebrow">БЫСТРЫЙ ЗАКАЗ</p><h2>Не хочешь выбирать? Закажи популярное</h2></div><p>Три готовых варианта из действующего меню. Цена и состав обновляются вместе с ним.</p></div><div class="quick-order-grid">${refs.map(quickOrderCard).join('')}</div>`;
}

function addQuickOrder(value){
  const [type,id] = String(value || '').split(':');
  const source = type === 'menu' ? findMenuItem(id) : type === 'combo' ? findCombo(id) : findSet(id);
  if(!source){ showToast('Эта позиция сейчас недоступна'); return; }
  const item = type === 'combo'
    ? comboCartItem(source)
    : makeCartItem({ id:source.id, name:source.name, price:source.price, emoji:source.emoji, details:type === 'set' ? source.size : '' });
  addCart(item);
}

function replaceOrAddCartItem(item, cartId){
  if(!cartId){ addCart(item); return; }
  const index = cart.findIndex(current=>current.cartId===cartId);
  if(index < 0){ addCart(item); return; }
  cart[index] = { ...item, cartId, qty:cart[index].qty || 1 };
  saveCart();
  renderCart();
  showToast('Состав обновлён');
}
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
  const wrapper=$('#cart-items'), empty=$('#cart-empty'), subtotal=cartSubtotal(), discount=promoDiscount(), bonusDiscount=activeBonusDiscount(), bonus=activeBonus(), total=cartTotal();
  updateCartCount();
  $('#cart-subtotal').textContent=formatPrice(subtotal);
  $('#cart-total').textContent=formatPrice(total);
  $('#checkout-total').textContent=formatPrice(total);
  $('#cart-discount').textContent=`−${formatPrice(discount)}`;
  $('#cart-discount-row').hidden = discount <= 0;
  $('#cart-bonus-row').hidden = !bonus;
  if(bonus){
    $('#cart-bonus-label').textContent=bonus.title;
    $('#cart-bonus').textContent=bonusDiscount>0?`−${formatPrice(bonusDiscount)}`:bonus.type==='double_points'?'x2':bonus.type==='free_drink'&&subtotal<700?`от ${formatPrice(700)}`:'активен';
  }
  $('#cart-upsells').hidden = cart.length === 0;
  syncPromoInputs();
  empty.hidden=cart.length>0;
  wrapper.innerHTML=cart.map(item=>`<article class="cart-row"><div class="cart-row__icon">${item.emoji||'🍽️'}</div><div><div class="cart-row__name">${esc(item.name)}</div>${item.details?`<div class="cart-row__details">${esc(item.details)}</div>`:''}${findCombo(item.id) || item.id === 'shawarma-standard-chicken' || item.id === 'custom-shawarma' || item.id === 'custom-sandwich' ? `<button class="cart-edit" data-cart-edit="${item.cartId}" type="button">изменить состав</button>` : ''}</div><div class="cart-row__right"><div class="cart-row__price">${formatPrice(item.price*item.qty)}</div><div class="cart-qty"><button class="qty-button" data-cart-decrease="${item.cartId}" type="button">−</button><span>${item.qty}</span><button class="qty-button" data-cart-increase="${item.cartId}" type="button">+</button></div><button class="cart-remove" data-cart-remove="${item.cartId}" type="button">убрать</button></div></article>`).join('');
  $('#checkout-btn').disabled=!cart.length;
  const checkoutSubmit=$('#checkout-submit');
  if(checkoutSubmit)checkoutSubmit.disabled=!cart.length||!paymentConfig.available;
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
    const value = typeof option === 'string' ? option : option.name;
    const optionPrice = typeof option === 'string' || option.price == null ? '' : formatPrice(option.price);
    const checked = type === 'checkbox' && key === 'twoSauces'
      ? index < 2
      : required && index === 0;
    return choiceControl(name, value, checked, type, optionPrice);
  }).join('')}</div></div>`;
}
function selectedComboPrice(){
  if(!currentCombo) return 0;
  const selectedSize = valuesByName('combo-size')[0];
  const size = currentCombo.sizes?.find(option=>option.name===selectedSize);
  return size?.price ?? currentCombo.price;
}
function updateComboPrice(){
  if(currentCombo) $('#combo-price').textContent=formatPrice(selectedComboPrice());
}
function applyComboPreset(options={}){
  Object.entries(options).forEach(([key,value])=>{
    const selected = new Set(optionList(value));
    $$(`input[name="combo-${key}"]`).forEach(input=>{ input.checked = selected.has(input.value); });
  });
  syncChoiceOptions($('#combo-form'));
  updateComboPrice();
}
function openCombo(id, cartId=null, presetOptions=null){
  editingComboCartId = cartId;
  currentCombo=findCombo(id); if(!currentCombo)return;
  const f=currentCombo.flags||[];
  $('#combo-modal-hero').innerHTML=`<div class="combo-modal__image"><img src="${currentCombo.image}" alt="${currentCombo.name}"></div><div class="combo-modal__about"><p>${currentCombo.description}</p><div class="combo-composition">${currentCombo.composition.map(item=>`<span>${item}</span>`).join('')}</div><strong>Выгода ${formatPrice(currentCombo.saving)}</strong></div>`;
  let html=getComboControl('Размер комбо',currentCombo.sizes,'size');
  if(f.includes('мясо')||f.includes('meat')) html+=getComboControl('Выбери мясо',['Курица','Говядина'],'meat');
  if(f.includes('side')) html+=getComboControl('Гарнир',['Картофель фри','Луковые кольца'],'side');
  if(f.includes('sandwich')) html+=getComboControl('Сэндвич',['Сэндвич с курицей','Сэндвич с ветчиной','Жареный сэндвич','Американский сэндвич','Перекрестный с курицей','Перекрестный с ветчиной','Чиабатта-сэндвич'],'sandwich');
  if(f.includes('morning')){html+=getComboControl('Основа',['Сырники','Венские вафли'],'morningBase');html+=getComboControl('Горячий напиток',['Кофе','Чай'],'morningHot');html+=getComboControl('Холодный напиток',['Смузи','Сок'],'morningCold');}
  if(f.includes('sweet')){html+=getComboControl('Десерт',['Пахлава с мороженым','Пончики','Наполеон','Медовик'],'sweetBase');html+=getComboControl('Напиток',['Кофе','Чай'],'sweetDrink');}
  if(f.includes('shawarmaSauces')) html+=getComboControl('Соусы в шаурму — можно выбрать сколько угодно',sauces,'shawarmaSauces','checkbox',false);
  if(f.includes('friesSauce')) html+=getComboControl('Соус к картофелю фри — выберите один',sauces,'friesSauce');
  if(f.includes('drink')||f.includes('напиток')) html+=getComboControl('Напиток',drinks,'drink');
  if(f.includes('gyrosSauce')||f.includes('gyresSauce')) html+=getComboControl(currentCombo.sauceLabel||'Соус',['Мацони','Чесночный'],'sauce');
  else if(f.includes('fishSauce')) html+=getComboControl(currentCombo.sauceLabel||'Соус',['Кисло-сладкий','Чесночный'],'sauce');
  else if(f.includes('sauce')||f.includes('соус')) html+=getComboControl(currentCombo.sauceLabel||'Соус',sauces,'sauce');
  if(f.includes('twoSauces')) html+=getComboControl('Два соуса',sauces,'twoSauces','checkbox',false);
  $('#combo-title').textContent=currentCombo.name;
  $('#combo-form').innerHTML=html;
  updateComboPrice();
  syncChoiceOptions($('#combo-form'));
  if(presetOptions) applyComboPreset(presetOptions);
  openOverlay('#combo-overlay');
}
function valuesByName(name){ return $$(`input[name="${name}"]:checked`).map(el=>el.value); }
function addCombo(){
  if(!currentCombo)return; const data=[]; const f=currentCombo.flags||[];
  const options={};
  const detailLabels={size:'Размер',meat:'Мясо',side:'Гарнир',sandwich:'Сэндвич',morningBase:'Основа',morningHot:'Горячий напиток',morningCold:'Холодный напиток',sweetBase:'Десерт',sweetDrink:'Напиток',drink:'Напиток',shawarmaSauces:'Соусы в шаурму',friesSauce:'Соус к фри',sauce:'Соус',twoSauces:'Соусы'};
  const possible=['size','meat','side','sandwich','morningBase','morningHot','morningCold','sweetBase','sweetDrink','drink','shawarmaSauces','friesSauce','sauce','twoSauces'];
  possible.forEach(key=>{const list=valuesByName(`combo-${key}`);if(list.length){options[key]=list.length===1?list[0]:list;data.push(`${detailLabels[key]}: ${list.join(', ')}`);}});
  replaceOrAddCartItem(makeCartItem({id:currentCombo.id,name:currentCombo.name,price:selectedComboPrice(),emoji:currentCombo.emoji,details:data.join(' · '),options}), editingComboCartId);
  editingComboCartId = null;
  closeOverlay('#combo-overlay');
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
  $('#builder-title').textContent=base.title; $('#builder-summary-title').textContent=currentBuilderType==='sandwich'?builderState.size:builderState.size+' '+base.label; $('#builder-preview').textContent=base.icon;
  const sizes=base.sizes.map(s=>radioOption('builder-size',s.name,builderState.size===s.name,formatPrice(s.price))).join('');
  const meats=Object.entries(base.proteinPrices).map(([name,price])=>radioOption('builder-meat',name,builderState.meat===name,price?`+${formatPrice(price)}`:'в базе')).join('');
  const vegetables=base.veggies.map(v=>checkboxOption('builder-veggies',v,builderState.veggies.includes(v),'')).join('');
  const sauceList=sauces.map(s=>checkboxOption('builder-sauces',s,builderState.sauces.includes(s),'')).join('');
  const extras=base.extras.map(e=>checkboxOption('builder-extras',e.name,builderState.extras.includes(e.name),`+${formatPrice(e.price)}`)).join('');
  $('#builder-form').innerHTML=`
    <section class="form-block"><h3>${currentBuilderType==='sandwich'?'Выбери основу':'Выбери размер'}</h3><div class="option-grid">${sizes}</div></section>
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
function openBuilder(type, cartId=null, presetOptions=null){
  currentBuilderType=type;
  editingBuilderCartId=cartId;
  builderState=presetOptions ? {
    ...presetOptions,
    type,
    veggies:[...optionList(presetOptions.veggies)],
    sauces:[...optionList(presetOptions.sauces)],
    extras:[...optionList(presetOptions.extras)]
  } : initialBuilderState(type);
  renderBuilder();
  openOverlay('#builder-overlay');
}
function addBuilder(){
  const base=builderBase[currentBuilderType]; const price=builderPrice(); const details=[builderState.meat, builderState.veggies.length?builderState.veggies.join(', '):'без овощей', builderState.sauces.length?builderState.sauces.join(', '):'без соуса', builderState.extras.join(', ')].filter(Boolean).join(' · ');
  replaceOrAddCartItem(makeCartItem({id:`custom-${currentBuilderType}`,name:`${base.label} — своя сборка`,price,emoji:base.icon,details,options:{...builderState,veggies:[...builderState.veggies],sauces:[...builderState.sauces],extras:[...builderState.extras]}}), editingBuilderCartId);
  editingBuilderCartId = null;
  closeOverlay('#builder-overlay');
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
  return items.map(item=>({ id:item.id, name:item.name, price:item.price, emoji:item.emoji, details:item.details, options:item.options||null, qty:item.qty }));
}
function restoreCart(items){
  cart = (items || []).map(item => ({ ...makeCartItem(item), qty:item.qty || 1 }));
  saveCart();
  renderCart();
  closeOverlays(['#history-overlay', '#favorites-overlay', '#search-overlay', '#availability-overlay', '#save-order-overlay']);
  openOverlay('#cart-overlay');
  showToast('Заказ добавлен в корзину');
}
function saveFavoriteFromCart(){
  if(!cart.length){ showToast('Корзина пока пустая'); return; }
  openSaveOrderPrompt(snapshotItems(),cartTotal());
}
function saveFavoriteOrder(orderId){
  const order = safeJson('jelani_orders', []).find(item=>item.id===orderId);
  if(!order) return;
  openSaveOrderPrompt(snapshotItems(order.items),order.total);
}
function openSaveOrderPrompt(items, total, existingId=null){
  const existing = existingId ? savedOrders().find(order=>order.id===existingId) : null;
  pendingSavedOrder = existing
    ? { ...existing, mode:'rename' }
    : { id:`SAVED-${Date.now().toString().slice(-8)}`, date:new Date().toLocaleString('ru-RU'), createdAt:new Date().toISOString(), total:Number(total || 0), items:snapshotItems(items), mode:'create' };
  $('#save-order-title').textContent = existing ? 'Переименовать заказ' : 'Как назвать заказ?';
  $('#save-order-name').value = existing?.name || '';
  closeOverlays(['#cart-overlay', '#history-overlay', '#favorites-overlay']);
  openOverlay('#save-order-overlay');
  window.setTimeout(()=>$('#save-order-name')?.focus(),100);
}
function savePendingOrder(name){
  if(!pendingSavedOrder) return;
  const cleanName = String(name || '').trim();
  if(!cleanName){ showToast('Введите название заказа'); return; }
  const orders = savedOrders();
  if(pendingSavedOrder.mode === 'rename'){
    const updatedAt = new Date().toISOString();
    const next = orders.map(order=>order.id===pendingSavedOrder.id ? { ...order, name:cleanName, updatedAt } : order);
    storeSavedOrders(next);
    void savedOrdersRequest('PATCH',`/${encodeURIComponent(pendingSavedOrder.id)}`,{ name:cleanName });
    showToast('Заказ переименован');
  } else {
    const { mode, ...draft } = pendingSavedOrder;
    const saved = { ...draft, name:cleanName, updatedAt:new Date().toISOString() };
    storeSavedOrders([saved, ...orders]);
    void syncSavedOrder(saved);
    showToast('Заказ сохранён');
  }
  pendingSavedOrder = null;
  closeOverlay('#save-order-overlay');
  renderAccount();
  if($('#favorites-overlay')?.classList.contains('open')) openFavorites();
}
function updateDeliveryFields(){
  const select = $('#delivery-select');
  const field = $('#address-field');
  const input = field?.querySelector('input');
  const needsAddress = select?.value === 'Доставка';
  if(field) field.hidden = !needsAddress;
  if(input) input.required = needsAddress;
  renderPaymentConfig();
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
function renderPaymentConfig(){
  const methods=paymentConfig.methods||{};
  const inputs=$$('#payment-methods input[name="payment"]');
  const pickup=$('#delivery-select')?.value!=='Доставка';
  inputs.forEach(input=>{
    const methodAvailable=input.value==='bank_card'?methods.bankCard:input.value==='sbp'?methods.sbp:methods.cash&&pickup;
    const enabled=paymentConfig.available&&methodAvailable;
    input.disabled=!enabled;
    if(!enabled)input.checked=false;
  });
  if(!inputs.some(input=>input.checked&&!input.disabled)){
    const preferred=inputs.find(input=>!input.disabled);
    if(preferred)preferred.checked=true;
  }
  const emailField=$('#receipt-email-field');
  const emailInput=emailField?.querySelector('input');
  const selected=inputs.find(input=>input.checked&&!input.disabled);
  const cashSelected=selected?.value==='cash';
  const needsReceiptEmail=Boolean(paymentConfig.receiptEmailRequired&&!cashSelected&&selected);
  if(emailField)emailField.hidden=!needsReceiptEmail;
  if(emailInput)emailInput.required=needsReceiptEmail;
  const status=$('#payment-status');
  const ready=Boolean(selected);
  status?.classList.toggle('is-ready',ready);
  status?.classList.toggle('is-error',!ready);
  if($('#payment-status-title'))$('#payment-status-title').textContent=cashSelected
    ? 'Оплата при получении'
    : ready ? 'Безопасная предоплата' : pickup ? 'Выберите способ оплаты' : 'Для доставки нужна онлайн-оплата';
  if($('#payment-status-copy'))$('#payment-status-copy').textContent=cashSelected
    ? 'Оплатите заказ наличными при самовывозе.'
    : ready ? 'После подтверждения оплаты заказ автоматически поступит на кухню.'
      : pickup ? 'Доступные способы оплаты появятся здесь.' : 'Наличные доступны только при самовывозе.';
  if($('#checkout-note'))$('#checkout-note').textContent=cashSelected
    ? 'После оформления мы сразу передадим заказ на кухню. Статус появится здесь автоматически.'
    : 'После подтверждения оплаты мы сразу передадим заказ на кухню. Статус появится здесь автоматически.';
  const submit=$('#checkout-submit');
  if(submit){
    submit.disabled=!ready||!cart.length;
    submit.innerHTML=cashSelected?'Оформить заказ <span>→</span>':'Перейти к оплате <span>→</span>';
  }
}
async function hydratePaymentConfig(){
  try{
    const config=await apiRequest('/api/payment/config');
    paymentConfig={...paymentConfig,...config};
  }catch{
    const localPreview=['127.0.0.1','localhost'].includes(location.hostname);
    paymentConfig={available:localPreview,methods:{bankCard:false,sbp:false,cash:localPreview},receiptEmailRequired:false};
  }
  renderPaymentConfig();
}
function openCheckout(){
  if(!cart.length){showToast('Сначала добавь позиции в корзину');return;}
  $('#checkout-total').textContent=formatPrice(cartTotal());
  const profile = getProfile();
  const form = $('#checkout-form');
  if(profile && form){
    const nameInput = form.querySelector('input[name="name"]');
    const phoneInput = form.querySelector('input[name="phone"]');
    const addressInput = form.querySelector('input[name="address"]');
    const emailInput = form.querySelector('input[name="email"]');
    if(nameInput && !nameInput.value) nameInput.value = profile.name || '';
    if(phoneInput && !phoneInput.value) phoneInput.value = profile.phone || '';
    if(addressInput && !addressInput.value) addressInput.value = profile.addresses?.find(address=>address.isDefault)?.address || profile.addresses?.[0]?.address || '';
    if(emailInput && !emailInput.value) emailInput.value = profile.identities?.find(identity=>identity.email)?.email || '';
  }
  renderPaymentConfig();
  syncPromoInputs();
  updateDeliveryFields();
  closeOverlay('#cart-overlay');
  openOverlay('#checkout-overlay');
}
async function sendOrderToServer(order){
  const response = await fetch('/api/order', {
    method:'POST',
    credentials:'same-origin',
    headers:apiHeaders(true),
    body:JSON.stringify(order)
  });
  const data = await response.json().catch(()=>({ ok:false }));
  if(!response.ok || data.ok === false) throw new Error(data.error || 'Не удалось создать оплату. Попробуйте ещё раз.');
  return data;
}
function storePendingPayment(order){
  localStorage.setItem(PENDING_PAYMENT_KEY,JSON.stringify({order,createdAt:new Date().toISOString()}));
}
function pendingPayment(){
  return safeJson(PENDING_PAYMENT_KEY,null);
}
function setPaymentResult(state,title,copy){
  const modal=$('#payment-overlay .payment-result-modal');
  const mark=$('#payment-result-mark');
  const check=$('#payment-check');
  const retry=$('#payment-retry');
  modal?.classList.toggle('is-success',state==='success');
  modal?.classList.toggle('is-canceled',state==='canceled'||state==='error');
  if($('#payment-result-title'))$('#payment-result-title').textContent=title;
  if($('#payment-result-copy'))$('#payment-result-copy').textContent=copy;
  if(mark)mark.textContent=state==='success'?'✓':state==='canceled'||state==='error'?'×':'•••';
  if(check){
    check.hidden=state==='canceled';
    check.disabled=state==='checking';
    check.dataset.paymentAction=state==='success'?'done':'check';
    check.innerHTML=state==='success'?'Перейти к заказу <span>→</span>':state==='checking'?'Проверяем...':'Проверить ещё раз <span>→</span>';
  }
  if(retry)retry.hidden=state!=='canceled';
}
function clearPaymentQuery(){
  const url=new URL(location.href);
  url.searchParams.delete('payment');
  url.searchParams.delete('order');
  url.searchParams.delete('track');
  history.replaceState({},'',`${url.pathname}${url.search}${url.hash}`);
}
function completePaidCheckout(data,order){
  const status=data.status||localStatusFromOrder(order);
  order.subtotal=Number(data.order?.subtotal??order.subtotal);
  order.discount=Number(data.order?.discount??order.discount);
  order.total=Number(data.order?.total??order.total);
  if(Array.isArray(data.order?.items))order.items=data.order.items;
  order.status=status.status;
  order.statusDetail=status.detail;
  order.tracking=true;
  order.paymentStatus=data.payment?.status||status.paymentStatus||'succeeded';
  order.awardedBonus=data.awardedBonus||null;
  if(Array.isArray(data.activeBonuses)){
    engagementState.bonuses=data.activeBonuses;
    localStorage.setItem(LOCAL_BONUSES_KEY,JSON.stringify(data.activeBonuses));
  }
  upsertActiveOrder(status,order.trackingToken);
  const orders=safeJson('jelani_orders',[]).filter(item=>item.id!==order.id);
  orders.unshift(order);
  localStorage.setItem('jelani_orders',JSON.stringify(orders.slice(0,30)));
  engagementState.taste={...buildLocalTasteProfile(),overrides:engagementState.taste?.overrides||safeJson(LOCAL_TASTE_KEY,{})};
  if(order.discount>0&&String(order.promo||'').toUpperCase()==='JELANI10')localStorage.setItem('jelani_first_order_used','true');
  promoCode='';
  localStorage.removeItem('jelani_promo');
  localStorage.removeItem(PENDING_PAYMENT_KEY);
  pendingCheckoutOrder=null;
  cart=[];
  saveCart();
  const form=$('#checkout-form');
  form?.reset();
  updateDeliveryFields();
  renderCart();
  renderPaymentConfig();
  renderAccount();
  checkoutSubmitting=false;
  pendingPaidFollowup={order,bonus:order.awardedBonus};
  clearPaymentQuery();
  closeOverlay('#checkout-overlay');
  openOverlay('#payment-overlay');
  const cashOrder=order.paymentStatus==='cash_on_pickup';
  setPaymentResult('success',cashOrder?'Заказ принят':'Оплата прошла',cashOrder
    ? `Заказ ${order.id} передан на кухню. Оплата наличными при самовывозе.`
    : `Заказ ${order.id} передан на кухню. Статус будет обновляться автоматически.`);
}
function finishPaymentFollowup(){
  closeOverlay('#payment-overlay');
  if(!pendingPaidFollowup)return;
  const {order,bonus}=pendingPaidFollowup;
  pendingPaidFollowup=null;
  showToast(`Заказ ${order.id} принят`);
  renderAccountBonus();
  renderTaste();
  if(bonus){pendingPostOrderSave=order;revealBonus(bonus);}
  else openSaveOrderPrompt(order.items,order.total);
}
function retryCanceledPayment(){
  localStorage.removeItem(PENDING_PAYMENT_KEY);
  pendingCheckoutOrder=null;
  checkoutSubmitting=false;
  clearPaymentQuery();
  closeOverlay('#payment-overlay');
  openCheckout();
}
async function checkReturnedPayment(){
  const params=new URLSearchParams(location.search);
  const pending=pendingPayment();
  const orderId=params.get('order')||pending?.order?.id||'';
  const trackingToken=params.get('track')||pending?.order?.trackingToken||'';
  if(!orderId||!trackingToken){
    setPaymentResult('error','Не удалось найти заказ','Откройте личный кабинет или свяжитесь с нами, если деньги списались.');
    return;
  }
  setPaymentResult('checking','Проверяем оплату','Получаем актуальный статус напрямую у платёжного сервиса.');
  try{
    const data=await apiRequest(`/api/payment/status?id=${encodeURIComponent(orderId)}&track=${encodeURIComponent(trackingToken)}`);
    const paymentStatus=data.payment?.status||data.status?.paymentStatus||'pending';
    if(paymentStatus==='succeeded'||paymentStatus==='refunded'){
      const order=pending?.order||{
        id:orderId,trackingToken,date:new Date().toLocaleString('ru-RU'),delivery:data.status?.delivery||'',
        items:data.order?.items||[],subtotal:data.order?.subtotal||0,discount:data.order?.discount||0,total:data.order?.total||0
      };
      completePaidCheckout(data,order);
      return;
    }
    if(paymentStatus==='canceled'){
      localStorage.removeItem(PENDING_PAYMENT_KEY);
      pendingCheckoutOrder=null;
      clearPaymentQuery();
      setPaymentResult('canceled','Оплата не завершена','Деньги не списаны. Корзина сохранена, можно выбрать способ оплаты и попробовать ещё раз.');
      return;
    }
    setPaymentResult('pending','Ждём подтверждение','Платёж ещё обрабатывается. Обычно это занимает несколько секунд.');
  }catch(error){
    setPaymentResult('error','Не удалось проверить оплату',error.message||'Попробуйте проверить статус ещё раз.');
  }
}
function handlePaymentReturn(){
  if(new URLSearchParams(location.search).get('payment')!=='return')return;
  openOverlay('#payment-overlay');
  void checkReturnedPayment();
}
async function completeCheckout(event){
  event.preventDefault();
  if(checkoutSubmitting) return;
  if(!paymentConfig.available){showToast('Приём заказов пока настраивается');return;}
  const formEl = event.currentTarget;
  const submit = formEl.querySelector('button[type="submit"]');
  const form = new FormData(formEl);
  const payment = form.get('payment');
  if(!payment){
    showToast('Выберите способ оплаты');
    return;
  }
  const selectedPayment=formEl.querySelector('input[name="payment"]:checked');
  if(!selectedPayment||selectedPayment.disabled){showToast('Этот способ оплаты сейчас недоступен');return;}
  if(payment==='cash'&&form.get('delivery')!=='Самовывоз'){
    showToast('Наличные доступны только при самовывозе');
    return;
  }
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
  } catch {}
  promoCode = String(form.get('promo') || promoCode || '').trim().toUpperCase();
  if(promoCode && !isAuthorized()){
    promoCode = '';
    localStorage.removeItem('jelani_promo');
    syncPromoInputs();
    openHistory();
    showToast('Сначала войдите в профиль для промокода');
    return;
  }
  if(promoCode) localStorage.setItem('jelani_promo', promoCode);
  else localStorage.removeItem('jelani_promo');
  const discount = promoDiscount() + activeBonusDiscount();
  const selectedBonus = activeBonus();
  const trackingToken = createTrackingToken();
  const order = pendingCheckoutOrder || {
    id:createOrderId(),
    status:'Новый',
    date:new Date().toLocaleString('ru-RU'),
    name:customerName,
    phone:phoneInput.value,
    delivery:form.get('delivery'),
    address:form.get('address') || '',
    email:form.get('email') || '',
    payment,
    comment:form.get('comment') || '',
    promo:normalizedPromo(),
    subtotal:cartSubtotal(),
    discount,
    total:cartTotal(),
    bonusId:selectedBonus?.id || '',
    items:snapshotItems(),
    trackingToken,
    profile:profilePayload()
  };
  pendingCheckoutOrder = order;

  const initialSubmitHtml = submit.innerHTML;
  checkoutSubmitting = true;
  submit.disabled = true;
  submit.textContent = payment==='cash'?'Отправляем заказ...':'Создаём оплату...';
  try {
    const data = await sendOrderToServer(order);
    order.subtotal = Number(data.order?.subtotal ?? order.subtotal);
    order.discount = Number(data.order?.discount ?? order.discount);
    order.total = Number(data.order?.total ?? order.total);
    if(Array.isArray(data.order?.items)) order.items = data.order.items;
    storePendingPayment(order);
    if(data.payment?.status==='succeeded'||data.payment?.status==='cash_on_pickup'){
      completePaidCheckout(data,order);
      submit.innerHTML=initialSubmitHtml;
      return;
    }
    if(data.payment?.status==='canceled'){
      localStorage.removeItem(PENDING_PAYMENT_KEY);
      pendingCheckoutOrder=null;
      checkoutSubmitting=false;
      submit.disabled=false;
      submit.innerHTML=initialSubmitHtml;
      openOverlay('#payment-overlay');
      setPaymentResult('canceled','Оплата не завершена','Корзина сохранена. Выберите способ оплаты и попробуйте ещё раз.');
      return;
    }
    const confirmationUrl=String(data.payment?.confirmationUrl||'');
    if(!/^https:\/\//.test(confirmationUrl))throw new Error('Платёжный сервис не вернул ссылку для оплаты.');
    submit.textContent='Переходим к оплате...';
    location.assign(confirmationUrl);
    return;
  } catch (error) {
    checkoutSubmitting = false;
    if(error.message==='Время оплаты истекло. Оформите заказ заново.'){
      pendingCheckoutOrder=null;
      localStorage.removeItem(PENDING_PAYMENT_KEY);
    }
    submit.disabled = false;
    submit.innerHTML = initialSubmitHtml;
    showToast(error.message || 'Не удалось создать оплату. Попробуйте ещё раз.');
    return;
  }
}
function orderSummary(order){
  const count=(order.items||[]).reduce((sum,item)=>sum+(item.qty||1),0);
  const delivery = order.delivery ? ` · ${esc(order.delivery)}` : '';
  const status = order.status || (order.delivery ? 'Новый' : 'Любимый заказ');
  return `${order.date}${delivery} · ${count} поз. · ${esc(status)}`;
}
function historyTemplate(order, favorite=false){
  return `<article class="history-item">
    <div class="history-item__top"><span>${esc(order.id)}</span><span>${formatPrice(order.total)}</span></div>
    <p>${orderSummary(order)}</p>
    ${order.statusDetail ? `<div class="history-item__status">${esc(order.statusDetail)}</div>` : ''}
    <div class="history-item__actions">
      <button type="button" data-repeat-${favorite ? 'favorite' : 'order'}="${order.id}">Заказать снова</button>
      ${favorite ? '' : `<button type="button" data-favorite-order="${order.id}">Сохранить заказ</button>`}
    </div>
  </article>`;
}
function savedOrderTemplate(order){
  const checked = repriceSnapshot(order.items || []);
  const changed = Number(order.total || 0) !== checked.total;
  return `<article class="history-item saved-order-item">
    <div class="history-item__top"><strong>${esc(order.name || 'Сохранённый заказ')}</strong><span>${formatPrice(checked.total)}</span></div>
    <p>${esc(itemNames(order.items || []))}</p>
    ${checked.unavailable.length ? `<div class="saved-order-notice">Нужна замена: ${checked.unavailable.map(result=>esc(result.item.name)).join(', ')}</div>` : changed ? '<div class="saved-order-notice">Цена обновлена по текущему меню</div>' : ''}
    <div class="history-item__actions">
      <button type="button" data-repeat-favorite="${order.id}">Повторить</button>
      <button type="button" data-edit-saved-order="${order.id}">Изменить состав</button>
      <button type="button" data-rename-saved-order="${order.id}">Переименовать</button>
      <button type="button" data-delete-saved-order="${order.id}">Удалить</button>
    </div>
  </article>`;
}
function openHistory(){
  renderAccount();
  closeOverlays(['#favorites-overlay', '#cart-overlay']);
  openOverlay('#history-overlay');
}
function openFavorites(){
  const favorites=savedOrders();
  $('#favorites-list').innerHTML=favorites.length?favorites.map(savedOrderTemplate).join(''):'<div class="history-empty">Сохранённых заказов пока нет.<br>Сохрани корзину или заказ из истории.</div>';
  closeOverlays(['#history-overlay', '#cart-overlay']);
  openOverlay('#favorites-overlay');
}
function prepareRepeat(items){
  const checked = repriceSnapshot(items || []);
  if(!checked.unavailable.length){ restoreCart(checked.available); return; }
  pendingRepeatItems = checked.available;
  $('#availability-list').innerHTML = checked.unavailable.map(result=>`<div><strong>${esc(result.item.name)}</strong><span>${esc(result.reason)}</span></div>`).join('');
  $('#repeat-available-btn').disabled = checked.available.length === 0;
  closeOverlays(['#history-overlay', '#favorites-overlay', '#cart-overlay']);
  openOverlay('#availability-overlay');
}
function repeatOrder(orderId){
  const order = safeJson('jelani_orders', []).find(item=>item.id===orderId);
  if(order) prepareRepeat(order.items);
}
function repeatFavorite(orderId){
  const order = savedOrders().find(item=>item.id===orderId);
  if(order) prepareRepeat(order.items);
}
function renameSavedOrder(orderId){
  const order = savedOrders().find(item=>item.id===orderId);
  if(order) openSaveOrderPrompt(order.items,order.total,order.id);
}
function deleteSavedOrder(orderId){
  const order = savedOrders().find(item=>item.id===orderId);
  if(!order || !window.confirm(`Удалить «${order.name}»?`)) return;
  storeSavedOrders(savedOrders().filter(item=>item.id!==orderId));
  void savedOrdersRequest('DELETE',`/${encodeURIComponent(orderId)}`);
  openFavorites();
  renderAccount();
  showToast('Заказ удалён');
}
function editCartItem(cartId){
  const item = cart.find(current=>current.cartId===cartId);
  if(!item) return;
  closeOverlay('#cart-overlay');
  const combo = findCombo(item.id);
  if(combo){ openCombo(combo.id,cartId,item.options || comboDefaultOptions(combo)); return; }
  if(item.id === 'shawarma-standard-chicken'){
    openBuilder('shawarma',cartId,initialBuilderState('shawarma'));
    return;
  }
  if(item.id === 'custom-shawarma' || item.id === 'custom-sandwich'){
    openBuilder(item.id.replace('custom-',''),cartId,item.options);
  }
}
function openSearchModal(query=''){
  activeSearchFilter = '';
  $('#search-input').value = query;
  renderSearch(query);
  openOverlay('#search-overlay');
  window.setTimeout(()=>$('#search-input')?.focus(),100);
}
function searchMatches(item, clean){
  return !clean || `${item.name} ${item.description || ''} ${item.category || ''} ${(item.tags||[]).join(' ')}`.toLowerCase().includes(clean);
}
function filterMenuItem(item, filter){
  const text = `${item.name} ${item.description} ${(item.tags||[]).join(' ')}`.toLowerCase();
  if(filter === 'spicy') return text.includes('чили') || text.includes('халапеньо') || text.includes('остр');
  if(filter === 'beef') return text.includes('говядин');
  if(filter === 'under300') return item.price <= 300;
  if(filter === 'meatless') return !/(куриц|говядин|мяс|крыл|наггет|бургер|донер|шаурм|бекон|ветчин)/.test(text);
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
    if(target.dataset.comboCategory){currentComboCategory=target.dataset.comboCategory;renderCombos();}
    if(target.dataset.category){currentCategory=target.dataset.category;renderCategories();renderMenu();}
    if(target.dataset.add){const item=findMenuItem(target.dataset.add);if(item)addCart(makeCartItem({id:item.id,name:item.name,price:item.price,emoji:item.emoji,details:''}));}
    if(target.dataset.set){const item=findSet(target.dataset.set);if(item)addCart(makeCartItem({id:item.id,name:item.name,price:item.price,emoji:item.emoji,details:item.size}));}
    if(target.dataset.quickAdd) addQuickOrder(target.dataset.quickAdd);
    if(target.dataset.quickEdit){
      const [type,id] = target.dataset.quickEdit.split(':');
      if(type === 'combo') openCombo(id);
      if(type === 'builder') openBuilder(id);
    }
    if(target.dataset.quickRepeatOrder) repeatOrder(target.dataset.quickRepeatOrder);
    if(target.dataset.quickEditOrder) repeatOrder(target.dataset.quickEditOrder);
    if(target.dataset.editTaste !== undefined) openTasteProfile();
    if(target.dataset.resetTaste !== undefined && window.confirm('Сбросить вкусовой профиль?')) resetTasteProfile();
    if(target.dataset.upsell) addUpsell(target.dataset.upsell);
    if(target.dataset.repeatOrder) repeatOrder(target.dataset.repeatOrder);
    if(target.dataset.repeatFavorite) repeatFavorite(target.dataset.repeatFavorite);
    if(target.dataset.favoriteOrder) saveFavoriteOrder(target.dataset.favoriteOrder);
    if(target.dataset.editSavedOrder) repeatFavorite(target.dataset.editSavedOrder);
    if(target.dataset.renameSavedOrder) renameSavedOrder(target.dataset.renameSavedOrder);
    if(target.dataset.deleteSavedOrder) deleteSavedOrder(target.dataset.deleteSavedOrder);
    if(target.dataset.savedName !== undefined) $('#save-order-name').value = target.dataset.savedName;
    if(target.dataset.openFavorites !== undefined){closeMobileMenu();openFavorites();}
    if(target.dataset.searchFilter){activeSearchFilter = activeSearchFilter === target.dataset.searchFilter ? '' : target.dataset.searchFilter; renderSearch($('#search-input').value);}
    if(target.dataset.reviewAction) showToast('Спасибо! Раздел отзывов скоро появится');
    if(target.dataset.cartIncrease)changeCart(target.dataset.cartIncrease,1);
    if(target.dataset.cartDecrease)changeCart(target.dataset.cartDecrease,-1);
    if(target.dataset.cartEdit)editCartItem(target.dataset.cartEdit);
    if(target.dataset.cartRemove){cart=cart.filter(item=>item.cartId!==target.dataset.cartRemove);saveCart();renderCart();}
    if(target.dataset.authProvider)void startAuthProvider(target.dataset.authProvider);
    if(target.dataset.removeAccountAddress!==undefined)removeAccountAddress(target.dataset.removeAccountAddress);
  });
  $('#open-cart').addEventListener('click',()=>openOverlay('#cart-overlay')); $('#mobile-cart').addEventListener('click',()=>openOverlay('#cart-overlay')); $('#close-cart').addEventListener('click',()=>closeOverlay('#cart-overlay'));
  $('#mobile-menu-toggle')?.addEventListener('click',toggleMobileMenu);
  $('#close-mobile-menu')?.addEventListener('click',closeMobileMenu);
  $$('.mobile-menu a').forEach(link=>link.addEventListener('click',closeMobileMenu));
  $$('[data-open-history]').forEach(button=>button.addEventListener('click',()=>{closeMobileMenu();openHistory();}));
  $('#favorites-btn')?.addEventListener('click',openFavorites);
  $('#close-builder').addEventListener('click',()=>closeOverlay('#builder-overlay')); $('#close-combo').addEventListener('click',()=>closeOverlay('#combo-overlay')); $('#close-checkout').addEventListener('click',()=>closeOverlay('#checkout-overlay')); $('#close-history').addEventListener('click',()=>closeOverlay('#history-overlay')); $('#close-favorites').addEventListener('click',()=>closeOverlay('#favorites-overlay')); $('#close-search').addEventListener('click',()=>closeOverlay('#search-overlay')); $('#close-save-order').addEventListener('click',()=>closeOverlay('#save-order-overlay')); $('#close-availability').addEventListener('click',()=>closeOverlay('#availability-overlay')); $('#close-bonus').addEventListener('click',closeBonusReveal); $('#close-taste-profile').addEventListener('click',()=>closeOverlay('#taste-profile-overlay'));
  $('#close-payment-result')?.addEventListener('click',finishPaymentFollowup);
  $('#payment-check')?.addEventListener('click',event=>{
    if(event.currentTarget.dataset.paymentAction==='done')finishPaymentFollowup();
    else void checkReturnedPayment();
  });
  $('#payment-retry')?.addEventListener('click',retryCanceledPayment);
  $('#checkout-btn').addEventListener('click',openCheckout); $('#save-favorite-btn').addEventListener('click',saveFavoriteFromCart); $('#add-combo-to-cart').addEventListener('click',addCombo); $('#add-builder-to-cart').addEventListener('click',addBuilder); $('#checkout-form').addEventListener('submit',completeCheckout); $('#order-history-btn').addEventListener('click',openHistory);
  $('#apply-promo').addEventListener('click',()=>applyPromo($('#promo-code').value));
  $('#promo-code').addEventListener('keydown',event=>{ if(event.key === 'Enter'){ event.preventDefault(); applyPromo(event.currentTarget.value); } });
  $('#checkout-promo').addEventListener('input',event=>applyPromo(event.currentTarget.value));
  $('#phone-request-form')?.addEventListener('submit',requestPhoneCode);
  $('#phone-verify-form')?.addEventListener('submit',verifyPhoneCode);
  $('#auth-change-phone')?.addEventListener('click',changeAuthPhone);
  $('#auth-cancel-link')?.addEventListener('click',cancelLinkMethods);
  $('#account-form')?.addEventListener('submit',saveAccountProfile);
  $('#add-account-address')?.addEventListener('click',addAccountAddress);
  $('#link-login-method')?.addEventListener('click',openLinkMethods);
  $('#account-logout')?.addEventListener('click',()=>void logoutAccount());
  $('#account-delete')?.addEventListener('click',()=>void deleteAccount());
  $('#save-order-form')?.addEventListener('submit',event=>{
    event.preventDefault();
    savePendingOrder($('#save-order-name').value);
  });
  $('#add-drop-btn')?.addEventListener('click',addCurrentDrop);
  $('#bonus-continue')?.addEventListener('click',closeBonusReveal);
  $('#taste-profile-form')?.addEventListener('submit',saveTasteProfile);
  $('#reset-taste-profile')?.addEventListener('click',()=>{if(window.confirm('Сбросить вкусовой профиль?'))resetTasteProfile();});
  $('#repeat-available-btn')?.addEventListener('click',()=>{
    if(pendingRepeatItems.length) restoreCart(pendingRepeatItems);
  });
  $('#find-replacement-btn')?.addEventListener('click',()=>{
    cart = pendingRepeatItems.map(item=>({ ...makeCartItem(item), qty:item.qty || 1 }));
    pendingRepeatItems = [];
    saveCart();
    renderCart();
    closeOverlay('#availability-overlay');
    openSearchModal();
  });
  $('#tracker-close')?.addEventListener('click',()=>{
    const order = currentActiveOrders()[0];
    if(order) dismissActiveOrder(order.id);
  });
  $('#tracker-received')?.addEventListener('click',()=>{
    const order = currentActiveOrders()[0];
    if(order) dismissActiveOrder(order.id);
  });
  $('#delivery-select').addEventListener('change',()=>{pendingCheckoutOrder=null;updateDeliveryFields();});
  $('#payment-methods').addEventListener('change',()=>{pendingCheckoutOrder=null;renderPaymentConfig();});
  const phoneInput = $('#checkout-form input[name="phone"]');
  phoneInput.addEventListener('input',event=>{ event.currentTarget.setCustomValidity(''); });
  phoneInput.addEventListener('blur',event=>{
    if(isRussianMobilePhone(event.currentTarget.value)) event.currentTarget.value = formatRussianPhone(event.currentTarget.value);
  });
  $('#open-search').addEventListener('click',()=>openSearchModal()); $('#search-input').addEventListener('input',e=>renderSearch(e.target.value));
  $('#builder-form').addEventListener('change',()=>{readBuilder();renderBuilder();});
  $('#combo-form').addEventListener('change', event => {
    const input = event.target;
    if (input.name === 'combo-twoSauces' && input.checked && valuesByName('combo-twoSauces').length > 2) {
      input.checked = false;
      showToast('В этом комбо можно выбрать только 2 соуса');
    }
    syncChoiceOptions($('#combo-form'));
    updateComboPrice();
  });
  $$('.overlay').forEach(overlay=>overlay.addEventListener('click',e=>{if(e.target===overlay){if(overlay.id==='bonus-overlay')closeBonusReveal();else if(overlay.id==='payment-overlay')finishPaymentFollowup();else closeOverlay('#'+overlay.id);}}));
  document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMobileMenu();if($('#bonus-overlay')?.classList.contains('open'))closeBonusReveal();if($('#payment-overlay')?.classList.contains('open'))finishPaymentFollowup();$$('.overlay.open').filter(el=>el.id!=='payment-overlay').forEach(el=>closeOverlay('#'+el.id));}});
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
  void hydrateAuth().finally(()=>{
    void hydrateSavedOrders();
    void hydrateEngagement();
  });
  void hydratePaymentConfig();
  handlePaymentReturn();
  window.setInterval(updateStoreStatus, 60000);
}
init();
