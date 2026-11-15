'use strict';
// Keep buttons mounted so wallet updates cannot swallow clicks or keyboard focus.
const shopCards=new Map();
const pendingItems=new Set();
function buildShop(){
  for(const item of PixelParty.items){
    const card=document.createElement('article');card.className='shop-card';
    const preview=document.createElement('div');preview.className='item-preview '+item.kind;
    preview.style.setProperty('--sample-bg',item.colors[0]);preview.style.setProperty('--sample-accent',item.colors[1]);
    preview.setAttribute('aria-hidden','true');preview.innerHTML='<span>▦</span><span>◈</span><span>▰</span>';
    const name=document.createElement('h3');name.textContent=item.name;
    const desc=document.createElement('p');desc.textContent=item.description;
    const button=document.createElement('button');button.type='button';
    const note=document.createElement('small');
    button.onclick=async()=>{
      if(pendingItems.has(item.id))return;
      pendingItems.add(item.id);renderShop();
      try{const result=await PixelParty.choose(item.id);document.getElementById('shop-status').textContent=result.ok?(item.kind==='theme'?'Site theme':'Game colors')+' set to '+item.name+'.':result.message;}
      catch{document.getElementById('shop-status').textContent='Could not equip the item. Please try again.';}
      finally{pendingItems.delete(item.id);renderShop();}
    };
    card.append(preview,name,desc,button,note);
    document.getElementById(item.kind+'-items').append(card);
    shopCards.set(item.id,{card,button,note});
  }
}
function renderShop(){
  const s=PixelParty.read();
  for(const item of PixelParty.items){
    const view=shopCards.get(item.id);if(!view)continue;
    const owned=s.owned.includes(item.id),equipped=s[item.kind]===item.id,pending=pendingItems.has(item.id);
    view.button.textContent=pending?'APPLYING…':equipped?(item.kind==='theme'?'ACTIVE THEME':'ACTIVE GAME COLORS'):owned?'EQUIP':`BUY · ${item.price} TOKENS`;
    view.button.disabled=pending||(!owned&&s.balance<item.price);
    view.button.setAttribute('aria-label',view.button.textContent+' '+item.name);
    view.button.setAttribute('aria-pressed',String(equipped));
    view.card.classList.toggle('is-equipped',equipped);
    const needed=item.price-s.balance;
    view.note.textContent=equipped?(item.kind==='theme'?'Your current site theme':'Your current game colors'):owned?'Owned — switch for free':needed>0?`${needed} more ${needed===1?'token':'tokens'} needed`:'Buy once. Keep in this browser.';
  }
  for(const kind of ['theme','screen'])document.getElementById('active-'+kind).textContent=PixelParty.items.find(i=>i.id===s[kind]).name;
}
buildShop();window.addEventListener('walletchange',renderShop);renderShop();

// Tabs only change what is shown; they never equip items or spend tokens.
const categoryTabs=Array.from(document.querySelectorAll('.shop-tabs [role="tab"]'));
function selectCategory(tab,focus=false){
  for(const current of categoryTabs){
    const selected=current===tab;
    current.setAttribute('aria-selected',String(selected));
    current.tabIndex=selected?0:-1;
    document.getElementById(current.getAttribute('aria-controls')).hidden=!selected;
  }
  document.getElementById('shop-status').textContent='';
  if(focus)tab.focus();
}
categoryTabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>selectCategory(tab));
  tab.addEventListener('keydown',event=>{
    let next;
    if(event.key==='ArrowRight')next=(index+1)%categoryTabs.length;
    if(event.key==='ArrowLeft')next=(index+categoryTabs.length-1)%categoryTabs.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=categoryTabs.length-1;
    if(next!==undefined){event.preventDefault();selectCategory(categoryTabs[next],true);}
  });
});
