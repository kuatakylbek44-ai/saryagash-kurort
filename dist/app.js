import {hotels, PHOTO, PHONE, EMAIL, ADDRESS, money, icon, escapeHtml} from './data.js';
import {detailPage, comparePage, openBooking, initFeatures} from './features.js';
import {initAssistant, openAssistant} from './assistant.js';

const $ = selector => document.querySelector(selector);
const readSet = key => {try{return new Set(JSON.parse(localStorage.getItem(key)||'[]').filter(id=>hotels.some(h=>h.id===id)));}catch{return new Set();}};
const favorites = readSet('saryagash-favorites');
const comparison = new Set([...readSet('saryagash-compare')].slice(0,3));
const persist = (key,value) => {try{localStorage.setItem(key,JSON.stringify([...value]));}catch{}}
const dateISO = date => `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
const today = new Date();
const startDate = new Date(today);startDate.setDate(startDate.getDate()+7);
const endDate = new Date(startDate);endDate.setDate(endDate.getDate()+7);
const search = {arrival:dateISO(startDate),departure:dateISO(endDate),guests:2};
const filters = {category:'all',sort:'recommended',query:'',price:'all',stars:'all'};
let lastFocus=null, toastTimer, observer, homeExpanded=false;
const categories=[['all','Барлығы','grid'],['wellness','Емдік демалыс','water'],['family','Отбасымен','users'],['budget','Қолжетімді','leaf'],['premium','Жайлы люкс','spark']];

function brand(){return `<a class="brand" href="#/" aria-label="Saryagash — басты бет"><img src="./assets/favicon.svg" alt="" width="43" height="43"><span><span class="brand-title">saryagash<span style="color:#7b9973">.</span></span><span class="brand-sub">ДЕМАЛЫС ПЕН ҮЙЛЕСІМ</span></span></a>`;}
function header(){
 $('#header').innerHTML=`<div class="container header-inner">${brand()}<nav class="main-nav" aria-label="Негізгі мәзір"><a href="#/catalog">Санаторийлер</a><a href="#/about">Неліктен Сарыағаш?</a><a href="#/how">Қалай брондаймын?</a></nav><div class="header-actions"><a class="icon-btn header-compare" href="#/compare" aria-label="Санаторийлерді салыстыру">${icon('compare')}<span class="badge-count compare-count" hidden>0</span></a><a class="icon-btn" href="#/favorites" aria-label="Таңдаулылар">${icon('heart')}<span class="badge-count favorite-count" hidden>0</span></a><button class="header-phone" data-action="contact">${icon('phone',17)}<span>${PHONE}</span></button><button class="icon-btn mobile-menu-button" data-action="menu" aria-label="Мәзірді ашу">${icon('menu')}</button></div></div>`;
}
function footer(){
 $('#footer').innerHTML=`<div class="container"><div class="footer-top"><div class="footer-brand">${brand()}<p>Денсаулыққа қамқорлық пен жайлы демалыс — бір мекенде.</p></div><div class="footer-group"><h3>Демалысты таңдаңыз</h3><a href="#/catalog">Барлық санаторийлер</a><a href="#/compare">Санаторийлерді салыстыру</a><a href="#/favorites">Таңдаулылар</a></div><div class="footer-group"><h3>Біз көмектесеміз</h3><a href="#/how">Қалай брондаймын?</a><a href="#/faq">Жиі қойылатын сұрақтар</a><button data-action="assistant">Сая көмекшімен сөйлесу</button><button data-action="roles">Менеджерлер үшін</button></div><div class="footer-group"><h3>Байланыс</h3><button data-action="contact">${icon('phone')}${PHONE}</button><button data-action="contact">${icon('mail')}${EMAIL}</button><p>${icon('pin')}${ADDRESS}</p></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} Saryagash. Демалысты сүйіспеншілікпен жоспарлаңыз.</span><button data-action="privacy">Құпиялылық туралы</button><a href="https://unsplash.com/photos/a-swimming-pool-in-a-resort-6pvIAIoipIU" target="_blank" rel="noopener noreferrer">Фото: Rosemary Media / Unsplash</a></div><p class="footer-demo">Бұл — танысуға арналған демо нұсқа. Санаторий атаулары, бағалар, санаттар, рейтингтер, қолжетімділік және байланыс деректері — үлгі. Ортақ фото нақты Сарыағаш санаторийін көрсетпейді. Нақты брондау мен төлем әзірге қосылмаған.</p></div>`;
}
function searchForm(){return `<form id="search-form" class="search-shell" aria-label="Демалысты іздеу"><div class="search-field destination-field">${icon('pin',22)}<div class="field-copy"><label for="destination">Қайда барамыз?</label><select id="destination" name="destination"><option>Сарыағаш курорт</option></select></div></div><div class="search-field dates-field">${icon('calendar',22)}<div class="field-copy date-pair"><div class="date-item"><label for="arrival">Келу күні</label><input id="arrival" type="date" name="arrival" min="${dateISO(today)}" value="${search.arrival}" required></div><div class="date-item"><label for="departure">Кету күні</label><input id="departure" type="date" name="departure" min="${search.arrival}" value="${search.departure}" required></div></div></div><div class="search-field guests-field">${icon('users',22)}<div class="field-copy"><label for="guests">Қонақтар</label><select name="guests" id="guests">${[1,2,3,4,5,6].map(n=>`<option value="${n}" ${n===search.guests?'selected':''}>${n} адам</option>`).join('')}</select></div></div><button class="btn btn-primary search-submit" type="submit">${icon('search',19)}Іздеу</button></form>`;}
const demoNote=()=>`<p class="demo-note">${icon('info')}Демо каталог · Бағалар мен рейтингтер — танысуға арналған үлгі</p>`;
function pills(){return `<div class="filter-pills" aria-label="Демалыс түрі">${categories.map(([id,label,ico])=>`<button class="filter-pill ${filters.category===id?'active':''}" data-action="category" data-category="${id}" aria-pressed="${filters.category===id}">${icon(ico)}${label}</button>`).join('')}</div>`;}
function sortField(){return `<select id="sort" class="sort-field" aria-label="Сұрыптау"><option value="recommended" ${filters.sort==='recommended'?'selected':''}>Ұсынылған ретпен</option><option value="price-asc" ${filters.sort==='price-asc'?'selected':''}>Алдымен арзаны</option><option value="price-desc" ${filters.sort==='price-desc'?'selected':''}>Алдымен қымбаты</option><option value="rating" ${filters.sort==='rating'?'selected':''}>Рейтингі жоғары</option><option value="stars" ${filters.sort==='stars'?'selected':''}>Жұлдызы көбірек</option></select>`;}
function card(h,index=0){
 const type={wellness:['water','Емдік демалыс'],family:['users','Отбасылық демалыс'],budget:['leaf','Тиімді таңдау'],premium:['spark','Жайлы люкс']}[h.category];
 return `<article class="hotel-card reveal" style="transition-delay:${Math.min(index%3,2)*65}ms"><div class="card-image-wrap"><a href="#/sanatorium/${h.id}" aria-label="${h.name} туралы толығырақ"><img src="${h.image}" alt="${h.name} үшін үлгі курорт фотосы" loading="lazy" width="600" height="400"></a><span class="card-label">${icon(type[0],12)}${type[1]}</span><button class="icon-btn card-favorite" data-action="favorite" data-id="${h.id}" aria-label="${h.name}: таңдаулыларға сақтау" aria-pressed="${favorites.has(h.id)}">${icon('heart',16)}</button><span class="card-num">САРЫАҒАШ / ${String(h.id).padStart(2,'0')}</span></div><div class="card-body"><div class="card-title-row"><h3><a href="#/sanatorium/${h.id}">${h.name}</a></h3><span class="card-rating" title="Үлгі рейтинг">${icon('star')} ${h.rating.toFixed(1)}</span></div><p class="card-location">${icon('pin')}${ADDRESS}</p><div class="card-tags">${h.tags.map(t=>`<span>${icon(t==='Бассейн'?'pool':t==='Минералды су'?'water':t==='Тамақтану'?'cup':t==='Wi-Fi'?'wifi':'leaf')}${t}</span>`).join('')}</div><div class="card-bottom"><div class="card-price">${money(h.price)}<small>адам / тәулік · бастап</small></div><a href="#/sanatorium/${h.id}" class="btn">Толығырақ</a></div><button class="card-compare ${comparison.has(h.id)?'selected':''}" data-action="compare" data-id="${h.id}" aria-pressed="${comparison.has(h.id)}">${icon(comparison.has(h.id)?'check':'compare')}<span>${comparison.has(h.id)?'Салыстыруға қосылды':'Салыстыруға қосу'}</span></button></div></article>`;
}
function filteredHotels(base=hotels){
 let found=base.filter(h=>(filters.category==='all'||h.category===filters.category)&&(!filters.query||h.name.toLocaleLowerCase().includes(filters.query.toLocaleLowerCase()))&&(filters.price==='all'||h.price<=Number(filters.price))&&(filters.stars==='all'||h.stars===Number(filters.stars)));
 const sorts={'price-asc':(a,b)=>a.price-b.price,'price-desc':(a,b)=>b.price-a.price,rating:(a,b)=>b.rating-a.rating,stars:(a,b)=>b.stars-a.stars,recommended:(a,b)=>a.id-b.id};
 return found.sort(sorts[filters.sort]);
}
function emptyState(isFavorites=false){return `<div class="empty-state">${icon(isFavorites?'heart':'search')}<h2>${isFavorites?'Ұнаған демалысыңызды сақтаңыз':'Сәйкес санаторий табылмады'}</h2><p>${isFavorites?'Санаторийдегі жүрек белгісін басыңыз. Таңдауыңыз осында сақталады.':'Басқа атау енгізіңіз немесе сүзгілерді өзгертіңіз.'}</p>${isFavorites?'<a class="btn btn-primary" href="#/catalog">Санаторийлерді қарау</a>':'<button class="btn btn-secondary" data-action="reset-filters">Сүзгілерді тазарту</button>'}</div>`;}
function home(){
 const selected=filteredHotels();
 const shown=homeExpanded?selected:selected.slice(0,6);
 return `<section class="hero container"><div class="hero-grid"><div class="hero-copy"><div class="eyebrow"><span class="dot"></span>ӨЗІҢІЗГЕ ҚАМҚОРЛЫҚ ОСЫ ЖЕРДЕН БАСТАЛАДЫ</div><h1>Өзіңізге арнаған<br>ең жақсы<br><em>демалыс.</em></h1><p>Сарыағаштың шипалы тынысын сезініңіз.<br>Санаторийлерді салыстырып, жаныңызға<br class="desktop-break"> жайлы мекенді таңдаңыз.</p><div class="hero-note"><div class="hero-note-icons"><span>${icon('water',18)}</span><span>${icon('leaf',18)}</span><span>${icon('sun',18)}</span></div><div class="hero-note-copy"><b>Денеңізге қуат. Жаныңызға тыныштық.</b>Сізге сай демалысты бірге табамыз.</div></div></div><div class="hero-visual"><img class="hero-photo" src="${PHOTO}" alt="Көгілдір бассейні бар курорттың үлгі фотосы" width="1000" height="850" fetchpriority="high"><span class="image-location">${icon('pin',14)}САРЫАҒАШ · ҚАЗАҚСТАН</span><div class="hero-image-caption"><p>КҮНДЕЛІКТІ ҚАРБАЛАСТАН АЛЫС</p><h2>Тыныштыққа бір қадам жақын.</h2></div><div class="hero-seal">${icon('sun',27)}<span>БАЯУ ӨМІР</span></div></div></div>${searchForm()}<div class="trust-strip"><span>${icon('check')}Бағаларды оңай салыстыру</span><span>${icon('check')}Өзіңізге сай таңдау</span><span>${icon('check')}Брондаудың екі тәсілі</span></div></section><section class="container catalog-section" id="home-catalog"><div class="section-heading reveal"><div><p class="eyebrow">СІЗДІҢ КЕЛЕСІ ДЕМАЛЫСЫҢЫЗ</p><h2 class="section-title">Жақсы демалыс<br><em>осы жерден басталады.</em></h2></div><p class="section-intro">Тыныш демалыс, жайлы бөлме немесе отбасымен өткізген уақыт. Өзіңізге керегін табыңыз.</p></div><div class="catalog-controls">${pills()}${sortField()}</div>${demoNote()}<div class="hotel-grid" id="hotel-grid">${shown.length?shown.map(card).join(''):emptyState()}</div><div class="catalog-bottom"><a href="#/catalog" class="btn btn-secondary">Барлық 10 санаторийді қарау ${icon('grid',17)}</a><p>Таңдаңыз. Салыстырыңыз. Асықпай шешіңіз.</p></div></section><section class="why-section" id="why"><div class="container why-grid"><div class="why-photo reveal"><img src="${PHOTO}" alt="Демалыс атмосферасын көрсететін үлгі фото" loading="lazy" width="600" height="700"><div class="why-photo-caption">${icon('water')}<span><b>Асықпай дем алатын мекен.</b><small>Сарыағаш курорт</small></span></div></div><div class="why-content reveal"><p class="eyebrow">НЕЛІКТЕН САРЫАҒАШ?</p><h2 class="section-title">Табиғаттың жылуы.<br><em>Өзіңізге көңіл бөлу.</em></h2><p>Күнделікті қарбаластан алыстап, демалысқа уақыт бөліңіз. Біз санаторийлердің мүмкіндіктерін бір жерге жинап, таңдауыңызды жеңілдетеміз.</p><div class="why-points"><div class="why-point">${icon('water')}<div><h3>Минералды су</h3><p>Санаторий ұсынатын қызметтермен танысыңыз.</p></div></div><div class="why-point">${icon('leaf')}<div><h3>Жайлы орта</h3><p>Тыныш серуен мен өзіңізге арналған уақыт.</p></div></div><div class="why-point">${icon('bed')}<div><h3>Түрлі бөлмелер</h3><p>Қажеттілігіңіз бен бюджетіңізге сай таңдау.</p></div></div><div class="why-point">${icon('users')}<div><h3>Жақындарыңызбен</h3><p>Бірге өткізген демалыстың ерекше жылуы.</p></div></div></div></div></div></section><section class="container steps-section" id="how"><div class="steps-header reveal"><p class="eyebrow">БӘРІ ТҮСІНІКТІ. БӘРІ ЫҢҒАЙЛЫ.</p><h2 class="section-title">Демалысқа <em>үш қадам.</em></h2></div><div class="steps-grid"><div class="step reveal"><div class="step-symbol">${icon('search',26)}</div><h3>Өзіңізге сай табыңыз</h3><p>Күндер мен бюджетіңізді таңдап, санаторийлердің қызметтерін қарап шығыңыз.</p></div><div class="step reveal"><div class="step-symbol">${icon('compare',26)}</div><h3>Асықпай салыстырыңыз</h3><p>Ұнаған үш нұсқаны баға, бөлме және қызметтері бойынша салыстырыңыз.</p></div><div class="step reveal"><div class="step-symbol">${icon('calendar',26)}</div><h3>Брондауды таңдаңыз</h3><p>Менеджерге өтінім беру немесе онлайн брондау жолын демо режимде байқап көріңіз.</p></div></div></section><section class="container helper-banner reveal"><div class="helper-banner-copy"><span class="helper-icon">${icon('spark',30)}</span><div><h2>Таңдауға көмек керек пе?</h2><p>Сая көмекші сұрақтарыңызға жауап беріп, сайтпен таныстырады.</p></div></div><button class="btn" data-action="assistant">${icon('spark',18)}Көмекшімен сөйлесу</button></section><section class="container faq-section" id="faq"><div class="reveal"><p class="eyebrow">СҰРАҚТАРЫҢЫЗҒА ЖАУАП</p><h2 class="section-title">Білгеніңіз<br><em>жақсы.</em></h2><p>Демалысты сенімді жоспарлауға көмектесеміз.</p></div><div class="faq-list reveal">${faqItems().map(([q,a])=>`<details><summary>${q}${icon('chevron')}</summary><p>${a}</p></details>`).join('')}</div></section>`;
}
function faqItems(){return [
 ['Бағаға не кіреді?','Санаторий бетінде бөлме, тамақтану және қызметтер жеке көрсетіледі. Бұл нұсқадағы барлық тарифтер — үлгі. Нақты ұсынысты санаторий менеджерімен келісу қажет.'],
 ['Брондау қалай жұмыс істейді?','Екі жолды байқап көруге болады: менеджер арқылы өтінім немесе онлайн брондау. Қазіргі демода ақпарат санаторийге жіберілмейді және нақты төлем алынбайды.'],
 ['Бірнеше санаторийді қалай салыстырамын?','Санаторий карточкасындағы «Салыстыруға қосу» батырмасын басыңыз. Үш нұсқаға дейін таңдап, салыстыру бетін ашыңыз.'],
 ['Келесі жылдың бағаларын көре аламын ба?','Күндерді келесі жылға таңдай аласыз. Демо сомалар танысу үшін есептеледі. Нақты сайтта әр мерзімге санаторий растаған тариф қолданылатын болады.'],
 ['Сая көмекші қандай сұрақтарға жауап береді?','Қазір көмекші сайттағы үлгі санаторийлер, бағалар, қызметтер және брондау жолы туралы жауап береді. Бұл — AI қызметіне әлі қосылмаған демо көмекші. Ол диагноз қоймайды және ем тағайындамайды.']
 ];}
function catalog(isFavorites=false){
 const base=isFavorites?hotels.filter(h=>favorites.has(h.id)):hotels;
 const selected=filteredHotels(base);
 return `<section class="container catalog-page load-in"><div class="page-breadcrumb"><a href="#/">Басты бет</a><span>/</span><span>${isFavorites?'Таңдаулылар':'Санаторийлер'}</span></div><div class="catalog-page-top"><div><p class="eyebrow">ӨЗІҢІЗГЕ САЙ ДЕМАЛЫС</p><h1 class="section-title">${isFavorites?'Жаныңызға жақын <em>таңдаулар.</em>':'Сарыағаш <em>санаторийлері.</em>'}</h1><p>${isFavorites?'Ұнаған орындарды сақтап, кейін қайта оралыңыз.':'Бағасы, қызметі және жайлылығы бойынша таңдаңыз.'}</p></div><button class="btn btn-secondary" data-action="search-modal">${icon('calendar',17)}Күндерді өзгерту</button></div><form class="catalog-tools" id="catalog-filters"><div class="control control-search"><label for="query">Санаторий атауы</label><input id="query" name="query" type="search" placeholder="Мысалы, Санаторий 3" value="${escapeHtml(filters.query)}">${icon('search')}</div><div class="control"><label for="price">Адам / тәулік бағасы</label><select id="price" name="price"><option value="all">Кез келген баға</option value="15000" ${filters.price==='15000'?'selected':''}>15 000 ₸ дейін</option><option value="20000" ${filters.price==='20000'?'selected':''}>20 000 ₸ дейін</option><option value="25000" ${filters.price==='25000'?'selected':''}>25 000 ₸ дейін</option></select></div><div class="control"><label for="stars">Жұлдыз санаты · үлгі</label><select id="stars" name="stars"><option value="all">Барлық санаттар</option>${[3,4,5].map(n=>`<option value="${n}" ${filters.stars===String(n)?'selected':''}>${n} жұлдыз</option>`).join('')}</select></div><button class="btn btn-secondary" data-action="reset-filters" type="button">Тазарту</button></form><p class="results-count">${escapeHtml(formatDate(search.arrival))} – ${escapeHtml(formatDate(search.departure))} · ${search.guests} адам · <span id="results-count">${selected.length}</span> санаторий</p><div class="catalog-controls">${pills()}${sortField()}</div>${demoNote()}<div class="hotel-grid" id="hotel-grid">${selected.length?selected.map(card).join(''):emptyState(isFavorites&&base.length===0)}</div></section>`;
}
function formatDate(value){return new Date(`${value}T12:00:00`).toLocaleDateString('kk-KZ',{day:'numeric',month:'long'});}
function reveal(){observer?.disconnect();observer=new IntersectionObserver(entries=>entries.forEach(entry=>{if(entry.isIntersecting){entry.target.classList.add('visible');observer.unobserve(entry.target);}}),{threshold:.06});document.querySelectorAll('.reveal').forEach(el=>observer.observe(el));}
function updateGrid(){
 const route=location.hash;
 const isFavorites=route.startsWith('#/favorites');
 const base=isFavorites?hotels.filter(h=>favorites.has(h.id)):hotels;
 const selected=filteredHotels(base);
 const grid=$('#hotel-grid');if(!grid)return;
 const atHome=route===''||route==='#/'||['#/about','#/how','#/faq'].includes(route);
 const show=atHome&&!homeExpanded?selected.slice(0,6):selected;
 grid.innerHTML=show.length?show.map(card).join(''):emptyState(isFavorites&&base.length===0);
 if($('#results-count'))$('#results-count').textContent=selected.length;
 document.querySelectorAll('.filter-pill').forEach(el=>{el.classList.toggle('active',el.dataset.category===filters.category);el.setAttribute('aria-pressed',el.dataset.category===filters.category)});
 reveal();
}
function render(){
 closeModal();
 const route=location.hash.replace(/^#/,'')||'/';
 const detail=route.match(/^\/sanatorium\/(\d+)$/);
 document.body.classList.toggle('detail-route',Boolean(detail));
 let scrollTarget=null;
 if(detail){const hotel=hotels.find(h=>h.id===Number(detail[1]));$('#main').innerHTML=hotel?detailPage(hotel):`<div class="container catalog-page">${emptyState()}</div>`;document.title=hotel?`${hotel.name} — Saryagash`:'Санаторий табылмады — Saryagash';}
 else if(route==='/catalog'||route==='/favorites'){$('#main').innerHTML=catalog(route==='/favorites');document.title=route==='/favorites'?'Таңдаулылар — Saryagash':'Санаторийлер — Saryagash';}
 else if(route==='/compare'){$('#main').innerHTML=comparePage(hotels.filter(h=>comparison.has(h.id)));document.title='Санаторийлерді салыстыру — Saryagash';}
 else{$('#main').innerHTML=home();document.title='Saryagash — өзіңізге арнаған демалыс';scrollTarget=({'/about':'why','/how':'how','/faq':'faq'})[route];}
 updateCounters();reveal();
 document.querySelectorAll('.main-nav a').forEach(a=>a.classList.toggle('active',a.getAttribute('href')===location.hash));
 if(scrollTarget)requestAnimationFrame(()=>document.getElementById(scrollTarget)?.scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'}));else window.scrollTo({top:0,behavior:'instant'});
}
function navigate(route){const hash=route.startsWith('#')?route:`#${route.startsWith('/')?'':'/'}${route}`;if(location.hash===hash)render();else location.hash=hash;}
function toast(message){clearTimeout(toastTimer);$('#toast').textContent=message;$('#toast').classList.add('show');toastTimer=setTimeout(()=>$('#toast').classList.remove('show'),3000);}
function updateCounters(){
 document.querySelectorAll('.favorite-count').forEach(el=>{el.hidden=favorites.size===0;el.textContent=favorites.size});
 document.querySelectorAll('.compare-count').forEach(el=>{el.hidden=comparison.size===0;el.textContent=comparison.size});
 $('#compare-dock').innerHTML=comparison.size&&!location.hash.startsWith('#/compare')?`<div class="compare-dock"><div class="compare-dock-info">${icon('compare')}<span><b>${comparison.size} санаторий таңдалды</b>Үш нұсқаға дейін</span></div><a href="#/compare" class="btn btn-primary">Салыстыру</a><button class="icon-btn" data-action="clear-compare" aria-label="Салыстыруды тазарту">${icon('close',16)}</button></div>`:'';
 document.querySelectorAll('[data-action="favorite"]').forEach(el=>{const selected=favorites.has(Number(el.dataset.id));el.setAttribute('aria-pressed',selected);if(el.closest('.detail-title-actions'))el.innerHTML=`${icon(selected?'check':'heart',18)}${selected?'Сақталды':'Сақтау'}`;});
 document.querySelectorAll('[data-action="compare"]').forEach(el=>{const selected=comparison.has(Number(el.dataset.id));el.setAttribute('aria-pressed',selected);el.classList.toggle('selected',selected);if(el.classList.contains('card-compare'))el.innerHTML=`${icon(selected?'check':'compare')}<span>${selected?'Салыстыруға қосылды':'Салыстыруға қосу'}</span>`;else if(el.closest('.detail-title-actions'))el.innerHTML=`${icon(selected?'check':'compare',18)}${selected?'Қосылды':'Салыстыру'}`;});
}
function toggleFavorite(id){if(favorites.has(id)){favorites.delete(id);toast('Таңдаулылардан алынды');}else{favorites.add(id);toast('Таңдаулыларға сақталды');}persist('saryagash-favorites',favorites);updateCounters();if(location.hash==='#/favorites')updateGrid();}
function toggleCompare(id){if(comparison.has(id)){comparison.delete(id);}else{if(comparison.size>=3){toast('Бір уақытта үш санаторийге дейін салыстыруға болады');return;}comparison.add(id);toast('Салыстыруға қосылды');}persist('saryagash-compare',comparison);updateCounters();if(location.hash==='#/compare')render();}
function openModal(html){
 lastFocus=document.activeElement;
 $('#modal-root').innerHTML=`<div class="modal-backdrop"><div class="modal-dialog" role="dialog" aria-modal="true" aria-label="Ақпарат терезесі" tabindex="-1"><button class="modal-close" data-action="close-modal" aria-label="Терезені жабу">${icon('close',19)}</button>${html}</div></div>`;
 document.body.style.overflow='hidden';
 const dialog=$('.modal-dialog');setTimeout(()=>{if(dialog?.isConnected)(dialog.querySelector('input,select,textarea,button:not(.modal-close),a')||dialog).focus();},50);
}
function closeModal(){if(!$('#modal-root').children.length)return;$('#modal-root').innerHTML='';document.body.style.overflow='';lastFocus?.isConnected&&lastFocus.focus();}
function showContact(){openModal(`<p class="eyebrow">БІЗБЕН БАЙЛАНЫСЫҢЫЗ</p><h2>Демалысыңызды бірге жоспарлайық.</h2><p>Байланыс деректері — үлгі. Бұл демода нақты менеджерге хабар жіберілмейді.</p><div class="contact-grid"><div class="contact-row">${icon('phone',22)}<span><small>Телефон · үлгі</small><strong>${PHONE}</strong></span></div><div class="contact-row">${icon('mail',22)}<span><small>Email · үлгі</small><strong>${EMAIL}</strong></span></div><div class="contact-row">${icon('pin',22)}<span><small>Мекенжай</small><strong>${ADDRESS}</strong></span></div></div><button class="btn btn-primary" data-action="assistant" style="margin-top:22px">${icon('spark',18)}Сая көмекшіден сұрау</button>`);}
function showSearch(){openModal(`<p class="eyebrow">ДЕМАЛЫСЫҢЫЗДЫ ЖОСПАРЛАҢЫЗ</p><h2>Қашан демаламыз?</h2><p>Күндер мен адам санын таңдап, үлгі бағаларды қарап шығыңыз.</p><div class="modal-search">${searchForm()}</div>`);}
window.Site={openModal,closeModal,toast,navigate,getSearch:()=>({...search}),toggleCompare,toggleFavorite,favorites,compare:comparison};
header();footer();initFeatures();initAssistant();render();
window.addEventListener('hashchange',render);
window.addEventListener('scroll',()=>$('#header').classList.toggle('scrolled',scrollY>20),{passive:true});
document.addEventListener('click',event=>{
 const routeLink=event.target.closest('a[href^="#/"]');
 if(routeLink){closeModal();if(location.hash===routeLink.getAttribute('href')){event.preventDefault();render();}}
 if(event.target.classList.contains('modal-backdrop'))closeModal();
 const el=event.target.closest('[data-action]');if(!el)return;
 const action=el.dataset.action;const id=Number(el.dataset.id);
 if(action==='favorite')toggleFavorite(id);
 if(action==='compare')toggleCompare(id);
 if(action==='clear-compare'){comparison.clear();persist('saryagash-compare',comparison);updateCounters();if(location.hash==='#/compare')render();}
 if(action==='category'){filters.category=el.dataset.category;updateGrid();}
 if(action==='reset-filters'){Object.assign(filters,{category:'all',sort:'recommended',query:'',price:'all',stars:'all'});if($('#query'))$('#query').value='';if($('#price'))$('#price').value='all';if($('#stars'))$('#stars').value='all';if($('#sort'))$('#sort').value='recommended';updateGrid();}
 if(action==='assistant'){closeModal();openAssistant();}
 if(action==='close-modal')closeModal();
 if(action==='contact')showContact();
 if(action==='search-modal')showSearch();
 if(action==='book'){const hotel=hotels.find(h=>h.id===id);if(hotel)openBooking(hotel,el.dataset.mode||'request',Number(el.dataset.multiplier)||1);}
 if(action==='menu')openModal(`<h2>Сізге қай бөлім керек?</h2><div class="contact-grid"><a class="contact-row" href="#/catalog">${icon('search')}Санаторийлер</a><a class="contact-row" href="#/compare">${icon('compare')}Салыстыру</a><a class="contact-row" href="#/favorites">${icon('heart')}Таңдаулылар</a><a class="contact-row" href="#/about">${icon('leaf')}Неліктен Сарыағаш?</a><a class="contact-row" href="#/how">${icon('calendar')}Қалай брондаймын?</a><button class="contact-row" data-action="contact">${icon('phone')}Байланыс</button></div>`);
 if(action==='roles')openModal(`<p class="eyebrow">АЛДАҒЫ МҮМКІНДІКТЕР</p><h2>Санаторийдің жеке кабинеті</h2><p>Алғашқы нұсқада келушілерге арналған беттер көрсетілді. Келесі кезеңде менеджерлерге қауіпсіз кіру мен броньдарды басқару қосылады.</p><div class="contact-grid"><div class="contact-row">${icon('shield',23)}<span><strong>Сайт иелері</strong><small>Сен және ағаң: санаторийлер, менеджерлер, барлық броньдар.</small></span></div><div class="contact-row">${icon('calendar',23)}<span><strong>Санаторий менеджерлері</strong><small>Өзіне бекітілген санаторийдің бағалары, күнтізбесі және броньдары.</small></span></div></div>`);
 if(action==='privacy')openModal(`<h2>Демо нұсқадағы деректер</h2><p>Таңдаулылар мен салыстыру тізімі осы браузерде ғана сақталады. Демо бронь санаторийге жіберілмейді, нақты төлем алынбайды. Көмекші чат сыртқы AI қызметіне қосылмаған және хабарларыңызды серверге жібермейді.</p><p style="margin-top:15px">Нақты іске қосылғанда жеке деректерді өңдеу шарттары бөлек жарияланады.</p>`);
});
document.addEventListener('change',event=>{
 const el=event.target;
 if(el.id==='sort'){filters.sort=el.value;updateGrid();}
 if(el.id==='price'||el.id==='stars'){filters[el.id]=el.value;updateGrid();}
 if(el.id==='arrival'){const departure=el.closest('form')?.querySelector('[name="departure"]');if(departure){const next=new Date(`${el.value}T12:00:00`);next.setDate(next.getDate()+1);departure.min=dateISO(next);if(departure.value<=el.value)departure.value=dateISO(next);}}
});
document.addEventListener('input',event=>{if(event.target.id==='query'){filters.query=event.target.value;updateGrid();}});
document.addEventListener('submit',event=>{
 if(event.target.id==='catalog-filters'){event.preventDefault();return;}
 if(event.target.id!=='search-form')return;
 event.preventDefault();const form=new FormData(event.target);
 if(form.get('departure')<=form.get('arrival')){toast('Кету күні келу күнінен кейін болуы керек');return;}
 Object.assign(search,{arrival:form.get('arrival'),departure:form.get('departure'),guests:Number(form.get('guests'))});
 closeModal();navigate('/catalog');
});
document.addEventListener('keydown',event=>{
 if(!$('#modal-root').children.length)return;
 if(event.key==='Escape'){event.preventDefault();closeModal();}
 if(event.key==='Tab'){const list=[...$('.modal-dialog').querySelectorAll('a,button,input,select,textarea,[tabindex="0"]')].filter(el=>!el.disabled&&el.offsetParent!==null);if(!list.length)return;const first=list[0],last=list.at(-1);if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}}
});
