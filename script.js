const SVG={wrench:'<path d="M14.7 6.3a4 4 0 0 0-5.4 5.2L3 17.8 6.2 21l6.3-6.3a4 4 0 0 0 5.2-5.4l-2.6 2.6-2.4-.6-.6-2.4z"/>',drop:'<path d="M12 3s6 6.5 6 11a6 6 0 0 1-12 0c0-4.5 6-11 6-11z"/>',gear:'<circle cx="12" cy="12" r="3"/><path d="M12 2v3M12 19v3M2 12h3M19 12h3M5 5l2 2M17 17l2 2M19 5l-2 2M7 17l-2 2"/>',tire:'<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3"/>',bolt:'<path d="M13 2 4 14h7l-1 8 9-12h-7z"/>',box:'<path d="M21 8 12 3 3 8v8l9 5 9-5zM3 8l9 5 9-5M12 13v8"/>'};
const IM={S1:'drop',S2:'gear',S3:'tire',S5:'bolt',S6:'tire',S7:'bolt',S8:'gear'};
const icon=k=>'<img class="ico-img" src="logo-sm.png" alt="" width="56" height="56" loading="lazy" decoding="async">';
/* ===== Tampilan ===== */
function waLink(text){return 'https://wa.me/'+S().wa+'?text='+encodeURIComponent(text)}
function renderBase(){
  const s=S();
  document.querySelectorAll('[data-s]').forEach(e=>e.textContent=s[e.dataset.s]||'');
  $('#waTop').href=$('#waHero').href=$('#waFloat').href=waLink('Halo '+s.name+', saya ingin bertanya.');
  $('#mapBtn').href=s.maps;
}
function renderPromos(){
  const t=today();
  $('#promoGrid').innerHTML=DB.read(K.promos,[]).map(p=>{
    const exp=p.to<t,pct=Math.round((1-p.promo/p.normal)*100);
    return `<article class="item ${exp?'expired':''}"><span class="disc">${pct}%</span><h3>${esc(p.name)}</h3>
    <div class="price">${rp(p.promo)}<span class="old">${rp(p.normal)}</span></div>
    <p class="muted">${esc(p.tnc)}</p><p class="muted">Berlaku ${esc(p.from)} s/d ${esc(p.to)} ${exp?'<span class="badge b-bad">Berakhir</span>':''}</p>
    ${exp?'':`<a class="btn" target="_blank" rel="noopener" href="${waLink('Halo, saya ingin booking promo: '+p.name)}">Booking via WhatsApp</a>`}</article>`}).join('')||'<div class="empty">Belum ada promo.</div>';
}
function renderServices(){
  const sv=DB.read(K.services,[]);
  $('#svcGrid').innerHTML=sv.map(x=>`<article class="item"><div class="ico">${icon(x.id)}</div><h3>${esc(x.name)}</h3><p class="muted">${esc(x.desc)}</p><p class="muted">Estimasi ${esc(x.dur)}</p><div class="price">mulai ${rp(x.fee)}</div><p class="muted">Biaya jasa, belum termasuk spare part.</p></article>`).join('');
  $('#bkSvc').innerHTML=sv.map(x=>`<option>${esc(x.name)}</option>`).join('');
}
let pSel=null;
const mobile=()=>matchMedia('(max-width:860px)').matches;
function renderProducts(){
  const P=DB.read(K.products,[]),cats=[...new Set(P.map(p=>p.cat))],sel=$('#pCat');
  if(!sel.options.length)sel.innerHTML='<option>Semua</option>'+cats.map(c=>`<option>${esc(c)}</option>`).join('');
  const q=$('#pSearch').value.toLowerCase().trim(),m=mobile(),hide=m&&!q&&pSel===null;
  $('#pChips').innerHTML=['Semua Produk',...cats].map(x=>`<button class="chip ${pSel===x?'on':''}" data-c="${esc(x)}">${esc(x)}</button>`).join('');
  $('#pHint').hidden=!hide;
  if(hide){$('#prodGrid').innerHTML='';return}
  const c=m?(pSel||'Semua Produk'):sel.value,all=c==='Semua'||c==='Semua Produk';
  const list=P.filter(p=>(all||p.cat===c)&&(p.name+p.sku).toLowerCase().includes(q));
  $('#prodGrid').innerHTML=list.map(p=>{
    const b=p.stock<=0?'<span class="badge b-bad">Stok habis</span>':p.stock<=p.min?`<span class="badge b-warn">Stok menipis: ${p.stock}</span>`:`<span class="badge b-ok">Stok: ${p.stock}</span>`;
    return `<article class="item"><div class="ico">${icon('box')}</div><h3>${esc(p.name)}</h3><p class="muted">SKU ${esc(p.sku)} · ${esc(p.cat)}</p><div class="price">${rp(p.price)}</div>${b}
    <a class="btn ghost" target="_blank" rel="noopener" href="${waLink('Halo, saya tanya produk '+p.name+' ('+p.sku+')')}">Tanya via WhatsApp</a></article>`}).join('')||'<div class="empty">Produk tidak ditemukan.</div>';
}
let qFilter='Semua';
function renderQueue(){
  const chips=['Semua',...STATUS];
  $('#qChips').innerHTML=chips.map(c=>`<button class="chip ${c===qFilter?'on':''}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
  const q=$('#qSearch').value.trim().toLowerCase();
  const l=DB.read(K.wo,[]).filter(w=>(qFilter==='Semua'||w.status===qFilter)&&w.no.toLowerCase().includes(q));
  $('#qList').innerHTML=l.map(w=>`<div class="q"><div class="no">${esc(w.no)}${(w.demo||w.dummy)?'<br><span class="badge">DEMO</span>':''}</div><div><b>${esc(w.motor)}</b><div class="muted">${esc(w.job)}</div></div>
  <div class="st"><span class="badge ${stCls(w.status)}">${esc(w.status)}</span> <span class="muted">Mekanik ${esc(w.mech||'-')} · Est. ${esc(w.eta||'-')}</span></div></div>`).join('')||'<div class="empty">Belum ada antrean untuk filter ini.</div>';
}
/* ===== Booking ===== */
function bkCode(){const a='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';let r='';for(let i=0;i<4;i++)r+=a[Math.floor(Math.random()*a.length)];return 'BK-'+today().slice(2).replace(/-/g,'')+'-'+r}
function submitBooking(e){
  e.preventDefault();const f=e.target,d=Object.fromEntries(new FormData(f)),bad=[];
  f.querySelectorAll('input,select').forEach(i=>i.classList.remove('err'));
  ['nama','wa','plat','motor','tgl'].forEach(k=>{if(!String(d[k]||'').trim())bad.push(k)});
  if(d.wa&&!/^(\+?62|0)8\d{7,12}$/.test(d.wa.replace(/[\s-]/g,'')))bad.push('wa');
  if(d.tgl&&d.tgl<today())bad.push('tgl');
  if(bad.length){bad.forEach(k=>f.elements[k].classList.add('err'));toast('Periksa kolom yang ditandai merah.');return}
  const B=DB.read(K.bookings,[]);
  const b={id:'B'+Date.now(),code:bkCode(),...d,status:'Menunggu konfirmasi',created:new Date().toISOString()};
  B.push(b);if(!DB.write(K.bookings,B))return;
  const r=$('#bkResult');r.hidden=false;
  r.innerHTML=`<h3>Booking tersimpan</h3><p>Kode booking Anda: <b class="price">${esc(b.code)}</b></p><p class="muted">${esc(b.layanan)} · ${esc(b.motor)} · ${esc(b.tgl)} ${esc(b.jam)}<br>Admin akan mengonfirmasi. Booking belum berarti masuk antrean.</p>
  <a class="btn" target="_blank" rel="noopener" href="${waLink('Halo, saya booking servis. Kode: '+b.code+'\nNama: '+b.nama+'\nMotor: '+b.motor+' ('+b.plat+')\nLayanan: '+b.layanan+'\nJadwal: '+b.tgl+' '+b.jam)}">Kirim konfirmasi WhatsApp</a>`;
  f.reset();toast('Booking berhasil disimpan.');
}
function checkBooking(e){
  e.preventDefault();const c=$('#chkCode').value.trim().toUpperCase(),r=$('#chkResult');r.hidden=false;
  const b=DB.read(K.bookings,[]).find(x=>x.code===c);
  r.innerHTML=b?`<b>${esc(b.code)}</b><p>${esc(b.layanan)} · ${esc(b.tgl)} ${esc(b.jam)}</p><span class="badge b-warn">${esc(b.status)}</span>`:'<p>Kode tidak ditemukan. Periksa penulisan kode booking.</p>';
}
/* ===== Tema & init ===== */
function setTheme(t){document.documentElement.dataset.theme=t;DB.write(K.theme,t)}
setTheme(DB.read(K.theme,'dark'));
$('#themeBtn').onclick=()=>setTheme(document.documentElement.dataset.theme==='dark'?'light':'dark');
renderBase();renderPromos();renderServices();renderProducts();renderQueue();
$('#bkForm').elements.tgl.min=today();
$('#pSearch').oninput=renderProducts;$('#pCat').onchange=renderProducts;$('#qSearch').oninput=renderQueue;
$('#qChips').onclick=e=>{const c=e.target.dataset.c;if(c){qFilter=c;renderQueue()}};
$('#bkForm').onsubmit=submitBooking;$('#chkForm').onsubmit=checkBooking;
window.addEventListener('storage',()=>{renderProducts();renderQueue();renderPromos()});

const mb=$('#menuBtn'),nv=$('#nav'),closeMenu=()=>{nv.classList.remove('open');mb.setAttribute('aria-expanded','false')};
mb.onclick=()=>mb.setAttribute('aria-expanded',nv.classList.toggle('open'));
nv.onclick=e=>{if(e.target.tagName==='A')closeMenu()};
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeMenu()});

$('#pChips').onclick=e=>{const c=e.target.dataset.c;if(c){pSel=pSel===c?null:c;renderProducts()}};
matchMedia('(max-width:860px)').onchange=renderProducts;
/* Loading screen: tampil 3 detik setiap buka / muat ulang */
setTimeout(()=>{const y=$('#splash');y&&y.remove()},3500);
/* Tombol pasang PWA */
let dp=null;const pw=document.querySelectorAll('.pwa'),inApp=()=>matchMedia('(display-mode: standalone)').matches||navigator.standalone===true;
pw.forEach(b=>b.hidden=inApp());
addEventListener('beforeinstallprompt',e=>{e.preventDefault();dp=e});
addEventListener('appinstalled',()=>{dp=null;pw.forEach(b=>b.hidden=true);toast('Aplikasi berhasil dipasang')});
pw.forEach(b=>b.onclick=()=>{
  if(dp){dp.prompt();dp.userChoice.then(()=>{dp=null});return}
  const ios=/iphone|ipad|ipod/i.test(navigator.userAgent);
  $('#pwaT').innerHTML=ios?'Ketuk ikon <b>Bagikan</b> di Safari, lalu pilih <b>Tambah ke Layar Utama</b>.':'Buka menu browser (titik tiga ⋮), lalu pilih <b>Instal aplikasi</b> atau <b>Tambahkan ke layar utama</b>. Jika menu tidak ada, buka website ini lewat Chrome atau Edge.';
  $('#pwaM').hidden=false});
$('#pwaX').onclick=()=>$('#pwaM').hidden=true;$('#pwaM').onclick=e=>{if(e.target.id==='pwaM')e.target.hidden=true};
