(function(){var R=document.documentElement,RM=R.classList.contains('rm');var vols=[].slice.call(document.querySelectorAll('[data-vol]'));
function punch(oc,page){var st=oc.querySelector('.stamp');if(!st)return;st.classList.remove('hit');void st.offsetWidth;st.classList.add('hit');
  if(RM)return;
  setTimeout(function(){oc.classList.remove('knock');page.classList.remove('knock');void oc.offsetWidth;oc.classList.add('knock');page.classList.add('knock');
    var r=st.getBoundingClientRect(),o=oc.getBoundingClientRect(),f=document.createElement('span');f.className='ink-flash';var s=Math.max(r.width,r.height)*1.9;
    f.style.width=f.style.height=s+'px';f.style.left=(r.left-o.left+r.width/2-s/2)+'px';f.style.top=(r.top-o.top+r.height/2-s/2)+'px';oc.appendChild(f);
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
vols.forEach(setup);
window.__replay=function(){var v=vols.filter(function(x){var r=x.getBoundingClientRect();return r.top<innerHeight&&r.bottom>0})[0]||vols[0];v.__play();};
})();
