import { hotels, icon, money, escapeHtml } from './data.js';

const roomTypes = [
  { name:'Стандарт', key:'standard', multiplier:1, size:'22 м²', subtitle:'Жайлы демалысқа қажеттінің бәрі', features:['Бір бөлмеге 2 қонаққа дейін','Тамақтану','Wi-Fi'] },
  { name:'Комфорт', key:'comfort', multiplier:1.35, size:'30 м²', subtitle:'Кеңістік пен жайлылық үйлесімі', features:['Бір бөлмеге 2 қонаққа дейін','Балкон','Тамақтану'] },
  { name:'Люкс', key:'luxe', multiplier:1.8, size:'45 м²', subtitle:'Өзіңізге көбірек кеңістік сыйлаңыз', features:['Бір бөлмеге 2 қонаққа дейін','Демалыс аймағы','Тамақтану'] },
];
let calendarMonth = new Date();
calendarMonth.setDate(1);
let selectedCalendarDay = '';
let currentBookingHotel = null;

function localDate(date = new Date()) {
  return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
}
function plusDays(value, days) {
  const date = new Date(`${value}T12:00:00`);
  date.setDate(date.getDate()+days);
  return localDate(date);
}
function stayDays(arrival, departure) {
  if (!arrival || !departure) return 0;
  return Math.round((Date.parse(`${departure}T12:00:00Z`) - Date.parse(`${arrival}T12:00:00Z`))/86400000);
}
function searchDefaults() {
  const search = globalThis.window?.Site?.getSearch?.() || {};
  const today = localDate();
  const arrival = /^\d{4}-\d{2}-\d{2}$/.test(search.arrival || '') && search.arrival >= today ? search.arrival : plusDays(today, 1);
  const departure = search.departure > arrival ? search.departure : plusDays(arrival, 7);
  return { arrival, departure, guests: Math.max(1, Math.min(10, Number(search.guests) || 2)) };
}

function calendarMarkup(hotelId) {
  const year = calendarMonth.getFullYear();
  const month = calendarMonth.getMonth();
  const days = new Date(year, month+1, 0).getDate();
  const offset = (new Date(year, month, 1).getDay()+6)%7;
  const today = localDate();
  const cells = Array.from({length:offset}, () => '<span class="detail-calendar-empty" aria-hidden="true"></span>');
  for (let day=1; day<=days; day++) {
    const date = localDate(new Date(year, month, day));
    const count = (day + hotelId)%9 === 0 ? 0 : ((day+hotelId)%4)+1;
    const past = date < today;
    cells.push(`<button type="button" class="detail-calendar-day ${!count?'is-full':''} ${selectedCalendarDay===date?'is-selected':''}" data-feature="calendar-day" data-date="${date}" data-id="${hotelId}" ${past || !count ? 'disabled' : ''} aria-label="${day} ${escapeHtml(new Intl.DateTimeFormat('kk-KZ',{month:'long',year:'numeric'}).format(calendarMonth))}, ${past?'өткен күн':count?`${count} үлгі бөлме`:'үлгі бойынша орын жоқ'}"><span>${day}</span><small>${past?'—':count?`${count} орын`:'толы'}</small></button>`);
  }
  return `<div class="detail-calendar-heading"><button type="button" class="detail-round-button" data-feature="calendar-prev" data-id="${hotelId}" aria-label="Алдыңғы ай">${icon('back')}</button><strong>${new Intl.DateTimeFormat('kk-KZ',{month:'long',year:'numeric'}).format(calendarMonth)}</strong><button type="button" class="detail-round-button detail-calendar-next" data-feature="calendar-next" data-id="${hotelId}" aria-label="Келесі ай">${icon('back')}</button></div><div class="detail-calendar-week">${['Дс','Сс','Ср','Бс','Жм','Сб','Жс'].map(d=>`<span>${d}</span>`).join('')}</div><div class="detail-calendar-grid">${cells.join('')}</div><div class="detail-calendar-legend"><span><i></i> Үлгі бос орындар</span><span><i class="is-unavailable"></i> Үлгі бойынша толы</span></div>`;
}

export function detailPage(hotel) {
  const site = globalThis.window?.Site;
  const isFavorite = site?.favorites?.has?.(hotel.id) || false;
  const isCompared = site?.compare?.has?.(hotel.id) || false;
  const amenityIcons = { 'Минералды су':'water', 'Бассейн':'pool', 'Тамақтану':'cup', 'Wi-Fi':'wifi', 'Спа':'leaf' };
  const amenities = (hotel.tags || []).map(label => [amenityIcons[label] || 'check', label]);
  calendarMonth = new Date(`${searchDefaults().arrival}T12:00:00`);
  calendarMonth.setDate(1);
  selectedCalendarDay = '';
  return `<div class="detail-page container"><nav class="detail-breadcrumb" aria-label="Бет жолы"><a href="#/">Басты бет</a><span>/</span><a href="#/catalog">Санаторийлер</a><span>/</span><span>${hotel.name}</span></nav>
  <div class="detail-title-row"><div><div class="detail-kicker"><span class="eyebrow">САРЫАҒАШ · № ${String(hotel.id).padStart(2,'0')}</span><span class="detail-demo-pill">Танысу нұсқасы</span></div><h1>${hotel.name}</h1><div class="detail-location">${icon('pin',17)} ${hotel.address}<span class="detail-dot">·</span><span class="detail-rating">${icon('star',15)} ${hotel.rating.toFixed(1)}</span><span class="detail-muted">үлгі рейтинг</span></div></div><div class="detail-title-actions"><button class="btn btn-secondary" type="button" data-action="favorite" data-id="${hotel.id}" aria-pressed="${isFavorite}">${icon('heart',18)} <span>${isFavorite?'Сақталды':'Сақтау'}</span></button><button class="btn btn-secondary" type="button" data-action="compare" data-id="${hotel.id}" aria-pressed="${isCompared}">${icon(isCompared?'check':'compare',18)} <span>${isCompared?'Салыстыруға қосылды':'Салыстыру'}</span></button></div></div>
  <div class="detail-gallery"><button class="detail-gallery-main" type="button" data-feature="photo" data-id="${hotel.id}" aria-label="Санаторийдің үлгі фотосын үлкейту"><img src="${hotel.image}" alt="Санаторий ${hotel.id} үшін курорттың үлгі фотосы"><span class="detail-photo-label">${icon('grid',16)} Фотоны ашу</span></button><div class="detail-gallery-side"><img src="${hotel.image}" alt="Курорттың үлгі фотосы" style="object-position:20% 60%"><img src="${hotel.image}" alt="Курорттың үлгі фотосы" style="object-position:85% 45%"></div><span class="detail-gallery-caption">Барлық фотолар — дизайнға арналған үлгі</span></div>
  <nav class="detail-tabs" aria-label="Санаторий бөлімдері">${[['overview','Шолу'],['rooms','Бөлмелер'],['wellness','Сауықтыру'],['calendar','Бос орындар'],['reviews','Пікірлер'],['location','Мекенжай']].map(([id,text])=>`<button type="button" data-feature="section" data-target="detail-${id}">${text}</button>`).join('')}</nav>
  <div class="detail-layout"><div class="detail-content">
  <section id="detail-overview" class="detail-section"><div class="eyebrow">ӨЗІҢІЗГЕ АРНАЛҒАН УАҚЫТ</div><h2>Тыныштық. Табиғат. Жайлылық.</h2><p class="detail-lead">${hotel.description}</p><p>Күнделікті қарбаластан алыстап, асықпай демалыңыз. Өзіңізге қолайлы бөлмені таңдап, сапарыңызды бір жерден жоспарлаңыз.</p><div class="detail-amenities">${amenities.map(([name,label])=>`<div>${icon(name,23)}<span>${label}</span></div>`).join('')}</div><p class="detail-disclaimer">${icon('info',16)} Қызметтер мен сипаттамалар — үлгі. Нақты ақпарат санаторий өкілімен толықтырылады.</p></section>
  <section id="detail-rooms" class="detail-section"><div class="eyebrow">ЖАЙЛЫ КЕҢІСТІК</div><h2>Өзіңізге лайық бөлме</h2><p class="detail-muted">Үлгі бағалар бір адамға, бір тәулікке көрсетілген.</p><div class="detail-rooms">${roomTypes.map(room=>`<article class="detail-room"><div class="detail-room-photo"><img loading="lazy" src="${hotel.image}" alt="${room.name} бөлмесіне арналған уақытша курорт фотосы"><span>Үлгі фото</span></div><div class="detail-room-content"><div class="detail-room-head"><h3>${room.name}</h3><span>${room.size}</span></div><p>${room.subtitle}</p><div class="detail-room-features">${room.features.map(f=>`<span>${icon('check',14)} ${f}</span>`).join('')}</div><div class="detail-room-bottom"><div><strong>${money(Math.round(hotel.price*room.multiplier))}</strong><small>/ адам · тәулік</small></div><button class="btn btn-primary" type="button" data-feature="room-book" data-id="${hotel.id}" data-multiplier="${room.multiplier}">Таңдау</button></div></div></article>`).join('')}</div></section>
  <section id="detail-wellness" class="detail-section"><div class="eyebrow">ДЕНЕ МЕН ЖАН ҮЙЛЕСІМІ</div><h2>Сауықтыру және демалыс</h2><div class="detail-wellness-grid">${[['water','Минералды су','Санаторийдің су бағдарламалары туралы ақпарат осы бөлімде болады.'],['leaf','Спа және тынығу','Демалыс кеңістіктері мен күтім қызметтерінің сипаттамасы.'],['sun','Белсенді демалыс','Серуен, бассейн және бос уақытты өткізу мүмкіндіктері.'],['shield','Маманмен кеңесу','Сауықтыру бағдарламасының құрамын санаторий маманымен нақтылаңыз.']].map(([name,title,text])=>`<article>${icon(name,28)}<h3>${title}</h3><p>${text}</p></article>`).join('')}</div><div class="detail-included"><h3>Бағаға не кіреді?</h3><div><span>${icon('check',17)} Таңдалған бөлмеде тұру</span><span>${icon('check',17)} Үлгіде: күніне 3 мезгіл тамақ</span><span>${icon('check',17)} Үлгіде: ортақ демалыс аймақтары</span></div><p>Емшаралар мен қосымша қызметтердің нақты құрамы брондау алдында жеке расталады.</p></div></section>
  <section id="detail-calendar" class="detail-section"><div class="eyebrow">ДЕМАЛЫС КҮНІН ТАҢДАҢЫЗ</div><h2>Бос орын күнтізбесі</h2><p class="detail-muted">Бұл — күнтізбенің жұмысын көрсететін үлгі. Нақты бос орындар әлі қосылмаған.</p><div class="detail-calendar" id="detail-calendar-widget">${calendarMarkup(hotel.id)}</div></section>
  <section id="detail-reviews" class="detail-section"><div class="eyebrow">ҚОНАҚТАР ТӘЖІРИБЕСІ</div><h2>Пікірлер</h2><div class="detail-empty-reviews">${icon('star',34)}<h3>Алғашқы пікір әлі жазылған жоқ</h3><p>Мұнда санаторийде демалған қонақтардың пікірлері жарияланады. Карточкадағы рейтинг дизайнға арналған үлгі ретінде көрсетілген.</p></div></section>
  <section id="detail-location" class="detail-section"><div class="eyebrow">СІЗДІ КҮТЕТІН МЕКЕН</div><h2>Мекенжай және байланыс</h2><div class="detail-location-block"><div class="detail-map-illustration"><div class="detail-map-road detail-map-road-one"></div><div class="detail-map-road detail-map-road-two"></div><div class="detail-map-road detail-map-road-three"></div><div class="detail-map-marker">${icon('pin',26)}<strong>Сарыағаш курорт</strong><span>Орналасу сызбасы · үлгі</span></div></div><div class="detail-contact-list"><div>${icon('pin',22)}<span><small>Мекенжай</small><strong>${hotel.address}</strong></span></div><div>${icon('phone',22)}<span><small>Үлгі телефон</small><strong>${hotel.phone}</strong></span></div><div>${icon('mail',22)}<span><small>Үлгі электрондық пошта</small><strong>${hotel.email}</strong></span></div></div></div></section>
  <section class="detail-section detail-faq"><h2>Сұрақтарыңыз бар ма?</h2><details><summary>Бронь қалай расталады?</summary><p>Менеджер арқылы берілген өтінім бос орын тексерілген соң расталады. Бірден брондау үлгісінде растау сынақ төлемі қадамынан кейін көрсетіледі. Қазір нақты өтінім жіберілмейді.</p></details><details><summary>Баға қай мерзімге арналған?</summary><p>Қазір барлық бағалар — интерфейсті тексеруге арналған үлгі тарифтер. Нақты тарифтер күнге, бөлме түріне және қонақ санына байланысты енгізіледі.</p></details><details><summary>Броньды өзгертуге бола ма?</summary><p>Нақты іске қосылғанда өзгерту және тоқтату шарттары әр санаторийдің брондау бетінде көрсетіледі.</p></details></section>
  </div><aside class="detail-sidebar"><div class="detail-booking-card"><div class="detail-booking-label">Сіздің тыныш демалысыңыз</div><div class="detail-from-price"><strong>${money(hotel.price)}</strong><span>бастап</span></div><p>бір адамға / тәулік · үлгі баға</p><div class="detail-booking-benefits"><span>${icon('check',16)} Бөлме мен күнді өзіңіз таңдаңыз</span><span>${icon('check',16)} Жалпы соманы алдын ала көріңіз</span><span>${icon('check',16)} Менеджер көмегін пайдаланыңыз</span></div><button class="btn btn-primary" type="button" data-feature="room-book" data-id="${hotel.id}">Брондауды көру</button><button class="btn btn-secondary" type="button" data-feature="instant-book" data-id="${hotel.id}">${icon('spark',17)} Бірден брондау · демо</button><div class="detail-booking-footnote">${icon('shield',16)} Сынақ нұсқасы. Ақша алынбайды.</div></div><div class="detail-help-card">${icon('phone',22)}<div><strong>Таңдауға көмектесейік</strong><span>${hotel.phone}</span><small>Үлгі байланыс нөмірі</small></div></div></aside></div>
  <div class="detail-mobile-book"><div><strong>${money(hotel.price)}</strong><small>адам / тәулік · үлгі</small></div><button class="btn btn-primary" data-feature="room-book" data-id="${hotel.id}">Брондау</button></div></div>`;
}

export function comparePage(selectedHotels) {
  const list = selectedHotels.filter(Boolean).slice(0,3);
  const search = searchDefaults();
  const nights = stayDays(search.arrival, search.departure);
  return `<div class="compare-page container"><nav class="detail-breadcrumb"><a href="#/">Басты бет</a><span>/</span><span>Салыстыру</span></nav><div class="eyebrow">ӨЗІҢІЗГЕ ЕҢ ҚОЛАЙЛЫСЫН ТАҢДАҢЫЗ</div><h1>Бәрі көз алдыңызда.</h1><p class="compare-intro">Бағалар мен мүмкіндіктерді салыстырып, өзіңізге лайық демалысты табыңыз.</p><div class="compare-summary">${icon('calendar',18)} ${search.arrival} — ${search.departure}<span>·</span>${icon('users',18)} ${search.guests} адам<span>·</span>${nights} тәулік<span class="detail-demo-pill">Үлгі есеп</span></div>${!list.length ? `<div class="compare-empty">${icon('compare',44)}<h2>Алдымен санаторийлерді таңдаңыз</h2><p>Каталогтағы «Салыстыру» батырмасымен 2–3 санаторий қосыңыз.</p><a class="btn btn-primary" href="#/catalog">Санаторийлерді қарау</a></div>` : `<div class="compare-grid" style="--compare-count:${Math.max(2,list.length)}">${list.map(h=>`<article class="compare-hotel"><div class="compare-hotel-image"><img src="${h.image}" alt="${h.name} — үлгі фото"><button type="button" class="detail-round-button" data-feature="remove-compare" data-id="${h.id}" aria-label="${h.name} салыстырудан алып тастау">${icon('close',18)}</button><span>№ ${String(h.id).padStart(2,'0')}</span></div><div class="compare-hotel-title"><h2><a href="#/sanatorium/${h.id}">${h.name}</a></h2><p>${icon('pin',15)} ${h.address}</p></div><div class="compare-property"><small>Бір адамға / тәулік</small><strong>${money(h.price)}</strong></div><div class="compare-property compare-total"><small>${search.guests} адамға, ${nights} тәулікке</small><strong>${money(h.price*search.guests*nights)}</strong><span>${Math.ceil(search.guests/2)} бөлме · Стандарт · үлгі есеп</span></div><div class="compare-property"><small>Үлгі рейтинг</small><strong class="compare-rating">${icon('star',18)} ${h.rating.toFixed(1)} <span>/ 5</span></strong></div><div class="compare-property"><small>Жұлдыз санаты · үлгі</small><span class="compare-stars">${Array.from({length:h.stars},()=>icon('star',15)).join('')}</span></div><div class="compare-property"><small>Қызметтер · үлгі</small><div class="compare-tags">${h.tags.map(tag=>`<span>${icon('check',14)}${escapeHtml(tag)}</span>`).join('')}</div></div><div class="compare-property"><small>Брондау</small><span>Менеджер арқылы немесе онлайн демо</span></div><div class="compare-actions"><button type="button" class="btn btn-primary" data-feature="room-book" data-id="${h.id}">Таңдау</button><a href="#/sanatorium/${h.id}" class="btn btn-secondary">Толығырақ</a></div></article>`).join('')}${list.length<3?`<a class="compare-add" href="#/catalog">${icon('compare',32)}<strong>Тағы бір санаторий қосу</strong><span>Үш нұсқаға дейін салыстырыңыз</span></a>`:''}</div><p class="detail-disclaimer">${icon('info',17)} Барлық бағалар мен рейтингтер — үлгі. Есеп бірдей күндер, қонақ саны және стандарт бөлме үшін берілген.</p>`}</div>`;
}

export function openBooking(hotel, mode='request', multiplier=1) {
  if (!hotel || !globalThis.window?.Site?.openModal) return;
  currentBookingHotel = hotel;
  const search = searchDefaults();
  if (selectedCalendarDay && selectedCalendarDay >= localDate()) {
    search.arrival = selectedCalendarDay;
    search.departure = plusDays(selectedCalendarDay, 7);
  }
  selectedCalendarDay = '';
  window.Site.openModal(`<div class="booking-modal"><div class="eyebrow">ДЕМАЛЫСЫҢЫЗДЫ ЖОСПАРЛАҢЫЗ</div><h2 id="booking-title">${hotel.name}</h2><p class="booking-subtitle">${icon('pin',16)} ${hotel.address}</p><div class="booking-demo-notice">${icon('info',18)}<span>Бұл — сынақ нұсқасы. Өтінім жіберілмейді, ақша алынбайды.</span></div><form id="booking-form"><fieldset class="booking-modes"><legend>Брондау тәсілі</legend><label><input type="radio" name="mode" value="request" ${mode==='request'?'checked':''}><span>${icon('users',21)}<strong>Менеджер арқылы</strong><small>Бос орынды нақтылау</small></span></label><label><input type="radio" name="mode" value="instant" ${mode==='instant'?'checked':''}><span>${icon('spark',21)}<strong>Бірден брондау</strong><small>Онлайн төлем үлгісі</small></span></label></fieldset><div class="booking-fields"><label>Келу күні<input type="date" name="arrival" required min="${localDate()}" value="${search.arrival}"></label><label>Кету күні<input type="date" name="departure" required min="${plusDays(search.arrival,1)}" value="${search.departure}"></label><label>Қонақ саны<select name="guests">${Array.from({length:10},(_,i)=>`<option value="${i+1}" ${search.guests===i+1?'selected':''}>${i+1} адам</option>`).join('')}</select></label><label>Бөлме түрі<select name="room">${roomTypes.map(r=>`<option value="${r.multiplier}" ${Number(multiplier)===r.multiplier?'selected':''}>${r.name}</option>`).join('')}</select></label><label>Атыңыз<input type="text" name="name" autocomplete="given-name" maxlength="80" placeholder="Мысалы, Айдана" required></label><label>Телефон<input type="tel" name="phone" autocomplete="tel" placeholder="+7 777 777 7777" required></label></div><div class="booking-total-box"><div><span id="booking-calculation"></span><strong id="booking-total"></strong></div><small id="booking-room-count"></small><small>Баға әр адамға есептеледі. Үлгі тарифке тұру және тамақтану кіреді.</small></div><p id="booking-error" class="booking-error" role="alert"></p><div class="booking-mode-note" id="booking-mode-note"></div><button class="btn btn-primary booking-submit" type="submit" id="booking-submit">Өтінімді сынап көру</button><p class="booking-privacy">Енгізілген деректер серверге жіберілмейді және сақталмайды.</p></form></div>`);
  refreshBookingTotal();
}

function refreshBookingTotal() {
  const form = document.getElementById('booking-form');
  if (!form || !currentBookingHotel) return;
  const values = new FormData(form);
  const arrival = values.get('arrival');
  const departure = values.get('departure');
  const nights = stayDays(arrival, departure);
  const guests = Number(values.get('guests'));
  const rate = Math.round(currentBookingHotel.price * Number(values.get('room')));
  form.elements.departure.min = arrival ? plusDays(arrival,1) : localDate();
  document.getElementById('booking-calculation').textContent = `${money(rate)} × ${guests} адам × ${Math.max(0,nights)} тәулік`;
  document.getElementById('booking-room-count').textContent = `${Math.ceil(guests/2)} бөлме · әр бөлмеге 2 адамға дейін. Бөлмелер саны қонақ санына қарай есептелді.`;
  document.getElementById('booking-total').textContent = nights > 0 ? money(rate*guests*nights) : 'Күндерді таңдаңыз';
  const instant = values.get('mode')==='instant';
  document.getElementById('booking-submit').textContent = instant ? 'Сынақ төлеміне өту' : 'Өтінімді сынап көру';
  document.getElementById('booking-mode-note').textContent = instant ? 'Келесі қадамда төлемнің үлгі экраны ашылады. Банк картасының деректері қажет емес.' : 'Нақты сайтта менеджер бос орынды тексеріп, сізбен байланысады.';
  document.getElementById('booking-error').textContent = '';
}

function bookingSuccess(details, instant=false) {
  window.Site.openModal(`<div class="booking-success"><span class="booking-success-icon">${icon('check',34)}</span><span class="detail-demo-pill">Сынақ аяқталды</span><h2>${instant?'Брондау үлгісі дайын!':'Өтінім үлгісі дайын!'}</h2><p>${instant?'Брондаудың толық жолын көрдіңіз. Нақты бронь жасалған жоқ және ақша алынған жоқ.':'Өтінім беру жолын көрдіңіз. Бұл деректер менеджерге жіберілген жоқ.'}</p><div class="booking-confirmation"><strong>${escapeHtml(details.hotel.name)}</strong><span>${escapeHtml(details.room)} · ${details.rooms} бөлме · ${details.guests} адам</span><span>${details.arrival} — ${details.departure}</span><strong>${money(details.total)}</strong><small>Үлгі есеп · ${details.nights} тәулік</small></div><button class="btn btn-primary" type="button" data-feature="close-modal">Жалғастыру</button></div>`);
}

function submitBooking(event) {
  const form = event.target;
  if (form.id !== 'booking-form') return;
  event.preventDefault();
  const data = new FormData(form);
  const arrival = String(data.get('arrival'));
  const departure = String(data.get('departure'));
  const nights = stayDays(arrival,departure);
  const phone = String(data.get('phone')).replace(/\D/g,'');
  const error = document.getElementById('booking-error');
  if (arrival < localDate() || !Number.isFinite(nights) || nights < 1 || nights > 90) { error.textContent='Келу және кету күндерін тексеріңіз. Демалыс ұзақтығы 1–90 тәулік болуы керек.'; return; }
  if (String(data.get('name')).trim().length < 2) { error.textContent='Атыңызды кемінде екі әріппен жазыңыз.'; return; }
  if (!/^[78]\d{10}$/.test(phone)) { error.textContent='Телефонды +7 777 777 7777 форматында енгізіңіз.'; return; }
  const multiplier = Number(data.get('room'));
  const details = { hotel:currentBookingHotel, arrival,departure,nights,guests:Number(data.get('guests')),rooms:Math.ceil(Number(data.get('guests'))/2),room:roomTypes.find(r=>r.multiplier===multiplier)?.name || 'Стандарт',total:Math.round(currentBookingHotel.price*multiplier)*Number(data.get('guests'))*nights };
  if (data.get('mode') !== 'instant') { bookingSuccess(details); return; }
  window.Site.openModal(`<div class="booking-payment"><div class="eyebrow">СЫНАҚ ТӨЛЕМІ</div><h2>Брондауды аяқтау</h2><p>Бұл экран онлайн төлемнің қалай көрінетінін көрсетеді.</p><div class="booking-confirmation"><strong>${escapeHtml(details.hotel.name)} · ${escapeHtml(details.room)}</strong><span>${details.arrival} — ${details.departure}</span><span>${details.rooms} бөлме · ${details.guests} адам · ${details.nights} тәулік</span><strong>${money(details.total)}</strong></div><div class="booking-demo-notice">${icon('shield',21)}<span>Нақты төлем жасалмайды. Банк картасының деректерін енгізудің қажеті жоқ.</span></div><button class="btn btn-primary booking-submit" type="button" id="booking-demo-pay">Сынақ төлемін аяқтау</button><button class="btn btn-secondary booking-submit" type="button" data-feature="close-modal">Бас тарту</button></div>`);
  document.getElementById('booking-demo-pay')?.addEventListener('click',()=>bookingSuccess(details,true),{once:true});
}

export function initFeatures() {
  if (!globalThis.window || !globalThis.document) return;
  if (window.__sanatoriumFeaturesInitialized) return;
  window.__sanatoriumFeaturesInitialized = true;
  document.addEventListener('submit',submitBooking);
  document.addEventListener('input',event=>{ if(event.target.closest('#booking-form'))refreshBookingTotal(); });
  document.addEventListener('change',event=>{ if(event.target.closest('#booking-form'))refreshBookingTotal(); });
  document.addEventListener('click',event=>{
    const target = event.target.closest('[data-feature]');
    if (!target) return;
    const action = target.dataset.feature;
    const hotel = hotels.find(h=>h.id===Number(target.dataset.id));
    if (action==='section') { document.getElementById(target.dataset.target)?.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth',block:'start'}); }
    if (action==='room-book') openBooking(hotel,'request',Number(target.dataset.multiplier)||1);
    if (action==='instant-book') openBooking(hotel,'instant');
    if (action==='close-modal') window.Site.closeModal();
    if (action==='remove-compare') { window.Site.toggleCompare(Number(target.dataset.id));window.Site.navigate('/compare'); }
    if (action==='photo' && hotel) window.Site.openModal(`<div class="detail-lightbox"><img src="${hotel.image}" alt="${hotel.name} — курорттың үлгі фотосы"><p>${hotel.name} · Интерфейске арналған үлгі фото</p></div>`);
    if ((action==='calendar-prev'||action==='calendar-next') && hotel) {calendarMonth.setMonth(calendarMonth.getMonth()+(action==='calendar-prev'?-1:1));document.getElementById('detail-calendar-widget').innerHTML=calendarMarkup(hotel.id);}
    if (action==='calendar-day' && hotel) {selectedCalendarDay=target.dataset.date;openBooking(hotel);}
  });
}
