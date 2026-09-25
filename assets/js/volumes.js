(function(){var R=document.documentElement,RM=R.classList.contains('rm');var vols=[].slice.call(document.querySelectorAll('[data-vol]'));
function punch(oc,page){var st=oc.querySelector('.stamp');if(!st)return;st.classList.remove('hit');void st.offsetWidth;st.classList.add('hit');
  if(RM)return;
  /* v9 · 7: у «В суде» / «В работе» вспышки нет; у выигранного — не дальше 12px от рамки штампа */
  var go=st.classList.contains('stamp-go');
  setTimeout(function(){oc.classList.remove('knock');page.classList.remove('knock');void oc.offsetWidth;oc.classList.add('knock');page.classList.add('knock');
    if(go)return;
    var ink=st.querySelector('.st-ink')||st,r=ink.getBoundingClientRect(),o=oc.getBoundingClientRect(),f=document.createElement('span');f.className='ink-flash';
    f.style.width=(r.width+24)+'px';f.style.height=(r.height+24)+'px';f.style.borderRadius='14px';f.style.left=(r.left-o.left-12)+'px';f.style.top=(r.top-o.top-12)+'px';oc.appendChild(f);
    requestAnimationFrame(function(){f.classList.add('go')});setTimeout(function(){f.remove()},900);},300);}
function setup(v){var page=v.querySelector('.vA-page'),ocs=[].slice.call(v.querySelectorAll('.oc')),q=[],busy=false,io=null;
  function next(){if(!q.length){busy=false;return;}busy=true;punch(q.shift(),page);setTimeout(next,RM?0:560);}
  function arm(){if(io)io.disconnect();q=[];busy=false;
    if(!('IntersectionObserver' in window)){ocs.forEach(function(o){q.push(o)});next();return;}
    io=new IntersectionObserver(function(es){es.filter(function(e){return e.isIntersecting}).sort(function(a,b){return a.boundingClientRect.top-b.boundingClientRect.top})
      .forEach(function(e){io.unobserve(e.target);q.push(e.target);});if(!busy)next();},{threshold:.6});ocs.forEach(function(o){io.observe(o)});}
  function play(){v.classList.remove('open','untie','shown');ocs.forEach(function(o){var s=o.querySelector('.stamp');if(s)s.classList.remove('hit')});void v.offsetWidth;
    if(RM||innerWidth<=900){v.classList.add('open','shown');setTimeout(arm,RM?0:500);return;}
    setTimeout(function(){v.classList.add('untie')},80);setTimeout(function(){v.classList.add('open')},520);
    setTimeout(function(){v.classList.add('shown')},1450);setTimeout(arm,2000);}
  v.__play=play;
  if('IntersectionObserver' in window){var o=new IntersectionObserver(function(es){if(es[0].isIntersecting){o.disconnect();play();}},{rootMargin:'0px 0px -38% 0px',threshold:0});o.observe(v);}else play();}
/* v8: левая половина (оборот обложки) лежит поверх страницы абсолютно — страница не должна быть ниже её содержимого */
function fitBack(v){var page=v.querySelector('.vA-page'),cvb=v.querySelector('.cvb');if(!page||!cvb)return;
  if(innerWidth<=900){page.style.minHeight='';return;}
  var cs=getComputedStyle(cvb),h=parseFloat(cs.paddingTop)+parseFloat(cs.paddingBottom);
  [].forEach.call(cvb.children,function(c){var s=getComputedStyle(c);h+=c.offsetHeight+(c.classList.contains('cvb-end')?0:parseFloat(s.marginTop)||0)+(parseFloat(s.marginBottom)||0);});
  page.style.minHeight=Math.ceil(h)+'px';}
function fitAll(){vols.forEach(fitBack);}
/* v9 · Q7: порядок Tab = порядок чтения. Открытый том (>900px): левая страница (оборот обложки), потом правая — лист идёт после обложки.
   Узкий экран: обложка → лист → оборот — лист переносится внутрь .vA-flip (там display:contents) между лицевой стороной и оборотом. */
var MQ=window.matchMedia?matchMedia('(max-width:900px)'):null;
function place(v){var book=v.querySelector('.vA-book'),page=v.querySelector('.vA-page'),flip=v.querySelector('.vA-flip'),back=flip&&flip.querySelector('.vA-back');if(!book||!page||!flip||!back)return;
  if(MQ&&MQ.matches){if(page.parentNode!==flip)flip.insertBefore(page,back);}
  else if(page.parentNode!==book||page.previousElementSibling!==flip){book.insertBefore(page,flip.nextSibling);}}
/* v9 · 3: разворот открытого тома (>900px) — «Что подготовить» с кнопками на правой странице; чтобы страницы были заполнены
   поровну, часть блоков переезжает между страницами (data-desk: left — на оборот обложки, page — на лист перед «Что подготовить»).
   На узком экране блоки стоят в порядке чтения, как в разметке. */
function arrange(v,desk){var page=v.querySelector('.vA-page'),cvb=v.querySelector('.cvb');if(!page||!cvb)return;
  if(!v.__desk){v.__desk=[].slice.call(v.querySelectorAll('[data-desk]'));v.__desk.forEach(function(el){el.__home=document.createComment('v9-home');el.parentNode.insertBefore(el.__home,el);});}
  var end=page.querySelector('.vA-end');
  v.__desk.forEach(function(el){if(desk){if(el.getAttribute('data-desk')==='left')cvb.appendChild(el);else page.insertBefore(el,end);}
    else{var h=el.__home;if(h.nextSibling!==el)h.parentNode.insertBefore(el,h.nextSibling);}});}
function placeAll(){vols.forEach(function(v){place(v);arrange(v,!(MQ&&MQ.matches));});}
placeAll();if(MQ){if(MQ.addEventListener)MQ.addEventListener('change',function(){placeAll();fitAll();});else if(MQ.addListener)MQ.addListener(function(){placeAll();fitAll();});}
fitAll();addEventListener('resize',fitAll,{passive:true});if(document.fonts&&document.fonts.ready)document.fonts.ready.then(fitAll);
if(document.fonts&&document.fonts.addEventListener)document.fonts.addEventListener('loadingdone',fitAll);
vols.forEach(setup);
window.__replay=function(){var v=vols.filter(function(x){var r=x.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0})[0]||vols[0];v.__play();};
})();
