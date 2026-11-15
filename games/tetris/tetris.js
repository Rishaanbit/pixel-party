'use strict';
const canvas=document.getElementById('board'),ctx=canvas.getContext('2d');
const shapes=[[[1,1,1,1]],[[1,1],[1,1]],[[0,1,0],[1,1,1]],[[0,1,1],[1,1,0]],[[1,1,0],[0,1,1]],[[1,0,0],[1,1,1]],[[0,0,1],[1,1,1]]];
const colors=['#9ddce5','#edcf79','#aaa2ff','#b6f36d','#eb9ac2','#8faafa','#efa773'],names=['I — LINE','O — SQUARE','T — TEE','S — ZIG','Z — ZAG','J — HOOK','L — CORNER'];
let board,piece,next,bag=[],score=0,lines=0,best=0,state='ready',last=0,elapsed=0;
try{best=Number(localStorage.getItem('pixel-party-tetris-best'))||0}catch{}
document.getElementById('best').textContent=best;
const $=id=>document.getElementById(id);
function take(){if(!bag.length){bag=[0,1,2,3,4,5,6];for(let i=6;i>0;i--){const j=Math.floor(Math.random()*(i+1));[bag[i],bag[j]]=[bag[j],bag[i]]}}return bag.pop()}
function collision(p=piece,dx=0,dy=0,m=p.matrix){return m.some((row,y)=>row.some((v,x)=>v&&(p.x+x+dx<0||p.x+x+dx>=10||p.y+y+dy>=20||(p.y+y+dy>=0&&board[p.y+y+dy][p.x+x+dx]))))}
function spawn(){const type=next;next=take();piece={type,matrix:shapes[type].map(r=>r.slice()),x:3,y:0};$('next').textContent=names[next];if(collision())finish()}
function updateHUD(){$('score').textContent=score;$('lines').textContent=lines;$('level').textContent=1+Math.floor(lines/10);if(score>best){best=score;$('best').textContent=best;try{localStorage.setItem('pixel-party-tetris-best',String(best))}catch{}}}
function start(){window.PixelParty?.beginRound();board=Array.from({length:20},()=>Array(10).fill(0));bag=[];score=0;lines=0;next=take();state='playing';elapsed=0;last=performance.now();spawn();updateHUD();$('overlay').hidden=true;$('pause').disabled=false;$('pause').textContent='PAUSE';draw()}
function show(title,copy,label){$('overlay-title').textContent=title;$('overlay-copy').textContent=copy;$('start').textContent=label;$('overlay').hidden=false}
function finish(){state='over';$('pause').disabled=true;show('Game over',`${score} points · ${lines} cleared rows.`,'RESTART')}
function pause(){if(state==='playing'){state='paused';show('Paused','','RESUME');$('pause').textContent='RESUME'}else if(state==='paused'){state='playing';last=performance.now();$('overlay').hidden=true;$('pause').textContent='PAUSE'}}
function lock(){piece.matrix.forEach((row,y)=>row.forEach((v,x)=>{if(v)board[piece.y+y][piece.x+x]=piece.type+1}));let cleared=0;board=board.filter(row=>{if(row.every(Boolean)){cleared++;return false}return true});while(board.length<20)board.unshift(Array(10).fill(0));score+=[0,100,300,500,800][cleared]*(1+Math.floor(lines/10));lines+=cleared;if(cleared)window.PixelParty?.award(cleared*8);updateHUD();spawn();elapsed=0}
function down(manual=false){if(!collision(piece,0,1)){piece.y++;if(manual){score++;updateHUD()}}else lock();elapsed=0}
function rotate(){const m=piece.matrix[0].map((_,i)=>piece.matrix.map(r=>r[i]).reverse());for(const offset of [0,-1,1,-2,2])if(!collision(piece,offset,0,m)){piece.matrix=m;piece.x+=offset;return}}
function action(a){if(state!=='playing')return;if(a==='left'&&!collision(piece,-1))piece.x--;if(a==='right'&&!collision(piece,1))piece.x++;if(a==='rotate')rotate();if(a==='down')down(true);if(a==='drop'){while(!collision(piece,0,1)){piece.y++;score+=2}lock()}draw()}
function cell(x,y,color,ghost=false){ctx.fillStyle=color;if(ghost){ctx.globalAlpha=.25;ctx.strokeStyle=color;ctx.strokeRect(x*24+2,y*24+2,20,20);ctx.globalAlpha=1;return}ctx.fillRect(x*24+1,y*24+1,22,22);ctx.fillStyle='#ffffff30';ctx.fillRect(x*24+3,y*24+3,18,3)}
function draw(){ctx.fillStyle='#141720';ctx.fillRect(0,0,240,480);ctx.strokeStyle='#b6adce10';for(let x=0;x<=10;x++){ctx.beginPath();ctx.moveTo(x*24,0);ctx.lineTo(x*24,480);ctx.stroke()}for(let y=0;y<=20;y++){ctx.beginPath();ctx.moveTo(0,y*24);ctx.lineTo(240,y*24);ctx.stroke()}if(!board)return;board.forEach((r,y)=>r.forEach((v,x)=>{if(v)cell(x,y,colors[v-1])}));if(piece){let ghost={...piece};while(!collision(ghost,0,1))ghost.y++;piece.matrix.forEach((r,y)=>r.forEach((v,x)=>{if(v){cell(ghost.x+x,ghost.y+y,colors[piece.type],true);cell(piece.x+x,piece.y+y,colors[piece.type])}}))}}
function loop(time){if(state==='playing'){elapsed+=Math.min(time-last,100);if(elapsed>=Math.max(90,750-Math.floor(lines/10)*65)){down();draw()}}last=time;requestAnimationFrame(loop)}
$('start').onclick=()=>state==='paused'?pause():start();$('restart').onclick=start;$('pause').onclick=pause;
document.addEventListener('keydown',e=>{const map={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'rotate',ArrowDown:'down',' ':'drop'};if(map[e.key]){e.preventDefault();if(!e.repeat||!['drop','rotate'].includes(map[e.key]))action(map[e.key])}if(['p','P','Escape'].includes(e.key)){e.preventDefault();if(!e.repeat)pause()}});
document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>action(b.dataset.action));
window.addEventListener('blur',()=>{if(state==='playing')pause()});document.addEventListener('visibilitychange',()=>{if(document.hidden&&state==='playing')pause()});draw();requestAnimationFrame(loop);
