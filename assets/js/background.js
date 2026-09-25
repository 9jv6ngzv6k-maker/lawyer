/* v9 · видео-подложка: выбор кодека, скорость 0.5×, параллакс за мышью (≤12px, scale 1.06),
   пауза в скрытой вкладке, постер при reduced-motion / экономии трафика / медленной сети.
   Ниже первого экрана фон одного спокойного состояния: бумажная вуаль 0.88, blur 6px, без стали
   (состояния «под томом» и «открытый том» убраны — фон больше не «дышит» между разделами).
   Телефон (≤700px): только bg-small.mp4 и только пока виден первый экран (#top); дальше — неподвижный постер. */
(function(){
'use strict';
var D=document,W=window,R=D.documentElement,box=D.getElementById('vbg');if(!box)return;
var media=box.querySelector('.vbg-media'),RM=R.classList.contains('rm')||!!(W.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches);
var con=navigator.connection||{},slow=!!(con.saveData||/(^|-)2g$/.test(con.effectiveType||''));
/* первый экран: вуаль .55 / blur 2.5px; первый экран ушёл: .88 / 6px — плавно, по тому же dim (1 → .78), что и раньше */
var TOP={pp:.55,bl:2.5},BELOW={pp:.88,bl:6},dim=1;
function apply(){var k=Math.min(1,Math.max(0,(1-dim)/.22));
  box.style.setProperty('--bl',(TOP.bl+(BELOW.bl-TOP.bl)*k).toFixed(2)+'px');
  box.style.setProperty('--st','0');
  box.style.setProperty('--pp',(TOP.pp+(BELOW.pp-TOP.pp)*k).toFixed(3));}
W.__bgDim=function(v){v=+v;if(!(v>=0))v=0;dim=Math.min(1,v);apply();};
apply();
if(RM||slow)return;
var PHONE=!!(W.matchMedia&&matchMedia('(max-width:700px)').matches);
var hero=D.getElementById('top');
/* телефон: видео живёт только пока виден первый экран */
var heroSeen=!PHONE, heroIn=!PHONE, loaded=false, v=null;
/* открыто по якорю ниже первого экрана (/#reestr): первый экран «не показан», пока человек сам не вернётся наверх */
var h=location.hash.slice(1),tgt=h&&h!=='top'&&D.getElementById(h),deep=!!(PHONE&&tgt&&hero&&tgt.compareDocumentPosition(hero)&Node.DOCUMENT_POSITION_PRECEDING&&!hero.contains(tgt));
var jumped=false;
function allowed(){return heroIn&&heroSeen&&!D.hidden;}
var failed=false;
function tryPlay(){if(!v||failed)return;var p=v.play();if(p&&p.catch)p.catch(function(){});}
function sync(){
  if(allowed()){if(!v){if(loaded)startVideo();}else tryPlay();}
  else if(v){v.pause();box.classList.remove('playing');}}
if(PHONE&&hero&&'IntersectionObserver' in W){
  new IntersectionObserver(function(es){var e=es[es.length-1];heroIn=e.isIntersecting;
    if(heroIn&&(!deep||jumped))heroSeen=true;
    if(!heroIn)jumped=true;
    sync();},{threshold:0}).observe(hero);
}else if(PHONE){heroIn=heroSeen=!deep;}
var VIDEO={webm:'assets/video/bg.webm',mp4:'assets/video/bg.mp4',small:'assets/video/bg-small.mp4'};
function startVideo(){if(v)return;
  var el=D.createElement('video');el.muted=true;el.defaultMuted=true;el.loop=true;el.playsInline=true;el.setAttribute('playsinline','');el.setAttribute('muted','');el.preload='auto';el.setAttribute('aria-hidden','true');
  var src='',type='';
  if(PHONE){ if(el.canPlayType('video/mp4')){src=VIDEO.small;type='video/mp4';} }
  else{
    if(el.canPlayType('video/webm; codecs="vp9"')){src=VIDEO.webm;type='video/webm';}
    else if(el.canPlayType('video/mp4; codecs="avc1.4D401F"')){src=VIDEO.mp4;type='video/mp4';}
  }
  if(!src)return;
  v=el;
  var so=D.createElement('source');so.src=src;so.type=type;v.appendChild(so);
  /* браузер не смог декодировать — остаётся постер, видео стоит на паузе */
  function fail(){failed=true;box.classList.remove('playing');try{v.pause();}catch(e){}}
  so.addEventListener('error',fail);v.addEventListener('error',fail);
  media.appendChild(v);
  function rate(){try{v.playbackRate=.5;}catch(e){}}
  v.addEventListener('loadedmetadata',rate);v.addEventListener('play',rate);
  v.addEventListener('playing',function(){if(allowed())box.classList.add('playing');else v.pause();});
  if(allowed())tryPlay();
}
D.addEventListener('visibilitychange',sync);
/* видео — после события load и простоя главного потока: не конкурирует с шрифтами, постером и скриптами первого экрана */
function whenIdle(){loaded=true;var go=function(){if(allowed())startVideo();};if(W.requestIdleCallback)requestIdleCallback(go,{timeout:2000});else setTimeout(go,200);}
if(D.readyState==='complete')whenIdle();else W.addEventListener('load',whenIdle,{once:true});
/* параллакс за мышью */
var tx=0,ty=0,x=0,y=0,raf=0;
function step(){x+=(tx-x)*.06;y+=(ty-y)*.06;media.style.setProperty('--px',x.toFixed(2)+'px');media.style.setProperty('--py',y.toFixed(2)+'px');
  raf=(Math.abs(tx-x)>.05||Math.abs(ty-y)>.05)?requestAnimationFrame(step):0;}
W.addEventListener('pointermove',function(e){if(e.pointerType!=='mouse')return;tx=-(e.clientX/innerWidth-.5)*24;ty=-(e.clientY/innerHeight-.5)*24;if(!raf)raf=requestAnimationFrame(step);},{passive:true});
})();
