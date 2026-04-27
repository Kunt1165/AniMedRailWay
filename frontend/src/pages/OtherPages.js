import React, { useState } from 'react';

const articles = [
  {
    id: 1,
    cat: 'Харчування',
    title: 'Що можна і не можна давати собаці',
    excerpt: 'Повний список безпечних та небезпечних продуктів. Деякі звичні людські продукти смертельно небезпечні для тварин.',
    emoji: '🥦',
    readTime: '5 хв',
    date: '5 берез. 2025',
    content: [
      { type: 'intro', text: 'Власники собак часто хочуть поділитися їжею зі своїм улюбленцем. Деякі продукти справді нешкідливі, але чимало звичних для людини страв можуть спричинити серйозне отруєння або навіть смерть тварини.' },
      { type: 'heading', text: '✅ Що можна давати собаці' },
      { type: 'list', items: ['🥕 Морква — відмінний снек, корисна для зубів та зору', '🍎 Яблуко (без кісточок) — джерело вітамінів A і C', '🫐 Чорниця — антиоксиданти, корисна для імунітету', '🍌 Банан — джерело калію, але не більше кількох шматочків на день', '🥦 Броколі — в малих кількостях, містить корисні вітаміни', '🍗 Варена курятина без кісток — відмінне джерело білка', '🥚 Варене яйце — повноцінний білок і корисні жири', '🐟 Варена риба без кісток — омега-3, корисна для шкіри та шерсті'] },
      { type: 'heading', text: '❌ Що категорично не можна' },
      { type: 'list', items: ['🍫 Шоколад — містить теобромін, викликає судоми та може бути смертельним', '🧅 Цибуля та часник — руйнують еритроцити, викликають анемію', '🍇 Виноград та родзинки — навіть невелика кількість може викликати ниркову недостатність', '🥑 Авокадо — персин у м\'якоті токсичний для собак', '☕ Кофеїн — кава, чай, енергетики можуть викликати тахікардію', '🍬 Ксиліт (замінник цукру) — викликає різке падіння цукру в крові', '🦴 Варені кістки — розколюються на гострі уламки', '🧂 Сіль у великій кількості — може призвести до отруєння натрієм'] },
      { type: 'tip', text: '💡 Якщо ваша собака з\'їла щось підозріле — негайно зателефонуйте ветеринару. Не чекайте симптомів, особливо при шоколаді, винограді чи цибулі.' },
      { type: 'heading', text: 'Що робити при отруєнні' },
      { type: 'paragraph', text: 'Симптоми отруєння: блювота, діарея, надмірне слиновиділення, тремтіння, судоми, млявість. Якщо ви спостерігаєте хоча б один із них після підозрілої їжі — не зволікайте з візитом до ветеринара.' }
    ]
  },
  {
    id: 2,
    cat: 'Здоров\'я',
    title: 'Коли терміново до ветеринара: 10 тривожних симптомів',
    excerpt: 'Знаки, на які варто звернути увагу негайно. Рання діагностика часто рятує життя вашого улюбленця.',
    emoji: '🌡️',
    readTime: '7 хв',
    date: '1 берез. 2025',
    content: [
      { type: 'intro', text: 'Тварини не можуть сказати, що їм погано. Тому власник має вміти розпізнати тривожні сигнали. Ось 10 симптомів, при яких потрібно негайно їхати до ветеринара.' },
      { type: 'heading', text: '🚨 Симптоми, що вимагають негайної допомоги' },
      { type: 'numbered', items: ['Утруднене дихання або задишка — дихання з відкритим ротом у кішки, хрипи, синюшність ясен', 'Неможливість сечовипускання — особливо у котів-самців: може бути закупорка уретри', 'Судоми або втрата свідомості — навіть якщо тварина прийшла до тями', 'Здуття живота — особливо у великих собак: може бути заворот шлунку', 'Сильна кровотеча, яка не зупиняється протягом 5 хвилин', 'Блювота або діарея з кров\'ю', 'Тварина не може встати або пересуватися', 'Відмова від їжі та води більше 24 годин у поєднанні з млявістю', 'Різке погіршення зору або очі помутніли, почервоніли', 'Тварина з\'їла токсичну речовину — ліки, хімікати, шоколад'] },
      { type: 'tip', text: '💡 Заздалегідь збережіть телефон цілодобової ветеринарної клініки. У критичній ситуації не буде часу шукати.' },
      { type: 'heading', text: 'Симптоми, з якими можна почекати до ранку' },
      { type: 'paragraph', text: 'Легке чхання без інших симптомів, одноразова блювота без крові після якої тварина активна, невелика кульгавість без набряку — ці стани варто спостерігати. Якщо симптоми не зникли за 12–24 години або посилились — записуйтесь до лікаря.' }
    ]
  },
  {
    id: 3,
    cat: 'Виховання',
    title: 'Базові команди для щеня: з чого почати',
    excerpt: 'Простий план тренувань. Перші 30 днів — найважливіші для формування поведінки.',
    emoji: '🎓',
    readTime: '6 хв',
    date: '25 лют. 2025',
    content: [
      { type: 'intro', text: 'Виховання щеняти — це не покарання за погану поведінку, а формування правильних звичок через позитивне підкріплення. Перші 3–4 місяці — найкращий час для навчання.' },
      { type: 'heading', text: '📋 5 базових команд у правильній послідовності' },
      { type: 'numbered', items: ['«Сидіти» — найлегша і перша команда. Тримайте ласощі над носом і повільно відводьте назад — щеня само сяде.', '«Місце» — вкрай важлива для спокою в домі. Вкажіть на килимок, дочекайтеся коли лягає, хваліть.', '«До мене» — рятівна команда. Ніколи не кличте щоб покарати — лише позитивні асоціації.', '«Лежати» — навчайте після «сидіти». Опускайте ласощі до підлоги між лапами.', '«Стоп» / «Фу» — коротке, тверде слово. Не кричіть, достатньо серйозного тону.'] },
      { type: 'tip', text: '💡 Тренування не більше 5–10 хвилин за раз, 2–3 рази на день. Завершуйте на успіху.' },
      { type: 'heading', text: 'Типові помилки власників' },
      { type: 'list', items: ['Повторення команди кілька разів — щеня вчиться ігнорувати', 'Покарання через тривалий час після проступку — тварина не розуміє за що', 'Непослідовність — сьогодні можна на диван, завтра ні', 'Надто довгі тренування — перевтома і відраза до навчання'] }
    ]
  },
  {
    id: 4,
    cat: 'Здоров\'я',
    title: 'Вакцинація кішок: повний графік',
    excerpt: 'Які щеплення потрібні, коли їх робити і що очікувати після вакцинації.',
    emoji: '💉',
    readTime: '4 хв',
    date: '20 лют. 2025',
    content: [
      { type: 'intro', text: 'Вакцинація — найефективніший спосіб захистити кішку від небезпечних інфекційних захворювань. Навіть домашні кішки потребують щеплень — збудники можуть потрапити на взутті господаря.' },
      { type: 'heading', text: '📅 Базовий графік вакцинації' },
      { type: 'list', items: ['8–9 тижнів — перше щеплення від панлейкопенії, герпесвірусу, калівірусу', '12 тижнів — друге щеплення + перше від сказу', '1 рік — ревакцинація всього комплексу', 'Надалі — щорічна ревакцинація від сказу, комплексна кожні 1–3 роки'] },
      { type: 'heading', text: 'Що очікувати після щеплення' },
      { type: 'paragraph', text: 'Протягом 1–3 днів кішка може бути млявою, мало їсти, мати незначне підвищення температури — це нормально. Якщо млявість триває більше 3 днів або є набряк у місці ін\'єкції — зверніться до ветеринара.' },
      { type: 'tip', text: '💡 Вакцинацію роблять лише здоровій тварині. За 10–14 днів до щеплення проводять дегельмінтизацію. Не вакцинуйте кішку під час течки або вагітності.' }
    ]
  },
  {
    id: 5,
    cat: 'Догляд',
    title: 'Грумінг вдома: покрокова інструкція',
    excerpt: 'Як самостійно підстригти кігті, почистити вуха і викупати вашого улюбленця.',
    emoji: '✂️',
    readTime: '8 хв',
    date: '15 лют. 2025',
    content: [
      { type: 'intro', text: 'Регулярний грумінг — це не лише краса, але й здоров\'я. Нестрижені кігті заважають ходити, брудні вуха призводять до інфекцій.' },
      { type: 'heading', text: '✂️ Підстригання кігтів' },
      { type: 'paragraph', text: 'Знадобляться спеціальні кігтерізи. Натисніть на подушечку лапи щоб виступив кіготь. Стрижіть лише прозору частину — уникайте рожевої зони з судинами. Підстригають кігті раз на 3–4 тижні.' },
      { type: 'heading', text: '👂 Чищення вух' },
      { type: 'paragraph', text: 'Здорове вухо — рожеве, без запаху. Нанесіть лосьйон, злегка помасажуйте основу вуха, дайте тварині струсити голову, протріть ватним диском. Не лізьте глибоко.' },
      { type: 'heading', text: '🛁 Купання' },
      { type: 'list', items: ['Лише спеціальний шампунь для тварин — людський порушує pH шкіри', 'Температура води — 37–38°C', 'Уникайте потрапляння води у вуха та очі', 'Ретельно змивайте шампунь — залишки викликають подразнення', 'Добре сушіть — не випускайте мокру тварину на холод', 'Собак купають раз на 3–6 тижнів'] },
      { type: 'tip', text: '💡 Привчайте тварину до грумінгу з дитинства — торкайтеся лапок, вух щодня. Тоді процедури стануть звичним ритуалом.' }
    ]
  },
  {
    id: 6,
    cat: 'Харчування',
    title: 'Натуральний корм чи сухий: що вибрати',
    excerpt: 'Плюси та мінуси кожного типу харчування для собак і кішок різного віку.',
    emoji: '🍖',
    readTime: '6 хв',
    date: '10 лют. 2025',
    content: [
      { type: 'intro', text: 'Питання харчування — одне з найбільш суперечливих серед власників тварин. Обидва підходи мають право на існування, якщо вони збалансовані.' },
      { type: 'heading', text: '🏭 Готовий корм (сухий та вологий)' },
      { type: 'list', items: ['✅ Зручність — збалансований склад без зайвих зусиль', '✅ Стабільний склад щодня', '✅ Різні формули — для цуценят, літніх, стерилізованих', '✅ Сухий корм механічно очищує зуби від нальоту', '❌ Склад преміум і економ класу кардинально відрізняється', '❌ Деякі тварини погано переносять сухий корм'] },
      { type: 'heading', text: '🥩 Натуральне харчування' },
      { type: 'list', items: ['✅ Ви знаєте точний склад їжі', '✅ Свіжі інгредієнти, відсутність консервантів', '❌ Легко зробити раціон незбалансованим', '❌ Обов\'язкові добавки: кальцій, омега-3, вітаміни', '❌ Значно дорожче і займає більше часу'] },
      { type: 'tip', text: '💡 Якісний готовий корм преміум-класу (Orijen, Royal Canin, Hills) забезпечить тварину всім необхідним. Якщо обираєте натуральне — проконсультуйтесь із ветеринарним дієтологом.' },
      { type: 'paragraph', text: 'Не змішуйте сухий корм і натуральне в одному прийомі їжі — вони перетравлюються з різною швидкістю. Свіжа вода має бути доступна завжди.' }
    ]
  }
];

const categories = ["Всі", "Харчування", "Здоров'я", "Виховання", "Догляд"];
const catColors = { "Харчування": '#D4EDD9', "Здоров'я": '#E8F7F5', 'Виховання': '#FEE9E2', 'Догляд': '#F5EFE6' };

function ArticleContent({ article, onBack }) {
  return (
    <div className="main-content">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button className="btn btn-secondary btn-sm" onClick={onBack}>← Назад</button>
          <div>
            <span className="badge badge-mint" style={{ marginBottom: 6, display: 'inline-block' }}>{article.cat}</span>
            <h1 style={{ fontSize: 24, lineHeight: 1.3 }}>{article.title}</h1>
            <p style={{ color: 'var(--warm-grey)', fontSize: 14 }}>⏱ {article.readTime} · {article.date}</p>
          </div>
        </div>
      </div>

      <div className="page-content">
        <div style={{ maxWidth: 720 }}>
          <div style={{ height: 180, background: catColors[article.cat] || 'var(--sand)', borderRadius: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 72, marginBottom: 32 }}>
            {article.emoji}
          </div>

          {article.content.map((block, i) => {
            if (block.type === 'intro') return (
              <p key={i} style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--charcoal)', fontWeight: 500, marginBottom: 28, padding: '20px 24px', background: 'var(--mint-light)', borderRadius: 12, borderLeft: '4px solid var(--mint)' }}>
                {block.text}
              </p>
            );
            if (block.type === 'heading') return (
              <h2 key={i} style={{ fontSize: 19, fontWeight: 700, marginBottom: 14, marginTop: 32, color: 'var(--charcoal)' }}>
                {block.text}
              </h2>
            );
            if (block.type === 'paragraph') return (
              <p key={i} style={{ fontSize: 15, lineHeight: 1.8, color: 'var(--charcoal)', marginBottom: 20 }}>
                {block.text}
              </p>
            );
            if (block.type === 'list') return (
              <ul key={i} style={{ listStyle: 'none', padding: 0, margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                {block.items.map((item, j) => (
                  <li key={j} style={{ fontSize: 15, lineHeight: 1.7, padding: '12px 16px', background: 'var(--cream)', borderRadius: 10, color: 'var(--charcoal)' }}>
                    {item}
                  </li>
                ))}
              </ul>
            );
            if (block.type === 'numbered') return (
              <ol key={i} style={{ padding: '0 0 0 20px', margin: '0 0 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                {block.items.map((item, j) => (
                  <li key={j} style={{ fontSize: 15, lineHeight: 1.7, paddingLeft: 8, color: 'var(--charcoal)' }}>
                    {item}
                  </li>
                ))}
              </ol>
            );
            if (block.type === 'tip') return (
              <div key={i} style={{ padding: '16px 20px', background: '#FEF9E7', borderRadius: 12, border: '1px solid #F4D03F', fontSize: 14, lineHeight: 1.7, marginBottom: 20, color: '#7D6608' }}>
                {block.text}
              </div>
            );
            return null;
          })}

          <div style={{ marginTop: 40, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            <button className="btn btn-secondary" onClick={onBack}>← Повернутись до статей</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export function ArticlesPage() {
  const [cat, setCat] = useState('Всі');
  const [openArticle, setOpenArticle] = useState(null);

  if (openArticle) {
    return <ArticleContent article={openArticle} onBack={() => setOpenArticle(null)} />;
  }

  const filtered = cat === 'Всі' ? articles : articles.filter(a => a.cat === cat);

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1>Статті та поради</h1>
          <p>Корисні матеріали про догляд за улюбленцями</p>
        </div>
      </div>
      <div className="page-content">
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
          {categories.map(c => (
            <button key={c} onClick={() => setCat(c)} style={{
              padding: '8px 18px', border: 'none', borderRadius: 50, cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500,
              background: cat === c ? 'var(--mint)' : 'white',
              color: cat === c ? 'white' : 'var(--charcoal)',
              border: `1.5px solid ${cat === c ? 'var(--mint)' : 'var(--border)'}`,
              transition: 'all 0.2s'
            }}>{c}</button>
          ))}
        </div>

        <div className="grid-3">
          {filtered.map(article => (
            <div
              key={article.id}
              className="card fade-up"
              style={{ cursor: 'pointer', transition: 'transform 0.2s, box-shadow 0.2s', overflow: 'hidden' }}
              onClick={() => setOpenArticle(article)}
              onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(30,40,50,0.12)'; }}
              onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = ''; }}
            >
              <div style={{ height: 140, background: catColors[article.cat] || 'var(--sand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 52 }}>
                {article.emoji}
              </div>
              <div style={{ padding: '20px 20px 24px' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 10 }}>
                  <span className="badge badge-mint">{article.cat}</span>
                  <span style={{ fontSize: 12, color: 'var(--warm-grey)' }}>⏱ {article.readTime}</span>
                </div>
                <h3 style={{ fontSize: 17, marginBottom: 8, lineHeight: 1.35 }}>{article.title}</h3>
                <p style={{ fontSize: 13, color: 'var(--warm-grey)', lineHeight: 1.65, marginBottom: 14 }}>{article.excerpt}</p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: 12, color: 'var(--warm-grey)' }}>{article.date}</div>
                  <span style={{ fontSize: 13, color: 'var(--mint)', fontWeight: 600 }}>Читати →</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// =============== NEARBY PAGE ================

const places = [
  { id: 1, type: 'vet', name: 'ВетКлініка «Добрі лапи»', address: 'вул. Шевченка, 42', dist: '0.8 км', rating: 4.9, phone: '+380 44 123-45-67', hours: 'Пн-Нд 08:00–20:00', tags: ['Екстрена допомога', 'Вакцинація', 'УЗД', 'Хірургія'], emoji: '🏥' },
  { id: 2, type: 'grooming', name: 'Грумінг-салон «PetStyle»', address: 'вул. Франка, 17', dist: '1.2 км', rating: 4.7, phone: '+380 44 234-56-78', hours: 'Пн-Сб 09:00–19:00', tags: ['Стрижка', 'Мийка', 'Ногті', 'Фарбування'], emoji: '✂️' },
  { id: 3, type: 'shop', name: 'Зоомагазин «Хвостатий»', address: 'вул. Лесі Українки, 5', dist: '1.5 км', rating: 4.6, phone: '+380 44 345-67-89', hours: 'Пн-Нд 09:00–21:00', tags: ['Корм', 'Аксесуари', 'Ліки', 'Іграшки'], emoji: '🛒' },
  { id: 4, type: 'vet', name: 'Ветклініка «Доктор Айболить»', address: 'пр. Перемоги, 22', dist: '2.1 км', rating: 4.8, phone: '+380 44 456-78-90', hours: 'Пн-Пт 09:00–18:00', tags: ['Щеплення', 'Аналізи', 'Дерматологія'], emoji: '🏥' },
  { id: 5, type: 'grooming', name: 'Grooming Studio «Paws»', address: 'вул. Хрещатик, 8', dist: '2.4 км', rating: 4.5, phone: '+380 44 567-89-01', hours: 'Вт-Нд 10:00–20:00', tags: ['Люкс-стрижка', 'Спа', 'Ароматерапія'], emoji: '✂️' },
  { id: 6, type: 'shop', name: 'ZooMart', address: 'вул. Банкова, 15', dist: '3.0 км', rating: 4.4, phone: '+380 44 678-90-12', hours: 'Пн-Нд 08:00–22:00', tags: ['Живий корм', 'Акваріум', 'Птахи', 'Гризуни'], emoji: '🛒' },
];

const placeTypes = { all: 'Всі', vet: '🏥 Ветеринари', grooming: '✂️ Грумінг', shop: '🛒 Магазини' };

export function NearbyPage() {
  const [filter, setFilter] = useState('all');
  const [selected, setSelected] = useState(null);
  const filtered = filter === 'all' ? places : places.filter(p => p.type === filter);

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h1>Сервіси поряд</h1>
          <p>Ветеринари, грумінг та зоомагазини у вашому місті</p>
        </div>
      </div>
      <div className="page-content">
        <div style={{ display: 'flex', gap: 8, marginBottom: 28 }}>
          {Object.entries(placeTypes).map(([k, v]) => (
            <button key={k} onClick={() => setFilter(k)} style={{
              padding: '8px 18px', border: 'none', borderRadius: 50, cursor: 'pointer',
              fontFamily: 'DM Sans, sans-serif', fontSize: 14, fontWeight: 500,
              background: filter === k ? 'var(--charcoal)' : 'white',
              color: filter === k ? 'white' : 'var(--charcoal)',
              border: `1.5px solid ${filter === k ? 'var(--charcoal)' : 'var(--border)'}`,
              transition: 'all 0.2s'
            }}>{v}</button>
          ))}
        </div>

        <div className="grid-2">
          {filtered.map(place => (
            <div key={place.id} className="card fade-up" style={{ cursor: 'pointer', transition: 'all 0.2s', border: selected?.id === place.id ? '1.5px solid var(--mint)' : '1px solid var(--border)' }}
              onClick={() => setSelected(selected?.id === place.id ? null : place)}
            >
              <div style={{ padding: '20px 24px' }}>
                <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start', marginBottom: 14 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 16, background: 'var(--mint-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 26, flexShrink: 0 }}>
                    {place.emoji}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{place.name}</div>
                    <div style={{ fontSize: 13, color: 'var(--warm-grey)' }}>📍 {place.address} · {place.dist}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#FFF9E6', borderRadius: 8, padding: '4px 10px' }}>
                    <span>⭐</span>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{place.rating}</span>
                  </div>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
                  {place.tags.map(t => <span key={t} className="badge badge-grey">{t}</span>)}
                </div>
                {selected?.id === place.id && (
                  <div style={{ borderTop: '1px solid var(--border)', paddingTop: 14, display: 'flex', flexDirection: 'column', gap: 8 }} onClick={e => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: 8, fontSize: 14 }}>
                      <span>📞</span>
                      <a href={`tel:${place.phone}`} style={{ color: 'var(--mint-dark)', fontWeight: 500, textDecoration: 'none' }}>{place.phone}</a>
                    </div>
                    <div style={{ display: 'flex', gap: 8, fontSize: 14 }}>
                      <span>🕐</span>
                      <span style={{ color: 'var(--warm-grey)' }}>{place.hours}</span>
                    </div>
                    <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
                      <a href={`tel:${place.phone}`} className="btn btn-primary btn-sm" style={{ flex: 1, justifyContent: 'center', textDecoration: 'none' }}>📞 Зателефонувати</a>
                      <button className="btn btn-secondary btn-sm" style={{ flex: 1 }} onClick={() => window.open(`https://maps.google.com?q=${place.name}`, '_blank')}>🗺️ Навігатор</button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}