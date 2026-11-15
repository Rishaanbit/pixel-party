/* Browser-local wallet shared by the menu, shop, and game pages. */
(() => {
  'use strict';
  const KEY='pixel-party-wallet-v1';
  const items=[
    {id:'midnight',kind:'theme',name:'Midnight',price:0,description:'Original purple background and lime controls.',colors:['#101019','#c5f581']},
    {id:'ocean',kind:'theme',name:'Ocean',price:40,description:'Deep blue backgrounds and aqua controls across the site.',colors:['#091e2b','#7de5df']},
    {id:'sunset',kind:'theme',name:'Sunset',price:60,description:'Plum backgrounds and peach controls across the site.',colors:['#291622','#ffc294']},
    {id:'original',kind:'screen',name:'Original',price:0,description:'Original game colors.',colors:['#c5f581','#c1a3fa']},
    {id:'frost',kind:'screen',name:'Frost',price:25,description:'An icy blue color treatment for all three game boards.',colors:['#83baff','#a6f4ff']},
    {id:'candy',kind:'screen',name:'Candy',price:35,description:'Pink and violet colors for all three game boards.',colors:['#ff9bdb','#c99bff']}
  ];
  const fresh=()=>({balance:0,earned:0,owned:['midnight','original'],theme:'midnight',screen:'original'});
  let memory=fresh(),persistent=true,round=0,roundId=0,queue=Promise.resolve();
  function clean(value){const s=fresh();if(!value||typeof value!=='object')return s;for(const key of ['balance','earned'])if(Number.isSafeInteger(value[key])&&value[key]>=0)s[key]=value[key];s.owned=[...new Set([...s.owned,...(Array.isArray(value.owned)?value.owned:[]).filter(id=>items.some(i=>i.id===id))])];for(const kind of ['theme','screen'])if(items.some(i=>i.id===value[kind]&&i.kind===kind)&&s.owned.includes(value[kind]))s[kind]=value[kind];return s;}
  function read(){if(!persistent)return structuredClone(memory);try{const raw=localStorage.getItem(KEY);memory=raw?clean(JSON.parse(raw)):memory;}catch{persistent=false;}return structuredClone(memory);}
  function refresh(){const s=read();document.documentElement.dataset.theme=s.theme;document.documentElement.dataset.screen=s.screen;document.querySelectorAll('[data-wallet]').forEach(el=>el.textContent=s.balance.toLocaleString());document.querySelectorAll('[data-earned]').forEach(el=>el.textContent=s.earned.toLocaleString());document.querySelectorAll('[data-round]').forEach(el=>el.textContent=round);document.querySelectorAll('[data-save-note]').forEach(el=>el.textContent=persistent?'Saved in this browser on this device. Clearing site data removes progress.':'Browser storage is unavailable. Progress lasts only while this page stays open.');window.dispatchEvent(new CustomEvent('walletchange',{detail:s}));return s;}
  function transact(change){const run=()=>{const s=read();const result=change(s);if(result.ok){memory=s;try{localStorage.setItem(KEY,JSON.stringify(s));}catch{persistent=false;}refresh();}return result;};const task=()=>navigator.locks?navigator.locks.request(KEY,run):run();queue=queue.then(task,task);return queue;}
  function award(amount){if(!Number.isSafeInteger(amount)||amount<=0)return Promise.resolve({ok:false});const id=roundId;return transact(s=>{s.balance+=amount;s.earned+=amount;if(id===roundId)round+=amount;return {ok:true};});}
  function choose(id){return transact(s=>{const item=items.find(i=>i.id===id);if(!item)return {ok:false,message:'Unknown item.'};if(!s.owned.includes(id)){if(s.balance<item.price)return {ok:false,message:'Not enough tokens yet.'};s.balance-=item.price;s.owned.push(id);}s[item.kind]=id;return {ok:true,message:item.name+' equipped.'};});}
  window.PixelParty={items,read,refresh,award,choose,beginRound(){roundId++;round=0;refresh();},settled:()=>queue};
  window.addEventListener('storage',e=>{if(e.key===KEY||e.key===null){if(e.newValue===null)memory=fresh();refresh();}});
  function ready(){
    const game=document.body.dataset.game;
    if(game&&window.self===window.top){const nav=document.createElement('nav');nav.className='game-wallet';nav.innerHTML='<a href="../../index.html">← GAMES</a><a href="../../shop.html">SHOP · <span data-wallet>0</span> ◈</a>';document.querySelector('main').prepend(nav);}
    refresh();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',ready);else ready();
})();
