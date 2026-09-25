/* «Порядок» — навигатор ситуаций, проверка срока, реестр, заявка.
   Vanilla JS, без зависимостей. Контент — из ../../assets/js/data.js (window.SITE). */
(function(){
'use strict';
var W=window, D=document;
var S=W.SITE||{cats:[],dirs:[],prep:[],prepAll:[],cases:{}};
var RM=W.matchMedia&&W.matchMedia('(prefers-reduced-motion: reduce)').matches;
function $(s,r){return (r||D).querySelector(s)}
function $$(s,r){return Array.prototype.slice.call((r||D).querySelectorAll(s))}
function esc(s){return String(s).replace(/[&<>"]/g,function(c){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]})}
function plural(n,a,b,c){n=Math.abs(n)%100;var m=n%10;if(n>10&&n<20)return c;if(m>1&&m<5)return b;if(m===1)return a;return c}
function fmtDate(d){function p(x){return (x<10?'0':'')+x}return p(d.getDate())+'.'+p(d.getMonth()+1)+'.'+d.getFullYear()}
function hdrH(){var h=$('#hdr');return h?h.offsetHeight:0}
function scrollToEl(el,cb){ if(!el)return; var y=el.getBoundingClientRect().top+W.pageYOffset-hdrH()-12;
  W.scrollTo({top:Math.max(0,y),behavior:RM?'auto':'smooth'}); if(cb){ var t0=Date.now(),last=-1;
  (function wait(){var p=W.pageYOffset; if(RM||(p===last&&Date.now()-t0>200)||Date.now()-t0>1500){cb();return;} last=p; setTimeout(wait,80);})(); } }

/* ═════ Меню (телефон) ═════ */
var menuB=$('#menuB'), menu=$('#menu');
function setMenu(open){ menuB.setAttribute('aria-expanded',open?'true':'false'); menu.hidden=!open; }
if(menuB){ menuB.addEventListener('click',function(){setMenu(menu.hidden)});
  menu.addEventListener('click',function(e){ if(e.target.closest('a')) setMenu(false); });
  D.addEventListener('keydown',function(e){ if(e.key==='Escape'&&!menu.hidden){setMenu(false);menuB.focus();} }); }

/* ═════ Навигатор «Что случилось?» ═════
   Для каждой ситуации (индекс SITE.dirs): категория SITE.cats, ярлык-норма и короткое описание
   — те же, что на папках основного сайта. */
var DIR=[
  {cat:1,s:'Ранение получено, документы поданы — а приказ о выплате не издан. Либо пришёл отказ: «травма получена не при исполнении обязанностей».'},
  {cat:2,s:'Страховщик признаёт случай, но платит по нижней планке или тянет с перечислением. Отдельно — неустойка за просрочку.'},
  {cat:3,s:'Ранение есть, но причинная связь записана не как «военная травма» — и человек теряет право на выплаты.'},
  {cat:5,s:'Инвалидность не установлена, установлена не та группа или снята при переосвидетельствовании. Спор о праве — исковое производство по ГПК РФ.'},
  {cat:4,s:'Уволен как негодный к службе, но единовременное пособие или ежемесячная компенсация не назначены.'},
  {cat:6,s:'Семья годами стоит в очереди — и её исключают из списка задним числом.'},
  {cat:0,s:'Региональный акт исключил вашу категорию из получателей выплаты. Спорим с самим актом, по которому отказали всем.'},
  {cat:11,title:'Банкротство военнослужащих',s:'С нуля — от подачи заявления до окончательного судебного акта. Кредиторы, жильё, управляющий, военные выплаты в конкурсной массе.',
    where:'АПК РФ, дело о банкротстве · арбитражный суд',term:'АПК РФ в деле о банкротстве — свои короткие сроки обжалования определений.',
    more:{href:'#bankrot',label:'Раздел о банкротстве'}},
  {cat:-1,title:'Другое или не знаю, как назвать',s:'Напишите одной строкой, что случилось, — дальше спрошу сам.',
    how:'Честный вывод, включая «оснований нет». Если спор есть — план по этапам и порядок обжалования: глава 21 или 22 КАС, иск по ГПК или обособленный спор в банкротстве.',
    where:'Порядок обжалования определяется после разбора официального ответа.'}
];
function block(c,label){ if(!c)return ''; for(var i=0;i<c.blocks.length;i++) if(c.blocks[i].label===label) return c.blocks[i].text; return ''; }
function casesFor(i){ var out=[]; for(var k in S.cases) if(S.cases[k].dir===i) out.push(S.cases[k]); return out; }

function cardHTML(i){
  var d=DIR[i]||DIR[8], c=S.cats[d.cat], title=d.title||(c&&c.title)||S.dirs[i]||'';
  var proc=block(c,'Порядок и срок'), cut=proc.indexOf(' — ');
  var where=d.where||(cut>0?proc.slice(0,cut):proc), term=d.term||(cut>0?proc.slice(cut+3):'');
  var how=d.how||block(c,'Как решается');
  var prep=(i>=0&&i<8&&S.prep[i])?S.prep[i]:(S.prepAll||[]);
  var rel=casesFor(i), st=c&&c.status?c.status:'';
  var h='';
  if(c) h+='<p class="card-norm"><span>Норма права</span><b>'+esc(c.norm)+'</b></p>';
  h+='<h3 class="card-t" id="cardT">'+esc(title)+'</h3>';
  if(d.s) h+='<p class="card-s">'+esc(d.s)+'</p>';
  if(how) h+='<div class="card-sec"><p class="card-k">Путь обжалования</p><p>'+esc(how)+'</p></div>';
  if(where||term){ h+='<div class="card-sec"><dl class="card-rows">';
    if(where) h+='<div><dt>Порядок и суд</dt><dd>'+esc(where)+'</dd></div>';
    if(term) h+='<div><dt>Срок</dt><dd>'+esc(term)+'</dd></div>';
    h+='</dl></div>'; }
  if(prep.length) h+='<div class="card-sec"><p class="card-k">Что подготовить</p><ul class="ticks">'+prep.map(function(x){return '<li>'+esc(x)+'</li>'}).join('')+'</ul></div>';
  if(st||rel.length){ h+='<p class="card-st">'+esc(st);
    if(rel.length) h+=(st?' ':'')+'Дела в реестре: '+rel.map(function(x){return '<a href="#delo-'+x.num+'" data-case-go="delo-'+x.num+'">'+x.num+'</a>'}).join(', ')+'.';
    h+='</p>'; }
  h+='<div class="btns"><a class="btn btn-p" href="#zayavka" data-dir-go="'+i+'">Получить разбор</a>';
  if(d.more) h+='<a class="btn btn-o" href="'+d.more.href+'">'+esc(d.more.label)+'</a>';
  else if(/Три месяца|три месяца/.test(term)) h+='<a class="btn btn-o" href="#srok">Проверить срок</a>';
  h+='</div>';
  return h;
}

var sits=$('#sits'), cardLi=$('#sitCardLi'), card=$('#sitCard'), cur=-1;
function cols(){ var g=getComputedStyle(sits).gridTemplateColumns; return g&&g!=='none'?g.split(' ').length:1; }
function placeCard(btn){
  var items=$$('li',sits).filter(function(li){return li!==cardLi});
  var li=btn.closest('li'), idx=items.indexOf(li), n=cols();
  var anchor=li;
  if(n>1&&!li.classList.contains('sit-li-other')){
    var end=Math.min(Math.floor(idx/n)*n+n-1,items.length-1);
    // «Другое» занимает всю строку — не прыгаем за него
    while(end>idx&&items[end].classList.contains('sit-li-other')) end--;
    anchor=items[end];
  }
  if(anchor.nextSibling!==cardLi) sits.insertBefore(cardLi,anchor.nextSibling);
}
function openSit(i,btn,opts){
  opts=opts||{};
  var before=btn.getBoundingClientRect().top;
  $$('.sit',sits).forEach(function(b){b.setAttribute('aria-expanded','false')});
  if(cur===i&&!opts.force){ cur=-1; cardLi.hidden=true; return; }
  cur=i; btn.setAttribute('aria-expanded','true');
  card.innerHTML=cardHTML(i);
  placeCard(btn); cardLi.hidden=false;
  // держим нажатую кнопку на месте, если карточка выше схлопнулась
  var after=btn.getBoundingClientRect().top; if(Math.abs(after-before)>1) W.scrollBy(0,after-before);
  card.classList.remove('in'); void card.offsetWidth; if(!RM) card.classList.add('in');
  // если карточка ушла за нижний край — мягко подтягиваем её
  var r=card.getBoundingClientRect(), vh=W.innerHeight, bar=$('#mbar'), barH=bar&&getComputedStyle(bar).display!=='none'?bar.offsetHeight:0;
  if(r.top>vh-barH-160){ scrollToEl(btn); }
}
if(sits){
  sits.addEventListener('click',function(e){ var b=e.target.closest('.sit'); if(!b)return; openSit(+b.dataset.dir,b); });
  var rT; W.addEventListener('resize',function(){ clearTimeout(rT); rT=setTimeout(function(){ if(cur>=0){var b=$('.sit[data-dir="'+cur+'"]',sits); if(b) placeCard(b);} },120); });
}

/* ═════ Проверка срока ═════ (та же логика, что на основном сайте: +3 месяца со дня получения отказа) */
function mask(inp){ inp.addEventListener('input',function(){ var v=inp.value.replace(/\D/g,'').slice(0,8), o=v.slice(0,2);
  if(v.length>2)o+='.'+v.slice(2,4); if(v.length>4)o+='.'+v.slice(4); inp.value=o; }); }
function parseDate(s){ var m=/^(\d{2})\.(\d{2})\.(\d{4})$/.exec(s||''); if(!m)return null; var d=new Date(+m[3],+m[2]-1,+m[1]);
  if(d.getDate()!==+m[1]||d.getMonth()!==+m[2]-1||+m[3]<1990)return null; return d; }
function today(){ var t=new Date(); return new Date(t.getFullYear(),t.getMonth(),t.getDate()); }
function term(d){ var e=new Date(d.getTime()); e.setMonth(e.getMonth()+3); var t=today(), days=Math.round((e-t)/864e5);
  return {end:e,days:days,future:d>t,p:Math.max(0,Math.min(1,(t-d)/(e-d)))}; }
function left(n){ return (n%10===1&&n%100!==11?'Остался ':'Осталось ')+n+' '+plural(n,'день','дня','дней'); }

var cIn=$('#calcIn'), cOut=$('#calcOut'), cBig=$('#cBig'), cTxt=$('#cTxt'), cFill=$('#cFill'), cX=$('#cX');
function calc(){ var s=cIn.value, d=parseDate(s); cX.hidden=true;
  function set(st,big,txt,p){ cOut.dataset.state=st; cBig.textContent=big; cTxt.textContent=txt; cFill.style.transform='scaleX('+p+')'; }
  if(s.length<10){ set('empty','—',s.length?'Введите дату полностью: ДД.ММ.ГГГГ':'Результат появится здесь.',0); return; }
  if(!d){ set('empty','—','Проверьте дату: ДД.ММ.ГГГГ',0); return; }
  var r=term(d);
  if(r.future){ set('empty','—','Дата ещё не наступила — проверьте год.',0); return; }
  if(r.days>0) set('ok',r.days+' '+plural(r.days,'день','дня','дней'),left(r.days)+'. Срок истекает '+fmtDate(r.end)+'.',r.p);
  else if(r.days===0) set('ok','Сегодня','Сегодня последний день.',1);
  else { var n=-r.days; set('late','Срок истёк','Срок истёк '+fmtDate(r.end)+', просрочка '+n+' '+plural(n,'день','дня','дней')+'. Восстановление возможно по уважительной причине.',1); cX.hidden=false; }
}
if(cIn){ mask(cIn); cIn.addEventListener('input',calc); calc(); }

/* ═════ Реестр: фильтр + открытие дела по ссылке ═════ */
var flts=$$('.flt');
flts.forEach(function(b){ b.addEventListener('click',function(){ var f=b.dataset.f;
  flts.forEach(function(x){x.setAttribute('aria-pressed',x===b?'true':'false')});
  $$('#cases .case').forEach(function(c){ c.classList.toggle('off',f!=='all'&&c.dataset.f!==f); }); }); });
function openCase(id){ var li=D.getElementById(id); if(!li)return;
  if(li.classList.contains('off')){ var all=$('.flt[data-f="all"]'); if(all) all.click(); }
  var det=$('details',li); if(det) det.open=true;
  scrollToEl(li,function(){ var s=$('summary',li); if(s) s.focus({preventScroll:true}); }); }

/* ═════ Заявка ═════ */
var lead=$('#lead'), sel=$('#dirSel'), prepList=$('#prepList'), prepFor=$('#prepFor'), textIn=$('#textIn'), dateIn=$('#dateIn'), dOut=$('#dateOut');
var err=$('#formErr'), done=$('#done'), mailText='';
function renderPrep(i){ var ok=i>=0&&i<8&&S.prep[i]; var list=ok?S.prep[i]:(S.prepAll||[]);
  prepFor.textContent=ok?'· '+S.dirs[i].toLowerCase():'';
  prepList.innerHTML=list.map(function(x){return '<li>'+esc(x)+'</li>'}).join(''); }
function setWho(w){ var r=$('#lead [name=who][value="'+w+'"]'); if(r) r.checked=true;
  textIn.placeholder=w==='family'?'Кто он вам, где он сейчас, что пришло от ведомства и когда':'Что произошло и что ответило ведомство'; }
function setDir(i){ if(i==null||isNaN(i))return; sel.value=String(i); sel.closest('.fld').classList.remove('bad'); renderPrep(+i); }
function dateOut(){ var s=dateIn.value, d=parseDate(s); dOut.classList.remove('late');
  if(!s||s.length<10){dOut.textContent='';return;} if(!d){dOut.textContent='Проверьте дату: ДД.ММ.ГГГГ';return;}
  var r=term(d); if(r.future){dOut.textContent='Дата ещё не наступила — проверьте год.';return;}
  if(r.days>0) dOut.textContent=left(r.days)+'. Срок истекает '+fmtDate(r.end)+'.';
  else if(r.days===0) dOut.textContent='Сегодня последний день.';
  else { dOut.classList.add('late'); dOut.textContent='Срок истёк '+fmtDate(r.end)+', просрочка '+(-r.days)+' '+plural(-r.days,'день','дня','дней')+'. Восстановление возможно по уважительной причине.'; } }
function goForm(){ var target=lead.hidden?done:lead; scrollToEl(W.innerWidth<1024?target:$('#zayavka'),function(){
  var n=$('#fName'); if(!lead.hidden&&n&&!n.value) n.focus({preventScroll:true}); }); }

if(lead){
  sel.addEventListener('change',function(){ renderPrep(+sel.value); sel.closest('.fld').classList.remove('bad'); });
  $$('#lead [name=who]').forEach(function(r){ r.addEventListener('change',function(){setWho(r.value)}); });
  mask(dateIn); dateIn.addEventListener('input',dateOut);

  // любые ссылки «в заявку»: data-dir-go="N" — с выбранной ситуацией
  D.addEventListener('click',function(e){
    var t=e.target.closest('[data-dir-go]'); if(t){ e.preventDefault();
      var v=t.getAttribute('data-dir-go'); if(v!=='') setDir(+v);
      if(t.dataset.who) setWho(t.dataset.who);
      goForm(); return; }
    var c=e.target.closest('[data-case-go]'); if(c){ e.preventDefault(); openCase(c.getAttribute('data-case-go')); return; }
    if(e.target.closest('#calcGo')){ e.preventDefault(); if(parseDate(cIn.value)){ dateIn.value=cIn.value; dateOut(); } goForm(); return; }
    var p=e.target.closest('[data-policy]'); if(p){ e.preventDefault(); var dl=$('#policy');
      if(dl.showModal) dl.showModal(); else dl.setAttribute('open',''); return; }
  });

  lead.addEventListener('submit',function(e){ e.preventDefault(); var f=lead.elements, bad=[];
    $$('.fld,.agree',lead).forEach(function(x){x.classList.remove('bad')});
    if(!f.name.value.trim()) bad.push([f.name,'Укажите, как к вам обращаться']);
    if(f.contact.value.trim().length<5) bad.push([f.contact,'Укажите телефон или ник в Telegram']);
    if(!sel.value) bad.push([sel,'Выберите ситуацию — или «Другое или не знаю, как назвать»']);
    if(dateIn.value&&!parseDate(dateIn.value)) bad.push([dateIn,'Проверьте дату: ДД.ММ.ГГГГ']);
    if(!f.agree.checked) bad.push([f.agree,'Нужно согласие на обработку данных']);
    if(bad.length){ bad.forEach(function(b){ var p=b[0].closest('.fld,.agree'); if(p) p.classList.add('bad'); b[0].setAttribute('aria-invalid','true'); });
      err.textContent=bad[0][1]; err.hidden=false; bad[0][0].focus(); return; }
    err.hidden=true; $$('[aria-invalid]',lead).forEach(function(x){x.removeAttribute('aria-invalid')});
    var dir=S.dirs[+sel.value]||sel.options[sel.selectedIndex].text, family=(lead.querySelector('[name=who]:checked')||{}).value==='family';
    mailText='Заявка с сайта\nИмя: '+f.name.value.trim()+'\nКонтакт: '+f.contact.value.trim()+'\nСитуация: '+dir+
      '\nПишет: '+(family?'родственник':'сам')+(dateIn.value?'\nДата получения отказа: '+dateIn.value+(dOut.textContent?' ('+dOut.textContent+')':''):'')+
      (f.text.value.trim()?'\nКоротко: '+f.text.value.trim():'');
    var body=mailText.length>1400?mailText.slice(0,1400)+'…\n(полный текст скопируйте кнопкой «Скопировать текст» на сайте)':mailText;
    var href='mailto:yujiklop74@yandex.ru?subject='+encodeURIComponent('Заявка с сайта — '+dir)+'&body='+encodeURIComponent(body);
    try{ var a=D.createElement('a'); a.href=href; a.style.display='none'; D.body.appendChild(a); a.click(); a.remove(); }catch(x){ location.href=href; }
    lead.hidden=true; done.hidden=false; done.focus({preventScroll:true});
    if(done.getBoundingClientRect().top<hdrH()) scrollToEl(done);
  });
  // снять подсветку ошибки при вводе
  lead.addEventListener('input',function(e){ var p=e.target.closest('.fld,.agree'); if(p){p.classList.remove('bad'); e.target.removeAttribute('aria-invalid');} });
  lead.addEventListener('change',function(e){ var p=e.target.closest('.agree'); if(p){p.classList.remove('bad'); e.target.removeAttribute('aria-invalid');} });

  $('#copyBtn').addEventListener('click',function(){ var b=this;
    function ok(){ b.textContent='Скопировано'; setTimeout(function(){b.textContent='Скопировать текст'},2400); }
    function fb(){ var t=D.createElement('textarea'); t.value=mailText; t.setAttribute('readonly',''); t.style.position='fixed'; t.style.opacity='0';
      D.body.appendChild(t); t.select(); try{D.execCommand('copy'); ok();}catch(x){} t.remove(); }
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(mailText).then(ok,fb); else fb(); });
  $('#againBtn').addEventListener('click',function(){ lead.hidden=false; done.hidden=true; lead.reset(); dOut.textContent=''; setWho('self'); renderPrep(-1); $('#fName').focus(); });
}

/* ═════ Нижняя панель: прячем, пока открыта клавиатура в форме ═════ */
var mbar=$('#mbar');
if(mbar){
  D.addEventListener('focusin',function(e){ if(e.target.matches('input:not([type=radio]):not([type=checkbox]),select,textarea')) mbar.classList.add('hide'); });
  D.addEventListener('focusout',function(){ setTimeout(function(){ var a=D.activeElement; if(!a||!a.matches||!a.matches('input:not([type=radio]):not([type=checkbox]),select,textarea')) mbar.classList.remove('hide'); },60); });
}

/* закрытие диалога кликом по фону */
var dlg=$('#policy');
if(dlg) dlg.addEventListener('click',function(e){ if(e.target===dlg&&dlg.close) dlg.close(); });
})();
