'use strict';
const catalog = {snake:{name:'Snake',path:'games/hemdani-snake/index.html'},tetris:{name:'Tetris',path:'games/tetris/index.html'},pong:{name:'Pong',path:'games/pong/index.html'}};
const gameKey = new URLSearchParams(location.search).get('game');
const selected = Object.prototype.hasOwnProperty.call(catalog, gameKey) ? catalog[gameKey] : null;
if(selected){document.body.classList.toggle('snake-player', gameKey === 'snake');document.title=selected.name+' — Pixel Party';document.getElementById('game-title').textContent=selected.name.toUpperCase();const frame=document.getElementById('game');frame.title=selected.name+' game';frame.src=selected.path;frame.hidden=false;document.getElementById('hint').textContent='Click or tap the game to focus controls. Your game pauses when you switch away.';}
else document.getElementById('game').remove();
