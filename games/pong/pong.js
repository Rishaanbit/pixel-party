'use strict';
const $=id=>document.getElementById(id),canvas=$('board'),ctx=canvas.getContext('2d');
const H=380,W=680,PH=76,keys=new Set();let state='ready',player=152,cpu=152,ball={x:340,y:190,vx:290,vy:90},you=0,computer=0,last=0,serveWait=0;
function serve(direction){ball={x:W/2,y:H/2,vx:direction*290,vy:(Math.random()>.5?1:-1)*(80+Math.random()*80)};serveWait=.8}
function start(){window.PixelParty?.beginRound();you=0;computer=0;player=cpu=152;keys.clear();state='playing';serve(Math.random()>.5?1:-1);$('you').textContent=0;$('cpu').textContent=0;$('status').textContent='FIRST TO 7';$('overlay').hidden=true;$('pause').disabled=false;$('pause').textContent='PAUSE';last=performance.now()}
function show(title,copy,label){$('overlay-title').textContent=title;$('overlay-copy').textContent=copy;$('start').textContent=label;$('overlay').hidden=false}
function pause(){keys.clear();if(state==='playing'){state='paused';show('Paused','','RESUME');$('pause').textContent='RESUME'}else if(state==='paused'){state='playing';last=performance.now();$('overlay').hidden=true;$('pause').textContent='PAUSE'}}
function point(human){if(state!=='playing')return;if(human){you++;window.PixelParty?.award(3+(you===7?10:0));}else computer++;$('you').textContent=you;$('cpu').textContent=computer;$('status').textContent=human?'POINT TO YOU!':'POINT TO COMPUTER';if(you===7||computer===7){state='over';$('pause').disabled=true;show(you===7?'You win':'Computer wins',`${you} – ${computer}`,'RESTART')}else serve(human?-1:1)}
function bounce(paddle,direction){const hit=(ball.y-(paddle+PH/2))/(PH/2),speed=Math.min(650,Math.hypot(ball.vx,ball.vy)+24),angle=hit*Math.PI/3;ball.vx=direction*speed*Math.cos(angle);ball.vy=speed*Math.sin(angle)}
function tick(dt){const movement=(keys.has('down')?1:0)-(keys.has('up')?1:0);player=Math.max(0,Math.min(H-PH,player+movement*390*dt));const target=ball.vx>0?ball.y-PH/2:H/2-PH/2;cpu+=Math.max(-225*dt,Math.min(225*dt,target-cpu));cpu=Math.max(0,Math.min(H-PH,cpu));if(serveWait>0){serveWait-=dt;return}ball.x+=ball.vx*dt;ball.y+=ball.vy*dt;if(ball.y<7){ball.y=7;ball.vy=Math.abs(ball.vy)}if(ball.y>H-7){ball.y=H-7;ball.vy=-Math.abs(ball.vy)}if(ball.vx<0&&ball.x-7<=38&&ball.x>=24&&ball.y+7>=player&&ball.y-7<=player+PH){ball.x=45;bounce(player,1)}if(ball.vx>0&&ball.x+7>=W-38&&ball.x<=W-24&&ball.y+7>=cpu&&ball.y-7<=cpu+PH){ball.x=W-45;bounce(cpu,-1)}if(ball.x<-10)point(false);else if(ball.x>W+10)point(true)}
const motionPreference=matchMedia('(prefers-reduced-motion: reduce)');
let renderScale=0;
function paddleArt(x,y,color){
  ctx.shadowColor=color;ctx.shadowBlur=12;
  ctx.fillStyle=color;ctx.fillRect(x,y,12,PH);
  ctx.shadowBlur=0;
  ctx.fillStyle='#ffffff80';ctx.fillRect(x+2,y+2,2,PH-4);
  ctx.fillStyle='#ffffff55';ctx.fillRect(x+2,y+2,8,2);
  ctx.fillStyle='#10101955';ctx.fillRect(x+8,y+4,3,PH-6);
  ctx.fillStyle='#10101944';
  for(let i=0;i<3;i++)ctx.fillRect(x+5,y+PH/2-7+i*6,3,2);
}
function draw(){
  const scale=Math.min(window.devicePixelRatio||1,2);
  if(scale!==renderScale){canvas.width=W*scale;canvas.height=H*scale;renderScale=scale;}
  ctx.setTransform(scale,0,0,scale,0,0);
  ctx.shadowBlur=0;ctx.globalAlpha=1;
  const floor=ctx.createLinearGradient(0,0,W,H);
  floor.addColorStop(0,'#17241f');floor.addColorStop(.5,'#141720');floor.addColorStop(1,'#221d32');
  ctx.fillStyle=floor;ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#b6adce0a';ctx.lineWidth=1;ctx.beginPath();
  for(let x=20;x<W;x+=20){ctx.moveTo(x,0);ctx.lineTo(x,H);}
  for(let y=20;y<H;y+=20){ctx.moveTo(0,y);ctx.lineTo(W,y);}
  ctx.stroke();
  ctx.strokeStyle='#c1b7db25';ctx.setLineDash([5,10]);
  ctx.beginPath();ctx.moveTo(W/2,0);ctx.lineTo(W/2,H);ctx.stroke();ctx.setLineDash([]);
  ctx.strokeStyle='#c1b7db17';ctx.beginPath();ctx.arc(W/2,H/2,48,0,Math.PI*2);ctx.stroke();
  ctx.fillStyle='#d8cfeb35';ctx.fillRect(W/2-2,H/2-2,4,4);
  ctx.fillStyle='#c5f58155';ctx.fillRect(0,0,W/2,2);ctx.fillRect(0,H-2,W/2,2);
  ctx.fillStyle='#c1a3fa55';ctx.fillRect(W/2,0,W/2,2);ctx.fillRect(W/2,H-2,W/2,2);
  for(const x of [10,W-10]){ctx.strokeStyle=x<W/2?'#c5f58155':'#c1a3fa55';ctx.beginPath();ctx.moveTo(x,25);ctx.lineTo(x,10);ctx.lineTo(x+(x<W/2?15:-15),10);ctx.moveTo(x,H-25);ctx.lineTo(x,H-10);ctx.lineTo(x+(x<W/2?15:-15),H-10);ctx.stroke();}
  paddleArt(26,player,'#c5f581');paddleArt(W-38,cpu,'#c1a3fa');
  if(!motionPreference.matches&&state==='playing'&&serveWait<=0){
    const speed=Math.hypot(ball.vx,ball.vy);
    for(let i=4;i>0;i--){const size=14-i*2;ctx.globalAlpha=(5-i)*.035;ctx.fillStyle='#f4d692';ctx.fillRect(ball.x-ball.vx/speed*i*7-size/2,ball.y-ball.vy/speed*i*7-size/2,size,size);}
    ctx.globalAlpha=1;
  }
  ctx.shadowColor='#f4d692';ctx.shadowBlur=14;ctx.fillStyle='#f4d692';
  ctx.fillRect(ball.x-7,ball.y-7,14,14);ctx.shadowBlur=0;
  ctx.fillStyle='#fff6da';ctx.fillRect(ball.x-5,ball.y-5,8,8);
}

function loop(time){const dt=Math.min((time-last)/1000,.025);last=time;if(state==='playing')tick(dt);draw();requestAnimationFrame(loop)}
$('start').onclick=()=>state==='paused'?pause():start();$('restart').onclick=start;$('pause').onclick=pause;
const keyMap={ArrowUp:'up',w:'up',W:'up',ArrowDown:'down',s:'down',S:'down'};
document.addEventListener('keydown',e=>{if(keyMap[e.key]){e.preventDefault();keys.add(keyMap[e.key])}if(['p','P','Escape'].includes(e.key)){e.preventDefault();if(!e.repeat)pause()}});document.addEventListener('keyup',e=>{if(keyMap[e.key]){e.preventDefault();keys.delete(keyMap[e.key])}});
for(const name of ['up','down']){const b=$(name);b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);keys.add(name)});for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>keys.delete(name))}
function pointer(e){if(state!=='playing')return;const rect=canvas.getBoundingClientRect();player=Math.max(0,Math.min(H-PH,(e.clientY-rect.top)*H/rect.height-PH/2))}
canvas.addEventListener('pointermove',pointer);canvas.addEventListener('pointerdown',e=>{canvas.setPointerCapture(e.pointerId);pointer(e)});
window.addEventListener('blur',()=>{if(state==='playing')pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause()});requestAnimationFrame(loop);
