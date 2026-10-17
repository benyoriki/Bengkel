'use strict';
/* ===== Lapisan data (localStorage; mudah diganti Firebase) ===== */
const K={users:'motocare_users',purch:'motocare_purchases',logs:'motocare_activity_logs',tx:'motocare_transactions',moves:'motocare_stock_movements',cashb:'motocare_cash_entries',settings:'motocare_settings',services:'motocare_services',products:'motocare_products',promos:'motocare_promos',bookings:'motocare_bookings',wo:'motocare_work_orders',ver:'motocare_schema_version',theme:'motocare_theme'};
const SCHEMA=3;
const DB={
  read(k,def){try{const v=localStorage.getItem(k);return v?JSON.parse(v):def}catch(e){console.warn('Data rusak:',k);return def}},
  write(k,v){try{localStorage.setItem(k,JSON.stringify(v));if(typeof window!=='undefined'){clearTimeout(DB._t);DB._t=setTimeout(()=>window.dispatchEvent(new Event('mc-data')),120)}return true}catch(e){toast('Penyimpanan penuh atau diblokir. Ekspor data lalu kosongkan.');return false}}
};
const rp=n=>'Rp '+Number(n||0).toLocaleString('id-ID');
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let _clock=null,_dummy=false,_quiet=false;
const today=()=>{const d=_clock?new Date(_clock):new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function toast(m){const t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2800)}

function seed(){
  const v0=DB.read(K.ver,0);if(v0>=SCHEMA)return;if(v0===1){DB.write(K.wo,DB.read(K.wo,[]).map(w=>({demo:true,hist:[],...w})));DB.write(K.users,USERS);DB.write(K.ver,SCHEMA);return}if(v0===2){DB.write(K.users,USERS);DB.write(K.ver,SCHEMA);return}
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
  DB.write(K.bookings,[]);DB.write(K.users,USERS);
  DB.write(K.wo,[
    {id:'WO1',no:'A-001',motor:'Honda Beat',job:'Ganti oli mesin',mech:'Andi',status:'Sedang dikerjakan',date:today(),demo:true,hist:[],eta:'11:30'},
    {id:'WO2',no:'A-002',motor:'Yamaha NMAX',job:'Servis CVT',mech:'Budi',status:'Menunggu',date:today(),demo:true,hist:[],eta:'13:00'},
    {id:'WO3',no:'A-003',motor:'Honda Vario',job:'Servis berat / turun mesin',mech:'Candra',status:'Pemeriksaan awal',date:today(),demo:true,hist:[],eta:'—'},
    {id:'WO4',no:'A-004',motor:'Scoopy',job:'Ganti ban depan',mech:'Dedi',status:'Selesai',date:today(),demo:true,hist:[],eta:'10:15'},
    {id:'WO5',no:'A-005',motor:'PCX',job:'Tune-up',mech:'Andi',status:'Menunggu spare part',date:today(),demo:true,hist:[],eta:'15:00'}]);
  DB.write(K.ver,SCHEMA);
}
const S=()=>DB.read(K.settings,{});
const STATUS=['Menunggu','Pemeriksaan awal','Sedang dikerjakan','Menunggu spare part','Menunggu persetujuan pelanggan','Selesai','Siap diambil','Dibatalkan'];
const stCls=s=>({'Selesai':'b-ok','Siap diambil':'b-ok','Sedang dikerjakan':'b-acc','Menunggu':'b-warn','Pemeriksaan awal':'b-warn','Dibatalkan':'b-bad'}[s]||'b-warn');


/* ===== Logika operasional (satu pintu untuk semua halaman) ===== */
const sess=()=>{try{return JSON.parse(sessionStorage.getItem('motocare_session'))}catch(e){return null}};
const U=()=>{if(_dummy)return 'Kasir Demo';const s=sess();return s?s.name:'Staf'},stamp=()=>(_clock?new Date(_clock):new Date()).toISOString();
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
function log(a){const L=DB.read(K.logs,[]);L.push({t:stamp(),u:U(),a,..._d()});DB.write(K.logs,L.slice(-500))}
function cash(type,cat,desc,amount,method,ref){const C=DB.read(K.cashb,[]);C.push({id:uid('KS'),t:stamp(),type,cat,desc,amount,method,ref,u:U(),..._d()});DB.write(K.cashb,C)}
function setBooking(id,status){const B=DB.read(K.bookings,[]),b=B.find(x=>x.id===id);if(!b)return null;b.status=status;DB.write(K.bookings,B);log('Booking '+b.code+' → '+status);return b}
function bookingToWO(id){
  const B=DB.read(K.bookings,[]),b=B.find(x=>x.id===id);
  if(!b||b.status!=='Dikonfirmasi'||b.woId)return null;
  const W=DB.read(K.wo,[]),n=W.filter(w=>!w.demo).length+1;
  const w={id:uid('WO'),no:'W-'+String(n).padStart(3,'0'),bookingCode:b.code,cust:b.nama,plat:b.plat,motor:b.motor,job:b.layanan,note:b.catatan||'',mech:'',status:'Menunggu',date:today(),eta:'',demo:false,paid:false,hist:[{t:stamp(),s:'Menunggu',n:'Dibuat dari booking '+b.code}]};
  W.push(w);b.woId=w.id;b.status='Masuk antrean';DB.write(K.wo,W);DB.write(K.bookings,B);log('Work order '+w.no+' dibuat');return w}
function setWO(id,p,note){const W=DB.read(K.wo,[]),w=W.find(x=>x.id===id);if(!w)return;w.hist=w.hist||[];
  if(p.status&&p.status!==w.status)w.hist.push({t:stamp(),s:p.status,n:note||''});else if(note)w.hist.push({t:stamp(),s:w.status,n:note});
  Object.assign(w,p);DB.write(K.wo,W);log('WO '+w.no+': '+(p.status||'diperbarui'))}
function changeStock(sku,d,reason,ref){
  const P=DB.read(K.products,[]),p=P.find(x=>x.sku===sku);
  if(!p)return{ok:false,msg:'SKU tidak ditemukan'};
  if(p.stock+d<0)return{ok:false,msg:'Stok '+p.name+' tidak cukup'};
  p.stock+=d;DB.write(K.products,P);
  const M=DB.read(K.moves,[]);M.push({id:uid('MV'),t:stamp(),sku,qty:d,reason,ref,u:U(),..._d()});DB.write(K.moves,M);return{ok:true}}
function payInvoice(woId,items,disc,method,paid){
  const T=DB.read(K.tx,[]);
  if(woId&&T.some(t=>t.woId===woId&&t.status==='Lunas'))return{ok:false,msg:'Work order ini sudah dibayar.'};
  if(!items.length)return{ok:false,msg:'Tagihan masih kosong.'};
  const sub=items.reduce((a,i)=>a+i.qty*i.price,0);
  if(disc<0||disc>sub)return{ok:false,msg:'Diskon tidak valid.'};
  const total=sub-disc;if(paid<total)return{ok:false,msg:'Nominal bayar kurang dari total.'};
  const P=DB.read(K.products,[]);
  for(const i of items.filter(i=>i.sku)){const p=P.find(x=>x.sku===i.sku);if(!p||p.stock<i.qty)return{ok:false,msg:'Stok '+i.name+' tidak cukup.'}}
  const id='TRX-'+today().replace(/-/g,'')+'-'+String(T.length+1).padStart(4,'0');
  items.filter(i=>i.sku).forEach(i=>changeStock(i.sku,-i.qty,'Penjualan',id));
  const tx={id,woId,items,sub,disc,total,paid,change:paid-total,method,status:'Lunas',t:stamp(),cashier:U(),..._d()};
  T.push(tx);DB.write(K.tx,T);cash('in','Penjualan/servis','Pembayaran '+id,total,method,id);
  if(woId)setWO(woId,{paid:true,status:'Siap diambil'},'Dibayar '+id);
  log('Transaksi '+id+' lunas');notify('Transaksi lunas',id+' · '+rp(total)+' · '+method+(_dummy?' (dummy)':''));return{ok:true,tx}}
function cancelTx(id,reason){
  if(!reason||reason.trim().length<3)return{ok:false,msg:'Alasan wajib diisi.'};
  const T=DB.read(K.tx,[]),t=T.find(x=>x.id===id);
  if(!t||t.status!=='Lunas')return{ok:false,msg:'Transaksi tidak dapat dibatalkan.'};
  t.items.filter(i=>i.sku).forEach(i=>changeStock(i.sku,i.qty,'Pembatalan',id));
  t.status='Dibatalkan';t.reason=reason;t.cancelT=stamp();DB.write(K.tx,T);
  cash('out','Refund','Pembatalan '+id+': '+reason,t.total,t.method,id);
  if(t.woId)setWO(t.woId,{paid:false},'Transaksi '+id+' dibatalkan');
  log('Transaksi '+id+' dibatalkan');notify('Transaksi dibatalkan',id+' · '+rp(t.total),'bad');return{ok:true}}
function exportAll(){const o={};Object.entries(K).forEach(([n,k])=>o[k]=DB.read(k,null));return JSON.stringify(o,null,1)}
function importAll(txt){const o=JSON.parse(txt);const ok=Object.values(K).filter(k=>k!==K.theme);
  if(!o||typeof o!=='object'||!o[K.products]||!o[K.wo])throw new Error('Format backup tidak dikenali');ok.forEach(k=>{if(o[k]!=null)DB.write(k,o[k])})}
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click()}

/* ===== Akun demo & sesi (BUKAN keamanan sungguhan: semua ada di browser) ===== */
const USERS=[{u:'admin',p:'admin123',role:'admin',name:'Admin Demo'},{u:'owner',p:'owner123',role:'owner',name:'Owner Demo'},{u:'kasir',p:'kasir123',role:'kasir',name:'Kasir Demo'}];
const homeOf=r=>r==='owner'?'owner.html':r==='kasir'?'kasir.html':'admin.html';
function login(u,p){const a=DB.read(K.users,[]).find(x=>x.u===u&&x.p===p);if(!a)return null;const s={u:a.u,role:a.role,name:a.name};try{sessionStorage.setItem('motocare_session',JSON.stringify(s))}catch(e){return null}return s}
function logout(){try{sessionStorage.removeItem('motocare_session')}catch(e){}location.href='login.html'}
function guard(roles){const s=sess();if(!s||!roles.includes(s.role)){location.replace('login.html');return null}return s}
/* ===== Stok, pembelian, kas manual ===== */
function newProduct(p){if(!p.sku||!p.name||!(p.price>=0))return{ok:false,msg:'SKU, nama, dan harga wajib valid.'};
  const P=DB.read(K.products,[]);if(P.some(x=>x.sku===p.sku))return{ok:false,msg:'SKU sudah ada.'};
  P.push({sku:p.sku,name:p.name,cat:p.cat,price:p.price,stock:0,min:p.min||0});DB.write(K.products,P);log('Produk baru '+p.sku);return{ok:true}}
function addPurchase(p){
  if(!p.sku||!(p.qty>0)||!Number.isInteger(p.qty)||!(p.cost>=0))return{ok:false,msg:'Produk, jumlah (bulat), dan harga beli wajib valid.'};
  const id='PB-'+Date.now().toString(36).toUpperCase(),r=changeStock(p.sku,p.qty,'Pembelian',id);if(!r.ok)return r;
  const P=DB.read(K.products,[]);P.find(x=>x.sku===p.sku).cost=p.cost;DB.write(K.products,P);
  const total=p.qty*p.cost,L=DB.read(K.purch,[]);L.push({id,t:stamp(),...p,total,paid:p.status==='Lunas'?total:0,u:U(),..._d()});DB.write(K.purch,L);
  if(p.status==='Lunas')cash('out','Pembelian barang','Pembelian '+id+' · '+p.supplier,total,p.method,id);
  log('Pembelian '+id+' ('+p.status+')');notify('Barang masuk',p.sku+' × '+p.qty+' · '+p.status);return{ok:true,id}}
function payDebt(id){const L=DB.read(K.purch,[]),b=L.find(x=>x.id===id);if(!b||b.paid>=b.total)return{ok:false,msg:'Tidak ada utang.'};
  const amt=b.total-b.paid;b.paid=b.total;b.status='Lunas';DB.write(K.purch,L);cash('out','Pelunasan utang supplier','Pelunasan '+id+' · '+b.supplier,amt,b.method,id);log('Utang '+id+' dilunasi');return{ok:true}}
function stockOut(sku,qty,reason){if(!sku||!(qty>0)||!Number.isInteger(qty)||!reason)return{ok:false,msg:'Produk, jumlah (bulat), dan alasan wajib.'};
  const r=changeStock(sku,-qty,reason,'manual');if(r.ok)log('Barang keluar '+sku+' x'+qty+' ('+reason+')');return r}
function manualCash(type,cat,desc,amount,method){if(!['in','out'].includes(type)||!(amount>0)||!desc||desc.trim().length<3)return{ok:false,msg:'Jenis, keterangan, dan nominal (>0) wajib.'};
  cash(type,cat||'Lainnya',desc.trim(),amount,method,null);log('Kas '+(type==='in'?'masuk':'keluar')+' '+amount);return{ok:true}}
function stats(){const T=DB.read(K.tx,[]),C=DB.read(K.cashb,[]),P=DB.read(K.products,[]),W=DB.read(K.wo,[]).filter(w=>!w.demo),B=DB.read(K.bookings,[]),PB=DB.read(K.purch,[]);
  const td=new Date().toDateString(),ok=T.filter(t=>t.status==='Lunas'),tod=ok.filter(t=>new Date(t.t).toDateString()===td),sum=(a,f)=>a.reduce((x,i)=>x+f(i),0);
  const ki=sum(C.filter(c=>c.type==='in'),c=>c.amount),ko=sum(C.filter(c=>c.type==='out'),c=>c.amount);
  return{omzetHari:sum(tod,t=>t.total),trxHari:tod.length,omzetAll:sum(ok,t=>t.total),trxAll:ok.length,kasIn:ki,kasOut:ko,saldo:ki-ko,
  motorHari:W.filter(w=>w.date===today()).length,aktif:W.filter(w=>!['Selesai','Siap diambil','Dibatalkan'].includes(w.status)).length,
  bookingBaru:B.filter(b=>b.status==='Menunggu konfirmasi').length,kritis:P.filter(p=>p.stock<=p.min),
  nilai:sum(P.filter(p=>p.cost!=null),p=>p.stock*p.cost),tanpaHPP:P.filter(p=>p.cost==null).length,utang:sum(PB,p=>p.total-p.paid)}}

/* ===== Notifikasi, data dummy, simulasi live (hanya untuk pengujian) ===== */
const _d=()=>_dummy?{dummy:true}:{};
function notify(title,body,kind){if(_quiet||typeof document==='undefined'||!document.body)return;let n=document.getElementById('notifs');
  if(!n){n=document.createElement('div');n.id='notifs';n.setAttribute('aria-live','polite');document.body.appendChild(n)}
  const e=document.createElement('div');e.className='nt '+(kind||'');e.innerHTML='<b>'+esc(title)+'</b><br><span class="muted">'+esc(body)+'</span>';
  n.prepend(e);while(n.children.length>4)n.lastChild.remove();setTimeout(()=>e.remove(),5000)}
const rnd=n=>Math.floor(Math.random()*n),pick=a=>a[rnd(a.length)];
const MOTORS=['Honda Beat','Yamaha NMAX','Honda Vario','Honda Scoopy','Honda PCX','Yamaha Aerox','Suzuki Satria','Honda Revo','Yamaha Mio','Kawasaki Ninja 250'],MECH=['Andi','Budi','Candra','Dedi'],NAMES=['Rudi','Siti','Agus','Dewi','Hendra','Rina','Joko','Maya','Fajar','Lina'];
const plate=()=>'B '+(1000+rnd(8999))+' '+String.fromCharCode(65+rnd(26),65+rnd(26),65+rnd(26));
function asDummy(fn,at){const o=[_dummy,_clock];_dummy=true;_clock=at||null;try{return fn()}finally{_dummy=o[0];_clock=o[1]}}
function dummyWO(o){const W=DB.read(K.wo,[]),n=W.filter(w=>!w.demo).length+1,st=o.status||'Menunggu';
  const w={id:uid('WO'),no:'W-'+String(n).padStart(3,'0'),cust:pick(NAMES),plat:plate(),motor:pick(MOTORS),job:o.job,note:'',mech:pick(MECH),status:st,date:today(),eta:'',demo:false,dummy:true,paid:false,hist:[{t:stamp(),s:st,n:'Data dummy'}]};
  W.push(w);DB.write(K.wo,W);return w}
function dummySale(){const s=pick(DB.read(K.services,[])),P=DB.read(K.products,[]).filter(p=>p.stock>2),w=dummyWO({job:s.name,status:'Selesai'});
  const items=[{name:s.name,qty:1,price:s.fee,sku:null}];
  if(P.length&&Math.random()<.7){const p=pick(P);items.push({name:p.name,qty:1+rnd(2),price:p.price,sku:p.sku})}
  const sub=items.reduce((a,i)=>a+i.qty*i.price,0),disc=Math.random()<.15?Math.round(sub*.05/1000)*1000:0,tot=sub-disc,m=pick(['Tunai','Tunai','Transfer','QRIS']);
  return payInvoice(w.id,items,disc,m,m==='Tunai'?Math.ceil(tot/50000)*50000:tot)}
function dummyBooking(){const s=pick(DB.read(K.services,[])),B=DB.read(K.bookings,[]);
  const b={id:uid('B'),code:'BK-'+today().slice(2).replace(/-/g,'')+'-D'+(100+rnd(900)),nama:pick(NAMES),wa:'08120000'+(1000+rnd(8999)),plat:plate(),motor:pick(MOTORS),layanan:s.name,tgl:today(),jam:pick(['09:00','11:00','13:00','15:00']),catatan:'',status:'Menunggu konfirmasi',created:stamp(),dummy:true};
  B.push(b);DB.write(K.bookings,B);return b}
function seedDummy(){
  if(DB.read(K.tx,[]).some(t=>t.dummy))return{ok:false,msg:'Data dummy sudah ada. Hapus dulu bila ingin membuat ulang.'};
  const base=new Date(),at=(dd,min)=>{const d=new Date(base);d.setDate(d.getDate()-dd);d.setHours(0,min,0,0);return d};
  _quiet=true;
  try{
    asDummy(()=>{cash('in','Modal awal','Modal awal kas (dummy)',20000000,'Tunai',null);
      DB.read(K.products,[]).forEach(p=>addPurchase({sku:p.sku,supplier:'Supplier Contoh',invoice:'INV-D-'+p.sku,qty:20,cost:Math.round(p.price*.68/1000)*1000,status:'Lunas',method:'Transfer'}))},at(7,480));
    asDummy(()=>addPurchase({sku:'VBT-008',supplier:'Supplier Contoh',invoice:'INV-D-UTANG',qty:10,cost:95000,status:'Utang',method:'Transfer'}),at(2,600));
    for(let dd=6;dd>=0;dd--){
      const nowMin=base.getHours()*60+base.getMinutes(),maxM=dd===0?Math.max(500,nowMin):1020,n=dd===0?4+rnd(3):4+rnd(6);
      const slots=[...Array(n)].map(()=>480+rnd(Math.max(10,maxM-480))).sort((a,b)=>a-b);
      slots.forEach(m=>asDummy(()=>dummySale(),at(dd,m)));
      if(dd===5)asDummy(()=>manualCash('out','Gaji / upah','Gaji mekanik minggu ini',1500000,'Tunai'),at(5,1000));
      if(dd===3)asDummy(()=>manualCash('out','Listrik','Tagihan listrik bengkel',350000,'Transfer'),at(3,900));
      if(dd===1)asDummy(()=>manualCash('out','Operasional','Beli perlengkapan bengkel',120000,'Tunai'),at(1,800));
    }
    asDummy(()=>{['Menunggu','Pemeriksaan awal','Sedang dikerjakan','Sedang dikerjakan','Menunggu spare part','Menunggu persetujuan pelanggan','Selesai'].forEach(st=>dummyWO({job:pick(DB.read(K.services,[])).name,status:st}));for(let i=0;i<3;i++)dummyBooking()});
  }finally{_quiet=false}
  notify('Data dummy dibuat','Transaksi 7 hari, kas, stok, antrean, dan booking contoh');return{ok:true}}
function clearDummy(){
  const P=DB.read(K.products,[]),net={};DB.read(K.moves,[]).filter(m=>m.dummy).forEach(m=>{net[m.sku]=(net[m.sku]||0)+m.qty});P.forEach(p=>{if(net[p.sku])p.stock=Math.max(0,p.stock-net[p.sku])});
  [K.moves,K.cashb,K.tx,K.purch,K.wo,K.bookings,K.logs].forEach(k=>DB.write(k,DB.read(k,[]).filter(x=>!x.dummy)));
  const rest=DB.read(K.purch,[]);P.forEach(p=>{if(!rest.some(b=>b.sku===p.sku))delete p.cost});DB.write(K.products,P);return{ok:true}}
let _sim=null;
function simTick(){asDummy(()=>{const r=Math.random();
  if(r<.55){dummySale()}
  else if(r<.85){const A=DB.read(K.wo,[]).filter(w=>w.dummy&&!w.paid&&!['Selesai','Siap diambil','Dibatalkan'].includes(w.status)),nx=['Menunggu','Pemeriksaan awal','Sedang dikerjakan','Selesai'];
    if(A.length){const w=pick(A),i=nx.indexOf(w.status),to=i<0?'Sedang dikerjakan':nx[Math.min(i+1,3)];setWO(w.id,{status:to},'Simulasi');notify('Status antrean',w.no+' · '+w.motor+' → '+to,'warn')}
    else{const w=dummyWO({job:pick(DB.read(K.services,[])).name});notify('Motor masuk',w.no+' · '+w.motor+' · '+w.job)}}
  else{const b=dummyBooking();notify('Booking baru',b.code+' · '+b.motor+' · '+b.layanan,'warn')}})}
function startSim(noTick){if(_sim)return;try{sessionStorage.setItem('motocare_sim','1')}catch(e){}_sim=setInterval(simTick,7000);if(!noTick)simTick()}
function stopSim(){clearInterval(_sim);_sim=null;try{sessionStorage.removeItem('motocare_sim')}catch(e){}}
if(typeof window!=='undefined'){
  window.addEventListener('storage',e=>{if(e.key===K.tx&&e.newValue){try{const T=JSON.parse(e.newValue),o=e.oldValue?JSON.parse(e.oldValue):[];if(T.length>o.length){const t=T[T.length-1];notify('Transaksi baru',t.id+' · '+rp(t.total)+' · '+t.method)}}catch(x){}}});
  document.addEventListener('DOMContentLoaded',()=>{const g=id=>document.getElementById(id),s=sess();
    const b=g('back');if(b){const k=location.pathname.endsWith('kasir.html')&&s&&s.role==='admin';b.href=k?'admin.html':'index.html';b.textContent=k?'← Kembali ke Admin':'← Kembali ke Website'}
    const sb=g('simBtn'),lab=()=>{if(sb)sb.textContent=_sim?'■ Hentikan simulasi live':'▶ Mulai simulasi live'};
    if(sb)sb.onclick=()=>{_sim?stopSim():startSim();lab();toast(_sim?'Simulasi berjalan: aktivitas dummy tiap ±7 detik':'Simulasi dihentikan')};
    const gb=g('dummyBtn');if(gb)gb.onclick=()=>{const r=seedDummy();toast(r.ok?'Data dummy dibuat':r.msg)};
    const cb=g('clrBtn');if(cb)cb.onclick=()=>{if(confirm('Hapus semua data dummy dan kembalikan stok?')){stopSim();lab();clearDummy();toast('Data dummy dihapus')}};
    if(s&&sessionStorage.getItem('motocare_sim')==='1'){startSim(true);lab()}})}
seed();
