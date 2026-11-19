export const PHOTO = './assets/resort.jpg';
export const PHONE = '+7 777 777 7777';
export const EMAIL = 'saryagashkurort@example.com';
export const ADDRESS = 'Сарыағаш курорт';
const prices = [18000, 14500, 23000, 16500, 28000, 19500, 12500, 21000, 15500, 25000];
const categories = ['wellness','budget','premium','wellness','premium','family','budget','family','wellness','premium'];
export const hotels = prices.map((price, i) => ({
  id:i+1, name:`Санаторий ${i+1}`, price, rating:[4.9,4.7,4.9,4.8,4.9,4.8,4.6,4.8,4.7,4.9][i],
  stars:[4,3,5,4,5,4,3,4,3,5][i], category:categories[i], image:PHOTO,
  tags:i%3===0?['Минералды су','Бассейн','Тамақтану']:i%3===1?['Тамақтану','Спа','Wi-Fi']:['Бассейн','Спа','Тамақтану'],
  description:'Жасыл бақ, тыныш атмосфера және өзіңізге арнаған уақыт. Сарыағаштағы жайлы демалысыңызды осы жерден жоспарлаңыз.',
  phone:PHONE,email:EMAIL,address:ADDRESS,
}));
export const money = value => new Intl.NumberFormat('kk-KZ').format(value) + ' ₸';
export const escapeHtml = value => String(value).replace(/[&<>"']/g, char => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const paths = {
 search:'<circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/>',
 pin:'<path d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
 calendar:'<rect x="3" y="5" width="18" height="16" rx="3"/><path d="M7 3v4m10-4v4M3 11h18m-13 5h2m4 0h2"/>',
 users:'<circle cx="9" cy="8" r="3"/><path d="M3 21v-2a6 6 0 0 1 12 0v2m1-16a3 3 0 0 1 0 6m2 4a5 5 0 0 1 3 5v1"/>',
 heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>',
 compare:'<path d="M8 3v18m8-18v18M4 7h8m0 10h8M4 17h4m8-10h4"/><circle cx="8" cy="7" r="2"/><circle cx="16" cy="17" r="2"/>',
 check:'<path d="m5 12 4 4L19 6"/>',
 chevron:'<path d="m8 10 4 4 4-4"/>',
 close:'<path d="m6 6 12 12M6 18 18 6"/>',
 star:'<path d="m12 3 2.8 5.7 6.3.9-4.6 4.4 1.1 6.3-5.6-3-5.6 3 1.1-6.3L3 9.6l6.2-.9L12 3Z"/>',
 leaf:'<path d="M20 3C9 2 2 7 5 14c3 7 15 5 15-11Z"/><path d="M4 21 15 10"/>',
 water:'<path d="M12 3s7 7 7 12a7 7 0 0 1-14 0c0-5 7-12 7-12Z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
 sun:'<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1 1m12 12 1 1M5 19l1-1M18 6l1-1"/>',
 shield:'<path d="m12 3 8 3v6c0 5-8 9-8 9s-8-4-8-9V6l8-3Z"/><path d="m8 12 3 3 5-6"/>',
 phone:'<path d="M5 3h4l2 5-3 2a15 15 0 0 0 6 6l2-3 5 2v4a2 2 0 0 1-2 2A18 18 0 0 1 3 5a2 2 0 0 1 2-2Z"/>',
 mail:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
 spark:'<path d="m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3L12 3Z"/><path d="m20 2 .5 1.5L22 4l-1.5.5L20 6l-.5-1.5L18 4l1.5-.5L20 2Z"/>',
 menu:'<path d="M4 6h16M4 12h16M4 18h16"/>',
 bed:'<path d="M3 20V8m18 12V8M3 16h18M3 10h18v6M6 10V5h12v5m-6-5v5"/>',
 pool:'<path d="M3 20q3-3 6 0t6 0 6 0M3 16q3-3 6 0t6 0 6 0M7 13V5a2 2 0 0 1 4 0m3 10V5a2 2 0 0 1 4 0M7 8h7m-7 4h7"/>',
 wifi:'<path d="M2 8a16 16 0 0 1 20 0M5 12a11 11 0 0 1 14 0m-11 4a6 6 0 0 1 8 0"/><circle cx="12" cy="20" r=".5"/>',
 clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
 send:'<path d="m21 3-7 18-4-7-7-4 18-7ZM10 14 21 3"/>',
 info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v6m0-11v1"/>',
 back:'<path d="m14 6-6 6 6 6"/>',
 grid:'<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
 cup:'<path d="M5 4h12v9a6 6 0 0 1-12 0V4Zm12 1h2a3 3 0 0 1 0 6h-2M3 21h18"/>',
 logout:'<path d="M9 4H4v16h5m5-12 4 4-4 4m-5-4h13"/>'
};
export const icon = (name, size=20) => `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${paths[name]||paths.spark}</svg>`;
