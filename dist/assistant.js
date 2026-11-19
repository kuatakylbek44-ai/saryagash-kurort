import { hotels, money, icon, escapeHtml } from './data.js';

let widget;
let previousFocus;
let replyTimer;

const hotelLinks = (items) => `<div class="assistant-results">${items.map(hotel => `<a class="assistant-result" href="#/sanatorium/${hotel.id}"><span><b>${escapeHtml(hotel.name)}</b><small>${escapeHtml(hotel.tags.join(' · '))}</small></span><strong>${escapeHtml(money(hotel.price))}<small>адам / тәулік</small></strong></a>`).join('')}</div><p class="assistant-caption">Бұл — үлгі бағалар. Нақты тариф пен бос орын әлі қосылмаған.</p>`;

function answerQuestion(question) {
  const query = question.toLocaleLowerCase('kk-KZ').replace(/ё/g, 'е');
  const selectedMatch = query.match(/(?:санаторий|санатории|санатория|санатор|№)\s*(\d{1,2})(?!\d)/u);
  const selected = selectedMatch ? hotels.find(hotel => hotel.id === Number(selectedMatch[1])) : null;
  const roomQuestion = /(бөлме|болме|комнат|люкс|стандарт|жайлылық|жайлылык|(?:номер|нөмір)\s*(?:түр|тур|тип|баға|бага|цен)|(?:түр|тип).*(?:номер|нөмір))/u.test(query);
  if (/(ауру|ауыра|ауыр|диагноз|емде|дәрі|дари|асқазан|асказан|жүрек|журек|диабет|сырқат|сыркат|болез|лечени|лечить|здоров)/u.test(query)) {
    return '<p>Санаторийдегі сауықтыру қызметтері туралы ақпарат табуға көмектесемін. Сізге қандай емшара жарайтынын дәрігер немесе санаторийдің маманы анықтайды.</p><p>Бұл нұсқада емдеу бағдарламалары үлгі ретінде берілген. Таңдаған санаторийдің «Сауықтыру» бөлімін қарап, нақты бағдарламаны менеджерден сұраңыз.</p><a class="assistant-inline-link" href="#/catalog">Санаторийлерді қарау</a>';
  }
  if (/(мекен|адрес|қайда|кайда|орналас|телефон|почта|email|e-mail|байланыс|контакт|whatsapp)/u.test(query) || (!roomQuestion && /(номер|нөмір)/u.test(query))) {
    return `<p>Барлық санаторийге әзірге бірдей үлгі байланыс деректері енгізілген:</p><div class="assistant-contact"><span>${icon('pin',16)} Сарыағаш курорт</span><span>${icon('phone',16)} +7 777 777 7777</span><span>${icon('mail',16)} saryagashkurort@example.com</span></div><p class="assistant-caption">Телефон мен email — прототипке арналған үлгі деректер.</p>`;
  }
  if ((/(?:^|[\s,.!?])(?:ии|ai)(?:$|[\s,.!?])/u.test(query) || /(жасанды|ақылды|акылды|кімсің|кимсин|модель|демо|нақты|накты|шын|робот|көмекші|комекши)/u.test(query)) && !/(таңда|танда)/u.test(query)) {
    return '<p>Мен — Сая, сайттың демо көмекшісімін. Қазір осы сайттағы үлгі деректер бойынша дайын жауаптар ұсынамын: бағаларды, қызметтерді және брондау қадамдарын түсіндіремін.</p><p>Сыртқы AI қызметі, нақты бос орындар және менеджермен байланыс әзірге қосылмаған.</p>';
  }
  if (/(салыстыр|салысты|сравн)/u.test(query)) {
    return '<p>Каталогта ұнаған 2–3 санаторийдің «Салыстыру» батырмасын басыңыз. Салыстыру бетінде бағасы, бөлме санаты және қызметтері қатар көрсетіледі.</p><p>Бірдей күндер мен адам санын таңдасаңыз, жалпы шығынды салыстыру ыңғайлы болады.</p><a class="assistant-inline-link" href="#/compare">Салыстыруды ашу</a>';
  }
  if (/(брон|төле|толе|оплат|өтінім|отиним|заказ|тірке|тирке|болдырма|қайтар|кайтар)/u.test(query)) {
    return '<p>Санаторийді ашып, «Брондау» батырмасын басыңыз. Келу-кету күндерін, бөлмені және адам санын таңдаңыз.</p><p><b>Менеджер арқылы:</b> өтінім толтырасыз.<br><b>Бірден брондау:</b> онлайн төлем жолын сынап көресіз.</p><p class="assistant-caption">Қазір екі жол да демонстрация ретінде жұмыс істейді: өтінім менеджерге жіберілмейді, ақша алынбайды және нақты орын сақталмайды.</p><a class="assistant-inline-link" href="#/catalog">Санаторий таңдау</a>';
  }
  if (/(202\d|203\d|күн|кун|айы|айда|маусым|жыл|дата|календар|бос|свобод)/u.test(query) && !/(қанша|канша|есеп|адам|арзан)/u.test(query)) {
    return '<p>Санаторий бетіндегі күнтізбеден жоспарлаған кезеңіңізді қарап, брондау терезесінде келу-кету күндерін таңдауға болады.</p><p>Қазір күнтізбе мен тарифтер — үлгі. Нақты жүйеде әр маусымның бағасын және бос бөлме санын санаторий менеджері жаңартып отырады. Жаңа жылға баға енгізілмесе, оны менеджерден нақтылау қажет болады.</p>';
  }
  if (selectedMatch && !selected) {
    return '<p>Бұл нұсқада «Санаторий 1»–«Санаторий 10» бар. Осы санаторийлердің бірінің нөмірін жазыңыз немесе каталогтан таңдаңыз.</p><a class="assistant-inline-link" href="#/catalog">Каталогты ашу</a>';
  }
  if (selected) {
    const guestsMatch = query.match(/(\d{1,2})\s*(?:адам|кісі|киси|человек)/u);
    const nightsMatch = query.match(/(\d{1,2})\s*(?:күн|кун|тәулік|таулік|түн|тун|дней|сут)/u);
    if (guestsMatch && nightsMatch) {
      const guests = Number(guestsMatch[1]);
      const nights = Number(nightsMatch[1]);
      if (guests > 0 && nights > 0) return `<p><b>${escapeHtml(selected.name)}</b> үшін үлгі есеп:</p><p>${escapeHtml(money(selected.price))} × ${guests} адам × ${nights} тәулік = <b>${escapeHtml(money(selected.price * guests * nights))}</b>.</p><p>Бұл стандарт бөлменің үлгі тарифіне негізделген есеп. Нақты баға күндерге, бөлмеге және қызметтерге байланысты болады.</p>${hotelLinks([selected])}`;
    }
    return `<p><b>${escapeHtml(selected.name)}</b> туралы қысқаша:</p><p>Үлгі баға: <b>${escapeHtml(money(selected.price))}</b> / адам / тәулік.<br>Қызметтер: ${escapeHtml(selected.tags.join(', '))}.<br>Мекенжай: Сарыағаш курорт.</p><p>Жеке бетінде бөлмелер, сауықтыру, қызметтер, күнтізбе және байланыс бөлімдері бар.</p>${hotelLinks([selected])}`;
  }
  const budgetMatch = query.match(/(\d{1,3})\s*мың/u) || query.match(/(\d{1,3})\s*мындай/u);
  const rawBudgetMatch = query.match(/(\d{2})\s?(\d{3})/u);
  const budget = budgetMatch ? Number(budgetMatch[1]) * 1000 : rawBudgetMatch ? Number(rawBudgetMatch[1] + rawBudgetMatch[2]) : null;
  const requestedAmenities = [
    [/бассейн/u, 'Бассейн'], [/спа|spa/u, 'Спа'], [/wifi|wi-fi/u, 'Wi-Fi'],
    [/минерал/u, 'Минералды су'], [/тамақ|тамак|тағам|тагам/u, 'Тамақтану'],
  ].filter(([pattern]) => pattern.test(query)).map(([,tag]) => tag);
  const matchingAmenities = hotels.filter(hotel => requestedAmenities.every(tag => hotel.tags.includes(tag)));
  if (/(арзан|үнем|унем|бюджет|дешев|қолжетімді|колжетимди|қымбат емес|кымбат емес)/u.test(query) || budget) {
    let options = [...matchingAmenities].sort((a,b) => a.price-b.price);
    if (budget) options = options.filter(hotel => hotel.price <= budget);
    if (!options.length) return `<p>Үлгі каталогта ${budget ? `${escapeHtml(money(budget))} дейінгі бюджетке` : 'сұрауыңызға'}${requestedAmenities.length ? ` және мына қызметтердің барлығына: ${escapeHtml(requestedAmenities.join(', '))}` : ''} сай нұсқа жоқ. Бюджетті немесе қызметтер тізімін өзгертіп көріңіз.</p><a class="assistant-inline-link" href="#/catalog">Каталогты ашу</a>`;
    return `<p>${budget ? `${escapeHtml(money(budget))} дейінгі` : 'Бағасы төмен'}${requestedAmenities.length ? `, ${escapeHtml(requestedAmenities.join(', '))} қызметтері бар` : ''} үлгі нұсқалар:</p>${hotelLinks(options.slice(0,3))}`;
  }
  if (roomQuestion) {
    return '<p>Санаторийлердің жеке бетінде үш үлгі бөлме түрі бар: <b>Стандарт, Комфорт және Люкс</b>.</p><p>Бөлме карточкасынан бағасын қарап, брондау терезесінде күндер мен адам санын таңдауға болады. Жүйе үлгі жалпы соманы көрсетеді.</p><a class="assistant-inline-link" href="#/catalog">Бөлме таңдау</a>';
  }
  if (/(бассейн|spa|спа|wifi|wi-fi|тамақ|тамак|тағам|тагам|қызмет|кызмет|минерал|суы)/u.test(query)) {
    if (!matchingAmenities.length) return `<p>Үлгі каталогта мына қызметтердің барлығы қатар ұсынылатын санаторий жоқ: ${escapeHtml(requestedAmenities.join(', '))}. Қызметтер тізімін өзгертіп көріңіз.</p><a class="assistant-inline-link" href="#/catalog">Каталогты ашу</a>`;
    return `<p>Үлгі каталогтан сұраған қызметтердің барлығына сай нұсқалар:</p>${hotelLinks(matchingAmenities.slice(0,3))}<p>Толық тізімді санаторийдің «Қызметтер» бөлімінен көре аласыз.</p>`;
  }
  if (/(отбасы|баламен|балалар|семь|family)/u.test(query)) return `<p>Отбасылық демалыс санатындағы үлгі нұсқалар:</p>${hotelLinks(hotels.filter(hotel=>hotel.category==='family'))}<p>Баламен орналасу шарттары мен баланың тарифін нақты брондау алдында менеджерден білу керек.</p>`;
  if (/(премиум|premium|жұлдыз|жулдыз|рейтинг|жақсы|жаксы)/u.test(query)) return `<p>Премиум санатындағы үлгі нұсқаларды қарай аласыз:</p>${hotelLinks(hotels.filter(hotel=>hotel.category==='premium').slice(0,3))}<p class="assistant-caption">Сайттағы жұлдыздар мен рейтингтер әзірге демонстрациялық мәндер. Нақты қонақ пікірлері әлі жоқ.</p>`;
  if (/(баға|бага|қанша|канша|цена|стоим|таңда|танда|ұсын|усын|көмектес|комектес)/u.test(query)) return `<p>Қайсысы сізге ыңғайлы? Бюджетке сай, отбасылық немесе премиум нұсқа таңдауға көмектесемін. Мысалы, «20 мыңға дейін», «Бассейні бар» немесе «Санаторий 1» деп жазыңыз.</p>${hotelLinks([hotels[6],hotels[5],hotels[2]])}`;
  if (/^(сәлем|салем|салеметсіз|сәлеметсіз|привет|hello|hi|ассалаума)/u.test(query)) return '<p>Сәлем! Мен — Сая, демо көмекшімін. Сізге санаторий таңдауға, үлгі бағаларды қарауға және брондау жолын түсінуге көмектесемін.</p><p>Қандай демалыс іздеп жүрсіз: бағасы қолжетімді, отбасылық әлде спа демалысы ма?</p>';
  if (/(рахмет|рақмет|спасибо)/u.test(query)) return '<p>Оқасы жоқ! Тағы сұрағыңыз болса, жаза беріңіз. Мысалы, санаторийдің нөмірін немесе бір тәулікке жоспарлаған бюджетіңізді айтыңыз.</p>';
  return '<p>Бұл сұраққа дәл жауап беретін ақпарат менде әзірге жоқ. Мен сайттағы үлгі санаторийлер, бағалар, қызметтер және брондау қадамдары туралы көмектесе аламын.</p><p>Мысалы: «Арзан нұсқалар», «Санаторий 3» немесе «Қалай брондаймын?» деп жазыңыз.</p>';
}

function appendMessage(role, content, isMarkup=false) {
  const message = document.createElement('div');
  message.className = `assistant-message assistant-message-${role}`;
  if (role === 'bot') message.setAttribute('aria-label', 'Сая көмекші');
  if (isMarkup) message.innerHTML = content;
  else message.textContent = content;
  widget.querySelector('.assistant-messages').append(message);
  widget.querySelector('.assistant-messages').scrollTop = widget.querySelector('.assistant-messages').scrollHeight;
  return message;
}

function submitQuestion(question) {
  const cleanQuestion = question.trim().slice(0,500);
  if (!cleanQuestion) return;
  const input = widget.querySelector('.assistant-input');
  const send = widget.querySelector('.assistant-send');
  input.value = '';
  send.disabled = true;
  appendMessage('user', cleanQuestion);
  const typing = appendMessage('bot', '<span class="assistant-typing" aria-label="Жауап дайындалуда"><i></i><i></i><i></i></span>', true);
  window.clearTimeout(replyTimer);
  replyTimer = window.setTimeout(() => {
    typing.innerHTML = answerQuestion(cleanQuestion);
    const messages = widget.querySelector('.assistant-messages');
    messages.scrollTop = messages.scrollHeight;
    input.disabled = false;
    send.disabled = !input.value.trim();
    if (!widget.querySelector('.assistant-panel').hidden) input.focus({preventScroll:true});
  }, 320);
  input.disabled = true;
}

export function openAssistant() {
  if (!widget) initAssistant();
  const panel = widget.querySelector('.assistant-panel');
  if (!panel.hidden) return;
  previousFocus = document.activeElement;
  panel.hidden = false;
  widget.querySelector('.assistant-launch').setAttribute('aria-expanded','true');
  widget.classList.add('assistant-is-open');
  window.requestAnimationFrame(() => widget.querySelector('.assistant-input').focus({preventScroll:true}));
}

function closeAssistant() {
  widget.querySelector('.assistant-panel').hidden = true;
  widget.classList.remove('assistant-is-open');
  widget.querySelector('.assistant-launch').setAttribute('aria-expanded','false');
  if (previousFocus?.isConnected) previousFocus.focus({preventScroll:true});
  else widget.querySelector('.assistant-launch').focus({preventScroll:true});
}

export function initAssistant() {
  if (widget) return;
  widget = document.createElement('aside');
  widget.className = 'assistant-widget';
  widget.setAttribute('aria-label','Сайт көмекшісі');
  widget.innerHTML = `<section class="assistant-panel" id="saya-panel" role="dialog" aria-modal="false" aria-labelledby="saya-title" hidden>
    <header class="assistant-header"><span class="assistant-avatar">${icon('spark',25)}</span><div class="assistant-identity"><h2 id="saya-title">Сая көмекші</h2><span>Демо көмекші</span></div><button class="assistant-close" type="button" aria-label="Көмекшіні жабу">${icon('close',21)}</button></header>
    <div class="assistant-notice">Қазір сайттағы үлгі ақпаратпен жауап береді.</div>
    <div class="assistant-messages" role="log" aria-live="polite" aria-relevant="additions text" aria-label="Саямен әңгіме"></div>
    <div class="assistant-suggestions" aria-label="Дайын сұрақтар"><button type="button">Арзан нұсқалар</button><button type="button">Қалай брондаймын?</button><button type="button">Санаторий таңдауға көмектес</button></div>
    <form class="assistant-form"><label class="assistant-sr-only" for="saya-input">Көмекшіге сұрағыңыз</label><input class="assistant-input" id="saya-input" name="question" type="text" autocomplete="off" maxlength="500" placeholder="Сұрағыңызды жазыңыз…"><button class="assistant-send" type="submit" aria-label="Сұрақты жіберу" disabled>${icon('send',20)}</button></form>
    <div class="assistant-footnote">Сұрақтарыңыз сыртқы қызметке жіберілмейді.</div>
  </section><button type="button" class="assistant-launch" aria-controls="saya-panel" aria-expanded="false"><span class="assistant-launch-label">Көмек керек пе?</span><span class="assistant-launch-icon">${icon('spark',25)}</span></button>`;
  document.body.append(widget);
  appendMessage('bot','<p>Сәлем! Мен — <b>Сая</b> 🌿</p><p>Демалысыңызды бірге жоспарлайық. Санаторий таңдауға, үлгі бағаларды салыстыруға және брондау жолын түсінуге көмектесемін.</p>',true);
  widget.querySelector('.assistant-launch').addEventListener('click', () => widget.querySelector('.assistant-panel').hidden ? openAssistant() : closeAssistant());
  widget.querySelector('.assistant-close').addEventListener('click', closeAssistant);
  widget.querySelector('.assistant-input').addEventListener('input',event => widget.querySelector('.assistant-send').disabled = !event.target.value.trim());
  widget.querySelector('.assistant-form').addEventListener('submit',event => { event.preventDefault(); submitQuestion(widget.querySelector('.assistant-input').value); });
  widget.querySelector('.assistant-suggestions').addEventListener('click',event => { if(event.target.closest('button') && !widget.querySelector('.assistant-input').disabled) submitQuestion(event.target.closest('button').textContent); });
  widget.querySelector('.assistant-messages').addEventListener('click',event => { if(event.target.closest('a[href^="#/"]')) closeAssistant(); });
  document.addEventListener('keydown',event => { if(event.key === 'Escape' && !widget.querySelector('.assistant-panel').hidden) { event.preventDefault(); closeAssistant(); } });
}
