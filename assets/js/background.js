/* v7 · видео-подложка: выбор кодека, скорость 0.5×, параллакс за мышью (≤12px, scale 1.06),
   пауза в скрытой вкладке, постер при reduced-motion / экономии трафика / медленной сети,
   состояния под томами (blur 9px + сталь 12%; открытый том — видео приглушено до 30%). */
(function(){
'use strict';
var D=document,W=window,R=D.documentElement,box=D.getElementById('vbg');if(!box)return;
var media=box.querySelector('.vbg-media'),RM=R.classList.contains('rm')||!!(W.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
var con=navigator.connection||{},slow=!!(con.saveData||/(^|-)2g$/.test(con.effectiveType||''));
var dim=1,state='';
function apply(){var pp,bl,st;
  if(state==='open'){bl=9;st=.12;pp=.7;}          /* видео видно на 30% */
  else if(state==='tome'){bl=9;st=.12;pp=.5;}
  else {bl=2.5;st=0;pp=.55+(1-dim)*.55;}
  box.style.setProperty('--bl',bl+'px');box.style.setProperty('--st',st);box.style.setProperty('--pp',pp.toFixed(3));}
W.__bgDim=function(v){v=+v;if(!(v>=0))v=0;dim=Math.min(1,v);apply();};
apply();
/* состояние под томами */
var tomes=[].slice.call(D.querySelectorAll('.tome'));
function tomeState(){var h=innerHeight,s='';tomes.forEach(function(t){var r=t.getBoundingClientRect();if(r.top<h*.55&&r.bottom>h*.45){var v=t.querySelector('.vA');s=(v&&v.classList.contains('open'))?'open':'tome';}});
  if(s!==state){state=s;apply();}}
if(tomes.length){W.addEventListener('scroll',tomeState,{passive:true});setInterval(tomeState,400);}
/* видео */
if(RM||slow)return;
var VIDEO={'vbg-webm':'assets/video/bg.webm','vbg-mp4':'assets/video/bg.mp4','vbg-mp4s':'assets/video/bg-small.mp4'};
function b64(id){return VIDEO[id]||'';}
var v=D.createElement('video');v.muted=true;v.defaultMuted=true;v.loop=true;v.playsInline=true;v.setAttribute('playsinline','');v.setAttribute('muted','');v.preload='auto';v.setAttribute('aria-hidden','true');
var src='',type='';
if(v.canPlayType('video/webm; codecs="vp9"')){src=b64('vbg-webm');type='video/webm';}
if(!src&&v.canPlayType('video/mp4; codecs="avc1.4D401F"')){src=b64(innerWidth<=700?'vbg-mp4s':'vbg-mp4');type='video/mp4';}
if(!src)return;
var so=D.createElement('source');so.src=src;so.type=type;v.appendChild(so);
media.appendChild(v);
function rate(){try{v.playbackRate=.5;}catch(e){}}
v.addEventListener('loadedmetadata',rate);v.addEventListener('play',rate);
v.addEventListener('playing',function(){box.classList.add('playing');});
function tryPlay(){var p=v.play();if(p&&p.catch)p.catch(function(){});}
tryPlay();
D.addEventListener('visibilitychange',function(){if(D.hidden)v.pause();else tryPlay();});
/* параллакс за мышью */
var tx=0,ty=0,x=0,y=0,raf=0;
function step(){x+=(tx-x)*.06;y+=(ty-y)*.06;media.style.setProperty('--px',x.toFixed(2)+'px');media.style.setProperty('--py',y.toFixed(2)+'px');
  raf=(Math.abs(tx-x)>.05||Math.abs(ty-y)>.05)?requestAnimationFrame(step):0;}
W.addEventListener('pointermove',function(e){if(e.pointerType!=='mouse')return;tx=-(e.clientX/innerWidth-.5)*24;ty=-(e.clientY/innerHeight-.5)*24;if(!raf)raf=requestAnimationFrame(step);},{passive:true});
})();
