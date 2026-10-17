'use strict';
/* ===== Lapisan data (localStorage; mudah diganti Firebase) ===== */
const K={settings:'motocare_settings',services:'motocare_services',products:'motocare_products',promos:'motocare_promos',bookings:'motocare_bookings',wo:'motocare_work_orders',ver:'motocare_schema_version',theme:'motocare_theme'};
const SCHEMA=1;
const DB={
  read(k,def){try{const v=localStorage.getItem(k);return v?JSON.parse(v):def}catch(e){console.warn('Data rusak:',k);return def}},
  write(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){toast('Penyimpanan penuh atau diblokir. Ekspor data lalu kosongkan.');return false}}
};
const rp=n=>'Rp '+Number(n||0).toLocaleString('id-ID');
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function toast(m){const t=$('#toast');t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2800)}

function seed(){
  if(DB.read(K.ver,0)>=SCHEMA)return;
  DB.write(K.settings,{name:'MOTOCARE MOTOR',wa:'6281234567890',address:'Jl. Contoh Raya No. 12, Kota Anda',hours:'Senin–Sabtu 08.00–17.00 · Minggu tutup',maps:'https://maps.google.com/?q=bengkel+motor'});
  DB.write(K.services,[
    {id:'S1',ico:'🛢️',name:'Ganti oli mesin',desc:'Oli baru, cek kebocoran.',dur:'20 mnt',fee:20000},
    {id:'S2',ico:'⚙️',name:'Servis CVT',desc:'Bersih CVT, roller, v-belt.',dur:'90 mnt',fee:80000},
    {id:'S3',ico:'🛞',name:'Ganti ban luar',desc:'Pasang dan balancing.',dur:'40 mnt',fee:30000},
    {id:'S4',ico:'🔧',name:'Servis ringan',desc:'Pemeriksaan dan setel.',dur:'60 mnt',fee:50000},
    {id:'S5',ico:'🛠️',name:'Tune-up',desc:'Busi, filter, karburator/injeksi.',dur:'90 mnt',fee:100000},
    {id:'S6',ico:'🛑',name:'Ganti kampas rem',desc:'Periksa rem, ganti kampas.',dur:'30 mnt',fee:25000},
    {id:'S7',ico:'🔋',name:'Ganti aki',desc:'Uji kelistrikan dan pasang aki.',dur:'20 mnt',fee:15000},
    {id:'S8',ico:'🏍️',name:'Turun mesin',desc:'Servis berat, pembongkaran mesin.',dur:'1–3 hari',fee:350000}]);
  DB.write(K.products,[
    {sku:'OLI-001',name:'Oli Mesin 10W-30',cat:'Oli',price:75000,stock:24,min:6},
    {sku:'BAN-090',name:'Ban Luar 80/90',cat:'Ban',price:200000,stock:12,min:4},
    {sku:'KMP-014',name:'Kampas Rem Depan',cat:'Rem',price:85000,stock:3,min:5},
    {sku:'AKI-005',name:'Aki Motor 12V',cat:'Kelistrikan',price:250000,stock:10,min:3},
    {sku:'BSI-002',name:'Busi Iridium',cat:'Mesin',price:65000,stock:0,min:5},
    {sku:'VBT-008',name:'V-Belt Matic',cat:'CVT',price:140000,stock:8,min:3}]);
  const y=new Date().getFullYear();
  DB.write(K.promos,[
    {id:'P1',name:'Paket Ganti Oli Hemat',normal:110000,promo:75000,from:'2026-10-01',to:'2026-10-31',tnc:'Oli mesin + jasa + cek kondisi motor.'},
    {id:'P2',name:'Diskon Servis Ringan',normal:160000,promo:120000,from:'2026-10-01',to:'2026-10-31',tnc:'Cek mesin, rem, kelistrikan, CVT.'},
    {id:'P3',name:'Paket Servis Lengkap',normal:315000,promo:250000,from:'2026-10-01',to:'2026-10-31',tnc:'Tune-up + ganti oli + cek injeksi.'},
    {id:'P4',name:'Promo Ganti Ban',normal:235000,promo:200000,from:'2026-10-01',to:'2026-10-31',tnc:'Ban luar berkualitas + gratis pasang.'}]);
  DB.write(K.bookings,[]);
  DB.write(K.wo,[
    {id:'WO1',no:'A-001',motor:'Honda Beat',job:'Ganti oli mesin',mech:'Andi',status:'Sedang dikerjakan',date:today(),eta:'11:30'},
    {id:'WO2',no:'A-002',motor:'Yamaha NMAX',job:'Servis CVT',mech:'Budi',status:'Menunggu',date:today(),eta:'13:00'},
    {id:'WO3',no:'A-003',motor:'Honda Vario',job:'Servis berat / turun mesin',mech:'Candra',status:'Pemeriksaan awal',date:today(),eta:'—'},
    {id:'WO4',no:'A-004',motor:'Scoopy',job:'Ganti ban depan',mech:'Dedi',status:'Selesai',date:today(),eta:'10:15'},
    {id:'WO5',no:'A-005',motor:'PCX',job:'Tune-up',mech:'Andi',status:'Menunggu spare part',date:today(),eta:'15:00'}]);
  DB.write(K.ver,SCHEMA);
}
const S=()=>DB.read(K.settings,{});
const STATUS=['Menunggu','Pemeriksaan awal','Sedang dikerjakan','Menunggu spare part','Menunggu persetujuan pelanggan','Selesai','Siap diambil','Dibatalkan'];
const stCls=s=>({'Selesai':'b-ok','Siap diambil':'b-ok','Sedang dikerjakan':'b-acc','Menunggu':'b-warn','Pemeriksaan awal':'b-warn','Dibatalkan':'b-bad'}[s]||'b-warn');

/* ===== Tampilan ===== */
function waLink(text){return 'https://wa.me/'+S().wa+'?text='+encodeURIComponent(text)}
function renderBase(){
  const s=S();
  document.querySelectorAll('[data-s]').forEach(e=>e.textContent=s[e.dataset.s]||'');
  $('#waTop').href=waLink('Halo '+s.name+', saya ingin bertanya.');
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
  $('#svcGrid').innerHTML=sv.map(x=>`<article class="item"><div class="ico">${x.ico}</div><h3>${esc(x.name)}</h3><p class="muted">${esc(x.desc)}</p><p class="muted">Estimasi ${esc(x.dur)}</p><div class="price">mulai ${rp(x.fee)}</div><p class="muted">Biaya jasa, belum termasuk spare part.</p></article>`).join('');
  $('#bkSvc').innerHTML=sv.map(x=>`<option>${esc(x.name)}</option>`).join('');
}
function renderProducts(){
  const P=DB.read(K.products,[]),cats=['Semua',...new Set(P.map(p=>p.cat))];
  const sel=$('#pCat');if(!sel.options.length)sel.innerHTML=cats.map(c=>`<option>${esc(c)}</option>`).join('');
  const q=$('#pSearch').value.toLowerCase(),c=sel.value||'Semua';
  const list=P.filter(p=>(c==='Semua'||p.cat===c)&&(p.name+p.sku).toLowerCase().includes(q));
  $('#prodGrid').innerHTML=list.map(p=>{
    const b=p.stock<=0?'<span class="badge b-bad">Stok habis</span>':p.stock<=p.min?`<span class="badge b-warn">Stok menipis: ${p.stock}</span>`:`<span class="badge b-ok">Stok: ${p.stock}</span>`;
    return `<article class="item"><div class="ico">📦</div><h3>${esc(p.name)}</h3><p class="muted">SKU ${esc(p.sku)} · ${esc(p.cat)}</p><div class="price">${rp(p.price)}</div>${b}
    <a class="btn ghost" target="_blank" rel="noopener" href="${waLink('Halo, saya tanya produk '+p.name+' ('+p.sku+')')}">Tanya via WhatsApp</a></article>`}).join('')||'<div class="empty">Produk tidak ditemukan.</div>';
}
let qFilter='Semua';
function renderQueue(){
  const chips=['Semua',...STATUS];
  $('#qChips').innerHTML=chips.map(c=>`<button class="chip ${c===qFilter?'on':''}" data-c="${esc(c)}">${esc(c)}</button>`).join('');
  const q=$('#qSearch').value.trim().toLowerCase();
  const l=DB.read(K.wo,[]).filter(w=>(qFilter==='Semua'||w.status===qFilter)&&w.no.toLowerCase().includes(q));
  $('#qList').innerHTML=l.map(w=>`<div class="q"><div class="no">${esc(w.no)}</div><div><b>${esc(w.motor)}</b><div class="muted">${esc(w.job)}</div></div>
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
seed();renderBase();renderPromos();renderServices();renderProducts();renderQueue();
$('#bkForm').elements.tgl.min=today();
$('#pSearch').oninput=renderProducts;$('#pCat').onchange=renderProducts;$('#qSearch').oninput=renderQueue;
$('#qChips').onclick=e=>{const c=e.target.dataset.c;if(c){qFilter=c;renderQueue()}};
$('#bkForm').onsubmit=submitBooking;$('#chkForm').onsubmit=checkBooking;
window.addEventListener('storage',()=>{renderProducts();renderQueue();renderPromos()});
