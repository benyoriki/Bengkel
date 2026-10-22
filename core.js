'use strict';
/* ===== Lapisan data (localStorage; mudah diganti Firebase) ===== */
const K={users:'motocare_users',purch:'motocare_purchases',logs:'motocare_activity_logs',tx:'motocare_transactions',moves:'motocare_stock_movements',cashb:'motocare_cash_entries',settings:'motocare_settings',services:'motocare_services',products:'motocare_products',promos:'motocare_promos',bookings:'motocare_bookings',wo:'motocare_work_orders',cust:'motocare_customers',inv:'motocare_invoices',ver:'motocare_schema_version',theme:'motocare_theme'};
const SCHEMA=4;
const DB={
  read(k,def){if(DB._m){if(!(k in DB._m)){try{const v=localStorage.getItem(k);DB._m[k]=v?JSON.parse(v):def}catch(e){DB._m[k]=def}}return DB._m[k]}
    try{const v=localStorage.getItem(k);return v?JSON.parse(v):def}catch(e){console.warn('Data rusak:',k);return def}},
  write(k,v){if(DB._m){DB._m[k]=v;return true}
    try{localStorage.setItem(k,JSON.stringify(v));if(typeof window!=='undefined'){clearTimeout(DB._t);DB._t=setTimeout(()=>window.dispatchEvent(new Event('mc-data')),120)}return true}catch(e){toast('Penyimpanan penuh atau diblokir. Ekspor data lalu kosongkan.');return false}},
  flush(){const m=DB._m;DB._m=null;if(m)for(const k in m)DB.write(k,m[k])}
};
const rp=n=>'Rp '+Number(n||0).toLocaleString('id-ID');
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let _clock=null,_dummy=false,_quiet=false;
const today=()=>{const d=_clock?new Date(_clock):new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function toast(m){const t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2800)}

function seed(){
  const v0=DB.read(K.ver,0);if(v0>=SCHEMA)return;
  if(v0>=1){if(v0===1)DB.write(K.wo,DB.read(K.wo,[]).map(w=>({demo:true,hist:[],...w})));DB.write(K.users,USERS);
    DB.write(K.cashb,DB.read(K.cashb,[]).filter(c=>!['Penjualan/servis','Refund'].includes(c.cat)));DB.write(K.cust,DB.read(K.cust,[]));DB.write(K.inv,DB.read(K.inv,[]));DB.write(K.ver,SCHEMA);return}
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
  DB.write(K.bookings,[]);DB.write(K.users,USERS);DB.write(K.cust,[]);DB.write(K.inv,[]);
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
function cash(type,cat,desc,amount,method,ref,at){const C=DB.read(K.cashb,[]);C.push({id:uid('KS'),t:at||stamp(),type,cat,desc,amount,method,ref,u:U(),..._d()});DB.write(K.cashb,C)}
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
/* ===== Pelanggan, Faktur Service (WO), laporan harian ===== */
const dOf=t=>{const d=new Date(t);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
const addDays=n=>{const d=_clock?new Date(_clock):new Date();d.setDate(d.getDate()+n);return dOf(d)};
const normPlat=s=>String(s||'').toUpperCase().replace(/\s+/g,'');
const sumBy=(a,f)=>a.reduce((x,i)=>x+f(i),0);
const invT=i=>{const it=i.items||[],jasa=sumBy(it.filter(x=>x.type!=='part'),x=>x.qty*x.price),pt=it.filter(x=>x.type==='part'),part=sumBy(pt,x=>x.qty*x.price);return{jasa,part,sub:jasa+part,total:jasa+part-(i.disc||0),hpp:sumBy(pt,x=>x.qty*(x.cost||0))}};
function saveCustomer(c,id){const n=(c.name||'').trim(),pl=(c.plat||'').trim().toUpperCase();if(!n||!pl)return{ok:false,msg:'Nama dan No. Polisi wajib diisi.'};
  const C=DB.read(K.cust,[]);if(C.some(x=>x.id!==id&&normPlat(x.plat)===normPlat(pl)))return{ok:false,msg:'No. Polisi sudah terdaftar.'};
  const o={name:n,motor:(c.motor||'').trim(),plat:pl,hp:(c.hp||'').trim(),addr:(c.addr||'').trim()};
  if(id)Object.assign(C.find(x=>x.id===id),o);else C.push({id:uid('C'),...o,created:stamp(),..._d()});
  DB.write(K.cust,C);log('Pelanggan '+(id?'diubah ':'baru ')+pl);return{ok:true}}
function delCustomer(id){if(DB.read(K.inv,[]).some(i=>i.custId===id))return{ok:false,msg:'Pelanggan sudah punya faktur, tidak bisa dihapus.'};DB.write(K.cust,DB.read(K.cust,[]).filter(c=>c.id!==id));return{ok:true}}
function createInvoice(custId,extra){const c=DB.read(K.cust,[]).find(x=>x.id===custId);if(!c)return{ok:false,msg:'Pelanggan tidak ditemukan.'};
  const I=DB.read(K.inv,[]),d=today(),pre='FS-'+d.replace(/-/g,'')+'-';let n=I.filter(i=>i.no.startsWith(pre)).length+1;while(I.some(i=>i.no===pre+String(n).padStart(3,'0')))n++;
  const inv={id:uid('FK'),no:pre+String(n).padStart(3,'0'),date:d,t:stamp(),custId:c.id,name:c.name,motor:c.motor,plat:c.plat,hp:c.hp,addr:c.addr,km:'',mech:'',note:'',items:[],disc:0,ret:false,status:'Draft',u:U(),...(extra||{}),..._d()};
  I.push(inv);DB.write(K.inv,I);log('Faktur '+inv.no+' dibuat');return{ok:true,inv}}
function saveInvoice(id,p){const I=DB.read(K.inv,[]),i=I.find(x=>x.id===id);if(!i||i.status!=='Draft')return{ok:false,msg:'Faktur sudah ditutup, tidak bisa diubah.'};
  if(p.items){const it=[];for(const x of p.items){const q=Math.floor(+x.qty),pr=+x.price,nm=String(x.name||'').trim();if(!nm||!(q>=1)||!(pr>=0))return{ok:false,msg:'Item "'+(nm||'?')+'" tidak valid (nama, jumlah ≥ 1, harga ≥ 0).'};it.push({type:x.type==='part'?'part':'jasa',sku:x.sku||null,name:nm,qty:q,price:pr})}p={...p,items:it}}
  const nx={...i,...p},sub=invT(nx).sub;if(nx.disc<0||nx.disc>sub)return{ok:false,msg:'Diskon tidak valid.'};
  Object.assign(i,{km:nx.km,mech:nx.mech,note:nx.note,items:nx.items,disc:+nx.disc||0,ret:!!nx.ret});DB.write(K.inv,I);return{ok:true}}
function closeInvoice(id){const I=DB.read(K.inv,[]),i=I.find(x=>x.id===id);if(!i||i.status!=='Draft')return{ok:false,msg:'Faktur sudah ditutup.'};if(!i.items.length)return{ok:false,msg:'Faktur masih kosong.'};
  const P=DB.read(K.products,[]);for(const x of i.items.filter(x=>x.sku)){const p=P.find(y=>y.sku===x.sku);if(!p||p.stock<x.qty)return{ok:false,msg:'Stok '+x.name+' tidak cukup.'};x.cost=p.cost||0}
  i.items.filter(x=>x.sku).forEach(x=>changeStock(x.sku,-x.qty,'Penjualan',i.no));i.status='Tutup';i.closeT=stamp();DB.write(K.inv,I);log('Faktur '+i.no+' ditutup');return{ok:true}}
function payFaktur(id,method,paid){const I=DB.read(K.inv,[]),i=I.find(x=>x.id===id);if(!i||i.status!=='Tutup')return{ok:false,msg:'Faktur belum ditutup atau sudah dibayar.'};
  const t=invT(i).total;paid=paid==null||paid===''?t:+paid;if(!['Tunai','QRIS','Transfer'].includes(method))return{ok:false,msg:'Metode tidak valid.'};if(paid<t)return{ok:false,msg:'Nominal bayar kurang dari total.'};
  Object.assign(i,{status:'Lunas',method,paid,change:paid-t,payT:stamp(),payDate:dOf(stamp())});DB.write(K.inv,I);
  cash('in','Pendapatan servis','Pembayaran '+i.no+' · '+i.plat,t,method,i.id);
  if(i.woId)setWO(i.woId,{paid:true,status:'Siap diambil'},'Dibayar '+i.no);log('Faktur '+i.no+' lunas ('+method+')');notify('Faktur lunas',i.no+' · '+rp(t)+' · '+method+(_dummy?' (dummy)':''));return{ok:true}}
function rollbackInvoice(id){const I=DB.read(K.inv,[]),i=I.find(x=>x.id===id);if(!i||!['Tutup','Lunas'].includes(i.status))return{ok:false,msg:'Faktur tidak bisa di-rollback.'};
  if(i.status==='Lunas'){DB.write(K.cashb,DB.read(K.cashb,[]).filter(c=>!(c.ref===id&&c.type==='in')));['method','paid','change','payT','payDate'].forEach(k=>delete i[k])}
  i.items.filter(x=>x.sku).forEach(x=>changeStock(x.sku,x.qty,'Rollback faktur',i.no));
  i.status='Draft';i.rb=(i.rb||0)+1;DB.write(K.inv,I);if(i.woId)setWO(i.woId,{paid:false},'Faktur '+i.no+' di-rollback');log('Faktur '+i.no+' di-rollback ke Faktur Service');return{ok:true}}
function deleteInvoice(id){const I=DB.read(K.inv,[]),i=I.find(x=>x.id===id);if(!i||i.status!=='Draft')return{ok:false,msg:'Hanya faktur draft yang bisa dihapus.'};DB.write(K.inv,I.filter(x=>x.id!==id));log('Faktur '+i.no+' dihapus');return{ok:true}}
function invFromWO(woId){const w=DB.read(K.wo,[]).find(x=>x.id===woId);if(!w)return{ok:false,msg:'Work order tidak ditemukan.'};
  const ex=DB.read(K.inv,[]).find(i=>i.woId===woId&&i.status!=='Lunas');if(ex)return{ok:true,inv:ex};
  let C=DB.read(K.cust,[]),c=C.find(x=>w.plat&&normPlat(x.plat)===normPlat(w.plat));
  if(!c){if(!w.plat)return{ok:false,msg:'Work order tanpa No. Polisi: buat faktur lewat menu Faktur Service.'};c={id:uid('C'),name:w.cust||'Pelanggan',motor:w.motor||'',plat:w.plat,hp:'',addr:'',created:stamp()};C.push(c);DB.write(K.cust,C)}
  const r=createInvoice(c.id,{woId,mech:w.mech||'',note:w.job||''});return r}
function dayReport(d){const I=DB.read(K.inv,[]).filter(i=>i.status==='Lunas'&&i.payDate===d),C=DB.read(K.cashb,[]),T=i=>invT(i).total,by=m=>I.filter(i=>i.method===m);
  const inc=sumBy(I,T),qr=sumBy(by('QRIS'),T),tf=sumBy(by('Transfer'),T),tn=sumBy(by('Tunai'),T),outs=C.filter(c=>c.type==='out'&&dOf(c.t)===d),out=sumBy(outs,c=>c.amount),outT=sumBy(outs.filter(c=>c.method==='Tunai'),c=>c.amount);
  const awal=sumBy(C.filter(c=>c.method==='Tunai'&&(dOf(c.t)<d||(c.cat==='Modal awal'&&dOf(c.t)===d))),c=>c.type==='in'?c.amount:-c.amount);
  return{d,awal,inc,qr,tf,tn,out,outs,sisa:awal+inc-out,cash:awal+tn-outT,qrL:by('QRIS'),tfL:by('Transfer')}}
function dailyRows(f,t){const I=DB.read(K.inv,[]),o=[];if(!f||!t||f>t)return o;
  for(let d=new Date(f+'T12:00:00'),n=0;dOf(d)<=t&&n<400;d.setDate(d.getDate()+1),n++){const k=dOf(d),p=I.filter(i=>i.status==='Lunas'&&i.payDate===k),pr=p.flatMap(i=>i.items.filter(x=>x.type==='part'));
    o.push({d:k,inc:sumBy(p,i=>invT(i).total),units:I.filter(i=>i.date===k).length,pq:sumBy(pr,x=>x.qty),pv:sumBy(pr,x=>x.qty*x.price),ret:I.filter(i=>i.date===k&&i.ret).length})}return o}
function exportAll(){const o={};Object.entries(K).forEach(([n,k])=>o[k]=DB.read(k,null));return JSON.stringify(o,null,1)}
function importAll(txt){const o=JSON.parse(txt);const ok=Object.values(K).filter(k=>k!==K.theme);
  if(!o||typeof o!=='object'||!o[K.products]||!o[K.wo])throw new Error('Format backup tidak dikenali');ok.forEach(k=>{if(o[k]!=null)DB.write(k,o[k])})}
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click()}

/* ===== Akun demo & sesi (BUKAN keamanan sungguhan: semua ada di browser) ===== */
const USERS=[{u:'admin',p:'admin123',role:'admin',name:'Admin Demo'},{u:'owner',p:'owner123',role:'owner',name:'Owner Demo'}];
const homeOf=r=>r==='owner'?'owner.html':'admin.html';
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
function manualCash(type,cat,desc,amount,method,at){if(!['in','out'].includes(type)||!(amount>0)||!desc||desc.trim().length<3)return{ok:false,msg:'Jenis, keterangan, dan nominal (>0) wajib.'};
  cash(type,cat||'Lainnya',desc.trim(),amount,method,null,at);log('Kas '+(type==='in'?'masuk':'keluar')+' '+amount);return{ok:true}}
function stats(){const I=DB.read(K.inv,[]),ok=I.filter(i=>i.status==='Lunas'),C=DB.read(K.cashb,[]),P=DB.read(K.products,[]),W=DB.read(K.wo,[]).filter(w=>!w.demo),B=DB.read(K.bookings,[]),PB=DB.read(K.purch,[]),td=today(),tod=ok.filter(i=>i.payDate===td),T=i=>invT(i).total;
  const ki=sumBy(C.filter(c=>c.type==='in'),c=>c.amount),ko=sumBy(C.filter(c=>c.type==='out'),c=>c.amount);
  return{omzetHari:sumBy(tod,T),trxHari:tod.length,omzetAll:sumBy(ok,T),trxAll:ok.length,kasIn:ki,kasOut:ko,saldo:ki-ko,
  motorHari:I.filter(i=>i.date===td).length,aktif:W.filter(w=>!['Selesai','Siap diambil','Dibatalkan'].includes(w.status)).length,
  bookingBaru:B.filter(b=>b.status==='Menunggu konfirmasi').length,kritis:P.filter(p=>p.stock<=p.min),
  nilai:sumBy(P.filter(p=>p.cost!=null),p=>p.stock*p.cost),tanpaHPP:P.filter(p=>p.cost==null).length,utang:sumBy(PB,p=>p.total-p.paid)}}

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
function dummyCust(){const C=DB.read(K.cust,[]);if(C.length&&Math.random()<(C.length>30?.85:.4))return pick(C);const c={id:uid('C'),name:pick(NAMES),motor:pick(MOTORS),plat:plate(),hp:'08120000'+(1000+rnd(8999)),addr:'Jl. Contoh No. '+(1+rnd(90)),created:stamp(),dummy:true};C.push(c);DB.write(K.cust,C);return c}
function dummySale(){const c=dummyCust(),r=createInvoice(c.id);if(!r.ok)return r;const s=pick(DB.read(K.services,[])),P=DB.read(K.products,[]).filter(p=>p.stock>2),items=[{type:'jasa',name:s.name,qty:1,price:s.fee}];
  if(P.length&&Math.random()<.7){const p=pick(P);items.push({type:'part',sku:p.sku,name:p.name,qty:1+rnd(2),price:p.price})}
  const sub=sumBy(items,i=>i.qty*i.price),disc=Math.random()<.15?Math.round(sub*.05/1000)*1000:0;
  saveInvoice(r.inv.id,{items,disc,mech:pick(MECH),km:String(5000+rnd(60000)),ret:Math.random()<.08,note:'Data dummy'});
  const k=closeInvoice(r.inv.id);if(!k.ok)return k;return payFaktur(r.inv.id,pick(['Tunai','Tunai','Transfer','QRIS']))}
function dummyBooking(){const s=pick(DB.read(K.services,[])),B=DB.read(K.bookings,[]);
  const b={id:uid('B'),code:'BK-'+today().slice(2).replace(/-/g,'')+'-D'+(100+rnd(900)),nama:pick(NAMES),wa:'08120000'+(1000+rnd(8999)),plat:plate(),motor:pick(MOTORS),layanan:s.name,tgl:today(),jam:pick(['09:00','11:00','13:00','15:00']),catatan:'',status:'Menunggu konfirmasi',created:stamp(),dummy:true};
  B.push(b);DB.write(K.bookings,B);return b}
function seedDummy(){
  if(DB.read(K.inv,[]).some(t=>t.dummy)||DB.read(K.purch,[]).some(t=>t.dummy))clearDummy();
  const base=new Date(),N=90,SUP=['Toko Bali','Jaya Motor','Sinar Motor'],at=(dd,min)=>{const d=new Date(base);d.setDate(d.getDate()-dd);d.setHours(0,min,0,0);return d},nowMin=base.getHours()*60+base.getMinutes(),cost=p=>Math.round(p.price*.68/1000)*1000;
  _quiet=true;DB._m={};
  try{
    asDummy(()=>{cash('in','Modal awal','Modal awal kas (dummy)',15000000,'Tunai',null);DB.read(K.products,[]).forEach((p,x)=>addPurchase({sku:p.sku,supplier:SUP[x%3],invoice:'INV-D-'+p.sku,qty:30,cost:cost(p),status:'Lunas',method:'Transfer',invDate:today()}))},at(N+1,480));
    for(let dd=N;dd>=0;dd--){
      const dow=at(dd,0).getDay();
      if(dd%20===8)asDummy(()=>DB.read(K.products,[]).forEach((p,x)=>{const u=dd<50&&(x+dd)%2===0;addPurchase({sku:p.sku,supplier:SUP[x%3],invoice:'INV-D-'+dd+'-'+p.sku,qty:15+rnd(10),cost:cost(p),status:u?'Utang':'Lunas',method:'Transfer',invDate:today(),due:u?addDays(14+rnd(14)):'',note:u?'Tempo pembayaran':''})}),at(dd,500));
      const maxM=dd===0?Math.max(500,nowMin):1020,n=dow===0?0:(dd===0?3+rnd(3):3+rnd(5)+(dow===6?2:0));
      [...Array(n)].map(()=>480+rnd(Math.max(10,maxM-480))).sort((a,b)=>a-b).forEach(m=>asDummy(()=>dummySale(),at(dd,m)));
      asDummy(()=>{if(dow!==0&&Math.random()<.6)manualCash('out','Beli Bensin','Beli bensin operasional',20000+rnd(5)*10000,'Tunai');
        if(dd%7===0)manualCash('out','Gaji / upah','Gaji mekanik minggu ini',1500000,'Tunai');
        if(dd%30===3)manualCash('out','Listrik','Tagihan listrik bengkel',350000,'Transfer');
        if(dd%14===2)manualCash('out','Sumbangan','Sumbangan kegiatan warga',100000,'Tunai');
        if(dd%9===4)manualCash('out','Beli Busi','Beli busi untuk stok bengkel',130000,'Tunai')},at(dd,1000));
    }
    asDummy(()=>{for(let i=0;i<4;i++){const c=dummyCust(),r=createInvoice(c.id);if(!r.ok)continue;const s=pick(DB.read(K.services,[]));saveInvoice(r.inv.id,{items:[{type:'jasa',name:s.name,qty:1,price:s.fee}],mech:pick(MECH)});if(i<2)closeInvoice(r.inv.id)}},at(0,Math.max(500,nowMin)));
    asDummy(()=>{[['KMP-014',4],['BSI-002',0],['VBT-008',7]].forEach(([k,t])=>{const p=DB.read(K.products,[]).find(x=>x.sku===k);if(p&&p.stock!==t)changeStock(k,t-p.stock,'Penyesuaian: stock opname (dummy)','opname')});
      ['Menunggu','Pemeriksaan awal','Sedang dikerjakan','Sedang dikerjakan','Menunggu spare part','Menunggu persetujuan pelanggan','Selesai'].forEach(st=>dummyWO({job:pick(DB.read(K.services,[])).name,status:st}));for(let i=0;i<3;i++)dummyBooking()},at(0,nowMin));
  }finally{_quiet=false;DB.flush()}
  notify('Data dummy dibuat','Transaksi 3 bulan, pelanggan, stok, kas, hutang, antrean, booking');return{ok:true}}
function clearDummy(){
  const P=DB.read(K.products,[]),net={};DB.read(K.moves,[]).filter(m=>m.dummy).forEach(m=>{net[m.sku]=(net[m.sku]||0)+m.qty});P.forEach(p=>{if(net[p.sku])p.stock=Math.max(0,p.stock-net[p.sku])});
  [K.moves,K.cashb,K.tx,K.purch,K.wo,K.bookings,K.logs,K.inv,K.cust].forEach(k=>DB.write(k,DB.read(k,[]).filter(x=>!x.dummy)));
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
