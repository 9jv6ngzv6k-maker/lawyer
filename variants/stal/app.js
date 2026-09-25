/* Вариант «Сталь» — поведение страницы. Vanilla JS, без зависимостей. */
(function(){
'use strict';
var W=window, D=document, H=D.documentElement, S=W.SITE||{dirs:[],cats:[],prep:[],prepAll:[]};
var RM=H.classList.contains('rm');
var FINE=W.matchMedia&&matchMedia('(hover:hover) and (pointer:fine)').matches;
function $(s,c){return (c||D).querySelector(s)}
function $$(s,c){return Array.prototype.slice.call((c||D).querySelectorAll(s))}
function clamp(v,a,b){return v<a?a:v>b?b:v}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function plural(n,a,b,c){n=Math.abs(n)%100;var m=n%10;if(n>10&&n<20)return c;if(m>1&&m<5)return b;if(m===1)return a;return c}
function fmtDate(d){function p(x){return (x<10?'0':'')+x}return p(d.getDate())+'.'+p(d.getMonth()+1)+'.'+d.getFullYear()}
function hdrH(){return ($('#hdr')||{offsetHeight:68}).offsetHeight}
function scrollToEl(el,off){if(!el)return;var y=el.getBoundingClientRect().top+W.pageYOffset-hdrH()-(off==null?16:off);W.scrollTo({top:Math.max(0,y),behavior:RM?'auto':'smooth'})}

/* категория направления → индекс ситуации в форме (как в основном сайте) */
var CAT_DIR={0:6,1:0,2:1,3:2,4:4,5:3,6:5,7:7,8:7,9:7,10:7,11:7};

/* ═════════ ШАПКА И МЕНЮ ═════════ */
var hdr=$('#hdr'), burger=$('#burger'), menu=$('#menu');
function onScrollHdr(){hdr.classList.toggle('sc',W.pageYOffset>8)}
function setMenu(open){
 burger.setAttribute('aria-expanded',open?'true':'false');
 menu.hidden=!open; D.body.style.overflow=open?'hidden':'';
 if(open){var a=$('a',menu);if(a)a.focus({preventScroll:true});}
}
burger.addEventListener('click',function(){setMenu(menu.hidden)});
menu.addEventListener('click',function(e){if(e.target.closest('a'))setMenu(false)});
D.addEventListener('keydown',function(e){if(e.key==='Escape'&&!menu.hidden){setMenu(false);burger.focus();}});
W.addEventListener('resize',function(){if(W.innerWidth>1180&&!menu.hidden)setMenu(false)});

/* активный пункт навигации */
if('IntersectionObserver' in W){
 var navLinks=$$('.nav a'), secMap={};
 navLinks.forEach(function(a){secMap[a.getAttribute('href').slice(1)]=a});
 var navIO=new IntersectionObserver(function(es){es.forEach(function(e){var a=secMap[e.target.id];if(!a)return;if(e.isIntersecting){navLinks.forEach(function(x){x.classList.toggle('on',x===a)})}})},{rootMargin:'-45% 0px -50% 0px'});
 Object.keys(secMap).forEach(function(id){var s=D.getElementById(id);if(s)navIO.observe(s)});
}

/* ═════════ ПОЯВЛЕНИЕ И СЧЁТЧИКИ ═════════ */
function countTo(el){
 var to=+el.dataset.count; if(el.dataset.done)return; el.dataset.done='1';
 if(RM){el.textContent=to;return;}
 var t0=null, dur=1500+Math.min(to,250)*2;
 el.textContent='0';
 function step(t){if(t0===null)t0=t;var p=clamp((t-t0)/dur,0,1),e=1-Math.pow(1-p,3);el.textContent=Math.round(to*e);if(p<1)requestAnimationFrame(step);}
 requestAnimationFrame(step);
}
var revealEls=$$('.rv,.path'), counters=$$('[data-count]');
if('IntersectionObserver' in W&&!RM){
 var rIO=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');rIO.unobserve(e.target);}})},{rootMargin:'0px 0px -8% 0px',threshold:0.01});
 revealEls.forEach(function(el){rIO.observe(el)});
 var cIO=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){cIO.unobserve(e.target);setTimeout(function(){countTo(e.target)},e.target.closest('.hero')?850:150);}})},{threshold:.4});
 counters.forEach(function(el){el.textContent='0';cIO.observe(el)});
}else{
 revealEls.forEach(function(el){el.classList.add('in')});
}

/* ═════════ СТАЛЬНОЙ ЗНАК: наклон за курсором, уход вглубь при прокрутке ═════════ */
(function(){
 var emb=$('#emb'), rig=$('#embRig'), sheen=$('.emb-sheen'), hero=$('#top');
 if(!emb||!rig) return;
 if(RM){rig.style.transform='none';return;}
 var MAX=8;                         /* ≤ 8° за курсором */
 var tx=0,ty=0,cx=0,cy=0;           /* поворот X/Y: цель и текущее */
 var tz=0,cz=-280;                  /* глубина: интро выходит из глубины */
 var tl=32,tm=22,cl=32,cm=22;       /* блик */
 var run=false, visible=true;
 function frame(){
  cx+=(tx-cx)*.085; cy+=(ty-cy)*.085; cz+=(tz-cz)*.09; cl+=(tl-cl)*.1; cm+=(tm-cm)*.1;
  var p=clamp(-tz/340,0,1);
  rig.style.transform='translate3d(0,'+(p*-4).toFixed(2)+'%,'+cz.toFixed(1)+'px) rotateX('+(cx+p*9).toFixed(2)+'deg) rotateY('+cy.toFixed(2)+'deg)';
  rig.style.opacity=(1-p*.55).toFixed(3);
  if(sheen){sheen.style.setProperty('--lx',cl.toFixed(1)+'%');sheen.style.setProperty('--ly',cm.toFixed(1)+'%');}
  if(Math.abs(tx-cx)+Math.abs(ty-cy)+Math.abs(tz-cz)+Math.abs(tl-cl)+Math.abs(tm-cm)>.02&&visible){requestAnimationFrame(frame);}else{run=false;}
 }
 function kick(){if(!run&&visible){run=true;requestAnimationFrame(frame);}}
 function onScroll(){
  var h=hero.offsetHeight||W.innerHeight;
  tz=-clamp(W.pageYOffset/(h*.9),0,1)*340;
  kick();
 }
 if(FINE){
  W.addEventListener('pointermove',function(e){
   if(!visible||e.pointerType==='touch')return;
   var r=emb.getBoundingClientRect(), mx=r.left+r.width/2, my=r.top+r.height/2;
   var nx=clamp((e.clientX-mx)/(W.innerWidth*.5),-1,1), ny=clamp((e.clientY-my)/(W.innerHeight*.5),-1,1);
   ty=nx*MAX; tx=-ny*MAX; tl=50+nx*34; tm=40+ny*34; kick();
  },{passive:true});
  D.documentElement.addEventListener('pointerleave',function(){tx=ty=0;tl=32;tm=22;kick();});
 }
 if('IntersectionObserver' in W){
  new IntersectionObserver(function(es){visible=es[0].isIntersecting;if(visible)kick();},{threshold:0}).observe(hero);
 }
 W.addEventListener('scroll',onScroll,{passive:true});
 setTimeout(function(){onScroll();kick();},150);
})();

/* ═════════ 01 НАПРАВЛЕНИЯ → СПРАВКА ═════════ */
var catDlg=$('#catDlg'), catBody=$('#catBody');
function openDlg(d){ if(typeof d.showModal==='function'){d.showModal();}else{d.setAttribute('open','');} }
function closeDlg(d){ if(typeof d.close==='function'){d.close();}else{d.removeAttribute('open');} }
function openCat(i){
 var c=S.cats&&S.cats[i]; if(!c) return;
 var di=CAT_DIR[i], prep=(di>=0&&di<8&&S.prep[di])?S.prep[di]:S.prepAll;
 catBody.innerHTML=
  '<p class="dw-g mono">Справка по категории · '+esc(c.group)+'</p>'+
  '<p class="dw-norm" aria-hidden="true">'+esc(c.norm)+'</p>'+
  '<h2 class="dw-t" id="catT">'+esc(c.title)+'</h2>'+
  c.blocks.map(function(b,k){return '<div class="dw-b" style="--k:'+k+'"><h4>'+esc(b.label)+'</h4><p>'+esc(b.text)+'</p></div>'}).join('')+
  (c.status?'<p class="dw-st">'+esc(c.status)+'</p>':'')+
  (prep&&prep.length?'<div class="dw-prep"><p class="kick mono">Что подготовить</p><ul>'+prep.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></div>':'')+
  '<a class="btn btn-steel btn-lg btn-wide" href="#zayavka" data-dir="'+di+'" data-close><span>Разобрать мою ситуацию бесплатно</span><svg aria-hidden="true"><use href="#i-ar"/></svg></a>';
 openDlg(catDlg); catDlg.scrollTop=0;
}
$$('[data-cat]').forEach(function(b){b.addEventListener('click',function(){openCat(+b.dataset.cat)})});
$$('.dlg').forEach(function(d){
 d.addEventListener('click',function(e){
  if(e.target===d){closeDlg(d);return;}
  var x=e.target.closest('[data-close]'); if(x&&!x.hasAttribute('data-dir')){closeDlg(d);}
 });
});

/* ═════════ 02 РАЗБОР ОТКАЗА: пометки ═════════ */
var notes=$$('.note'), marks=$$('.mk');
function setNote(n){
 notes.forEach(function(b){b.setAttribute('aria-pressed',b.dataset.note===String(n)?'true':'false')});
 marks.forEach(function(m){m.classList.toggle('on',m.dataset.mk===String(n))});
}
notes.forEach(function(b){
 b.addEventListener('click',function(){setNote(b.dataset.note)});
 if(FINE) b.addEventListener('mouseenter',function(){marks.forEach(function(m){m.classList.toggle('on',m.dataset.mk===b.dataset.note)})});
});
var notesBox=$('#notes');
if(notesBox&&FINE) notesBox.addEventListener('mouseleave',function(){var a=$('.note[aria-pressed="true"]');setNote(a?a.dataset.note:0)});
marks.forEach(function(m){m.addEventListener('click',function(){setNote(m.dataset.mk)})});
(function(){var letter=$('#letter');if(!letter)return;
 if('IntersectionObserver' in W&&!RM){
  var touched=false;
  notes.concat(marks).forEach(function(x){x.addEventListener('click',function(){touched=true})});
  var lIO=new IntersectionObserver(function(es){if(es[0].isIntersecting){lIO.disconnect();
   /* юрист «проходит» по письму: 1 → 4, затем возвращается к первой пометке */
   [1,2,3,4,1].forEach(function(n,i){setTimeout(function(){if(!touched)setNote(n)},500+i*900)});
  }},{threshold:.4});
  lIO.observe(letter);
 }else setNote(1);
})();

/* ═════════ ПРОВЕРКА СРОКА ═════════ */
function mask(inp){inp.addEventListener('input',function(){var v=inp.value.replace(/\D/g,'').slice(0,8),o=v.slice(0,2);if(v.length>2)o+='.'+v.slice(2,4);if(v.length>4)o+='.'+v.slice(4);inp.value=o;})}
function parseDate(s){var m=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s||'');if(!m)return null;var d=new Date(+m[3],+m[2]-1,+m[1]);if(d.getDate()!==+m[1]||d.getMonth()!==+m[2]-1||+m[3]<1990)return null;return d}
function today(){var t=new Date();return new Date(t.getFullYear(),t.getMonth(),t.getDate())}
function term(d){var e=new Date(d.getTime());e.setMonth(e.getMonth()+3);var t=today(),days=Math.round((e-t)/864e5);return {end:e,days:days,future:d>t,p:clamp((t-d)/(e-d),0,1)}}
function leftTxt(n){return (n%10===1&&n%100!==11?'Остался ':'Осталось ')+n+' '+plural(n,'день','дня','дней')}
var cIn=$('#calcIn'), cOut=$('#calcOut'), cBig=$('#cBig'), cTxt=$('#cTxt'), cFill=$('#cFill'), cDot=$('#cDot'), cX=$('#cX');
function calc(){
 var s=cIn.value, d=parseDate(s); cX.hidden=true;
 function set(st,big,txt,p){cOut.dataset.state=st;cBig.textContent=big;cTxt.textContent=txt;var tw=cFill.parentNode.clientWidth;cFill.style.transform='scaleX('+p+')';cDot.style.transform='translate3d('+(p*tw).toFixed(1)+'px,0,0)';}
 if(s.length<10){set('empty','—',s.length?'Введите дату полностью: ДД.ММ.ГГГГ':'Результат появится здесь.',0);return;}
 if(!d){set('empty','—','Проверьте дату: ДД.ММ.ГГГГ',0);return;}
 var r=term(d);
 if(r.future){set('empty','—','Дата ещё не наступила — проверьте год.',0);return;}
 if(r.days>0) set('ok',r.days+' '+plural(r.days,'день','дня','дней'),leftTxt(r.days)+'. Срок истекает '+fmtDate(r.end)+'.',r.p);
 else if(r.days===0) set('ok','Сегодня','Сегодня последний день.',1);
 else {var n=-r.days;set('late','Срок истёк','Срок истёк '+fmtDate(r.end)+', просрочка '+n+' '+plural(n,'день','дня','дней')+'. Восстановление возможно по уважительной причине.',1);cX.hidden=false;}
}
if(cIn){mask(cIn);cIn.addEventListener('input',calc);calc();W.addEventListener('resize',calc);}

/* ═════════ 05 РЕЕСТР ═════════ */
var rows=$$('.rc'), flts=$$('.flt');
function toggleCase(tb,open){
 if(open==null) open=!tb.classList.contains('open');
 tb.classList.toggle('open',open);
 var b=$('.rc-b',tb); if(b) b.setAttribute('aria-expanded',open?'true':'false');
}
rows.forEach(function(tb){
 var row=$('.rc-row',tb);
 row.addEventListener('click',function(e){if(e.target.closest('a'))return;toggleCase(tb);});
});
function applyFilter(f){
 flts.forEach(function(x){x.setAttribute('aria-pressed',x.dataset.f===f?'true':'false')});
 rows.forEach(function(tb,i){
  var show=f==='all'||tb.dataset.f===f;
  tb.classList.toggle('gone',!show);
  if(show&&!RM&&tb.animate){tb.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'none'}],{duration:450,delay:i*35,easing:'cubic-bezier(.2,.7,.1,1)',fill:'backwards'});}
 });
}
flts.forEach(function(b){b.addEventListener('click',function(){applyFilter(b.dataset.f)})});
function openCase(num){
 var tb=D.getElementById('delo-'+num); if(!tb) return;
 if(tb.classList.contains('gone')) applyFilter('all');
 toggleCase(tb,true);
 setTimeout(function(){scrollToEl($('.rc-row',tb),12);var b=$('.rc-b',tb);if(b)b.focus({preventScroll:true});},RM?0:60);
}
D.addEventListener('click',function(e){var a=e.target.closest('[data-case]');if(!a)return;e.preventDefault();openCase(a.dataset.case);});
(function(){var m=/^#delo-(\d\d)$/.exec(location.hash);if(m)setTimeout(function(){openCase(m[1])},300);})();

/* ═════════ 08 ВОПРОСЫ: вкладки ═════════ */
var tabs=$$('.tab');
function selTab(t,focus){
 tabs.forEach(function(x){var on=x===t;x.setAttribute('aria-selected',on?'true':'false');x.tabIndex=on?0:-1;var p=D.getElementById(x.getAttribute('aria-controls'));if(p){p.hidden=!on;p.classList.remove('fp-in');if(on){void p.offsetWidth;p.classList.add('fp-in');}}});
 if(focus)t.focus();
}
tabs.forEach(function(t,i){
 t.addEventListener('click',function(){selTab(t)});
 t.addEventListener('keydown',function(e){var k=e.key,n=null;if(k==='ArrowRight'||k==='ArrowDown')n=tabs[(i+1)%tabs.length];else if(k==='ArrowLeft'||k==='ArrowUp')n=tabs[(i-1+tabs.length)%tabs.length];else if(k==='Home')n=tabs[0];else if(k==='End')n=tabs[tabs.length-1];if(n){e.preventDefault();selTab(n,true);}});
});

/* ═════════ 09 ЗАЯВКА ═════════ */
var lead=$('#lead'), sel=$('#dirSel'), prepList=$('#prepList'), prepFor=$('#prepFor'), textIn=$('#textIn'), dateIn=$('#dateIn'), dOut=$('#dateOut'), err=$('#formErr'), done=$('#done'), mailText='';
(S.dirs||[]).forEach(function(t,i){var o=D.createElement('option');o.value=String(i);o.textContent=t;sel.appendChild(o);});
function renderPrep(i){
 var ok=i>=0&&i<8&&S.prep&&S.prep[i], list=ok?S.prep[i]:(S.prepAll||[]);
 prepFor.textContent=ok?'· '+S.dirs[i].toLowerCase():'';
 prepList.innerHTML=list.map(function(x,k){return '<li style="--k:'+k+'">'+esc(x)+'</li>'}).join('');
}
function setWho(w){var r=$('#lead [name=who][value="'+w+'"]');if(r)r.checked=true;
 textIn.placeholder=w==='family'?'Кто он вам, где он сейчас, что пришло от ведомства и когда':'Что произошло и что ответило ведомство';}
function setDir(i,who){if(i==null||isNaN(i))return;sel.value=String(i);var f=sel.closest('.fld');if(f)f.classList.remove('bad');renderPrep(+i);if(who)setWho(who);}
sel.addEventListener('change',function(){renderPrep(sel.value===''?-1:+sel.value);sel.closest('.fld').classList.remove('bad');});
$$('#lead [name=who]').forEach(function(r){r.addEventListener('change',function(){setWho(r.value)})});
function dateOut(){
 var s=dateIn.value,d=parseDate(s);dOut.classList.remove('late');
 if(!s||s.length<10){dOut.textContent='';return;}
 if(!d){dOut.textContent='Проверьте дату: ДД.ММ.ГГГГ';return;}
 var r=term(d);if(r.future){dOut.textContent='Дата ещё не наступила — проверьте год.';return;}
 if(r.days>0)dOut.textContent=leftTxt(r.days)+'. Срок истекает '+fmtDate(r.end)+'.';
 else if(r.days===0)dOut.textContent='Сегодня последний день.';
 else{dOut.classList.add('late');dOut.textContent='Срок истёк '+fmtDate(r.end)+', просрочка '+(-r.days)+' '+plural(-r.days,'день','дня','дней')+'. Восстановление возможно по уважительной причине.';}
}
mask(dateIn);dateIn.addEventListener('input',dateOut);

function goForm(){
 var blank=$('#blank'); scrollToEl(W.innerWidth<=1020?blank:$('#zayavka'),12);
 var n=$('#fName'),t0=Date.now(),last=-1;
 (function wait(){var y=W.pageYOffset;if((y===last&&Date.now()-t0>250)||Date.now()-t0>1600||RM){if(n&&!n.value&&!lead.hidden)n.focus({preventScroll:true});return;}last=y;setTimeout(wait,90);})();
}
/* любой элемент с data-dir → заявка с выбранной ситуацией */
D.addEventListener('click',function(e){
 var t=e.target.closest('[data-dir]'); if(!t) return;
 e.preventDefault();
 setDir(+t.dataset.dir,t.dataset.who||'self');
 var dlg=t.closest('dialog');
 if(dlg){closeDlg(dlg);setTimeout(goForm,RM?0:120);}else goForm();
});
/* обычные якоря на форму — тоже с фокусом на поле */
$$('a[href="#zayavka"]:not([data-dir])').forEach(function(a){a.addEventListener('click',function(e){e.preventDefault();if(!menu.hidden)setMenu(false);goForm();})});
$('#calcGo').addEventListener('click',function(){if(parseDate(cIn.value)){dateIn.value=cIn.value;dateOut();}});

lead.addEventListener('submit',function(e){
 e.preventDefault();var f=lead.elements,bad=[];
 $$('.fld,.agree',lead).forEach(function(x){x.classList.remove('bad')});
 if(!f.name.value.trim())bad.push([f.name,'Укажите, как к вам обращаться']);
 if(f.contact.value.trim().length<5)bad.push([f.contact,'Укажите телефон или ник в Telegram']);
 if(!sel.value)bad.push([sel,'Выберите ситуацию — или «Другое или не знаю, как назвать»']);
 if(dateIn.value&&!parseDate(dateIn.value))bad.push([dateIn,'Проверьте дату: ДД.ММ.ГГГГ']);
 if(!f.agree.checked)bad.push([f.agree,'Нужно согласие на обработку данных']);
 bad.forEach(function(b){var p=b[0].closest('.fld,.agree');if(p)p.classList.add('bad');b[0].setAttribute('aria-invalid','true');});
 $$('[aria-invalid]',lead).forEach(function(x){if(!bad.some(function(b){return b[0]===x}))x.removeAttribute('aria-invalid')});
 if(bad.length){err.textContent=bad[0][1];err.hidden=false;bad[0][0].focus();return;}
 err.hidden=true;
 var dir=S.dirs[+sel.value]||'', family=(lead.querySelector('[name=who]:checked')||{}).value==='family';
 mailText='Заявка с сайта\nИмя: '+f.name.value.trim()+'\nКонтакт: '+f.contact.value.trim()+'\nСитуация: '+dir+
  '\nПишет: '+(family?'родственник':'сам')+(dateIn.value?'\nДата получения отказа: '+dateIn.value+(dOut.textContent?' ('+dOut.textContent+')':''):'')+
  (f.text.value.trim()?'\nКоротко: '+f.text.value.trim():'');
 var body=mailText.length>1400?mailText.slice(0,1400)+'…\n(полный текст скопируйте кнопкой «Скопировать текст» на сайте)':mailText;
 var href='mailto:yujiklop74@yandex.ru?subject='+encodeURIComponent('Заявка с сайта — '+dir)+'&body='+encodeURIComponent(body);
 try{var a=D.createElement('a');a.href=href;a.style.display='none';D.body.appendChild(a);a.click();a.remove();}catch(x){location.href=href;}
 lead.hidden=true;done.hidden=false;done.focus({preventScroll:true});
});
$('#copyBtn').addEventListener('click',function(){var lb=$('span',this);
 function ok(){lb.textContent='Скопировано';setTimeout(function(){lb.textContent='Скопировать текст'},2400);}
 function fb(){var t=D.createElement('textarea');t.value=mailText;t.setAttribute('readonly','');t.style.position='fixed';t.style.opacity='0';D.body.appendChild(t);t.select();try{D.execCommand('copy');ok();}catch(x){}t.remove();}
 if(navigator.clipboard&&navigator.clipboard.writeText){navigator.clipboard.writeText(mailText).then(ok,fb);}else fb();});
$('#againBtn').addEventListener('click',function(){lead.hidden=false;done.hidden=true;lead.reset();dOut.textContent='';setWho('self');renderPrep(-1);$('#fName').focus();});

/* политика */
var policy=$('#policy');
D.addEventListener('click',function(e){var p=e.target.closest('[data-policy]');if(!p)return;e.preventDefault();openDlg(policy);});

/* ═════════ НИЖНЯЯ ПАНЕЛЬ (телефон) ═════════ */
var dock=$('#dock'), formVisible=false;
if('IntersectionObserver' in W){new IntersectionObserver(function(es){formVisible=es[0].isIntersecting;onDock();},{threshold:.05}).observe($('#zayavka'));}
function onDock(){dock.classList.toggle('show',W.pageYOffset>W.innerHeight*.7&&!formVisible)}

W.addEventListener('scroll',function(){onScrollHdr();onDock();},{passive:true});
onScrollHdr();onDock();
})();
