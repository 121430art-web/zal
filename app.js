const PLAN = {
  версия: 3,
  шаг: 2.5,
  отдых: 90,
  дни: [
    { wd:[2], группа:"спина и плечи", упражнения:[
      {id:"hammer-row-high", имя:"Тяга верхняя в Хаммере", подходы:4, низ:8, верх:12, отдых:150, гр:"спина"},
      {id:"row-seated", имя:"Тяга сидя к поясу", подходы:4, низ:8, верх:12, отдых:150, гр:"спина"},
      {id:"pulldown", имя:"Тяга верхнего блока к груди", подходы:3, низ:10, верх:12, отдых:120, гр:"спина"},
      {id:"pullover", имя:"Пуловер на верхнем блоке", подходы:3, низ:10, верх:12, отдых:90, гр:"спина"},
      {id:"shoulder-press", имя:"Жим на плечи в Хаммере или гантели сидя", подходы:4, низ:8, верх:12, отдых:150, гр:"плечи"},
      {id:"lateral-raise", имя:"Махи гантелями в стороны", подходы:4, низ:12, верх:15, отдых:75, гр:"плечи"},
      {id:"rear-delt", имя:"Задняя дельта: разведение с упором", подходы:4, низ:12, верх:15, отдых:75, гр:"плечи"},
      {id:"biceps-machine", имя:"Бицепс в тренажёре", подходы:3, низ:10, верх:12, отдых:90, гр:"бицепс"}
    ]},
    { wd:[4], группа:"грудь и руки", упражнения:[
      {id:"hammer-press", имя:"Жим от груди в Хаммере", подходы:4, низ:8, верх:12, отдых:150, гр:"грудь"},
      {id:"db-press-mid", имя:"Жим гантелей на середину груди", подходы:3, низ:8, верх:12, отдых:120, гр:"грудь"},
      {id:"peck-deck", имя:"Бабочка (пек-дек)", подходы:3, низ:12, верх:15, отдых:75, гр:"грудь"},
      {id:"crossover", имя:"Разведение в кроссовере", подходы:3, низ:12, верх:15, отдых:75, гр:"грудь"},
      {id:"triceps-overhead", имя:"Трицепс в кроссовере из-за головы", подходы:3, низ:10, верх:12, отдых:75, гр:"трицепс"},
      {id:"triceps-pushdown", имя:"Разгибание на трицепс на блоке", подходы:3, низ:10, верх:12, отдых:75, гр:"трицепс"},
      {id:"biceps-machine2", имя:"Бицепс в тренажёре (или штанга сидя)", подходы:3, низ:10, верх:12, отдых:90, гр:"бицепс"},
      {id:"hammer-curl", имя:"Молотки сидя", подходы:3, низ:10, верх:12, отдых:90, гр:"бицепс"}
    ]},
    { wd:[6,0], группа:"ноги и пресс", упражнения:[
      {id:"leg-press", имя:"Жим ногами", подходы:4, низ:10, верх:12, отдых:180, гр:"квадрицепс"},
      {id:"machine-squat", имя:"Приседание в тренажёре (спина прижата, амплитуда не в пол)", подходы:3, низ:10, верх:12, отдых:150, гр:"квадрицепс"},
      {id:"leg-extension", имя:"Разгибание ног сидя", подходы:4, низ:12, верх:15, отдых:90, гр:"квадрицепс"},
      {id:"leg-curl", имя:"Сгибание ног лёжа", подходы:5, низ:10, верх:15, отдых:90, гр:"бицепс бедра"},
      {id:"single-leg-curl", имя:"Сгибание одной ногой", подходы:3, низ:10, верх:12, отдых:75, гр:"бицепс бедра"},
      {id:"hip-abduction", имя:"Тренажёр сидя на ягодицы", подходы:4, низ:12, верх:15, отдых:90, гр:"ягодицы"},
      {id:"glute-bridge", имя:"Ягодичный мост с блином", подходы:3, низ:12, верх:15, отдых:90, гр:"ягодицы"},
      {id:"calf-raise", имя:"Икры в тренажёре стоя", подходы:5, низ:15, верх:20, отдых:60, гр:"икры"},
      {id:"seated-calf", имя:"Икры сидя", подходы:3, низ:15, верх:20, отдых:60, гр:"икры"},
      {id:"dead-bug", имя:"Мёртвый жук", подходы:3, низ:8, верх:8, отдых:60, гр:"пресс"},
      {id:"plank", имя:"Планка (секунды)", подходы:3, низ:45, верх:60, отдых:60, гр:"пресс"}
    ]}
  ]
};
const KEY = "zal.v2";
const TKEY = "zal.timer";
const VERSION = "3.5";

/* Экранирование для сборки HTML строками. Всё, что пришло из импорта, плана или заметок,
   выводится только через esc(): иначе чужой JSON исполняет скрипт в этом origin. */
const ESC_MAP = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" };
const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ESC_MAP[c]);
/* CSV считает значением формулу, если ячейка начинается с = + - @. Ставим апостроф. */
const csvCell = v => { const s = String(v ?? ""); return /^[=+\-@\t\r]/.test(s) ? "'" + s : s; };

/* Импорт: берём только ожидаемую структуру и приводим типы. Экранирование при выводе — esc(),
   а это защита от падения рендера на чужом файле с полями не того типа. */
function cleanState(d){
  const s = (v, max = 200) => (typeof v === "string" ? v.slice(0, max) : (typeof v === "number" && isFinite(v) ? v : ""));
  const n = (v, def = "") => { const x = +v; return isFinite(x) ? x : def; };
  const arr = v => Array.isArray(v) ? v : [];
  const sessions = arr(d.sessions).map(x => ({
    дата: s(x && x.дата, 10),
    группа: s(x && x.группа, 60),
    упражнения: arr(x && x.упражнения).map(e => ({
      id: s(e && e.id, 60),
      имя: s(e && e.имя, 120),
      подходы: arr(e && e.подходы).map(p => ({
        вес: p && p.вес !== undefined ? s(p.вес, 20) : "",
        повторы: p && p.повторы !== undefined ? s(p.повторы, 20) : "",
        готово: !!(p && p.готово)
      }))
    }))
  })).filter(x => x.дата);

  const заметки = {};
  Object.entries(d.заметки && typeof d.заметки === "object" ? d.заметки : {}).slice(0, 500)
    .forEach(([k, v]) => { if(typeof v === "string") заметки[String(k).slice(0, 60)] = v.slice(0, 2000); });

  const дни = {};
  Object.entries(d.дни && typeof d.дни === "object" ? d.дни : {}).slice(0, 1000)
    .forEach(([k, v]) => {
      if(!v || typeof v !== "object") return;
      дни[String(k).slice(0, 10)] = {
        сон: n(v.сон), белок: n(v.белок), белок_еда: n(v.белок_еда), белок_добавка: n(v.белок_добавка),
        мин: n(v.мин), пульс: n(v.пульс), ккал: n(v.ккал)
      };
    });

  const план = (d.план && Array.isArray(d.план.дни) ? d.план.дни : []).map(day => ({
    wd: arr(day && day.wd).map(x => n(x, null)).filter(x => x !== null && x >= 0 && x <= 6),
    группа: s(day && day.группа, 60),
    день: s(day && day.день, 40),
    упражнения: arr(day && day.упражнения).map(e => ({
      id: s(e && e.id, 60),
      имя: s(e && e.имя, 120),
      подходы: Math.max(1, Math.min(12, n(e && e.подходы, 3))),
      низ: n(e && e.низ, 10), верх: n(e && e.верх, 12), отдых: n(e && e.отдых, 90),
      гр: s(e && e.гр, 40)
    })).filter(e => e.id)
  })).filter(day => day.wd.length && day.упражнения.length);

  return {
    sessions,
    вес: arr(d.вес).map(x => ({ дата: s(x && x.дата, 10), кг: n(x && x.кг), ts: n(x && x.ts) }))
      .filter(x => x.дата && x.кг !== ""),
    план: план.length ? { ...state.план, свой: true, дни: план } : state.план,
    заметки,
    дни
  };
}

/* Техника: короткие подсказки своими словами. Перед началом — 5–10 минут разминки. */
const TIPS = {
  "pulldown": { подсказки:["Сядь плотно, бёдра под валиками, спина с лёгким наклоном назад 10–15°",
    "Тяни локтями вниз и к корпусу, а не кистями",
    "Внизу сведи лопатки и на секунду задержись"],
    ошибки:"раскачиваться корпусом, тянуть за голову, выключать лопатки и работать только руками" },
  "row-supported": { подсказки:["Грудь прижата к упору, поясница не работает",
    "Тяни рукоять к низу живота, локти идут вдоль корпуса",
    "Разводи лопатки на возврате медленно, без рывка"],
    ошибки:"отрывать грудь от упора, помогать корпусом, дёргать вес" },
  "pullover": { подсказки:["Руки почти прямые, небольшой сгиб в локте",
    "Веди дугой от головы к бёдрам, корпус зафиксирован",
    "Внизу — пауза, вверх — медленно"],
    ошибки:"сгибать локти и превращать в тягу, раскачиваться" },
  "shoulder-press": { подсказки:["Спинка почти вертикально, поясница прижата",
    "Локти чуть впереди корпуса, жим вверх без прогиба",
    "Опускай до уровня ушей, не ниже"],
    ошибки:"прогибаться в пояснице, толкать ногами, разводить локти строго в стороны" },
  "lateral-raise": { подсказки:["Локти чуть согнуты и зафиксированы",
    "Поднимай до уровня плеч, мизинец чуть выше большого пальца",
    "Вес небольшой — работает техника, а не вес"],
    ошибки:"раскачивать корпус, поднимать выше плеч, брать слишком тяжёлые гантели" },
  "rear-delt": { подсказки:["Обопрись грудью на наклонную скамью — поясница разгружена",
    "Разводи руки в стороны, лопатки сводятся",
    "Вверху пауза, вниз — подконтрольно"],
    ошибки:"делать в наклоне без упора (нагрузка на поясницу), рывками" },

  "bench-press": { подсказки:["Лопатки свести и прижать к скамье, стопы в пол",
    "Гриф опускай к низу груди, локти под углом ~45°",
    "Прогиб в пояснице естественный, без «моста»"],
    ошибки:"отбивать гриф от груди, разводить локти в стороны под 90°, поднимать таз" },
  "incline-db": { подсказки:["Наклон скамьи около 30° — так работает грудь, а не плечи",
    "Гантели над верхом груди, локти под 45°",
    "Опускай до комфортной глубины, без растяжения"],
    ошибки:"слишком большой наклон, стучать гантелями вверху, выпрямлять локти в замок" },
  "crossover": { подсказки:["Корпус чуть вперёд, стопы устойчиво",
    "Руки слегка согнуты и не разгибаются в движении",
    "В точке сведения — пауза на секунду"],
    ошибки:"разгибать руки, помогать корпусом, гнаться за весом" },
  "biceps-bar": { подсказки:["Локти прижаты к корпусу, спина у опоры или стены",
    "Поднимай за счёт сгибания локтя, опускай до конца",
    "Поясница не участвует — не наклоняйся под вес"],
    ошибки:"раскачиваться корпусом, отрывать локти, бросать штангу вниз" },
  "triceps-pushdown": { подсказки:["Локти прижаты к бокам и не двигаются",
    "Разгибай только предплечья, корпус чуть вперёд",
    "Внизу полностью выпрями, вверх — медленно"],
    ошибки:"помогать плечами и корпусом, наваливаться весом" },
  "hammer-curl": { подсказки:["Сиди со спинкой, кисти нейтрально (большой палец вверх)",
    "Локти на месте, без раскачки",
    "Опускай медленнее, чем поднимаешь"],
    ошибки:"раскачивать корпус, отрывать локти, читинг" },
  "triceps-overhead": { подсказки:["Локти смотрят вверх и остаются на месте",
    "Разгибай предплечья за головой, растягивая трицепс внизу",
    "Корпус не прогибается в пояснице — держи пресс в тонусе"],
    ошибки:"разводить локти в стороны, прогибаться, брать слишком большой вес" },
  "single-leg-curl": { подсказки:["Таз прижат, работай одной ногой медленно",
    "Сгибай до комфортного угла, вверху — пауза",
    "Вниз подконтрольно, без броска"],
    ошибки:"помогать корпусом, разгонять вес, отрывать таз" },
  "seated-calf": { подсказки:["Колени под валиками, стопы на платформе",
    "Полная амплитуда: пятка вниз до растяжения, вверх до упора",
    "Вверху задержка на секунду"],
    ошибки:"пружинить, работать в короткой амплитуде, гнаться за весом" },

  "hammer-row-high": { подсказки:["Грудь прижата к упору, корпус не работает",
    "Тяни локтями вниз и назад, лопатки сводятся",
    "Возврат медленный, без броска"],
    ошибки:"отрывать грудь от упора, помогать корпусом, дёргать вес" },
  "row-seated": { подсказки:["Сиди плотно, спина с лёгким наклоном, поясница не круглая",
    "Тяни рукоятки к низу живота, локти вдоль корпуса",
    "В конце сведи лопатки, на возврате растяни"],
    ошибки:"раскачиваться корпусом, круглить спину, тянуть руками без лопаток" },
  "hammer-press": { подсказки:["Спинка настроена так, чтобы кисти были на уровне середины груди",
    "Локти под 45°, без разведения в стороны",
    "Жми плавно, не выпрямляй локти в замок"],
    ошибки:"отрывать плечи от спинки, отбивать вес, слишком глубокий ход" },
  "db-press-mid": { подсказки:["Гантели над серединой груди, локти под 45°",
    "Опускай до комфортной глубины, без растяжения",
    "Стопы в пол, поясница с естественным прогибом"],
    ошибки:"разводить локти под 90°, стучать гантелями, выгибать поясницу мостом" },
  "peck-deck": { подсказки:["Локти или кисти на уровне груди, плечи вниз",
    "Сведи и задержись на секунду",
    "Возврат медленный — растянутая часть важнее веса"],
    ошибки:"гнаться за весом, отрывать спину от спинки, резко бросать" },
  "biceps-machine": { подсказки:["Локти на подушке, плечи прижаты",
    "Сгибай без раскачки, опускай до конца",
    "Внизу не бросай — держи напряжение"],
    ошибки:"отрывать локти, помогать корпусом, читинг" },
  "biceps-machine2": { подсказки:["Сиди с опорой спины, локти прижаты",
    "Поднимай за счёт сгибания локтя, без наклона корпуса",
    "Опускай медленнее, чем поднимаешь"],
    ошибки:"раскачиваться корпусом, отрывать локти, брать лишний вес" },
  "hip-abduction": { подсказки:["Сиди плотно, спина прижата к спинке",
    "Разводи колени плавно, в конце пауза",
    "Своди медленно, без удара"],
    ошибки:"рывками, отрывать таз, гнаться за весом" },
  "machine-squat": { подсказки:["Спина прижата к спинке всё время, пятки на платформе",
    "Амплитуда не в пол — до комфортного угла, таз не подкручивается",
    "Колени идут по направлению стоп, не внутрь"],
    ошибки:"уходить глубоко с округлением таза, отрывать пятки, делать через боль" },
  "plank": { подсказки:["Локти под плечами, тело — одна линия",
    "Пресс и ягодицы в тонусе, поясница не провисает",
    "Дыши ровно, не задерживай дыхание"],
    ошибки:"провисать в пояснице, поднимать таз, задерживать дыхание" },

  "leg-press": { подсказки:["Поясница и таз прижаты к спинке — это главное при протрузии",
    "Колени идут по направлению стоп, не заваливаются внутрь",
    "Опускай до комфортного угла, колени не выпрямляй в замок"],
    ошибки:"отрывать таз, уходить в глубокий присед до боли, отбивать вес" },
  "leg-extension": { подсказки:["Сиди плотно, спина прижата к спинке",
    "Разгибай плавно, вверху пауза на секунду",
    "Опускай подконтрольно, не бросай"],
    ошибки:"рывками, отрывать таз, слишком большой вес" },
  "leg-curl": { подсказки:["Таз прижат, бёдра не отрываются",
    "Сгибай до 90°, вверху пауза",
    "Вниз — медленно, без пружины"],
    ошибки:"помогать корпусом, разгонять вес" },
  "glute-bridge": { подсказки:["Лёжа, стопы близко к тазу, рёбра вниз",
    "Поднимай таз за счёт ягодиц, а не поясницы",
    "Вверху не переразгибайся: корпус — одна линия"],
    ошибки:"выталкивать таз поясницей, гнаться за высотой" },
  "calf-raise": { подсказки:["Полная амплитуда: пятка вниз до растяжения",
    "Вверху задержка на секунду",
    "Без пружины — плавно вверх, плавно вниз"],
    ошибки:"мелкая амплитуда, раскачка, отбив" },
  "dead-bug": { подсказки:["Поясница прижата к полу всё время",
    "Двигай противоположные руку и ногу по диагонали",
    "Медленно, с выдохом, без спешки"],
    ошибки:"отрывать поясницу от пола, торопиться, делать на скорость" }
};

/* Наука: короткие выводы из обзоров, ссылки на PubMed. Полный разбор — наука.md */
const НАУКА = [
  { р:"Объём", т:"10–20 подходов на группу в неделю — рабочая зона. Ниже 8–10 роста почти нет, выше 20 выигрыш сомнителен, а усталость реальна.",
    и:"Schoenfeld 2017, J Sports Sci", u:"https://pubmed.ncbi.nlm.nih.gov/27433992/" },
  { р:"Частота", т:"1 или 2 раза в неделю на группу при равном объёме — почти одно и то же. Наш сплит не ошибка; важнее добрать подходы.",
    и:"Schoenfeld 2019, J Sports Sci", u:"https://pubmed.ncbi.nlm.nih.gov/30558493/" },
  { р:"Отказ", т:"Останавливаться за 1–2 повтора до отказа достаточно: RIR 0–5 дают сходную гипертрофию. Отказ в каждом подходе не нужен.",
    и:"Refalo 2023, Sports Med", u:"https://pubmed.ncbi.nlm.nih.gov/36334240/" },
  { р:"Повторы", т:"5–30 повторов при равном усилии растят мышцу сходно. «Малый вес на рельеф» — миф; решает близость к отказу.",
    и:"Schoenfeld 2021, Sports", u:"https://pubmed.ncbi.nlm.nih.gov/33671664/" },
  { р:"Отдых", т:"2–3 минуты между подходами базовых дают больше силы и массы, чем 1 минута. Короткий отдых — худшая экономия времени.",
    и:"Schoenfeld 2016, J Strength Cond Res", u:"https://pubmed.ncbi.nlm.nih.gov/26605807/" },
  { р:"Прогрессия", т:"Расти в повторах или в весе — работает и то, и другое. Считать надо тоннаж (кг × повторы), а не ощущения.",
    и:"Plotkin 2022, PeerJ", u:"https://pubmed.ncbi.nlm.nih.gov/36199287/" },
  { р:"Амплитуда", т:"Полная амплитуда с акцентом на растянутую часть. Растянутые партиалы — добавка, а не замена.",
    и:"Pallarés 2021, Scand J Med Sci Sports", u:"https://pubmed.ncbi.nlm.nih.gov/34170576/" },
  { р:"Травмы", т:"Риск снижает силовая работа, а не растяжка. Разминка 5–8 минут + 2 разминочных подхода.",
    и:"Lauersen 2014, Br J Sports Med", u:"https://pubmed.ncbi.nlm.nih.gov/24100287/" },
  { р:"Белок", т:"Ориентир 1,6 г/кг в сутки, порциями 25–40 г; дальше плато. При 80 кг — около 130 г.",
    и:"Morton 2018, Br J Sports Med", u:"https://pubmed.ncbi.nlm.nih.gov/28698222/" },
  { р:"Сон", т:"Меньше 6–7 часов — падают сила и восстановление. При плохом сне на этой неделе объём не повышаем.",
    и:"Knowles 2018, J Sci Med Sport", u:"https://pubmed.ncbi.nlm.nih.gov/29422383/" },
  { р:"Кардио", т:"150 минут умеренного в неделю не мешают росту мышц и сильно связаны с выживаемостью. Лучше после силовой или в день отдыха.",
    и:"Schumann 2022, Sports Med", u:"https://pubmed.ncbi.nlm.nih.gov/34757594/" },
  { р:"Поясница", т:"Опасна не нагрузка сама по себе, а «согнутая спина + вес + много повторов». Поэтому убраны наклоны и гиперэкстензия, а не нагрузка вообще.",
    и:"Callaghan & McGill 2001, Clin Biomech", u:"https://pubmed.ncbi.nlm.nih.gov/11114441/" },
  { р:"Поясница", т:"Давление в диске зависит от позы: лёжа и с опорой меньше, стоя и с осевой нагрузкой больше. Отсюда жим ногами, тяги с упором, мосты.",
    и:"Rohlmann 2001, Ergonomics", u:"https://pubmed.ncbi.nlm.nih.gov/11450876/" },
  { р:"Поясница", т:"«Единственно правильного» упражнения нет: работает то направление, которое уменьшает симптом, и регулярность. Это не заключение врача.",
    и:"Long 2004, Spine", u:"https://pubmed.ncbi.nlm.nih.gov/15564907/" },
  { р:"Механизмы", т:"Главный фактор роста — механическое напряжение в подходе. Метаболический стресс и микроповреждения — второстепенны; «забитость» не мера роста.",
    и:"Van Every 2025, J Sport Health Sci", u:"https://pubmed.ncbi.nlm.nih.gov/41276164/" },
  { р:"Региональная", т:"У одной мышцы разные участки растут по-разному в зависимости от упражнения. Акцент — на растянутую длину мышцы.",
    и:"Varovic 2025, Int J Sports Med", u:"https://pubmed.ncbi.nlm.nih.gov/40570881/" },
  { р:"Ощущение", т:"ЭМГ и «чувство мышцы» не предсказывают рост. Ощущение не доказательство — доказательство только прогресс в цифрах.",
    и:"Vigotsky 2022, Sports Med", u:"https://pubmed.ncbi.nlm.nih.gov/35006527/" },
  { р:"Выбор", т:"Критерий выбора упражнения — стимул/усталость: много работы для целевой мышцы при малой общей усталости. Тяжёлое — в начале, изоляция — в конце.",
    и:"Pelland 2026, Sports Med", u:"https://pubmed.ncbi.nlm.nih.gov/41343037/" },
  { р:"Тренажёры", т:"Для роста мышц машины и свободные веса эквивалентны. Сила специфична: растёт в том движении, которое тренируешь.",
    и:"Haugen 2023, BMC Sports Sci Med Rehabil", u:"https://pubmed.ncbi.nlm.nih.gov/37582807/" },
  { р:"Анатомия", т:"«Неудобное» упражнение часто про длину рычагов, а не про слабость. Разумнее сменить вариант или амплитуду, чем терпеть.",
    и:"Vigotsky 2019, J Strength Cond Res", u:"https://pubmed.ncbi.nlm.nih.gov/29489722/" },
  { р:"Вариативность", т:"Частая смена упражнений преимущества не даёт. Держать движение 6–12 недель; менять при плато, боли или скуке.",
    и:"Kassiano 2022, J Strength Cond Res", u:"https://pubmed.ncbi.nlm.nih.gov/35438660/" },
  { р:"Темп", т:"Скорость повтора в диапазоне 0,5–8 секунд на рост не влияет. Достаточно 1–2 с вниз, 1 с вверх — специально замедляться не нужно.",
    и:"Schoenfeld 2015, Sports Med", u:"https://pubmed.ncbi.nlm.nih.gov/25601394/" },
  { р:"Боль", т:"Умеренный дискомфорт в мышце допустим. Боль в суставе, резкая или с онемением и прострелом — стоп-сигнал, а не повод терпеть.",
    и:"Smith 2017, Br J Sports Med", u:"https://pubmed.ncbi.nlm.nih.gov/28596288/" }
];

const ПРОТОКОЛ = [
  "Смотри на цифры, а не на ощущение: растёт ли вес, повторы, оценка 1ПМ за 4–6 недель. «Забило мышцу» само по себе ничего не доказывает — ЭМГ не предсказывает рост.",
  "Отказывает именно целевая мышца, а не «устал весь». Если первой сдаётся не она — меняем угол или вариант.",
  "Техника воспроизводима: можешь повторить движение так же в следующий раз? Если «плывёт» — вес велик или вариант плохой.",
  "Боль: дискомфорт в мышце до 3/10 — норма. Боль в суставе, резкая или с онемением/прострелом — стоп и к врачу.",
  "Усталость против стимула: если после упражнения убит, страдает следующая тренировка, а прогресса нет — упражнение не твоё.",
  "Личный тест: два варианта одного движения по 4–6 недель, одинаковый объём и RIR. Результат — только цифры: вес, повторы, тоннаж.",
  "Держи упражнение 6–12 недель. Менять каждую тренировку («мышечная путаница») смысла нет — это миф.",
  "Прогресс есть, но техника плывёт → меняем технику и вес, упражнение оставляем. Нет прогресса или есть боль → меняем упражнение."
];

const ГДЕ_СМОТРЕТЬ = [
  { н:"Stronger by Science", у:"https://www.strongerbyscience.com", о:"разборы исследований: объём, частота, техника" },
  { н:"Renaissance Periodization", у:"https://www.youtube.com/@RenaissancePeriodization", о:"техника, подбор упражнений, объём" },
  { н:"Jeff Nippard", у:"https://www.youtube.com/@JeffNippard", о:"техника и программы со ссылками на исследования" },
  { н:"Barbell Medicine", у:"https://www.barbellmedicine.com", о:"тренировки при боли и ограничениях (врачи)" },
  { н:"Data Driven Strength", у:"https://www.youtube.com/@DataDrivenStrength", о:"авторы мета-анализов: дозирование, техника" },
  { н:"S&C Research (Chris Beardsley)", у:"https://sandcresearch.com", о:"биомеханика, стимул/усталость, механизмы" },
  { н:"3D Muscle Journey (Eric Helms)", у:"https://www.youtube.com/team3dmj", о:"объём, частота, техника, питание" },
  { н:"Juggernaut Training Systems", у:"https://www.jtsstrength.com", о:"техника базовых движений" },
  { н:"Alan Thrall", у:"https://www.youtube.com/@AlanThrall", о:"очень доступная техника и замены при ограничениях" },
  { н:"Squat University", у:"https://www.youtube.com/@SquatUniversity", о:"биомеханика, мобильность, боль в суставе" },
  { н:"Bret Contreras", у:"https://bretcontreras.com", о:"ягодицы и ноги, ограничения ЭМГ" },
  { н:"House of Hypertrophy", у:"https://www.youtube.com/@HouseofHypertrophy", о:"разбор исследований по гипертрофии" },
  { н:"MASS Research Review", у:"https://massresearchreview.com", о:"ежемесячный разбор новых статей (платно)" },
  { н:"Sci-Fit (рус.)", у:"https://sci-fit.net", о:"переводы научных статей со ссылками на первоисточники" },
  { н:"Prosportlab (рус.)", у:"https://prosportlab.com/works/strength-training/ch5", о:"силовая тренировка с опорой на физиологию" }
];

const КАК_ОТЛИЧАТЬ = [
  "Есть ссылки на конкретные исследования (PubMed/DOI), а не «учёные доказали».",
  "У автора профильное образование или публикации (PhD, врач, автор мета-анализов), а не только титул «чемпион».",
  "Не обещает «секрет», «одно упражнение» и «прорыв»; говорит о размере эффекта и неопределённости.",
  "Честно признаёт, где данных мало. Популярность не равна корректности."
];

const МИФЫ = [
  ["Менять упражнения каждую тренировку ("+"«путаница»"+")", "не подтверждается: прогресс даёт перегрузка в знакомых движениях"],
  ["Пресс убирает живот, сведения — жир с груди", "локальная тренировка не сжигает жир в этом месте"],
  ["Анаболическое окно 30 минут", "окно шире; решает суточный белок, до или после — одинаково"],
  ["Без приседа и становой массы не будет", "машины дают сходную гипертрофию; важнее объём и усилие"],
  ["Растяжка предотвращает травмы", "не подтверждается; риск снижает силовая работа"],
  ["Тренировка до отказа обязательна", "RIR 1–2 дают тот же результат"],
  ["Малые веса — рельеф, большие — масса", "при равном усилии 5–30 повторов дают сходный рост"]
];
const load = () => { try { const s = JSON.parse(localStorage.getItem(KEY)); return s && s.sessions ? s : {sessions:[], вес:[]} } catch(e){ return {sessions:[], вес:[]} } };
const save = s => localStorage.setItem(KEY, JSON.stringify(s));
let state = load();
if(!state.заметки) state.заметки = {};
/* Жёсткая починка плана (v3.5): любая битая структура — дни без wd, без группы,
   с пустыми упражнениями, неполный набор дней — заменяется стандартным планом.
   Кастомные названия упражнений сохраняем по id. */
(function(){
  const validDay = d => d && Array.isArray(d.wd) && d.wd.length &&
    typeof d.группа === "string" && d.группа.trim() &&
    Array.isArray(d.упражнения) && d.упражнения.length &&
    d.упражнения.every(e => e && e.id && e.имя && +e.подходы > 0);
  const days = state.план && state.план.дни;
  const ok = Array.isArray(days) && days.length >= 3 && days.every(validDay) &&
    [2,4,6,0].every(w => days.some(d => d.wd.includes(w)));
  if(!ok){
    const старыеИмена = {};
    (days || []).forEach(d => (d.упражнения || []).forEach(e => {
      if(e && e.id && e.имя) старыеИмена[e.id] = e.имя;
    }));
    state.план = JSON.parse(JSON.stringify(PLAN));
    state.план.дни.forEach(d => d.упражнения.forEach(e => {
      if(старыеИмена[e.id] && старыеИмена[e.id] !== e.имя) e.имя = старыеИмена[e.id] + " (" + e.имя + ")";
    }));
    save(state);
  }
})();
let tab = "today";
let manualPlan = null;

const fmtDate = d => new Date(d).toLocaleDateString("ru-RU",{day:"2-digit",month:"2-digit"});
const todayKey = () => new Date().toISOString().slice(0,10);
const planFor = wd => (P().дни || []).find(d => d.wd && d.wd.includes(wd));
const P = () => state.план || PLAN;
const round = (x, step) => Math.round(x / step) * step;

const planEx = id => P().дни.flatMap(d => d.упражнения).find(e => e.id === id);

function allEntries(exId){
  const pe = planEx(exId) || {};
  const need = pe.подходы || 0, top = pe.верх || 0;
  const out = [];
  state.sessions.forEach(s => {
    const e = s.упражнения.find(x => x.id === exId);
    if(!e) return;
    const done = e.подходы.filter(p => p.готово && +p.вес > 0);
    if(!done.length) return;
    out.push({
      дата: s.дата,
      вес: Math.max(...done.map(p => +p.вес)),
      объём: done.reduce((n,p) => n + (+p.вес) * (+p.повторы || 0), 0),
      сделано: done,
      hitTop: done.length >= need && done.every(p => (+p.повторы || 0) >= top)
    });
  });
  return out.sort((a,b) => a.дата < b.дата ? -1 : 1);
}
const bestBefore = exId => {
  const today = todayKey();
  let best = 0;
  state.sessions.forEach(s => {
    if(s.дата >= today) return;
    const e = s.упражнения.find(x => x.id === exId);
    if(!e) return;
    e.подходы.forEach(p => { if(p.готово && +p.вес > best) best = +p.вес; });
  });
  return best;
};

function suggest(ex){
  const h = allEntries(ex.id);
  if(!h.length) return {вес:null, text:"Первый раз — выбери рабочий вес сам", muted:true};
  const last = h[h.length-1];
  let misses = 0;
  for(let i = h.length-1; i >= 0 && !h[i].hitTop; i--) misses++;
  if(last.hitTop){
    return {вес:last.вес + P().шаг, text:`Прошлый раз ${last.сделано.length}×${ex.верх} с ${last.вес} кг → сегодня ${last.вес + P().шаг} кг`};
  }
  if(misses >= 2){
    const w = round(last.вес * 0.9, P().шаг);
    return {вес:w, text:`Два раза не добрал повторы → сброс 10%: ${w} кг (было ${last.вес})`};
  }
  return {вес:last.вес, text:`Прошлый раз ${last.сделано.length} подх. по ${last.вес} кг → тот же вес, добери повторы`, muted:true};
}

function ensureSession(plan){
  const k = todayKey();
  let s = state.sessions.find(x => x.дата === k);
  if(!s){ s = { дата:k, группа:plan.группа, упражнения:[] }; state.sessions.push(s); }
  plan.упражнения.forEach(ex => {
    if(!s.упражнения.find(x => x.id === ex.id)){
      const h = suggest(ex);
      s.упражнения.push({ id:ex.id, имя:ex.имя, подходы: Array.from({length:ex.подходы},()=>({
        вес: h.вес ?? "", повторы:"", готово:false
      }))});
    }
  });
  save(state);
  return s;
}

function warmups(w){
  if(!w || +w <= P().шаг*2) return [];
  return [0.4, 0.6, 0.8].map(p => round(+w * p, P().шаг)).filter(x => x > 0 && x < +w);
}

/* ---------- свои окна вместо prompt/alert (в установленном приложении они блокируются) ---------- */
function toast(msg){
  const t = document.getElementById("toast");
  t.textContent = msg; t.style.display = "block";
  clearTimeout(t._h); t._h = setTimeout(() => { t.style.display = "none"; }, 2600);
}
function closeModal(){ document.getElementById("modal").classList.remove("show"); }
function form(title, fields, ok, hint){
  const box = document.getElementById("modalBox");
  box.innerHTML = `<h3>${esc(title)}</h3>${hint ? `<div class="hint muted" style="margin:6px 0 0">${esc(hint)}</div>` : ""}
    ${fields.map((f, i) => `<label>${esc(f.label)}</label>
      ${f.big ? `<textarea id="f${i}" rows="3">${esc(f.value)}</textarea>`
              : `<input id="f${i}" type="${esc(f.type || "text")}" ${f.type === "number" ? 'inputmode="decimal" step="any"' : ""} value="${esc(f.value)}">`}`).join("")}
    <div class="acts">
      <button class="btn ghost" id="mCancel">Отмена</button>
      <button class="btn" id="mOk">Сохранить</button>
    </div>`;
  document.getElementById("modal").classList.add("show");
  document.getElementById("mCancel").onclick = closeModal;
  document.getElementById("mOk").onclick = () => {
    const vals = fields.map((f, i) => document.getElementById("f" + i).value);
    closeModal();
    ok(vals);
  };
}
function ask(title, text, ok){
  const box = document.getElementById("modalBox");
  box.innerHTML = `<h3>${esc(title)}</h3><div class="hint muted" style="margin:8px 0 0">${esc(text)}</div>
    <div class="acts"><button class="btn ghost" id="mCancel">Отмена</button>
    <button class="btn" id="mOk">Да</button></div>`;
  document.getElementById("modal").classList.add("show");
  document.getElementById("mCancel").onclick = closeModal;
  document.getElementById("mOk").onclick = () => { closeModal(); ok(); };
}
function showText(title, text){
  const box = document.getElementById("modalBox");
  box.innerHTML = `<h3>${esc(title)}</h3><textarea rows="12" readonly>${esc(text)}</textarea>
    <div class="acts"><button class="btn" id="mCancel">Закрыть</button></div>`;
  document.getElementById("modal").classList.add("show");
  document.getElementById("mCancel").onclick = closeModal;
}

/* ---------- перестановка тренировок ---------- */
function pickDay(){
  const wd = new Date().getDay();
  const cur = manualPlan || planFor(wd);
  const days = P().дни;
  const curIdx = days.findIndex(d => d === cur);
  if(curIdx < 0){ toast("Сегодня отдых — выбери «Тренироваться сейчас»"); return; }
  const box = document.getElementById("modalBox");
  box.innerHTML = `<h3>На какую тренировку поменять?</h3>
    <div class="hint muted" style="margin:8px 0 10px">Сейчас стоит: ${esc(cur.группа)}</div>
    ${days.map((d, i) => i === curIdx ? "" :
      `<button class="btn ghost" data-swap="${i}" style="margin-bottom:8px;width:100%">${esc(d.группа)} — ${esc(d.день)}</button>`).join("")}
    <div class="acts"><button class="btn ghost" id="mCancel">Отмена</button></div>`;
  document.getElementById("modal").classList.add("show");
  document.getElementById("mCancel").onclick = closeModal;
  box.querySelectorAll("[data-swap]").forEach(b => b.onclick = () => {
    closeModal();
    swapWith(curIdx, +b.dataset.swap);
  });
}

function swapWith(fromIdx, toIdx){
  const days = P().дни;
  if(fromIdx < 0 || toIdx < 0 || fromIdx === toIdx) return;
  const A = days[fromIdx], B = days[toIdx];
  const wa = A.wd;
  A.wd = B.wd;
  B.wd = wa;
  P().свой = true;

  const k = todayKey();
  const s = state.sessions.find(x => x.дата === k);
  const done = s && s.упражнения.some(e => e.подходы.some(p => p.готово));

  const apply = () => {
    state.sessions = state.sessions.filter(x => x.дата !== k);
    manualPlan = null;
    save(state);
    render();
    toast(`${B.группа[0].toUpperCase() + B.группа.slice(1)} сегодня, ${A.группа} — ${B.день}`);
  };

  if(done){
    ask("Сегодня уже есть подходы",
        "Они записаны по другой тренировке. Начать новую и удалить введённое сегодня?",
        apply);
  } else {
    apply();
  }
}

/* ---------- таймер отдыха ---------- */
let tick = null;
function getTimer(){ try { return JSON.parse(localStorage.getItem(TKEY)) } catch(e){ return null } }
function setTimer(o){ o ? localStorage.setItem(TKEY, JSON.stringify(o)) : localStorage.removeItem(TKEY); drawTimer(); }
function startRest(sec){ const total = sec || P().отдых; setTimer({end: Date.now() + total*1000, total}); }
function drawTimer(){
  const el = document.getElementById("timer");
  const t = getTimer();
  if(!t){ el.classList.remove("show","finished"); return; }
  el.classList.add("show");
  const left = Math.max(0, Math.round((t.end - Date.now())/1000));
  document.getElementById("timerT").textContent = `${Math.floor(left/60)}:${String(left%60).padStart(2,"0")}`;
  document.getElementById("timerL").textContent = left ? "отдых" : "отдых закончен";
  el.classList.toggle("finished", left === 0);
  if(!left && !t.beeped){
    t.beeped = true; localStorage.setItem(TKEY, JSON.stringify(t));
    if(navigator.vibrate) navigator.vibrate([200,100,200]);
  }
}
if(!tick) tick = setInterval(drawTimer, 500);
document.getElementById("timerPlus").onclick = () => { const t = getTimer(); if(!t) return; t.end += 15000; t.beeped = false; setTimer(t); };
document.getElementById("timerStop").onclick = () => setTimer(null);

/* ---------- экраны ---------- */
function renderToday(){
  const wd = new Date().getDay();
  const plan = manualPlan || planFor(wd);
  const title = document.getElementById("title"), sub = document.getElementById("subtitle"), app = document.getElementById("app");
  if(!plan){
    let n = null;
    for(let i=1;i<=7;i++){ const p = planFor((wd+i)%7); if(p){ n = {p, через:i}; break; } }
    /* План есть, но ни один день недели не находится — план повреждён. Чиним сами. */
    if(!n){
      title.textContent = "План повреждён";
      sub.textContent = "восстановление одним нажатием";
      app.innerHTML = '<section class="card"><div class="empty">План на телефоне в старом формате.<br>История тренировок сохранится — вернёт стандартный план.</div>' +
        '<button class="btn" id="repairPlan" style="margin-top:12px">Восстановить план</button></section>';
      document.getElementById("repairPlan").onclick = () => {
        state.план = JSON.parse(JSON.stringify(PLAN));
        save(state); render(); toast("План восстановлен");
      };
      return;
    }
    
    title.textContent = "Отдых";
    sub.textContent = new Date().toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long"});
    app.innerHTML = `<section class="card">
      <div class="empty">Сегодня по плану отдыха.<br>Следующая — <b>${esc(n.p.группа)}</b> через ${esc(n.через)} дн.</div>
      ${n.p.упражнения.map(e => `<div class="wr"><span>${esc(e.имя)}</span><span>${esc(e.подходы)}×${esc(e.низ)}–${esc(e.верх)}</span></div>`).join("")}
      <button class="btn" id="startNow" style="margin-top:14px">Тренироваться сейчас (${esc(n.p.группа)})</button>
      </section>`;
    document.getElementById("startNow").onclick = () => { manualPlan = n.p; render(); };
    return;
  }
  const s = ensureSession(plan);
  title.textContent = plan.группа[0].toUpperCase() + plan.группа.slice(1);
  const doneEx = s.упражнения.filter(e => e.подходы.every(p => p.готово)).length;
  sub.innerHTML = `${new Date().toLocaleDateString("ru-RU",{weekday:"long",day:"numeric",month:"long"})}
    · <span class="pill">${doneEx}/${s.упражнения.length} готово</span>`;

  app.innerHTML = s.упражнения.map((e, ei) => {
    const ex = plan.упражнения.find(x => x.id === e.id);
    const h = suggest(ex);
    const allDone = e.подходы.every(p => p.готово);
    const best = bestBefore(e.id);
    const wu = warmups(e.подходы[0].вес);
    return `<section class="card ${allDone ? "done" : ""}">
      <div class="exhead"><div class="exname">${esc(e.имя)}</div>
        <div class="plan">${esc(ex.подходы)} × ${esc(ex.низ)}–${esc(ex.верх)}<span class="tbtn" data-rest="${esc(ex.отдых || 90)}">⏱</span></div></div>
      <div class="hint ${h.muted ? "muted" : ""}">${esc(h.text)}</div>
      ${state.заметки[e.id] ? `<div class="note">${esc(state.заметки[e.id])}</div>` : ""}
      <div class="notebtn" data-note="${esc(e.id)}">✎ ${state.заметки[e.id] ? "изменить заметку" : "заметка"}</div>
      ${(t => t ? `<details class="tech"><summary>техника и подсказки</summary>
        <ul>${t.подсказки.map(c => `<li>${esc(c)}</li>`).join("")}</ul>
        <div class="bad">Чего избегать: ${esc(t.ошибки)}</div>
        <a href="https://www.youtube.com/results?search_query=${encodeURIComponent(e.имя + " техника выполнения")}" target="_blank" rel="noopener">видео: как делать</a>
      </details>` : "")(TIPS[e.id])}
      ${wu.length ? `<div class="warmup"><div class="wt">разминка</div>
        ${wu.map(w => `<div class="wr"><span>${Math.round(w/(+e.подходы[0].вес||1)*100)}%</span><span>${w} кг × 8–10</span></div>`).join("")}
      </div>` : ""}
      <div class="sets">
        ${e.подходы.map((p, pi) => {
          const rec = p.готово && +p.вес > best && best > 0;
          return `<div class="set">
          <div class="n">${pi+1}${rec ? ' <span class="pill rec">PR</span>' : ""}</div>
          <input type="number" inputmode="decimal" step="1.25" min="0" placeholder="кг"
                 value="${esc(p.вес)}" data-ex="${ei}" data-set="${pi}" data-f="вес">
          <input type="number" inputmode="numeric" step="1" min="0" placeholder="повт."
                 value="${esc(p.повторы)}" data-ex="${ei}" data-set="${pi}" data-f="повторы">
          <div class="chk ${p.готово ? "on" : ""}" data-ex="${ei}" data-set="${pi}">✓</div>
        </div>`}).join("")}
      </div>
    </section>`;
  }).join("") + `<div class="card">
    <button class="btn ghost" id="swapDay" style="margin-bottom:10px">↔ Поменять тренировку</button>
    <button class="btn" id="finish">Закончить тренировку</button></div>`;

  app.querySelectorAll("input[type=number]").forEach(inp => inp.addEventListener("input", ev => {
    const {ex, set, f} = ev.target.dataset;
    s.упражнения[+ex].подходы[+set][f] = ev.target.value; save(state);
  }));
  app.querySelectorAll(".chk").forEach(chk => chk.addEventListener("click", ev => {
    const {ex, set} = ev.currentTarget.dataset;
    const p = s.упражнения[+ex].подходы[+set];
    p.готово = !p.готово;
    if(p.готово && +p.вес > 0 && !p.повторы) p.повторы = ex_верх(plan, s.упражнения[+ex].id);
    save(state);
    if(p.готово){
      const exObj = plan.упражнения.find(x => x.id === s.упражнения[+ex].id);
      startRest(exObj ? exObj.отдых : P().отдых);
    }
    renderToday();
  }));
  app.querySelectorAll(".tbtn").forEach(b => b.addEventListener("click", ev => {
    startRest(+ev.currentTarget.dataset.rest || P().отдых);
  }));
  app.querySelectorAll("[data-note]").forEach(b => b.addEventListener("click", () => {
    const id = b.dataset.note;
    form("Заметка к упражнению", [{ label: "Что помнить", value: state.заметки[id] || "", big: true }], ([v]) => {
      if(v.trim()) state.заметки[id] = v.trim(); else delete state.заметки[id];
      save(state); renderToday(); toast(v.trim() ? "Заметка сохранена" : "Заметка удалена");
    }, "Например: «плечо хрустит — вес не выше 40»");
  }));
  document.getElementById("swapDay").onclick = pickDay;
  document.getElementById("finish").onclick = () => {
    const done = s.упражнения.reduce((n,e) => n + e.подходы.filter(p => p.готово).length, 0);
    if(!done){ toast("Пока ни одного подхода не отмечено"); return; }
    toast(`Готово: ${done} подходов. Данные на телефоне`);
    tab = "progress"; render();
  };
}
const ex_верх = (plan, id) => { const ex = plan.упражнения.find(x => x.id === id); return ex ? String(ex.верх) : ""; };

function renderProgress(){
  const app = document.getElementById("app");
  document.getElementById("title").textContent = "Прогресс";
  const sessions = state.sessions.filter(s => s.упражнения.some(e => e.подходы.some(p => p.готово)));
  document.getElementById("subtitle").innerHTML = `тренировок: ${sessions.length}`;

  const byEx = new Map();
  sessions.forEach(s => s.упражнения.forEach(e => {
    const done = e.подходы.filter(p => p.готово && +p.вес > 0);
    if(!done.length) return;
    const vol = done.reduce((n,p) => n + (+p.вес) * (+p.повторы || 0), 0);
    if(!byEx.has(e.id)) byEx.set(e.id, {имя:e.имя, точки:[]});
    byEx.get(e.id).точки.push({дата:s.дата, best:Math.max(...done.map(p => +p.вес)), vol});
  }));

  let html = "";

  /* --- сводка за 4 недели --- */
  const done = sessions.map(s => ({
    дата: s.дата,
    тоннаж: s.упражнения.reduce((n,e) => n + e.подходы.filter(p => p.готово && +p.вес > 0)
      .reduce((m,p) => m + (+p.вес) * (+p.повторы || 0), 0), 0),
    подходы: s.упражнения.reduce((n,e) => n + e.подходы.filter(p => p.готово).length, 0)
  })).filter(x => x.подходы > 0);
  const weeks = new Map();
  done.forEach(x => {
    const d = new Date(x.дата + "T12:00:00");
    const mon = new Date(d); mon.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    const k = mon.toISOString().slice(0,10);
    const w = weeks.get(k) || {тоннаж:0, тренировок:0, подходы:0};
    w.тоннаж += x.тоннаж; w.тренировок++; w.подходы += x.подходы;
    weeks.set(k, w);
  });
  const wkeys = [...weeks.keys()].sort().slice(-6);
  const wmax = Math.max(1, ...wkeys.map(k => weeks.get(k).тоннаж));
  const last4 = wkeys.slice(-4);
  const тоннаж4 = last4.reduce((n,k) => n + weeks.get(k).тоннаж, 0);
  const тр4 = last4.reduce((n,k) => n + weeks.get(k).тренировок, 0);
  const пд4 = last4.reduce((n,k) => n + weeks.get(k).подходы, 0);

  if(done.length){
    html += `<section class="card">
      <div class="exhead"><div class="exname">Итоги</div><div class="plan">за 4 недели</div></div>
      <div class="hist">
        <div class="hbar"><span>тренировок</span><span class="bar"><i style="width:${Math.min(100, тр4/12*100)}%"></i></span><span>${тр4}</span></div>
        <div class="hbar"><span>тоннаж</span><span class="bar"><i style="width:100%"></i></span><span>${Math.round(тоннаж4/1000)} т</span></div>
        <div class="hbar"><span>подходов</span><span class="bar"><i style="width:${Math.min(100, пд4/200*100)}%"></i></span><span>${пд4}</span></div>
      </div>
      ${wkeys.length > 1 ? `<div class="hist" style="margin-top:12px">${wkeys.map(k => `<div class="hbar">
        <span>${fmtDate(k)}</span><span class="bar"><i style="width:${Math.round(weeks.get(k).тоннаж/wmax*100)}%"></i></span>
        <span>${Math.round(weeks.get(k).тоннаж/1000)} т</span></div>`).join("")}</div>` : ""}
    </section>`;
  }

  /* объём за неделю по группам мышц — из текущего плана */
  const groups = {};
  P().дни.forEach(d => d.упражнения.forEach(e => {
    const g = e.гр || "прочее";
    groups[g] = (groups[g] || 0) + e.подходы;
  }));
  const gmax = Math.max(20, ...Object.values(groups));
  html += `<section class="card">
    <div class="exhead"><div class="exname">Объём за неделю</div><div class="plan">подходов</div></div>
    <div class="hint muted">Рабочая зона 8–20 подходов на группу в неделю. Ниже 8 — роста почти нет, выше 20 — лишняя усталость.</div>
    ${Object.entries(groups).map(([g, n]) => {
      const ok = n >= 8 && n <= 20;
      return `<div class="vrow"><span class="vt">${esc(g)}</span>
        <span class="bar"><i style="width:${Math.round(n/gmax*100)}%;background:${ok ? "var(--ok)" : "var(--warn)"}"></i></span>
        <span>${esc(n)}${ok ? "" : n < 8 ? " ⚠" : " ↑"}</span></div>`;
    }).join("")}
  </section>`;

  if(!sessions.length){
    html += `<div class="card"><div class="empty">Пока пусто. Отметь первый подход — и здесь появится история.</div></div>`;
  } else {
    html += [...byEx.entries()].map(([id, v]) => {
      const pts = v.точки.slice(-6);
      const max = Math.max(...pts.map(p => p.vol)) || 1;
      const last = pts[pts.length-1];
      const best = Math.max(...v.точки.map(p => p.best));
      /* оценка 1ПМ по формуле Эпли: вес × (1 + повторы / 30) */
      let rm = 0;
      sessions.forEach(s => s.упражнения.filter(e => e.id === id).forEach(e =>
        e.подходы.filter(p => p.готово && +p.вес > 0 && +p.повторы > 0).forEach(p => {
          const est = (+p.вес) * (1 + (+p.повторы) / 30);
          if(est > rm) rm = est;
        })));
      return `<section class="card">
        <div class="exhead"><div class="exname">${esc(v.имя)}</div><div class="plan">рекорд ${esc(best)} кг</div></div>
        <div class="hint muted">последний раз ${fmtDate(last.дата)} · объём ${last.vol} кг${rm ? ` · оценка 1ПМ ≈ ${Math.round(rm*2)/2} кг` : ""}</div>
        <div class="hist">${pts.map(p => `<div class="hbar">
          <span>${fmtDate(p.дата)}</span>
          <span class="bar"><i style="width:${Math.round(p.vol/max*100)}%"></i></span>
          <span>${p.vol}</span></div>`).join("")}</div>
      </section>`;
    }).join("");
  }
  app.innerHTML = html;
}

function renderScience(){
  const app = document.getElementById("app");
  document.getElementById("title").textContent = "Наука";
  document.getElementById("subtitle").textContent = "обзоры и мета-анализы, ссылки на PubMed";
  const cards = НАУКА.map(x => `<section class="card">
    <div class="exhead"><div class="exname">${x.р}</div></div>
    <div style="font-size:14px">${x.т}</div>
    <a class="src" href="${x.u}" target="_blank" rel="noopener">${x.и}</a>
  </section>`).join("");
  const myths = МИФЫ.map(([m, r]) => `<div class="myth"><b>${m}</b><br><span>${r}</span></div>`).join("");
  const proto = ПРОТОКОЛ.map((p, i) => `<div class="myth"><b>${i + 1}.</b> ${p}</div>`).join("");
  const src = ГДЕ_СМОТРЕТЬ.map(s => `<div class="myth"><b>${s.н}</b><br>
    <span>${s.о}</span><br><a class="src" href="${s.у}" target="_blank" rel="noopener">${s.у.replace(/^https?:\/\/(www\.)?/, "")}</a></div>`).join("");
  const how = КАК_ОТЛИЧАТЬ.map(h => `<div class="myth">${h}</div>`).join("");
  app.innerHTML = cards + `<section class="card">
    <div class="exhead"><div class="exname">Как понять, что упражнение твоё</div><div class="plan">4–6 недель</div></div>
    ${proto}
  </section>
  <section class="card">
    <div class="exhead"><div class="exname">Мифы</div><div class="plan">не подтверждаются</div></div>
    ${myths}
  </section>
  <section class="card">
    <div class="exhead"><div class="exname">Где смотреть технику</div><div class="plan">проверенные</div></div>
    ${src}
  </section>
  <section class="card">
    <div class="exhead"><div class="exname">Как отличать знание от хайпа</div></div>
    ${how}
  </section>
  <section class="card"><div class="hint muted">Это общие данные из литературы, а не медицинское заключение.
  Поясница и допустимые веса — только с лечащим врачом. Полный разбор с 63 источниками — в файле наука.md.</div></section>`;
}

function renderMedic(){
  const app = document.getElementById("app");
  document.getElementById("title").textContent = "Медик";
  document.getElementById("subtitle").textContent = "личный контроль здоровья";

  const days = state.дни || {};
  const keys = Object.keys(days).sort().slice(-7);
  const num = v => +v || 0;
  const avg = arr => arr.length ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : null;
  const sleep = avg(keys.map(k => num(days[k].сон)).filter(Boolean));
  const prot = avg(keys.map(k => num(days[k].белок)).filter(Boolean));
  const w = state.вес && state.вес.length ? state.вес[state.вес.length - 1] : null;
  const norm = w ? Math.round(1.6 * w.кг) : null;
  const week = Date.now() - 7 * 864e5;
  const sess = state.sessions.filter(s => new Date(s.дата).getTime() > week).length;
  const row = (label, val, note) => `<div class="wr"><span>${label}</span><span>${val}${note ? " · " + note : ""}</span></div>`;

  const flags = [
    "давящая боль или сжатие в груди, особенно при нагрузке",
    "одышка в покое или при разговоре",
    "обморок, предобморочное состояние, внезапное онемение или асимметрия лица",
    "резкая небывалая головная боль",
    "давление 180/110 и выше",
    "кровь в моче, кале или рвота с кровью",
    "температура выше 38 больше трёх дней",
    "потеря веса больше 5% за месяц без цели",
    "отёки на ногах, которые не проходят за ночь"
  ].map(t => `<li>${t}</li>`).join("");

  const annual = [
    "общий анализ крови с лейкоцитарной формулой",
    "глюкоза натощак и HbA1c",
    "липидограмма: общий холестерин, ЛПНП, ЛПВП, триглицериды",
    "биохимия: АЛТ, АСТ, билирубин, креатинин с расчётом СКФ, мочевая кислота",
    "ТТГ",
    "ферритин и железо — если есть утомляемость",
    "витамин D 25-ОН — по показаниям, зимой часто низкий",
    "ЭКГ и давление — с 35–40 лет, раньше при жалобах",
    "ПСА — мужчинам после 40–45, решение с врачом"
  ].map(t => `<li>${t}</li>`).join("");

  const home = [
    "давление: 2 раза в день, 7 дней подряд, сидя после 5 минут покоя — это информативнее одного замера в кабинете",
    "пульс покоя утром, до кофе",
    "вес: раз в неделю, утром натощак, иначе шум",
    "талия: раз в месяц, по пупку",
    "сон и белок — они уже в блоке «День»"
  ].map(t => `<li>${t}</li>`).join("");

  const reading = [
    "референсы у каждой лаборатории свои, чужой бланк ничего не значит",
    "один результат — не диагноз, смотри тренд из трёх точек",
    "перед выводами повтор через 2–4 недели: сон, нагрузка, алкоголь и обезвоживание меняют цифры",
    "норма и оптимум — разные вещи: «в пределах» не всегда «хорошо»",
    "не лечить цифру: лечат человека, а не показатель"
  ].map(t => `<li>${t}</li>`).join("");

  const questions = [
    "как давно это началось и что меняет состояние",
    "что уже проверяли и какие результаты",
    "какие лекарства и добавки принимаю постоянно",
    "наследственность: инфаркты, инсульты, диабет, онкология у родных до 60",
    "сон, алкоголь, курение, кофеин",
    "что я хочу понять: успокоиться, найти причину или получить план"
  ].map(t => `<li>${t}</li>`).join("");

  app.innerHTML = `
  <section class="card">
    <div class="exhead"><div class="exname">Мои цифры за неделю</div><div class="plan">${keys.length ? keys.length + " дн." : "нет данных"}</div></div>
    ${row("сон", sleep ? sleep + " ч" : "—", sleep && sleep < 7 ? "мало" : "")}
    ${row("белок", prot ? prot + " г" : "—", norm ? "норма около " + norm + " г" : "")}
    ${row("вес", w ? w.кг + " кг" : "—", w ? fmtDate(w.дата) : "")}
    ${row("тренировок за 7 дней", sess)}
    <div class="hint muted" style="margin-top:8px">Берётся из блока «День» и журнала тренировок. Пусто — значит не заполнено.</div>
  </section>

  <section class="card">
    <div class="exhead"><div class="exname">Красные флаги</div><div class="plan">к врачу сразу</div></div>
    <div class="hint muted">Это не «понаблюдать». С таким идут в приёмное отделение или вызывают скорую.</div>
    <ul>${flags}</ul>
  </section>

  <section class="card">
    <div class="exhead"><div class="exname">Раз в год: базовый набор</div><div class="plan">чек-лист</div></div>
    <div class="hint muted">Не назначение. Список того, что обсуждают с врачом, чтобы не забыть.</div>
    <ul>${annual}</ul>
  </section>

  <section class="card">
    <div class="exhead"><div class="exname">Дома: что мерить</div><div class="plan">без гаджетов</div></div>
    <ul>${home}</ul>
  </section>

  <section class="card">
    <div class="exhead"><div class="exname">Как читать анализы</div><div class="plan">правила</div></div>
    <ul>${reading}</ul>
  </section>

  <section class="card">
    <div class="exhead"><div class="exname">Что спросит дотошный медик</div><div class="plan">до выводов</div></div>
    <ul>${questions}</ul>
  </section>

  <section class="card"><div class="hint muted">Раздел собран по открытым клиническим рекомендациям и служит памяткой,
  а не заключением. Диагноз и лечение — только с врачом, который видит анализы и тебя целиком.
  Красные флаги не обсуждаются в чате — с ними едут в больницу.</div></section>`;
}

function renderPlan(){
  const app = document.getElementById("app");
  document.getElementById("title").textContent = "План";
  document.getElementById("subtitle").textContent = "нажми на упражнение, чтобы изменить";
  const pl = P();
  app.innerHTML = pl.дни.map((d, di) => `<section class="card">
    <div class="exhead"><div class="exname">${esc(d.группа)}</div><div class="plan">${esc(d.упражнения.reduce((n,e)=>n+e.подходы,0))} подх.</div></div>
    ${d.упражнения.map((e, ei) => `<div class="erow" data-d="${di}" data-e="${ei}">
      <span class="ename">${esc(e.имя)}</span>
      <span class="eplan">${esc(e.подходы)}×${esc(e.низ)}–${esc(e.верх)}</span>
      <span class="del" data-d="${di}" data-e="${ei}">✕</span>
    </div>`).join("")}
    <button class="btn ghost" data-add="${di}" style="margin-top:10px">+ упражнение</button>
  </section>`).join("") + `<section class="card">
    <div class="hint muted">Изменения сохраняются на телефоне. История по упражнению привязана к нему, поэтому при замене упражнения старые записи остаются в «Прогрессе».</div>
    <button class="btn ghost" id="planReset">Вернуть стандартный план</button>
  </section>`;

  app.querySelectorAll(".erow").forEach(row => row.addEventListener("click", ev => {
    if(ev.target.classList.contains("del")) return;
    const di = +row.dataset.d, ei = +row.dataset.e;
    const e = P().дни[di].упражнения[ei];
    form("Упражнение", [
      { label: "Название", value: e.имя },
      { label: "Подходы", value: e.подходы, type: "number" },
      { label: "Повторы (например 8-12)", value: `${e.низ}-${e.верх}` },
      { label: "Отдых, сек", value: e.отдых || 90, type: "number" }
    ], ([name, sets, reps, rest]) => {
      const m = String(reps).match(/(\d+)\D+(\d+)/);
      e.имя = name.trim() || e.имя;
      e.подходы = Math.max(1, Math.min(12, +sets || e.подходы));
      if(m){ e.низ = +m[1]; e.верх = +m[2]; } else if(+reps){ e.низ = e.верх = +reps; }
      e.отдых = Math.max(0, +rest || e.отдых || 90);
      P().свой = true;
      save(state); renderPlan(); toast("Изменено");
    });
  }));
  app.querySelectorAll(".del").forEach(x => x.addEventListener("click", ev => {
    ev.stopPropagation();
    const di = +x.dataset.d, ei = +x.dataset.e;
    const e = P().дни[di].упражнения[ei];
    ask("Убрать упражнение?", `«${e.имя}» пропадёт из плана. История тренировок останется.`, () => {
      P().дни[di].упражнения.splice(ei, 1);
      P().свой = true;
      save(state); renderPlan(); toast("Убрано из плана");
    });
  }));
  app.querySelectorAll("[data-add]").forEach(b => b.addEventListener("click", () => {
    const di = +b.dataset.add;
    form("Новое упражнение", [
      { label: "Название", value: "" },
      { label: "Подходы", value: 3, type: "number" },
      { label: "Повторы (например 10-12)", value: "10-12" },
      { label: "Отдых, сек", value: 90, type: "number" }
    ], ([name, sets, reps, rest]) => {
      if(!name.trim()){ toast("Нужно название"); return; }
      const m = String(reps).match(/(\d+)\D+(\d+)/);
      P().дни[di].упражнения.push({
        id: "custom-" + Date.now().toString(36),
        имя: name.trim(), подходы: Math.max(1, Math.min(12, +sets || 3)),
        низ: m ? +m[1] : 10, верх: m ? +m[2] : 12, отдых: Math.max(0, +rest || 90)
      });
      P().свой = true;
      save(state); renderPlan(); toast("Добавлено");
    }, "Пиши как удобно: «тренажёр, где тянешь ручки к низу спины»");
  }));
  document.getElementById("planReset").onclick = () => {
    ask("Вернуть стандартный план?", "Твои изменения плана пропадут. История тренировок останется.", () => {
      state.план = JSON.parse(JSON.stringify(PLAN));
      save(state); renderPlan(); toast("План сброшен к стандартному");
    });
  };
}

function renderSettings(){
  const app = document.getElementById("app");
  document.getElementById("title").textContent = "Ещё";
  document.getElementById("subtitle").textContent = "данные только на этом телефоне";

  const bw = state.вес || [];
  const dayKey = todayKey();
  const d = (state.дни && state.дни[dayKey]) || {};
  const all = (state.вес || []).slice().sort((a,b) =>
    (a.ts || 0) - (b.ts || 0) || (a.дата < b.дата ? -1 : a.дата > b.дата ? 1 : 0));
  const byDay = new Map();
  all.forEach(x => byDay.set(x.дата, x));
  const days = [...byDay.values()].slice(-14);
  const pts = days.map(x => x.кг);
  const maxW = Math.max(...pts, 1), minW = Math.min(...pts, maxW - 1);
  const line = days.length > 1 ? days.map((x,i) => {
    const X = 10 + i * (280 / (days.length - 1));
    const Y = 100 - ((x.кг - minW) / Math.max(1, maxW - minW)) * 80;
    return `${X.toFixed(1)},${Y.toFixed(1)}`;
  }).join(" ") : "";
  const last = all[all.length-1];
  const rows = all.slice(-8).reverse().map((x, i, arr) => {
    const idx = all.indexOf(x);
    const prev = idx > 0 ? all[idx-1] : null;
    const d = prev ? (x.кг - prev.кг) : 0;
    const ds = prev ? (d > 0 ? "+" : "") + d.toFixed(1).replace(".", ",") : "—";
    const dt = new Date(x.ts || (x.дата + "T12:00:00"));
    return `<div class="wrow"><span>${dt.toLocaleDateString("ru-RU",{day:"2-digit",month:"2-digit"})}
      ${x.ts ? dt.toLocaleTimeString("ru-RU",{hour:"2-digit",minute:"2-digit"}) : ""}</span>
      <span>${esc(String(x.кг).replace(".", ","))} кг</span>
      <span class="${d < 0 ? "down" : d > 0 ? "up" : ""}">${esc(ds)}</span></div>`;
  }).join("");

  app.innerHTML = `
    <section class="card">
      <div class="exhead"><div class="exname">Вес тела</div><div class="plan">${last ? esc(String(last.кг).replace(".", ",")) + " кг" : "нет данных"}</div></div>
      <div class="bwbox">
        <input type="number" id="bw" step="0.1" min="30" max="250" placeholder="кг" inputmode="decimal">
        <button class="btn ghost" id="bwAdd" style="width:auto">Записать</button>
      </div>
      ${rows ? `<div class="hist">${rows}</div>` : `<div class="k" style="margin-top:8px">Пока нет замеров</div>`}
      ${days.length > 1 ? `<svg class="chart" viewBox="0 0 300 110" preserveAspectRatio="none">
        <polyline fill="none" stroke="#5b9cff" stroke-width="2" points="${line}"/></svg>
        <div class="k">${fmtDate(days[0].дата)} → ${fmtDate(days[days.length-1].дата)}</div>` : `<div class="k" style="margin-top:8px">Добавь два замера — появится график</div>`}
    </section>
    <section class="card">
      <div class="exhead"><div class="exname">Калькулятор блинов</div><div class="plan">гриф 20 кг</div></div>
      <div class="bwbox">
        <input type="number" id="plW" step="2.5" min="0" placeholder="вес" inputmode="decimal">
        <input type="number" id="plBar" step="5" min="0" value="20" style="max-width:90px" inputmode="numeric">
        <button class="btn ghost" id="plGo" style="width:auto">Считать</button>
      </div>
      <div id="plOut" class="plate"></div>
    </section>
    <section class="card">
      <div class="exhead"><div class="exname">День</div><div class="plan">${fmtDate(todayKey())}</div></div>
      <div class="hint muted">Сон и белок — половина результата. Часы: длительность, пульс, калории. Заполнять не обязательно, но с этими цифрами я могу сказать точнее, что менять.</div>
      <div class="bwbox" style="flex-wrap:wrap">
        <input type="number" id="dSleep" step="0.5" min="0" max="16" placeholder="сон, ч" inputmode="decimal" value="${esc(d.сон || "")}">
        <input type="number" id="dProtFood" step="5" min="0" max="400" placeholder="белок: еда, г" inputmode="numeric" value="${esc(d.белок_еда || "")}">
        <input type="number" id="dProtSup" step="5" min="0" max="400" placeholder="белок: добавка, г" inputmode="numeric" value="${esc(d.белок_добавка || "")}">
        <input type="number" id="dMin" step="1" min="0" max="300" placeholder="мин" inputmode="numeric" value="${esc(d.мин || "")}">
        <input type="number" id="dHr" step="1" min="0" max="220" placeholder="пульс" inputmode="numeric" value="${esc(d.пульс || "")}">
        <input type="number" id="dKcal" step="10" min="0" max="3000" placeholder="ккал" inputmode="numeric" value="${esc(d.ккал || "")}">
        <button class="btn ghost" id="dSave" style="width:auto">Сохранить</button>
      </div>
      <div class="k" id="protTotal" style="margin-top:8px">белок за день: —</div>
      ${d.мин || d.пульс || d.ккал ? `<div class="k" style="margin-top:8px">последняя тренировка: ${d.мин ? esc(d.мин) + " мин" : ""}${d.пульс ? " · пульс " + esc(d.пульс) : ""}${d.ккал ? " · " + esc(d.ккал) + " ккал" : ""}</div>` : ""}
    </section>
    <section class="card">
      <div class="exhead"><div class="exname">Данные</div><div class="plan">${state.sessions.length} записей</div></div>
      <div class="hint muted">Ничего не уходит в интернет. Синхронизации нет.</div>
      <div class="row" style="margin-bottom:8px">
        <button class="btn ghost" id="dlJson">Скачать JSON</button>
        <button class="btn ghost" id="dlCsv">Скачать CSV</button>
      </div>
      <div class="row" style="margin-bottom:8px">
        <button class="btn ghost" id="export">Скопировать JSON</button>
        <button class="btn ghost" id="report">Отчёт текстом</button>
      </div>
      <div class="row"><label class="btn ghost" style="text-align:center;display:block">Загрузить JSON<input type="file" id="import" accept=".json" hidden></label></div>
    </section>
    <section class="card">
      <div class="exhead"><div class="exname">Сброс</div></div>
      <div class="hint">Удалит всю историю и замеры веса.</div>
      <button class="btn ghost" id="reset">Стереть всё</button>
    </section>
    <section class="card">
      <div class="exhead"><div class="exname">План</div></div>
      <div class="hint muted">Вторник — спина и плечи · Четверг — грудь и руки · Суббота или воскресенье — ноги и пресс.<br>
      Без осевой нагрузки: протрузия поясницы.</div>
      <button class="btn ghost" id="editPlan" style="margin-top:10px">Изменить упражнения</button>
    </section>
    <section class="card">
      <div class="exhead"><div class="exname">О приложении</div><div class="plan">версия ${VERSION}</div></div>
      <div class="hint muted">Если видишь старую версию — нажми кнопку: она сбросит кэш и перезагрузит приложение. Данные тренировок не пострадают.</div>
      <button class="btn ghost" id="upd">Проверить обновление</button>
    </section>`;

  document.getElementById("bwAdd").onclick = () => {
    const inp = document.getElementById("bw");
    const v = +inp.value;
    if(!v || v < 30 || v > 250){ toast("Введи вес в кг"); return; }
    state.вес = state.вес || [];
    state.вес.push({ дата: todayKey(), кг: v, ts: Date.now() });
    save(state);
    renderSettings();
    const fresh = document.getElementById("bw");
    if(fresh) fresh.focus();
  };
  const download = (name, text, mime) => {
    const blob = new Blob([text], { type: mime });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
  };
  document.getElementById("dlJson").onclick = () => {
    download(`зал-${todayKey()}.json`, JSON.stringify(state, null, 1), "application/json");
  };
  document.getElementById("dlCsv").onclick = () => {
    const lines = ["дата;группа;упражнение;подход;вес;повторы"];
    state.sessions.forEach(s => s.упражнения.forEach(e => e.подходы.forEach((p, i) => {
      if(!p.готово) return;
      lines.push([s.дата, s.группа, e.имя, i + 1, p.вес, p.повторы].map(csvCell).join(";"));
    })));
    download(`зал-${todayKey()}.csv`, "\ufeff" + lines.join("\r\n"), "text/csv");
  };
  document.getElementById("report").onclick = async () => {
    const sessions = state.sessions.filter(s => s.упражнения.some(e => e.подходы.some(p => p.готово)));
    const byEx = {};
    let тоннаж = 0, подходы = 0;
    sessions.forEach(s => s.упражнения.forEach(e => e.подходы.filter(p => p.готово).forEach(p => {
      подходы++;
      if(+p.вес > 0 && +p.повторы > 0){
        тоннаж += (+p.вес) * (+p.повторы);
        const b = byEx[e.имя] || {рекорд:0, одноПМ:0, дата:""};
        if(+p.вес > b.рекорд){ b.рекорд = +p.вес; b.дата = s.дата; }
        b.одноПМ = Math.max(b.одноПМ, (+p.вес) * (1 + (+p.повторы) / 30));
        byEx[e.имя] = b;
      }
    })));
    const groups = {};
    P().дни.forEach(d => d.упражнения.forEach(e => {
      const g = e.гр || "прочее";
      groups[g] = (groups[g] || 0) + e.подходы;
    }));
    const last = sessions.length ? sessions.map(s => s.дата).sort().pop() : "—";
    const txt = [
      `# Зал: отчёт ${todayKey()}`,
      ``,
      `Тренировок: ${sessions.length}. Подходов отмечено: ${подходы}. Тоннаж: ${Math.round(тоннаж)} кг. Последняя: ${last}.`,
      ``,
      `## Объём по плану (подходов в неделю)`,
      ...Object.entries(groups).map(([g, n]) => `- ${g}: ${n}${n < 8 ? " (ниже 8 — мало)" : ""}`),
      ``,
      `## По упражнениям`,
      ...Object.entries(byEx).map(([n, b]) => `- ${n}: рекорд ${b.рекорд} кг (${fmtDate(b.дата)}), оценка 1ПМ ≈ ${Math.round(b.одноПМ*2)/2} кг`),
      ``,
      `## Вес тела`,
      ...(state.вес || []).slice(-6).map(x => `- ${fmtDate(x.дата)}: ${x.кг} кг`),
      ``,
      `## Дни (сон / белок / часы)`,
      ...Object.entries(state.дни || {}).slice(-7).map(([dt, v]) =>
        `- ${fmtDate(dt)}: сон ${v.сон || "—"} ч, белок ${v.белок || "—"} г${(v.белок_еда || v.белок_добавка) ? ` (еда ${v.белок_еда || 0} + добавка ${v.белок_добавка || 0})` : ""}, ${v.мин || "—"} мин, пульс ${v.пульс || "—"}, ${v.ккал || "—"} ккал`)
    ].join("\n");
    try { await navigator.clipboard.writeText(txt); toast("Отчёт скопирован — вставь в Telegram"); }
    catch(e){ showText("Отчёт: скопируй вручную", txt); }
  };
  document.getElementById("export").onclick = async () => {
    const txt = JSON.stringify(state, null, 1);
    try { await navigator.clipboard.writeText(txt); toast("JSON скопирован"); }
    catch(e){ showText("JSON: скопируй вручную", txt); }
  };
  document.getElementById("import").onchange = ev => {
    const f = ev.target.files[0]; if(!f) return;
    const r = new FileReader();
    r.onload = () => {
      try {
        const d = JSON.parse(r.result);
        if(!d || !Array.isArray(d.sessions)) throw 0;
        const clean = cleanState(d);
        ask("Загрузить данные?", `${clean.sessions.length} записей. Текущие данные будут заменены.`, () => {
          state = clean;
          save(state); render(); toast("Данные загружены");
        });
      } catch(e){ toast("Не похоже на файл из этого приложения"); }
      ev.target.value = "";
    };
    r.readAsText(f);
  };
  document.getElementById("reset").onclick = () => {
    ask("Стереть всю историю?", "Тренировки, замеры веса и заметки удалятся. План останется.", () => {
      state = {sessions:[], вес:[], план:state.план, заметки:{}, дни:{}};
      save(state); render(); toast("История стёрта");
    });
  };
  document.getElementById("dSave").onclick = () => {
    const g = id => { const v = +document.getElementById(id).value; return v > 0 ? v : null; };
    state.дни = state.дни || {};
    const еда = g("dProtFood"), добавка = g("dProtSup");
    state.дни[todayKey()] = {
      сон: g("dSleep"),
      белок: (еда || 0) + (добавка || 0) || null,
      белок_еда: еда,
      белок_добавка: добавка,
      мин: g("dMin"), пульс: g("dHr"), ккал: g("dKcal")
    };
    save(state); renderSettings();
  };

  /* живой итог по белку: еда + добавка */
  const pf = document.getElementById("dProtFood"), ps = document.getElementById("dProtSup"),
        pt = document.getElementById("protTotal");
  const updProt = () => {
    const a = +pf.value || 0, b = +ps.value || 0;
    const norm = Math.round(1.6 * ((state.вес && state.вес.length ? state.вес[state.вес.length-1].кг : 85) || 85));
    if(!a && !b){ pt.textContent = `белок за день: — · норма около ${norm} г`; return; }
    pt.textContent = `белок за день: ${a + b} г${b ? ` (еда ${a} + добавка ${b})` : ""} · норма около ${norm} г`;
  };
  pf.addEventListener("input", updProt);
  ps.addEventListener("input", updProt);
  updProt();
  document.getElementById("plGo").onclick = () => {
    const total = +document.getElementById("plW").value;
    const bar = +document.getElementById("plBar").value || 20;
    const out = document.getElementById("plOut");
    if(!total || total < bar){ out.innerHTML = `<span>вес должен быть больше грифа (${bar} кг)</span>`; return; }
    let perSide = (total - bar) / 2;
    const plates = [25, 20, 15, 10, 5, 2.5, 1.25];
    const used = [];
    plates.forEach(pl => { while(perSide >= pl - 0.001){ used.push(pl); perSide -= pl; } });
    const left = Math.round(perSide * 100) / 100;
    out.innerHTML = used.length
      ? `<span>на сторону: ${used.join(" + ")}</span>${left > 0.01 ? `<span>остаток ${left} кг</span>` : ""}`
      : `<span>только гриф</span>`;
  };
  document.getElementById("editPlan").onclick = () => { tab = "plan"; render(); };
  document.getElementById("upd").onclick = async () => {
    try {
      if("serviceWorker" in navigator){
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
      if(window.caches){
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
    } catch(e) {}
    location.replace(location.pathname + "?v=" + Date.now());
  };
}

function render(){
  const vEl = document.getElementById("ver");
  if(vEl) vEl.textContent = "v" + VERSION;
  document.querySelectorAll(".nav button").forEach(b => b.classList.toggle("on", b.dataset.tab === tab));
  if(tab === "today") renderToday();
  else if(tab === "progress") renderProgress();
  else if(tab === "science") renderScience();
  else if(tab === "medic") renderMedic();
  else if(tab === "plan") renderPlan();
  else renderSettings();
  drawTimer();
}
document.querySelectorAll(".nav button").forEach(b => b.addEventListener("click", () => { tab = b.dataset.tab; render(); }));
render();

if("serviceWorker" in navigator && location.protocol === "https:"){
  navigator.serviceWorker.register("sw.js").then(reg => {
    /* Новая версия нашлась — подхватываем сразу, без «удали и поставь заново». */
    reg.addEventListener("updatefound", () => {
      const sw = reg.installing;
      if(!sw) return;
      sw.addEventListener("statechange", () => {
        if(sw.state === "installed" && navigator.serviceWorker.controller){
          sw.postMessage({ type: "skip" });
          location.reload();
        }
      });
    });
    setInterval(() => reg.update().catch(() => {}), 60 * 60 * 1000);
  }).catch(() => {});
}
