(function(){
'use strict';
var D=document, R=D.documentElement, W=window;
var RM=R.classList.contains('rm');
var FINE=!!(W.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches);
var S=W.SITE||{cats:[],dirs:[],prep:[],prepAll:[],cases:{}};
var $=function(s,c){return (c||D).querySelector(s)}, $$=function(s,c){return Array.prototype.slice.call((c||D).querySelectorAll(s))};
var hasWA=typeof Element!=='undefined'&&!!Element.prototype.animate;
var EASE='cubic-bezier(.16,1,.3,1)';
var vw=innerWidth, vh=innerHeight;
function A(el,kf,o){ if(!el||!hasWA||RM) return null; o=o||{}; if(!o.fill) o.fill='backwards'; if(!o.easing) o.easing=EASE; return el.animate(kf,o); }
function clamp(v,a,b){return v<a?a:v>b?b:v}
function f2(n){return Math.round(n*100)/100}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function plural(n,a,b,c){n=Math.abs(n)%100;var m=n%10;if(n>10&&n<20)return c;if(m>1&&m<5)return b;if(m===1)return a;return c}
function fmtDate(d){function p(x){return (x<10?'0':'')+x}return p(d.getDate())+'.'+p(d.getMonth()+1)+'.'+d.getFullYear()}
function jumpTo(y){var p=R.style.scrollBehavior;R.style.scrollBehavior='auto';W.scrollTo(0,y);R.style.scrollBehavior=p;}
function jumpBy(d){jumpTo(W.pageYOffset+d);}
function scrollPad(){return parseFloat(getComputedStyle(R).scrollPaddingTop)||110;}
/* v9 · Q4: позиция по раскладке (offsetTop), а не по getBoundingClientRect: лист .rv-sheet до появления сдвинут transform'ом,
   и первый переход вставал ниже повторного */
function docTop(el){var y=0;while(el){y+=el.offsetTop;el=el.offsetParent;}return y;}
function scrollToEl(el,smooth){ if(!el) return; var y=docTop(el)-scrollPad();
  W.scrollTo({top:Math.max(0,y),behavior:(smooth&&!RM)?'smooth':'auto'}); }

/* ═════════════ ПЕРВЫЙ ЭКРАН (хореография «Досье») ═════════════ */
var stage=$('#stage'), tilt=$('#tilt'), shake=$('#shake'), box=$('.stage-box');
function fit(){ if(!box||!stage) return; var w=box.clientWidth, h=box.clientHeight; if(!w||!h) return; stage.style.zoom=Math.min(w/640,h/800,1.18); }
function offs(el,root){var x=0,y=0;while(el&&el!==root){x+=el.offsetLeft;y+=el.offsetTop;el=el.offsetParent;}return {x:x,y:y};}
function layoutNote(){
  var paper=$('#sA .paper'), para=$('#paraA'), tgt=$('#tgt'), note=$('#note'), svg=$('#noteArrow'), p=$('#mA');
  if(!paper||!para||!tgt) return;
  var pp=offs(para,paper), t=offs(tgt,paper), ny=pp.y+para.offsetHeight+30;
  note.style.top=ny+'px';
  var sx=66, sy=ny-13, ex=t.x+tgt.offsetWidth*0.22, ey=t.y+tgt.offsetHeight+8;
  svg.setAttribute('width',paper.offsetWidth); svg.setAttribute('height',paper.offsetHeight);
  var cx=ex-34, cy=sy-3, d='M'+sx+','+sy+' Q'+cx+','+cy+' '+ex+','+ey;
  var ang=Math.atan2(ey-cy,ex-cx), L=8, a1=ang+Math.PI*0.8, a2=ang-Math.PI*0.8;
  d+=' M'+(ex+L*Math.cos(a1)).toFixed(1)+','+(ey+L*Math.sin(a1)).toFixed(1)+' L'+ex+','+ey+' L'+(ex+L*Math.cos(a2)).toFixed(1)+','+(ey+L*Math.sin(a2)).toFixed(1);
  p.setAttribute('d',d);
}
var noteChars=[];
$$('#note .nl').forEach(function(l){var t=l.textContent;l.textContent='';for(var i=0;i<t.length;i++){var c=D.createElement('span');c.className='c';c.textContent=t[i]===' '?' ':t[i];l.appendChild(c);noteChars.push(c);}});
var heroNums=$$('.fact .num[data-to]');
function countTo(el,to,delay,dur,suffix){
  suffix=suffix||'';
  if(RM){el.textContent=to.toLocaleString('ru-RU')+suffix;return;}
  var from=Math.max(1,Math.round(to*0.08));
  el.textContent=from.toLocaleString('ru-RU')+suffix;
  setTimeout(function(){var t0=performance.now();
    (function step(t){var k=Math.min(1,(t-t0)/dur),e=1-Math.pow(1-k,4);el.textContent=Math.round(from+(to-from)*e).toLocaleString('ru-RU')+suffix;if(k<1)requestAnimationFrame(step);})(t0);
  },delay);
}
function intro(){
  A($('.hdr-line'),[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:1400,easing:'cubic-bezier(.65,0,.2,1)'});
  [$('.logo')].concat($$('.nav a'),[$('.hdr-in>.btn-sm'),$('.burger')]).forEach(function(el,i){A(el,[{opacity:0,transform:'translateY(-8px)'},{opacity:1,transform:'none'}],{duration:900,delay:80+i*55});});
  var ws=$$('.h1 .w'), lines=[], lastTop=null, strikeLine=0;
  ws.forEach(function(w){var top=w.offsetTop;if(lastTop===null||Math.abs(top-lastTop)>4){lines.push([]);lastTop=top;}lines[lines.length-1].push(w);});
  lines.forEach(function(ln,i){ln.forEach(function(w,j){if(w.parentNode.classList.contains('strike'))strikeLine=i;
    A(w.firstElementChild,[{transform:'translateY(112%) rotate(4deg)'},{transform:'none'}],{duration:1100,delay:180+i*120+j*35,easing:'cubic-bezier(.19,1,.22,1)'});});});
  var tStrike=180+strikeLine*120+620;
  A($('.strike path'),[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:520,delay:tStrike,easing:'cubic-bezier(.55,.05,.25,1)'});
  A($('.strike .w'),[{opacity:1},{opacity:.78}],{duration:500,delay:tStrike+260,easing:'ease-out'});
  A($('.meta'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:900,delay:240});
  /* v9: .lead — элемент LCP, виден с первого кадра; вход только сдвигом */
  A($('.lead'),[{transform:'translateY(14px)'},{transform:'none'}],{duration:1000,delay:640});
  $$('.cta-row>.mag').forEach(function(m,i){A(m,[{opacity:0,transform:'translateY(16px)'},{opacity:1,transform:'none'}],{duration:1000,delay:780+i*90});});
  A($('.sit-jump'),[{opacity:0},{opacity:1}],{duration:900,delay:1000});
  A($('.hterm'),[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:900,delay:960});
  $$('#cap li').forEach(function(li,i){A(li,[{opacity:0,transform:'translateX(-10px)'},{opacity:1,transform:'none'}],{duration:800,delay:1300+i*90});});
  A($('.facts-line'),[{transform:'scaleX(0)'},{transform:'scaleX(1)'}],{duration:1300,delay:900,easing:'cubic-bezier(.65,0,.2,1)'});
  $$('.fact').forEach(function(f,i){A(f,[{opacity:0,transform:'translateY(10px)'},{opacity:1,transform:'none'}],{duration:900,delay:1000+i*80});});
  var P='perspective(1300px) ';
  if(vw<=620){
    A($('.ms-a'),[{opacity:0,transform:'translate3d(40px,60px,0) rotate(-9deg) scale(1.06)'},{opacity:1,offset:.35},{opacity:1,transform:'rotate(-2deg)'}],{duration:1100,delay:250,easing:'cubic-bezier(.2,.9,.25,1)'});
    A($('#msU'),[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:480,delay:1050,easing:'cubic-bezier(.5,0,.3,1)'});
    A($('#msO'),[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:600,delay:1300,easing:'cubic-bezier(.45,0,.3,1)'});
    A($('#msNote'),[{opacity:0,transform:'rotate(-3deg) translate(-6px,4px)'},{opacity:1,transform:'rotate(-3deg)'}],{duration:600,delay:1650,easing:'ease-out'});
    A($('.ms-b'),[{opacity:0,transform:'translate3d(-10px,-120px,0) rotate(9deg) scale(1.08)'},{opacity:1,offset:.3},{opacity:1,transform:'rotate(2.2deg)'}],{duration:800,delay:1750,easing:'cubic-bezier(.22,.8,.28,1)'});
    A($('#msStamp'),[{opacity:0,transform:'scale(2.4) rotate(-12deg)',easing:'cubic-bezier(.6,0,.9,.35)'},{opacity:1,transform:'scale(.95) rotate(-6deg)',offset:.58,easing:'cubic-bezier(.2,.8,.25,1)'},{opacity:1,transform:'rotate(-6deg)'}],{duration:520,delay:2380});
    A($('.mstage'),[{transform:'none'},{transform:'translate(-3px,2px)',offset:.2},{transform:'translate(2px,-1px)',offset:.45},{transform:'none'}],{duration:380,delay:2680,easing:'linear'});
  }
  A($('#sA .enter'),[{opacity:0,transform:P+'translate3d(110px,90px,0) rotateX(30deg) rotateY(-24deg) rotateZ(-9deg) scale(1.06)'},{opacity:1,offset:.32},
    {opacity:1,transform:P+'translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0) scale(1)'}],{duration:1250,delay:380,easing:'cubic-bezier(.2,.9,.25,1)'});
  A($('#sA .shade'),[{opacity:1,transform:'translate(40px,70px) scale(1.04)'},{opacity:0,transform:'none'}],{duration:1400,delay:420});
  A($('#sM .enter'),[{opacity:0,transform:P+'translate3d(130px,100px,0) rotateX(28deg) rotateY(-20deg) rotateZ(-5deg) scale(1.05)'},{opacity:1,offset:.34},
    {opacity:1,transform:P+'translate3d(0,0,0) rotateX(0) rotateY(0) rotateZ(0) scale(1)'}],{duration:1250,delay:450,easing:'cubic-bezier(.2,.9,.25,1)'});
  A($('#mBrk'),[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:400,delay:1300,easing:'cubic-bezier(.5,0,.3,1)'});
  A($('#mU'),[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:480,delay:1480,easing:'cubic-bezier(.5,0,.3,1)'});
  A($('#mO'),[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:600,delay:1720,easing:'cubic-bezier(.45,0,.3,1)'});
  var tN=1950;
  noteChars.forEach(function(c,i){A(c,[{opacity:0,transform:'translate(-3px,2px)'},{opacity:1,transform:'none'}],{duration:240,delay:tN+i*22,easing:'ease-out'});});
  A($('#mA'),[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:380,delay:tN+noteChars.length*22-60,easing:'cubic-bezier(.5,0,.3,1)'});
  var tB=2150;
  A($('#sB .enter'),[{opacity:0,transform:P+'translate3d(-40px,-150px,0) rotateX(-8deg) rotateZ(9deg) scale(1.1)'},{opacity:1,offset:.3},
    {opacity:1,transform:P+'translate3d(0,0,0) rotateX(0) rotateZ(0) scale(1)'}],{duration:850,delay:tB,easing:'cubic-bezier(.22,.8,.28,1)'});
  A($('#sB .shade'),[{opacity:1,transform:'translate(50px,110px) scale(1.08)'},{opacity:0,transform:'none'}],{duration:900,delay:tB,easing:'cubic-bezier(.3,.7,.3,1)'});
  A($('#sA .nudge'),[{transform:'none'},{transform:'translate(-4px,3px) rotate(-.5deg)',offset:.3},{transform:'none'}],{duration:700,delay:tB+520,easing:'cubic-bezier(.3,.7,.3,1)'});
  A($('#sM .nudge'),[{transform:'none'},{transform:'translate(-2px,2px) rotate(-.3deg)',offset:.3},{transform:'none'}],{duration:700,delay:tB+540,easing:'cubic-bezier(.3,.7,.3,1)'});
  var tS=tB+640, hit=tS+300;
  A($('#stampIn'),[{opacity:0,transform:'scale(2.5) rotate(-9deg)',easing:'cubic-bezier(.6,0,.9,.35)'},{opacity:1,transform:'scale(.95) rotate(0)',offset:.58,easing:'cubic-bezier(.2,.8,.25,1)'},
    {transform:'scale(1.015)',offset:.76},{opacity:1,transform:'none'}],{duration:520,delay:tS});
  A($('#bloom'),[{opacity:0,transform:'scale(.8)'},{opacity:1,transform:'scale(1)',offset:.2},{opacity:0,transform:'scale(1.35)'}],{duration:900,delay:hit-10,easing:'ease-out'});
  A(shake,[{transform:'none'},{transform:'translate(-5px,3px) rotate(-.35deg)',offset:.14},{transform:'translate(4px,-2px) rotate(.28deg)',offset:.32},
    {transform:'translate(-2.5px,1.5px) rotate(-.14deg)',offset:.52},{transform:'translate(1px,-.5px)',offset:.74},{transform:'none'}],{duration:440,delay:hit,easing:'linear'});
  A($('#nudgeB'),[{transform:'none'},{transform:'scale(.986)',offset:.18},{transform:'none'}],{duration:500,delay:hit-20,easing:'cubic-bezier(.3,.7,.3,1)'});
  heroNums.forEach(function(n,i){n.style.minWidth=(String(n.getAttribute('data-to')).length*0.62)+'em';
    A(n,[{opacity:0,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:500,delay:1150+i*110});
    countTo(n,+n.getAttribute('data-to'),1150+i*110,1250);});
  return hit+900;
}

/* живое: наклон сцены за курсором, веер при прокрутке */
var mx=0,my=0,tx=0,ty=0,fp=0,tfp=0,t0=performance.now(),liveFrom=0;
var fanEls={A:$('#sA .fan'),M:$('#sM .fan'),B:$('#sB .fan')}, BASE={A:-2.4,M:-.9,B:2.6};
W.addEventListener('pointermove',function(e){if(e.pointerType!=='mouse')return;tx=(e.clientX/vw-.5)*2;ty=(e.clientY/vh-.5)*2;},{passive:true});
D.addEventListener('pointerleave',function(){tx=0;ty=0;});
function heroLoop(now){
  if(W.pageYOffset<vh*1.3&&fanEls.A){
    mx+=(tx-mx)*.07; my+=(ty-my)*.07; fp+=(tfp-fp)*.12;
    var t=(now-t0)/1000, idle=Math.min(1,Math.max(0,(now-liveFrom)/1200));
    var e=fp<.5?2*fp*fp:1-Math.pow(-2*fp+2,2)/2, br=Math.sin(t*.9)*idle, br2=Math.sin(t*.9+1.4)*idle;
    tilt.style.transform='rotateX('+f2(-my*4.2)+'deg) rotateY('+f2(mx*5.5)+'deg) translateY('+f2(e*60)+'px)';
    fanEls.A.style.transform='translate3d('+f2(-mx*7-e*70)+'px,'+f2(-my*5+e*30+br*2)+'px,0) rotate('+f2(BASE.A-e*8)+'deg)';
    fanEls.M.style.transform='translate3d('+f2(-mx*2+e*120)+'px,'+f2(-my*2-e*6+br2*1.5)+'px,0) rotate('+f2(BASE.M+e*2.4)+'deg)';
    fanEls.B.style.transform='translate3d('+f2(mx*10+e*70)+'px,'+f2(my*8-e*70-br*2.5)+'px,0) rotate('+f2(BASE.B+e*8)+'deg)';
  }
  requestAnimationFrame(heroLoop);
}

/* ═════════════ МАГНИТНЫЕ КНОПКИ ═════════════ */
function magnet(el,kx,ky,lim){
  el.addEventListener('pointermove',function(e){if(e.pointerType!=='mouse')return;var r=el.getBoundingClientRect();
    var dx=clamp((e.clientX-r.left-r.width/2)*kx,-lim,lim), dy=clamp((e.clientY-r.top-r.height/2)*ky,-lim*.8,lim*.8);
    el.style.transition='transform .25s cubic-bezier(.2,.8,.2,1)'; el.style.transform='translate3d('+f2(dx)+'px,'+f2(dy)+'px,0)';});
  el.addEventListener('pointerleave',function(){el.style.transition='transform .7s cubic-bezier(.2,1.4,.3,1)';el.style.transform='';});
}
if(FINE&&!RM){ $$('.mag').forEach(function(m){magnet(m,.12,.24,10)}); $$('.mag-s').forEach(function(m){magnet(m,.14,.26,9)}); }

/* ═════════════ ШАПКА, МЕНЮ, ФОН ═════════════ */
var hdr=$('#hdr'), mbar=$('#mbar'), form=$('#zayavka'), lastDim=-1;
function onScroll(){
  var y=W.pageYOffset;
  hdr.classList.toggle('scrolled',y>12);
  tfp=Math.max(0,Math.min(1,y/(vh*.6)));
  var v=1-.22*clamp(y/(vh*.9),0,1);
  /* крайние значения (1 — самый верх, .78 — первый экран ушёл) передаются всегда: фон приходит точно в 0.55 и в 0.88 */
  if(Math.abs(v-lastDim)>.008||(v!==lastDim&&(v===1||v===.78))){lastDim=v; if(W.__bgDim){try{W.__bgDim(v)}catch(e){}}}
  if(mbar){var fr=form.getBoundingClientRect(); mbar.classList.toggle('show',y>vh*.7&&!(fr.top<vh*.9&&fr.bottom>0));}
  quoteProgress(); navUpdate();
}
W.addEventListener('scroll',onScroll,{passive:true});
W.addEventListener('resize',function(){vw=innerWidth;vh=innerHeight;fit();onScroll();},{passive:true});

/* активный пункт меню (v9 · 6): раздел активен, когда его верх ушёл под шапку; наверху страницы не подсвечен ни один пункт.
   После перехода по пункту меню раздел стоит на scroll-padding под шапкой — его пункт подсвечен, пока человек сам не прокрутит страницу. */
var NAV_IDS=['napravleniya','otkaz','tom1','bankrot','reestr','kto','kak','voprosy','zayavka'], navSecs=NAV_IDS.map(function(id){return D.getElementById(id)}).filter(Boolean),
    navLinks=$$('.nav a'), navCur, navPin=null;
function navUpdate(){ if(!navLinks.length) return; var hb=hdr.getBoundingClientRect().bottom, cur=null;
  navSecs.forEach(function(sec){ if(sec.getBoundingClientRect().top<=hb+1) cur=sec.id; });
  if(navPin){ var pt=D.getElementById(navPin).getBoundingClientRect().top; if(pt>hb+1&&pt<=scrollPad()+8) cur=navPin; }
  if(cur===navCur) return; navCur=cur;
  navLinks.forEach(function(a){ var on=!!cur&&a.getAttribute('href')==='#'+cur; a.classList.toggle('on',on); if(on) a.setAttribute('aria-current','true'); else a.removeAttribute('aria-current'); }); }
function unpin(){ if(navPin){ navPin=null; navUpdate(); } }
W.addEventListener('wheel',unpin,{passive:true}); W.addEventListener('touchstart',unpin,{passive:true});
D.addEventListener('keydown',function(e){ if(/^(Arrow(Up|Down)|Page(Up|Down)|Home|End| )$/.test(e.key)) unpin(); });

/* ═════════════ СЛОИ: меню, справка, политика ═════════════ */
var layers=[];
function focusables(root){return [].concat.apply([],[].concat(root).map(function(r){return $$('a[href],button:not([disabled]),input:not([type=hidden]),select,textarea,[tabindex]:not([tabindex="-1"])',r)})).filter(function(x){return x.offsetParent!==null||x===D.activeElement});}
function trap(e,root){if(e.key!=='Tab')return;var f=focusables(root);if(!f.length)return;var a=f[0],z=f[f.length-1];
  if(e.shiftKey&&D.activeElement===a){e.preventDefault();z.focus();}else if(!e.shiftKey&&D.activeElement===z){e.preventDefault();a.focus();}}
function lock(){R.classList.add('lock')}
function unlock(){if(!layers.length&&$('#dive').hidden&&$('#menu').hidden)R.classList.remove('lock')}
function openLayer(el,opener){layers.push({el:el,ret:opener||D.activeElement});el.hidden=false;lock();
  requestAnimationFrame(function(){requestAnimationFrame(function(){el.classList.add('open')})});
  setTimeout(function(){var x=$('.x',el);if(x)x.focus({preventScroll:true})},60);}
function closeLayer(el){var i=-1;layers.forEach(function(l,k){if(l.el===el)i=k});if(i<0)return;var l=layers.splice(i,1)[0];
  el.classList.remove('open');setTimeout(function(){el.hidden=true;unlock();},RM?0:520);if(l.ret&&l.ret.focus)l.ret.focus({preventScroll:true});}
D.addEventListener('keydown',function(e){
  if(!$('#dive').hidden){ if(e.key==='Escape'){closeCase();} else trap(e,$('#dive')); return; }
  if(layers.length){var top=layers[layers.length-1].el; if(e.key==='Escape')closeLayer(top); else trap(e,top); return;}
  /* меню: фокус ходит по шапке и меню, не уходит под оверлей; Esc возвращает фокус на бургер */
  if(!$('#menu').hidden){ if(e.key==='Escape'){setMenu(false);burger.focus();} else trap(e,[$('#hdr'),$('#menu')]); }
});

var burger=$('#burger'), menu=$('#menu');
function setMenu(on){burger.setAttribute('aria-expanded',on?'true':'false');
  if(on){menu.hidden=false;lock();$$('.menu-in a',menu).forEach(function(a,i){a.style.transitionDelay=(i*35)+'ms'});requestAnimationFrame(function(){requestAnimationFrame(function(){menu.classList.add('open')})});}
  else{menu.classList.remove('open');setTimeout(function(){menu.hidden=true;unlock();},RM?0:350);}}
burger.addEventListener('click',function(){setMenu(burger.getAttribute('aria-expanded')!=='true')});
$$('a',menu).forEach(function(a){a.addEventListener('click',function(){setMenu(false)})});

/* v9 · 2: телефон — папки строками; строка раскрывает опись и «Полный разбор» */
$$('.fd-r').forEach(function(b){ b.addEventListener('click',function(){ var li=b.closest('.fd'), on=!li.classList.contains('open'), before=b.getBoundingClientRect().top;
  li.classList.toggle('open',on); b.setAttribute('aria-expanded',on?'true':'false');
  var after=b.getBoundingClientRect().top; if(Math.abs(after-before)>1) jumpBy(after-before);
  if(on&&!RM){ var m=$('.fd-m',li); A(m,[{opacity:0,transform:'translate3d(0,-6px,0)'},{opacity:1,transform:'none'}],{duration:420}); } }); });

/* справка по категории */
var CAT_DIR={0:6,1:0,2:1,3:2,4:4,5:3,6:5,7:7,8:7,9:7,10:7,11:7};
function openCat(i,opener){var c=S.cats[i];if(!c)return;
  $('#drawerBody').innerHTML='<p class="dw-g mono">Справка по категории · '+esc(c.group)+' · '+esc(c.norm)+'</p><h3 class="dw-t" id="drawerT">'+esc(c.title)+'</h3>'+
    (c.lead?'<p class="dw-lead">'+esc(c.lead)+'</p>':'')+
    c.blocks.map(function(b,k){return '<div class="dw-b" style="transition-delay:'+(160+k*70)+'ms"><h4>'+esc(b.label)+'</h4><p>'+esc(b.text)+'</p></div>'}).join('')+
    (c.status?'<p class="dw-st" style="transition-delay:'+(160+c.blocks.length*70)+'ms">'+esc(c.status)+'</p>':'')+
    '<a class="btn-ink btn-wide" href="#zayavka" data-dir="'+CAT_DIR[i]+'" data-close><span>Разобрать мою ситуацию бесплатно</span>'+ARROW+'</a>';
  openLayer($('#drawer'),opener);}
var ARROW='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M4 10h11M10.5 5l5 5-5 5" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="square"/></svg>';

/* ═════════════ ПОЯВЛЕНИЕ ЛИСТОВ ═════════════ */
function onIn(sheet){
  $$('[data-count]',sheet).forEach(function(el){if(el.dataset.done)return;el.dataset.done=1;countTo(el,+el.dataset.count,420,1400,el.dataset.suffix||'')});
  $$('.fprep',sheet).forEach(function(f){f.classList.add('drawn')});
}
var sheets=$$('.rv-sheet');
if('IntersectionObserver' in W&&!RM){
  var sio=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');sio.unobserve(e.target);onIn(e.target);}})},{rootMargin:'0px 0px 35% 0px',threshold:0});
  sheets.forEach(function(s){sio.observe(s)});
}else{sheets.forEach(function(s){s.classList.add('in');onIn(s)});}

/* штампы с ударом */
function hitStamp(host,delay){var st=$('.stamp',host);if(!st||st.classList.contains('hit'))return;
  setTimeout(function(){st.classList.add('hit');var paper=$('.cdoc',host)||host;
    setTimeout(function(){paper.classList.remove('knock');void paper.offsetWidth;paper.classList.add('knock');},RM?0:300);},RM?0:delay);}
if('IntersectionObserver' in W&&!RM){
  var stIO=new IntersectionObserver(function(es){var k=0;es.forEach(function(e){if(e.isIntersecting){stIO.unobserve(e.target);hitStamp(e.target,500+(k++)*160);}})},{threshold:.5});
  $$('.cc-paper').forEach(function(p){if(!p.closest('template'))stIO.observe(p)});
}else{$$('.stamp').forEach(function(s){s.classList.add('hit')});}

/* ═════════════ СПИСКИ «ЧТО ПОДГОТОВИТЬ» ═════════════ */
$$('.check').forEach(function(ul){$$('li',ul).forEach(function(li,k){li.style.setProperty('--k',k)})});

/* ═════════════ 02 РАЗБОР ОТКАЗА ═════════════ */
var curNote=0, letter=$('#letter'), rns=$$('.rn'), circs=letter?$$('.ncirc',letter):[], drawnUpTo=0;
function drawMark(n){ if(n<=drawnUpTo) return; for(var k=drawnUpTo+1;k<=n;k++){(function(k,d){setTimeout(function(){
    $$('[data-mk="'+k+'"]',letter).forEach(function(m){m.classList.add('drawn')}); if(circs[k-1]) circs[k-1].classList.add('drawn');},d)})(k,(k-drawnUpTo-1)*420);}
  drawnUpTo=n; }
function activeNote(n){ rns.forEach(function(r){r.classList.toggle('on',r.dataset.note===String(n))});
  $$('.fr,.fr-in',letter).forEach(function(p){p.classList.toggle('on',p.dataset.fr===String(n))}); drawMark(n); }
if(letter){
  if(RM){drawMark(4);}
  else if('IntersectionObserver' in W){
    W.addEventListener('scroll',function(){ if(vw<=1020) return; var lr=letter.getBoundingClientRect(); if(lr.bottom<0||lr.top>vh) return;
      var best=0,bd=1e9; rns.forEach(function(r){var b=r.getBoundingClientRect(),d=Math.abs(b.top+b.height/2-vh*.5);if(d<bd){bd=d;best=+r.dataset.note;}});
      if(best&&best!==curNote){curNote=best;activeNote(best);} },{passive:true});
    var lIO=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){
      if(vw<=1020){ lIO.disconnect(); [1,2,3,4].forEach(function(n,i){setTimeout(function(){activeNote(n)},300+i*900)}); }
      else if(!drawnUpTo){ activeNote(1); }
    }})},{threshold:.35});
    lIO.observe(letter);
  } else drawMark(4);
  $$('.rn-b').forEach(function(b){b.addEventListener('click',function(){activeNote(+b.dataset.noteB)})});
}

/* ═════════════ 02 ПРОВЕРКА СРОКА ═════════════ */
function mask(inp){inp.addEventListener('input',function(){var v=inp.value.replace(/\D/g,'').slice(0,8),o=v.slice(0,2);if(v.length>2)o+='.'+v.slice(2,4);if(v.length>4)o+='.'+v.slice(4);inp.value=o;})}
function parseDate(s){var m=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s||'');if(!m)return null;var d=new Date(+m[3],+m[2]-1,+m[1]);if(d.getDate()!==+m[1]||d.getMonth()!==+m[2]-1||+m[3]<1990)return null;return d}
function today(){var t=new Date();return new Date(t.getFullYear(),t.getMonth(),t.getDate())}
function term(d){ /* три месяца со дня получения отказа; нет такого числа — последний день месяца (ст. 93 КАС) */
  var e=new Date(d.getFullYear(),d.getMonth()+3,1); e.setDate(Math.min(d.getDate(),new Date(e.getFullYear(),e.getMonth()+1,0).getDate())); var t=today(), days=Math.round((e-t)/864e5);
  return {end:e,days:days,future:d>t,p:clamp((t-d)/(e-d),0,1)}; }
/* v9 · одна формулировка результата для мини-проверки, калькулятора и формы (13.2, 13.3) */
function termLine(r){ var KAS=' · если спор с ведомством по КАС';
  if(r.days>0) return {lead:(r.days%10===1&&r.days%100!==11?'Остался ':'Осталось ')+r.days+' '+plural(r.days,'день','дня','дней'),tail:' · срок истекает '+fmtDate(r.end)+KAS};
  if(r.days===0) return {lead:'Сегодня последний день',tail:KAS};
  return {lead:'Срок истёк '+fmtDate(r.end),tail:' · можно просить суд восстановить срок, если причина пропуска уважительная'}; }
var cIn=$('#calcIn'), cOut=$('#calcOut'), cBig=$('#cBig'), cTxt=$('#cTxt'), cFill=$('#cFill'), cDot=$('#cDot'), cX=$('#cX');
function calc(){ var s=cIn.value, d=parseDate(s); cX.hidden=true;
  var set=function(st,big,txt,p){cOut.dataset.state=st;cBig.textContent=big;cTxt.textContent=txt;var tw=cFill.parentNode.clientWidth;
    cFill.style.transform='scaleX('+p+')';cDot.style.transform='translate3d('+f2(p*tw)+'px,0,0)';};
  if(s.length<10){ set('empty','—',s.length?'Введите дату полностью: ДД.ММ.ГГГГ':'Результат появится здесь.',0); return; }
  if(!d){ set('empty','—','Проверьте дату: ДД.ММ.ГГГГ',0); return; }
  var r=term(d);
  if(r.future){ set('empty','—','Дата ещё не наступила — проверьте год.',0); return; }
  var L=termLine(r);
  if(r.days>0){ set('ok',r.days+' '+plural(r.days,'день','дня','дней'),L.lead+L.tail,r.p); }
  else if(r.days===0){ set('ok','Сегодня',L.lead+L.tail,1); }
  else { set('late','Срок истёк',L.lead+L.tail,1); cX.hidden=false; }
  if(!RM) A(cBig,[{opacity:0,transform:'translate3d(0,10px,0)'},{opacity:1,transform:'none'}],{duration:500});
}
/* мини-проверка срока на первом экране: та же term(), подробный расчёт — в #srok */
var htIn=$('#htIn'), htOut=$('#htOut'), htGo=$('#htGo');
if(htIn){ var htDef=htOut.innerHTML; mask(htIn);
  htIn.addEventListener('input',function(){ var s=htIn.value, d=parseDate(s); htOut.dataset.state='';
    if(s.length<10){ htOut.innerHTML=htDef; return; }
    if(!d){ htOut.textContent='Проверьте дату: ДД.ММ.ГГГГ'; return; }
    var r=term(d);
    if(r.future){ htOut.textContent='Дата ещё не наступила — проверьте год.'; return; }
    var L=termLine(r); htOut.dataset.state=r.days>=0?'ok':'late'; htOut.innerHTML='<b>'+esc(L.lead)+'</b>'+esc(L.tail); });
  /* v9 · 4: при фокусе поле и ответ — в видимой области (visualViewport), не под шапкой; нижняя панель пока скрыта */
  var htBox=$('#hterm'), htFocus=false, htT=0;
  function htEnsure(){ if(!htFocus) return; var vv=W.visualViewport, vTop=vv?vv.offsetTop:0, vH=vv?vv.height:innerHeight;
    var top=Math.max(hdr.getBoundingClientRect().bottom,vTop)+8, bottom=vTop+vH-8;
    var t=$('.hterm-f',htBox).getBoundingClientRect().top, b=Math.max(htIn.getBoundingClientRect().bottom,htOut.getBoundingClientRect().bottom);
    var d=0; if(b>bottom) d=b-bottom; if(t-d<top) d=t-top; if(Math.abs(d)>1) jumpBy(d); }
  function htLater(){ clearTimeout(htT); htEnsure(); htT=setTimeout(htEnsure,350); }
  htIn.addEventListener('focus',function(){ htFocus=true; R.classList.add('ht-focus'); htLater(); });
  htIn.addEventListener('blur',function(){ htFocus=false; R.classList.remove('ht-focus'); clearTimeout(htT); });
  htIn.addEventListener('input',function(){ requestAnimationFrame(htEnsure); });
  if(W.visualViewport) W.visualViewport.addEventListener('resize',htLater);
  htGo.addEventListener('click',function(){ if(parseDate(htIn.value)&&cIn){ cIn.value=htIn.value; calc(); dateIn.value=htIn.value; dateOut(); } }); }

if(vw<=620){var hd=$('.how-d');if(hd)hd.removeAttribute('open');}
if(cIn){ mask(cIn); cIn.addEventListener('input',calc); calc();
  $('#calcGo').addEventListener('click',function(){ if(parseDate(cIn.value)){$('#dateIn').value=cIn.value;dateOut();} }); }

/* тома: первые 3 исхода видны, остальные — кнопкой «Ещё N» */
$$('.vA-more').forEach(function(b){ var lb=$('span',b), txt=lb.textContent, ids=b.getAttribute('aria-controls').split(' ');
  ids.forEach(function(id){ var el=D.getElementById(id); if(el) el.hidden=true; });
  b.addEventListener('click',function(){ var on=b.getAttribute('aria-expanded')!=='true';
    ids.forEach(function(id,i){ var el=D.getElementById(id); if(!el) return; el.hidden=!on;
      if(on) A(el,[{opacity:0,transform:'translate3d(0,14px,0)'},{opacity:1,transform:'none'}],{duration:600,delay:i*80}); });
    b.setAttribute('aria-expanded',on?'true':'false'); lb.textContent=on?'Свернуть':txt; }); });

/* ═════════════ 04 РЕЕСТР ═════════════ */
var ccs=$('#ccs');
var ccMore=$('#ccMore'); if(ccMore) ccMore.addEventListener('click',function(){var cards=$$('.cc',ccs).filter(function(c){return c.offsetParent===null});ccs.classList.add('all');cards.forEach(function(c,i){A(c,[{opacity:0,transform:'translate3d(0,30px,0) rotate(-1deg)'},{opacity:1,transform:'none'}],{duration:700,delay:i*60});var p=$('.cc-paper',c);if(p)hitStamp(p,500+i*120);});});
function applyFilter(f){ ccs.classList.add('all'); $$('.flt').forEach(function(x){x.setAttribute('aria-selected',x.dataset.f===f?'true':'false')});
  var cards=$$('.cc',ccs), first=cards.map(function(c){return c.getBoundingClientRect()});
  cards.forEach(function(c){c.classList.toggle('gone',f!=='all'&&c.dataset.f!==f)});
  cards.forEach(function(c,i){if(c.classList.contains('gone')||RM)return;var r=c.getBoundingClientRect(),dx=first[i].left-r.left,dy=first[i].top-r.top;
    if(!first[i].width){c.animate([{opacity:0,transform:'translate3d(0,24px,0) rotate(-1.5deg) scale(.97)'},{opacity:1,transform:'none'}],{duration:600,delay:i*40,easing:EASE,fill:'backwards'});return;}
    if(dx||dy)c.animate([{transform:'translate('+dx+'px,'+dy+'px)'},{transform:'none'}],{duration:650,easing:EASE});});
  cards.forEach(function(c){if(!c.classList.contains('gone')){var p=$('.cc-paper',c);if(p)hitStamp(p,700)}});
}
$$('.flt').forEach(function(b){b.addEventListener('click',function(){applyFilter(b.dataset.f)})});
D.addEventListener('click',function(e){var g=e.target.closest('[data-filter-go]');if(!g)return;applyFilter(g.dataset.filterGo);scrollToEl($('#reestr .flts'),true);});

/* наклон листа за курсором + курсор «Открыть дело» */
var cursor=$('#cursor'), cx=-200, cy=-200, ctx=-200, cty=-200, curOn=false;
if(FINE&&!RM){
  D.addEventListener('pointermove',function(e){ctx=e.clientX;cty=e.clientY;
    var host=e.target.closest&&e.target.closest('.cc-b,.bk-case,.feat-r');
    var want=!!(host||(e.target.closest&&e.target.closest('.stage-open,.bk-out')))&&$('#dive').hidden;
    if(want!==curOn){curOn=want;cursor.classList.toggle('on',want);}
    if(host){var d=$('.cdoc',host),r=d.getBoundingClientRect(),nx=(e.clientX-r.left)/r.width-.5,ny=(e.clientY-r.top)/r.height-.5;
      d.style.setProperty('--ry',f2(nx*9)+'deg');d.style.setProperty('--rx',f2(-ny*7)+'deg');}
  },{passive:true});
  D.addEventListener('pointerout',function(e){var host=e.target.closest&&e.target.closest('.cc-b,.bk-case,.feat-r');if(!host||host.contains(e.relatedTarget))return;
    var d=$('.cdoc',host);d.style.setProperty('--rx','0deg');d.style.setProperty('--ry','0deg');});
  W.addEventListener('scroll',function(){ if(!curOn) return; var el=D.elementFromPoint(ctx,cty); var ok=!!(el&&el.closest&&el.closest('.cc-b,.bk-case,.feat-r,.stage-open,.bk-out')); if(!ok){curOn=false;cursor.classList.remove('on');} },{passive:true});
  (function cl(){cx+=(ctx-cx)*.2;cy+=(cty-cy)*.2;cursor.style.transform='translate3d('+f2(cx)+'px,'+f2(cy)+'px,0)';requestAnimationFrame(cl)})();
}

/* ═════════════ АККОРДЕОНЫ, ВКЛАДКИ ═════════════ */
/* аккордеон: остальные пункты закрываются мгновенно, строка под пальцем остаётся на месте */
$$('.acc-b').forEach(function(b){b.addEventListener('click',function(){var acc=b.parentNode,on=!acc.classList.contains('open'),before=b.getBoundingClientRect().top;
  $$('.acc',acc.parentNode).forEach(function(x){if(x!==acc&&x.classList.contains('open')){var a=$('.acc-a',x);a.style.transition='none';x.classList.remove('open');$('.acc-b',x).setAttribute('aria-expanded','false');void a.offsetHeight;requestAnimationFrame(function(){a.style.transition='';});}});
  acc.classList.toggle('open',on);b.setAttribute('aria-expanded',on?'true':'false');
  var after=b.getBoundingClientRect().top; if(Math.abs(after-before)>1){jumpBy(after-before);}})});
/* v9 · 11: без JS видны обе вкладки; с JS — только выбранная */
$$('.fpane').forEach(function(p,k){ var t=$('#ft'+k); p.hidden=!(t&&t.getAttribute('aria-selected')==='true'); });
$$('.ftab').forEach(function(t,i){t.addEventListener('click',function(){$$('.ftab').forEach(function(x){x.setAttribute('aria-selected',x===t?'true':'false')});
  $$('.fpane').forEach(function(p,k){p.hidden=k!==i;p.classList.remove('fp-in');if(k===i){void p.offsetWidth;p.classList.add('fp-in');}});})});
D.addEventListener('click',function(e){var b=e.target.closest('[data-faq]');if(!b)return;var t=$('#ft'+b.dataset.faq);if(t)t.click();scrollToEl($('#voprosy'),true);});
/* вопросы и «Как работаю» — свёрнутыми строками: по умолчанию все закрыты */

/* ═════════════ 06 ШАГИ ═════════════ */
if('IntersectionObserver' in W&&!RM){
  var stepIO=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){stepIO.unobserve(e.target);var i=$$('.step').indexOf(e.target);setTimeout(function(){e.target.classList.add('drawn')},500+i*260);}})},{rootMargin:'0px 0px -22% 0px'});
  $$('.step').forEach(function(s){stepIO.observe(s)});
}else $$('.step').forEach(function(s){s.classList.add('drawn')});

/* ═════════════ 05 ЦИТАТА: слова проявляются чернилами ═════════════ */
var q=$('#quote p'), qw=[];
if(q){q.innerHTML=q.textContent.split(' ').map(function(w){return '<span class="qw">'+esc(w)+'</span>'}).join(' ');qw=$$('.qw',q);}
function quoteProgress(){ if(!q||RM) return; var r=q.getBoundingClientRect(); var p=clamp((vh*.98-r.top)/(vh*.42),0,1), k=Math.round(p*qw.length);
  for(var i=0;i<qw.length;i++){var on=i<k;if(qw[i]._on!==on){qw[i]._on=on;qw[i].classList.toggle('on',on);}} }

/* ═════════════ 08 ЗАЯВКА ═════════════ */
var lead=$('#lead'), sel=$('#dirSel'), prepList=$('#prepList'), prepFor=$('#prepFor'), subNote=$('#subNote'), textIn=$('#textIn'), dateIn=$('#dateIn'), dOut=$('#dateOut');
var curSub='', TICK='<svg class="pensvg tk" viewBox="0 0 28 24" preserveAspectRatio="none" aria-hidden="true"><path class="pen" pathLength="1" stroke-width="2.4" d="M3,14.5 C5.5,16 8,18.6 10.2,21.6 C13.5,14 18.6,7.4 25.5,2.4"/></svg>';
function renderPrep(i){ var list=(i>=0&&i<8)?S.prep[i]:S.prepAll; prepFor.textContent=(i>=0&&i<8)?'· '+S.dirs[i].toLowerCase():'';
  prepList.innerHTML=list.map(function(x,k){return '<li style="--k:'+k+'"><span class="box" aria-hidden="true">'+TICK+'</span>'+esc(x)+'</li>'}).join('');
  var fp=prepList.closest('.fprep'); fp.classList.remove('drawn'); requestAnimationFrame(function(){requestAnimationFrame(function(){fp.classList.add('drawn')})}); }
function setWho(w){var r=$('#lead [name=who][value="'+w+'"]');if(r)r.checked=true;
  textIn.placeholder=w==='family'?'Кто он вам, что пришло от ведомства и когда. Место службы и номер части не указывайте.':'Что произошло и что ответило ведомство';}
function setDir(i,sub,who){ if(i==null||isNaN(i)) return; sel.value=String(i); curSub=sub||''; subNote.hidden=!curSub; subNote.textContent=curSub?'Уточнение: '+curSub:'';
  $('.fld',sel.parentNode.parentNode)&&sel.closest('.fld').classList.remove('bad'); renderPrep(+i); if(who) setWho(who); }
sel.addEventListener('change',function(){curSub='';subNote.hidden=true;renderPrep(+sel.value);sel.closest('.fld').classList.remove('bad');});
$$('#lead [name=who]').forEach(function(r){r.addEventListener('change',function(){setWho(r.value)})});
function dateOut(){ var s=dateIn.value, d=parseDate(s); dOut.classList.remove('late');
  if(!s){dOut.textContent='';return;} if(s.length<10){dOut.textContent='';return;} if(!d){dOut.textContent='Проверьте дату: ДД.ММ.ГГГГ';return;}
  var r=term(d); if(r.future){dOut.textContent='Дата ещё не наступила — проверьте год.';return;}
  var L=termLine(r); if(r.days<0) dOut.classList.add('late'); dOut.textContent=L.lead+L.tail; }
mask(dateIn); dateIn.addEventListener('input',dateOut);

/* любой элемент с data-dir → заявка с выбранной ситуацией */
D.addEventListener('click',function(e){var t=e.target.closest('[data-dir]');if(!t||t.closest('template'))return;
  setDir(+t.dataset.dir,t.dataset.sub||'',t.dataset.who||'self');
  if(t.hasAttribute('data-exit')) return;
  e.preventDefault();
  var l=t.hasAttribute('data-close')&&t.closest('.drawer,.modal');
  if(l){closeLayer(l);setTimeout(goForm,RM?0:380);} else goForm();
});
function goForm(){ var target=vw<=1020?$('#blank'):form; scrollToEl(target,true);
  var n=$('#lead [name=name]'); var t0=Date.now(), last=-1;
  (function wait(){ var y=W.pageYOffset; if((y===last&&Date.now()-t0>250)||Date.now()-t0>1600||RM){ if(n&&!n.value&&!lead.hidden)n.focus({preventScroll:true}); return; } last=y; setTimeout(wait,90); })(); }
D.addEventListener('click',function(e){ if(e.defaultPrevented) return; var a=e.target.closest('a[href^="#"]'); if(!a||a.closest('#dive')) return;
  var id=a.getAttribute('href').slice(1); if(!id||S.cases[id]) return; var el=D.getElementById(id); if(!el) return;
  e.preventDefault(); navPin=NAV_IDS.indexOf(id)>=0?id:null;
  if(id==='zayavka'){ if(a.hasAttribute('data-dir-reset')) resetDir(); goForm(); return; }
  if(id==='top'){W.scrollTo({top:0,behavior:RM?'auto':'smooth'});return;} scrollToEl(el,true); });
/* v9 · Q3: том 1 охватывает несколько ситуаций — кнопка сбрасывает выбор, «Что подготовить» и уточнение */
function resetDir(){ sel.value=''; curSub=''; subNote.hidden=true; subNote.textContent=''; sel.closest('.fld').classList.remove('bad'); renderPrep(-1); }

var err=$('#formErr'), done=$('#done'), blank=$('#blank'), mailText='', agreeErr=$('#agreeErr');
lead.agree.addEventListener('change',function(){ if(lead.agree.checked){ agreeErr.hidden=true; lead.agree.removeAttribute('aria-invalid'); lead.agree.closest('.agree').classList.remove('bad'); } });
lead.addEventListener('submit',function(e){e.preventDefault();var f=lead.elements,bad=[];
  $$('.fld,.agree',lead).forEach(function(x){x.classList.remove('bad')});
  if(!f.name.value.trim())bad.push([f.name,'Укажите, как к вам обращаться']);
  if(f.contact.value.trim().length<5)bad.push([f.contact,'Укажите телефон или ник в Telegram']);
  if(!sel.value)bad.push([sel,'Выберите ситуацию — или «Другое или не знаю, как назвать»']);
  if(dateIn.value&&!parseDate(dateIn.value))bad.push([dateIn,'Проверьте дату: ДД.ММ.ГГГГ']);
  /* v9 · Q6: ошибка согласия — у самого квадрата (рамка, текст рядом, aria-describedby), общий блок — для остальных полей */
  var agreeBad=!f.agree.checked; agreeErr.hidden=!agreeBad; if(agreeBad){f.agree.setAttribute('aria-invalid','true');bad.push([f.agree,''] );}else f.agree.removeAttribute('aria-invalid');
  if(bad.length){bad.forEach(function(b){var p=b[0].closest('.fld,.agree');if(p)p.classList.add('bad')});
    var firstMsg=bad.filter(function(b){return b[1]})[0]; if(firstMsg){err.textContent=firstMsg[1];err.hidden=false;}else err.hidden=true;
    bad[0][0].focus();return;}
  err.hidden=true;
  var dir=S.dirs[+sel.value]||'', family=(lead.querySelector('[name=who]:checked')||{}).value==='family';
  mailText='Заявка с сайта\nИмя: '+f.name.value.trim()+'\nКонтакт: '+f.contact.value.trim()+'\nСитуация: '+dir+(curSub?'\nУточнение: '+curSub:'')+
    '\nПишет: '+(family?'родственник':'сам')+(dateIn.value?'\nДата получения отказа: '+dateIn.value+(dOut.textContent?' ('+dOut.textContent+')':''):'')+
    (f.text.value.trim()?'\nКоротко: '+f.text.value.trim():'');
  var body=mailText.length>1400?mailText.slice(0,1400)+'…\n(полный текст скопируйте кнопкой «Скопировать текст» на сайте)':mailText;
  var href='mailto:yujiklop74@yandex.ru?subject='+encodeURIComponent('Заявка с сайта — '+dir)+'&body='+encodeURIComponent(body);
  try{var a=D.createElement('a');a.href=href;a.style.display='none';D.body.appendChild(a);a.click();a.remove();}catch(x){location.href=href;}
  lead.hidden=true;done.hidden=false;
  /* v9 · Q2: экран «Готово» открывается с начала — верх сразу под шапкой, затем фокус без прокрутки */
  jumpTo(Math.max(0,done.getBoundingClientRect().top+W.pageYOffset-hdr.getBoundingClientRect().bottom-8));
  done.focus({preventScroll:true});var st=$('.stamp',done);st.classList.remove('hit');void st.offsetWidth;st.classList.add('hit');
  setTimeout(function(){blank.classList.remove('knock');void blank.offsetWidth;blank.classList.add('knock')},RM?0:300);
  A(done,[{opacity:0,transform:'translateY(12px)'},{opacity:1,transform:'none'}],{duration:600});
});
$('#copyBtn').addEventListener('click',function(){var b=this,lb=$('span',b);
  function ok(){lb.textContent='Скопировано';setTimeout(function(){lb.textContent='Скопировать текст'},2400);}
  function fb(){var t=D.createElement('textarea');t.value=mailText;t.setAttribute('readonly','');t.style.position='fixed';t.style.opacity='0';D.body.appendChild(t);t.select();try{D.execCommand('copy');ok();}catch(x){}t.remove();}
  if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(mailText).then(ok,fb);}else fb();});
$('#againBtn').addEventListener('click',function(){lead.hidden=false;done.hidden=true;lead.reset();agreeErr.hidden=true;curSub='';subNote.hidden=true;dOut.textContent='';setWho('self');renderPrep(-1);$('#lead [name=name]').focus();});
D.addEventListener('click',function(e){var p=e.target.closest('[data-policy]');if(p){e.preventDefault();openLayer($('#policy'),p);return;}
  var c=e.target.closest('[data-close]');if(c&&!c.hasAttribute('data-dir')){var l=c.closest('.drawer,.modal');if(l)closeLayer(l);return;}
  var k=e.target.closest('[data-cat]');if(k){openCat(+k.dataset.cat,k);}});

/* ═════════════ ПРОВАЛ В ДЕЛО ═════════════ */
var dive=$('#dive'), dwin=$('#diveWin'), dstage=$('#diveStage'), dpage=$('#divePage'), dX=$('#diveX'), dT=$('#diveT');
var cur=null, busy=false, retFocus=null, pushed=false;
function visRect(el){if(!el)return null;var r=el.getBoundingClientRect();if(!r.width||r.bottom<40||r.top>vh-40)return null;return r;}
function sourceFor(id,trigger){
  if(trigger){ var sel=trigger.getAttribute&&trigger.getAttribute('data-src'); if(sel){var ss=$$(sel);for(var j=0;j<ss.length;j++){if(visRect(ss[j]))return ss[j];}}
    var host=trigger.closest&&trigger.closest('.cc-b,.bk-case,.feat-r'); if(host){var d=$('.cdoc',host);if(visRect(d))return d;} }
  var list=$$('.cc-b[data-case="'+id+'"] .cdoc, .bk-case[data-case="'+id+'"] .cdoc, .feat-r[data-case="'+id+'"] .cdoc');
  for(var i=0;i<list.length;i++){if(visRect(list[i]))return list[i];}
  return null;
}
function fallbackRect(){var w=Math.min(360,vw*.78),h=w*.92;return {left:(vw-w)/2,top:vh*.56-h/2,width:w,height:h,right:(vw+w)/2,bottom:vh*.56+h/2};}
function makeClone(id,src,r,Z){ var el; if(src&&src.classList.contains('cdoc')) el=src.cloneNode(true);
  else { var t=$('#mini-'+id); el=t.content.firstElementChild.cloneNode(true); }
  el.removeAttribute('style'); el.style.width=r.width+'px'; el.style.height=r.height+'px'; el.style.zoom=Z;
  var wr=D.createElement('div'); wr.className='dc'; wr.appendChild(el);
  dstage.innerHTML=''; dstage.appendChild(wr); return wr; }
/* кадры клона: k — видимый масштаб относительно карточки, (cx,cy) — центр на экране */
function cloneKF(r,Z,k,cx,cy,blur,op){ var w=r.width*k, h=r.height*k; return {transform:'translate3d('+f2(cx-w/2)+'px,'+f2(cy-h/2)+'px,0) scale('+f2(k/Z)+')',filter:'blur('+blur+'px)',opacity:op}; }
function zoomOf(r){ return Math.max(1.2,Math.min(vw*.5/r.width,vh*.64/r.height)); }
function fillPage(id){ var t=$('#tpl-'+id); dpage.innerHTML=''; dpage.appendChild(t.content.cloneNode(true)); dpage.scrollTop=0;
  var c=S.cases[id]; dT.textContent='Дело '+c.num+' · '+({vyplaty:'выплаты',vvk:'ВВК и МСЭ',zhile:'жильё',bankrot:'банкротство'})[c.cat];
  dive.setAttribute('aria-labelledby','caseT-'+c.num);
  $$('.stamp',dpage).forEach(function(s){s.classList.remove('hit')}); }
function afterReady(){ var st=$('.cs-stamp',dpage); if(st) hitStamp(st,RM?0:520); }
function insetOf(r){return 'inset('+f2(r.top)+'px '+f2(vw-r.right)+'px '+f2(vh-r.bottom)+'px '+f2(r.left)+'px round 2px)';}
function openCase(id,trigger,noPush){
  if(!S.cases[id]||busy) return; if(!dive.hidden){swapCase(id);return;}
  busy=true; cur=id; retFocus=D.activeElement; openTrigger=trigger||null;
  if(!R.classList.contains('lock')) lock();
  setMenu&&!$('#menu').hidden&&setMenu(false);
  cursor&&cursor.classList.remove('on'); curOn=false;
  var src=sourceFor(id,trigger), r=visRect(src)||fallbackRect(), Z=zoomOf(r);
  savedY=W.pageYOffset;
  var clone=makeClone(id,src,r,Z);
  fillPage(id); dpage.style.opacity=0; dive.classList.remove('ready'); dive.hidden=false; lock(); dpage.scrollTop=0;
  if(!noPush){try{history.pushState({c:id},'','#'+id);pushed=true;}catch(e){pushed=false;}}
  var Dur=RM?0:1150;
  if(!Dur||!hasWA){ dstage.innerHTML=''; dpage.style.opacity=1; dive.classList.add('ready'); busy=false; afterReady(); dX.focus({preventScroll:true}); return; }
  dwin.animate([{clipPath:insetOf(r)},{clipPath:'inset(0px 0px 0px 0px round 0px)'}],{duration:Dur*.66,easing:'cubic-bezier(.7,0,.22,1)',fill:'forwards'});
  var c0x=r.left+r.width/2, c0y=r.top+r.height/2, k0=cloneKF(r,Z,1,c0x,c0y,0,1); k0.easing='cubic-bezier(.6,0,.25,1)';
  var k1=cloneKF(r,Z,Z,vw/2,vh*.47,0,1); k1.offset=.52; k1.easing='cubic-bezier(.4,0,.7,.4)';
  var k2=cloneKF(r,Z,Z*1.3,vw/2,vh*.51,4,.95); k2.offset=.74; k2.easing='cubic-bezier(.5,0,.8,.5)';
  clone.animate([k0,k1,k2,cloneKF(r,Z,Z*1.9,vw/2,vh*.55,18,0)],
    {duration:Dur,easing:'linear',fill:'forwards'});
  setTimeout(function(){ dpage.animate([{opacity:0,transform:'scale(1.04)'},{opacity:1,transform:'none'}],{duration:650,easing:EASE,fill:'forwards'}); dive.classList.add('ready'); afterReady(); },Dur*.7);
  setTimeout(function(){ busy=false; dstage.innerHTML=''; dX.focus({preventScroll:true}); if(pendingClose){pendingClose=false;closeCase();} },Dur+60);
}
function swapCase(id){ if(!S.cases[id]||busy) return; busy=true; cur=id; openTrigger=null;
  var out=RM||!hasWA?null:dpage.animate([{opacity:1,transform:'none'},{opacity:0,transform:'translate3d(0,-18px,0)'}],{duration:260,easing:'ease-in',fill:'forwards'});
  var go=function(){ fillPage(id); dive.classList.remove('ready'); void dpage.offsetWidth; dive.classList.add('ready');
    if(!RM&&hasWA) dpage.animate([{opacity:0,transform:'translate3d(0,24px,0)'},{opacity:1,transform:'none'}],{duration:520,easing:EASE,fill:'forwards'}); else dpage.style.opacity=1;
    afterReady(); busy=false; try{history.replaceState({c:id},'','#'+id);}catch(e){} dX.focus({preventScroll:true}); };
  if(out) out.onfinish=go; else go(); }
function doClose(then){ if(dive.hidden) return; busy=true;
  var src=sourceFor(cur,null);
  if(savedY!=null&&Math.abs(W.pageYOffset-savedY)>2){jumpTo(savedY);}
  src=sourceFor(cur,openTrigger);
  var r=visRect(src), Dur=RM?0:900;
  var finish=function(){ dive.hidden=true; dstage.innerHTML=''; dpage.innerHTML=''; dpage.scrollTop=0; dwin.getAnimations&&dwin.getAnimations().forEach(function(a){a.cancel()});
    dpage.getAnimations&&dpage.getAnimations().forEach(function(a){a.cancel()}); dpage.style.opacity=0; dive.classList.remove('ready'); busy=false; unlock();
    if(!then&&savedY!=null&&!movedForSrc){jumpTo(savedY);} movedForSrc=false;
    if(then) then(); else if(retFocus&&retFocus.focus&&D.body.contains(retFocus)) retFocus.focus({preventScroll:true}); };
  if(!Dur||!hasWA){ finish(); return; }
  var rr=r||fallbackRect(), Z=zoomOf(rr), clone=makeClone(cur,src,rr,Z);
  dpage.animate([{opacity:1},{opacity:0}],{duration:280,fill:'forwards'}); dive.classList.remove('ready');
  var e0=rr.left+rr.width/2, e1=rr.top+rr.height/2, m1=cloneKF(rr,Z,1+(Z-1)*.4,vw/2+(e0-vw/2)*.6,vh*.47+(e1-vh*.47)*.6,0,1); m1.offset=.55;
  clone.animate([cloneKF(rr,Z,Z*1.7,vw/2,vh*.53,16,0),m1,cloneKF(rr,Z,1,e0,e1,0,r?1:0)],{duration:Dur,easing:'cubic-bezier(.3,0,.2,1)',fill:'forwards'});
  var a=dwin.animate([{clipPath:'inset(0px 0px 0px 0px round 0px)'},{clipPath:insetOf(rr)}],{duration:Dur*.8,delay:Dur*.2,easing:'cubic-bezier(.65,0,.3,1)',fill:'forwards'});
  a.onfinish=finish; }
var savedY=null, movedForSrc=false, pendingClose=false, openTrigger=null;
function closeCase(then){ if(dive.hidden) return; if(busy){ pendingClose=true; return; }
  if(pushed){ pushed=false; closeThen=then||null; try{history.back();}catch(e){doClose(then);} return; }
  try{history.replaceState({},'',location.pathname+location.search);}catch(e){} doClose(then); }
var closeThen=null;
W.addEventListener('popstate',function(){ var id=location.hash.slice(1);
  if(S.cases[id]){ if(dive.hidden) openCase(id,null,true); else swapCase(id); }
  else if(!dive.hidden){ var t=closeThen; closeThen=null; doClose(t); } });
dX.addEventListener('click',function(){closeCase()});
dpage.addEventListener('click',function(e){ var g=e.target.closest('[data-go]'); if(g){ swapCase(g.dataset.go); return; }
  var x=e.target.closest('[data-exit]'); if(x){ e.preventDefault(); e.stopPropagation(); var di=+x.dataset.dir;
    closeCase(function(){ setDir(di,'',''); scrollToEl(form,true); setTimeout(function(){var n=$('#lead [name=name]');if(n)n.focus({preventScroll:true})},RM?0:900); }); } });
D.addEventListener('click',function(e){ var c=e.target.closest('[data-case]'); if(!c||c.closest('#dive')) return; e.preventDefault(); openCase(c.dataset.case,c); });

/* ═════════════ СТАРТ ═════════════ */
function start(){
  layoutNote(); fit();
  if('scrollRestoration' in history) history.scrollRestoration='manual';
  var h=location.hash.slice(1);
  if(RM||S.cases[h]){ R.classList.remove('intro'); onScroll(); if(!RM)requestAnimationFrame(heroLoop); deep(0); return; }
  if(h&&D.getElementById(h)){ R.classList.remove('intro'); onScroll(); requestAnimationFrame(heroLoop); [60,500,1200].forEach(function(t){setTimeout(function(){scrollToEl(D.getElementById(h),false)},t)}); return; }
  var end=intro(); R.classList.remove('intro'); liveFrom=performance.now()+end; onScroll(); requestAnimationFrame(heroLoop);
}
function deep(){ var id=location.hash.slice(1); if(S.cases[id]) setTimeout(function(){openCase(id,null,true)},RM?0:120); }
var fr=D.fonts&&D.fonts.ready?D.fonts.ready:Promise.resolve(), started=false;
/* v9: отложенные начертания (fonts.css) приходят после load — пересчитать позицию пометки на листе */
if(D.fonts&&D.fonts.addEventListener) D.fonts.addEventListener('loadingdone',function(){ if(started){ layoutNote(); } });
function go(){ if(started) return; started=true; try{start();}catch(err){R.classList.remove('intro'); if(W.console) console.warn(err);} }
fr.then(function(){requestAnimationFrame(go)}); setTimeout(go,1500);
})();
