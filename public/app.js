const $=x=>document.getElementById(x);
let ps=[],allProducts=[],cart=JSON.parse(localStorage.getItem('nb_cart')||'{}'),cat='সব পণ্য';
const cats=['ইলেকট্রনিক','মোবাইল আইটেম','উপহার সামগ্রী','পোশাক'];
const catMeta={
 'ইলেকট্রনিক':{icon:'🔌',desc:'চকেট, সুইচ, বৈদ্যুতিক তার, LED বাল্ব ও সার্কিট ব্রেকার এবং অন্যান্য ইলেকট্রিক পণ্য',img:'/images/category-electronics.jpg',tone:'blue'},
 'মোবাইল আইটেম':{icon:'📱',desc:'মোবাইল, কভার, চার্জার ও অ্যাক্সেসরিজ',img:'/images/category-mobile.jpg',tone:'green'},
 'উপহার সামগ্রী':{icon:'🎁',desc:'গিফট বক্স, খেলনা ও বিশেষ উপহার',img:'/images/category-gifts.jpg',tone:'pink'},
 'পোশাক':{icon:'👕',desc:'শার্ট, টি-শার্ট, প্যান্ট ও অন্যান্য পোশাক',img:'/images/category-clothing.jpg',tone:'orange'}
};
const money=n=>'৳ '+Number(n||0).toLocaleString('en-US');
function esc(s){return String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
function visitor(){let x=localStorage.getItem('nb_visitor');if(!x){x=crypto.randomUUID();localStorage.setItem('nb_visitor',x)}return x}
async function track(){try{await fetch('/api/track/visit?v='+encodeURIComponent(visitor())+'&path='+encodeURIComponent(location.pathname))}catch{}}
function productImages(p){let a=Array.isArray(p.images)?p.images.filter(Boolean):[];if(p.image&&!a.includes(p.image))a.unshift(p.image);return [...new Set(a)]}
function normalizeCategory(value){const s=String(value||'').trim().toLowerCase();if(['ইলেকট্রনিক','ইলেকট্রনিক্স','electronics','electronic','electronics & gadgets','gadgets'].includes(s))return 'ইলেকট্রনিক';if(['মোবাইল আইটেম','মোবাইল','মোবাইল অ্যাক্সেসরিজ','mobile','mobile items','mobile accessories','phone accessories'].includes(s))return 'মোবাইল আইটেম';if(['উপহার সামগ্রী','উপহার','গিফট','gift','gifts','gift items'].includes(s))return 'উপহার সামগ্রী';if(['পোশাক','কাপড়','কাপড়','clothing','fashion','fashion & clothing','apparel'].includes(s))return 'পোশাক';return String(value||'').trim()}
function renderCats(){
 const nav=$('cats');
 nav.innerHTML=cats.map((c,i)=>{
   const items=allProducts.filter(p=>normalizeCategory(p.category)===c);
   const meta=catMeta[c];
   // Permanent category artwork is independent of product uploads.
   return `<button type="button" class="category-card ${c===cat?'active':''} tone-${meta.tone}" style="--delay:${i*80}ms" data-category="${esc(c)}" aria-label="${esc(c)} ক্যাটাগরির ${items.length}টি পণ্য দেখুন">
     <span class="category-image collage permanent-category-image"><img src="${meta.img}" alt="${esc(c)} ক্যাটাগরির ছবি" loading="eager"><span class="category-count">${items.length}টি পণ্য</span></span>
     <span class="category-copy"><b>${esc(c)}</b><small>${esc(meta.desc)}</small><span class="cat-cta">দেখুন সব পণ্য <i>→</i></span></span>
   </button>`;
 }).join('');
 renderChips();
}
function renderChips(){const box=$('categoryChips');if(!box)return;box.innerHTML=[{name:'সব পণ্য',icon:'▦'},...cats.map(c=>({name:c,icon:catMeta[c].icon}))].map(x=>`<button type="button" class="chip ${cat===x.name?'active':''}" data-category="${esc(x.name)}">${x.icon} ${esc(x.name)}</button>`).join('')}
function selectCategory(c){cat=cats.includes(c)?c:'সব পণ্য';renderCats();renderProducts();const section=$('products-section');if(section)section.scrollIntoView({behavior:'smooth',block:'start'});}
async function load(){try{const r=await fetch('/api/products');if(!r.ok)throw Error('পণ্য লোড করা যায়নি');allProducts=await r.json();renderCats();renderProducts()}catch(e){$('products').innerHTML='<div class="empty-products">পণ্য লোড করা যাচ্ছে না। সার্ভার ও ডেটাবেস সংযোগ পরীক্ষা করুন।</div>'}}
function renderProducts(){
 const q=$('search').value.trim().toLowerCase();ps=allProducts.filter(p=>(cat==='সব পণ্য'||normalizeCategory(p.category)===cat)&&(!q||String([p.name,p.description,p.category].join(' ')).toLowerCase().includes(q)));
 $('productsTitle').textContent=cat==='সব পণ্য'?'জনপ্রিয় পণ্য':cat+' — সব পণ্য';$('productsSubtitle').textContent=cat==='সব পণ্য'?'পছন্দের পণ্য বেছে নিন, কার্টে যোগ করুন':cat+' ক্যাটাগরির '+ps.length+'টি পণ্য';$('productEyebrow').textContent=cat==='সব পণ্য'?'আপনার জন্য বাছাই করা':'নির্বাচিত ক্যাটাগরি';$('resultCount').textContent=`${ps.length}টি পণ্য`;
 $('products').innerHTML=ps.map(p=>{const ims=productImages(p),pic=ims[0]?`<img src="${esc(ims[0])}" alt="${esc(p.name)}" loading="lazy" onerror="this.parentElement.innerHTML='🛍️'">`:`<span class="product-placeholder">${catMeta[p.category]?.icon||'🛍️'}</span>`;const stock=Number(p.stock||0);return `<article class="product"><a class="pic" href="/product/${encodeURIComponent(p.id)}">${pic}<span class="image-count">▧ ${ims.length||0}</span></a><div class="pinfo"><small class="p-category">${esc(p.category)}</small><h3><a href="/product/${encodeURIComponent(p.id)}">${esc(p.name)}</a></h3><p class="p-desc">${esc(p.description||'মানসম্মত পণ্য, এখনই অর্ডার করুন')}</p><div class="price-row"><b>${money(p.price)}</b>${Number(p.oldPrice)>Number(p.price)?`<del>${money(p.oldPrice)}</del>`:''}</div><div class="stock-line ${stock<1?'out':''}">${stock>0?'● স্টকে আছে':'স্টক শেষ'}</div><div class="product-buttons"><button class="add-btn" onclick="add('${String(p.id).replace(/'/g,'')}');view('${String(p.id).replace(/'/g,'')}')" ${stock<1?'disabled':''}>＋ কার্টে যোগ</button><a class="buy-btn" href="/product/${encodeURIComponent(p.id)}">অর্ডার →</a></div></div></article>`}).join('')||`<div class="empty-products"><span>🛍️</span><h3>${cat==='সব পণ্য'?'কোনো পণ্য পাওয়া যায়নি':`“${esc(cat)}” ক্যাটাগরিতে এখনো পণ্য নেই`}</h3><p>${cat==='সব পণ্য'?'অন্য শব্দ দিয়ে খুঁজুন।':'এই ক্যাটাগরিতে পণ্য যোগ করা হলে এখানে স্বয়ংক্রিয়ভাবে দেখা যাবে।'}</p>${cat!=='সব পণ্য'?'<button onclick="selectCategory(\'সব পণ্য\')">সব পণ্য দেখুন</button>':''}</div>`;
 renderChips();cartUI();
}
function view(id){fetch('/api/track/product/'+encodeURIComponent(id),{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({visitorId:visitor()})}).catch(()=>{})}
function add(id){cart[id]=(cart[id]||0)+1;localStorage.setItem('nb_cart',JSON.stringify(cart));cartUI();const b=$('cart');b.classList.remove('cart-bump');void b.offsetWidth;b.classList.add('cart-bump')}
function cartUI(){let n=0,t=0;Object.entries(cart).forEach(([id,q])=>{const p=allProducts.find(x=>String(x.id)===String(id));if(p){n+=Number(q);t+=Number(q)*Number(p.price)}});$('cart').classList.toggle('hidden',!n);$('carttext').textContent=`${n}টি পণ্য · মোট ${money(t)}`;$('cartlistbtn').textContent=`কার্ট লিস্ট দেখুন (${n})`;$('headCartCount').textContent=n}
document.addEventListener('click',e=>{const target=e.target.closest('[data-category]');if(target){e.preventDefault();selectCategory(target.dataset.category);}});
$('search').addEventListener('input',renderProducts);track();load();
function openAdminLogin(){$('adminModal').classList.remove('hidden')}
$('adminLoginForm').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target),msg=$('adminLoginMsg');msg.textContent='লগইন হচ্ছে…';try{const r=await fetch('/api/admin/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(Object.fromEntries(f.entries()))});const d=await r.json();if(!r.ok)throw Error(d.error||'লগইন ব্যর্থ');localStorage.setItem('nb_admin_token',d.token);location.href='/admin-panel'}catch(err){msg.textContent=err.message}};
