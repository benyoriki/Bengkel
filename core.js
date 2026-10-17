'use strict';
/* ===== Lapisan data (localStorage; mudah diganti Firebase) ===== */
const K={logs:'motocare_activity_logs',tx:'motocare_transactions',moves:'motocare_stock_movements',cashb:'motocare_cash_entries',settings:'motocare_settings',services:'motocare_services',products:'motocare_products',promos:'motocare_promos',bookings:'motocare_bookings',wo:'motocare_work_orders',ver:'motocare_schema_version',theme:'motocare_theme'};
const SCHEMA=2;
const DB={
  read(k,def){try{const v=localStorage.getItem(k);return v?JSON.parse(v):def}catch(e){console.warn('Data rusak:',k);return def}},
  write(k,v){try{localStorage.setItem(k,JSON.stringify(v));return true}catch(e){toast('Penyimpanan penuh atau diblokir. Ekspor data lalu kosongkan.');return false}}
};
const rp=n=>'Rp '+Number(n||0).toLocaleString('id-ID');
const $=s=>document.querySelector(s);
const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const today=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
function toast(m){const t=$('#toast');if(!t)return;t.textContent=m;t.classList.add('show');clearTimeout(toast.t);toast.t=setTimeout(()=>t.classList.remove('show'),2800)}

function seed(){
  const v0=DB.read(K.ver,0);if(v0>=SCHEMA)return;if(v0===1){DB.write(K.wo,DB.read(K.wo,[]).map(w=>({demo:true,hist:[],...w})));DB.write(K.ver,SCHEMA);return}
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
const U=()=>'Staf (prototype)',stamp=()=>new Date().toISOString();
const uid=p=>p+Date.now().toString(36)+Math.random().toString(36).slice(2,5);
function log(a){const L=DB.read(K.logs,[]);L.push({t:stamp(),u:U(),a});DB.write(K.logs,L.slice(-500))}
function cash(type,cat,desc,amount,method,ref){const C=DB.read(K.cashb,[]);C.push({id:uid('KS'),t:stamp(),type,cat,desc,amount,method,ref,u:U()});DB.write(K.cashb,C)}
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
  const M=DB.read(K.moves,[]);M.push({id:uid('MV'),t:stamp(),sku,qty:d,reason,ref,u:U()});DB.write(K.moves,M);return{ok:true}}
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
  const tx={id,woId,items,sub,disc,total,paid,change:paid-total,method,status:'Lunas',t:stamp(),cashier:U()};
  T.push(tx);DB.write(K.tx,T);cash('in','Penjualan/servis','Pembayaran '+id,total,method,id);
  if(woId)setWO(woId,{paid:true,status:'Siap diambil'},'Dibayar '+id);
  log('Transaksi '+id+' lunas');return{ok:true,tx}}
function cancelTx(id,reason){
  if(!reason||reason.trim().length<3)return{ok:false,msg:'Alasan wajib diisi.'};
  const T=DB.read(K.tx,[]),t=T.find(x=>x.id===id);
  if(!t||t.status!=='Lunas')return{ok:false,msg:'Transaksi tidak dapat dibatalkan.'};
  t.items.filter(i=>i.sku).forEach(i=>changeStock(i.sku,i.qty,'Pembatalan',id));
  t.status='Dibatalkan';t.reason=reason;t.cancelT=stamp();DB.write(K.tx,T);
  cash('out','Refund','Pembatalan '+id+': '+reason,t.total,t.method,id);
  if(t.woId)setWO(t.woId,{paid:false},'Transaksi '+id+' dibatalkan');
  log('Transaksi '+id+' dibatalkan');return{ok:true}}
function exportAll(){const o={};Object.entries(K).forEach(([n,k])=>o[k]=DB.read(k,null));return JSON.stringify(o,null,1)}
function importAll(txt){const o=JSON.parse(txt);const ok=Object.values(K).filter(k=>k!==K.theme);
  if(!o||typeof o!=='object'||!o[K.products]||!o[K.wo])throw new Error('Format backup tidak dikenali');ok.forEach(k=>{if(o[k]!=null)DB.write(k,o[k])})}
function download(name,text,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type}));a.download=name;a.click()}
seed();
