import fs from 'node:fs/promises';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const root=new URL('../',import.meta.url);
const load=p=>fs.readFile(new URL(p,root),'utf8');
const economy=await load('economy.js');
function browser(store=new Map(),blocked=false){
 const nodes=new Map(),listeners={},documentListeners={};
 const paint=new Proxy({createLinearGradient:()=>({addColorStop(){}})},{get:(o,k)=>o[k]||(()=>{})});
 const document={readyState:'loading',documentElement:{dataset:{}},body:{dataset:{}},getElementById(id){if(!nodes.has(id))nodes.set(id,{textContent:'',getContext:()=>paint,addEventListener(){}});return nodes.get(id);},querySelectorAll(){return [];},addEventListener(name,fn){documentListeners[name]=fn;}};
 const window={addEventListener(name,fn){listeners[name]=fn;},dispatchEvent(){},devicePixelRatio:1};
 const context=vm.createContext({document,window,navigator:{},localStorage:{getItem:k=>{if(blocked)throw Error('Blocked');return store.get(k)??null;},setItem:(k,v)=>{if(blocked)throw Error('Blocked');store.set(k,v);}},structuredClone,CustomEvent:class{constructor(type,args){this.type=type;this.detail=args.detail;}},performance:{now:()=>0},requestAnimationFrame(){},matchMedia:()=>({matches:false}),Math});
 vm.runInContext(economy,context);
 return {context,api:window.PixelParty,document,listeners,documentListeners};
}
const store=new Map(),a=browser(store);
assert.equal(a.api.read().balance,0);
assert.equal((await a.api.choose('ocean')).ok,false);
await Promise.all([a.api.award(20),a.api.award(30)]);
assert.equal(a.api.read().balance,50);
assert.equal((await a.api.choose('ocean')).ok,true);
assert.equal(a.api.read().balance,10);
await a.api.choose('ocean');assert.equal(a.api.read().balance,10);
await a.api.choose('midnight');await a.api.choose('ocean');assert.equal(a.api.read().balance,10);
const reload=browser(store);reload.api.refresh();
assert.equal(reload.api.read().balance,10);assert.equal(reload.document.documentElement.dataset.theme,'ocean');
await reload.api.award(100);await reload.api.choose('frost');assert.equal(reload.document.documentElement.dataset.screen,'frost');
await reload.api.choose('candy');assert.equal(reload.document.documentElement.dataset.screen,'candy');
await reload.api.choose('original');assert.equal(reload.document.documentElement.dataset.screen,'original');
assert.equal((await reload.api.choose('missing')).ok,false);
assert.equal((await reload.api.award(-5)).ok,false);
const blocked=browser(new Map(),true);await blocked.api.award(30);await blocked.api.choose('frost');assert.equal(blocked.api.read().balance,5);
const corrupted=browser(new Map([['pixel-party-wallet-v1',JSON.stringify({balance:-9,owned:['fake'],theme:'ocean'})]]));assert.equal(corrupted.api.read().balance,0);assert.equal(corrupted.api.read().theme,'midnight');
// Returning to a cached page refreshes both applied theme and screen selection.
const cached=browser(store);cached.api.refresh();
await reload.api.choose('midnight');await reload.api.choose('candy');
assert.equal(cached.document.documentElement.dataset.theme,'ocean');
cached.listeners.pageshow({persisted:true});
assert.equal(cached.document.documentElement.dataset.theme,'midnight');
assert.equal(cached.document.documentElement.dataset.screen,'candy');
await reload.api.choose('ocean');cached.listeners.focus();
assert.equal(cached.document.documentElement.dataset.theme,'ocean');
await reload.api.choose('original');cached.documentListeners.visibilitychange();
assert.equal(cached.document.documentElement.dataset.screen,'original');
const remaining=reload.api.read().balance;
await Promise.all([reload.api.choose('candy'),reload.api.choose('frost'),reload.api.choose('original')]);
assert.equal(reload.api.read().screen,'original');assert.equal(reload.api.read().balance,remaining);
// A cached parent also updates the embedded game document.
let frameRefreshes=0;cached.document.querySelectorAll=selector=>selector==='iframe'?[{contentWindow:{PixelParty:{refresh(){frameRefreshes++;}}}}]:[];
cached.listeners.pageshow({persisted:true});assert.equal(frameRefreshes,1);
// Shop updates preserve the exact button nodes and can switch owned items repeatedly.
const shop=browser(store);shop.context.PixelParty=shop.api;
function element(){return {children:[],textContent:'',disabled:false,style:{setProperty(){}},classList:{toggle(){}},setAttribute(){},append(...children){this.children.push(...children);}};}
const ui=new Map();shop.document.getElementById=id=>{if(!ui.has(id))ui.set(id,element());return ui.get(id);};shop.document.createElement=element;
vm.runInContext(await load('shop.js'),shop.context);
const frostButton=vm.runInContext("shopCards.get('frost').button",shop.context);
await frostButton.onclick();assert.equal(shop.api.read().screen,'frost');
vm.runInContext('renderShop()',shop.context);
assert.equal(vm.runInContext("shopCards.get('frost').button",shop.context),frostButton);
await vm.runInContext("shopCards.get('original').button.onclick()",shop.context);
assert.equal(shop.api.read().screen,'original');assert.equal(ui.get('active-screen').textContent,'Original');
assert.equal(shop.api.read().balance,remaining);
// Actual Tetris lock: completing a row earns tokens; moving/dropping alone does not.
const t=browser();vm.runInContext(await load('games/tetris/tetris.js'),t.context);
vm.runInContext("start();action('drop');",t.context);await t.api.settled();assert.equal(t.api.read().balance,0);
vm.runInContext("start();board[19]=Array(10).fill(1);board[19][0]=0;piece={type:0,matrix:[[1]],x:0,y:19};lock();",t.context);await t.api.settled();assert.equal(t.api.read().balance,8);
vm.runInContext('start();',t.context);await t.api.settled();assert.equal(t.api.read().balance,8);
// Actual Pong match: seven human points and a single victory bonus.
const p=browser();vm.runInContext(await load('games/pong/pong.js'),p.context);vm.runInContext('start();for(let i=0;i<7;i++)point(true);point(true);',p.context);await p.api.settled();assert.equal(p.api.read().balance,31);
vm.runInContext('start();point(false);pause();',p.context);await p.api.settled();assert.equal(p.api.read().balance,31);
// Run Snake's actual movement function with a food pickup, empty move, and wall collision.
const snake=await load('games/hemdani-snake/index.html');const tick=snake.slice(snake.indexOf('  function tick() {'),snake.indexOf('  // Orientation changes'));
const s=browser();vm.runInContext(`let state='running',queue=[],direction={x:1,y:0},snake=[{x:1,y:1}],food={x:2,y:1},COLS=10,ROWS=10,score=0,impact=null,flash=0,bitePulse=0,reduced=true;function saveRecord(){}function updateHUD(){}function popScore(){}function pickupSound(){}function burst(){}function celebrateRecord(){}function spawnFood(){food={x:8,y:8};}function end(){state='over';}${tick}tick();tick();`,s.context);await s.api.settled();assert.equal(s.api.read().balance,2);
vm.runInContext("snake=[{x:9,y:1}];tick();tick();",s.context);await s.api.settled();assert.equal(s.api.read().balance,2);
// Validate local page resources, including GitHub Pages relative paths.
for(const file of ['index.html','play.html','shop.html','games/tetris/index.html','games/pong/index.html','games/hemdani-snake/index.html']){const html=await load(file);for(const m of html.matchAll(/(?:src|href)="([^"]+)"/g)){const ref=m[1].split(/[?#]/)[0];if(ref&&!ref.includes(':'))await fs.access(new URL(ref,new URL(file,root)));}}
for(const file of ['economy.js','shop.js','player.js','games/tetris/tetris.js','games/pong/pong.js'])new vm.Script(await load(file));
console.log('PASS: earning hooks in all 3 games, persistence, affordability, duplicate purchases, equip/reset, unavailable storage, invalid data, links, and syntax.');
