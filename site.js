(function(){
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});
  var t=document.createElement('div');t.className='scrolltape';t.setAttribute('aria-hidden','true');
  t.innerHTML='<span class="tape-label">TAPE</span><div class="tape-track"><div class="tape-fill"></div><div class="tape-dot"></div></div><span class="tape-pct">0%</span>';
  document.body.appendChild(t);
  var fill=t.querySelector('.tape-fill'),dot=t.querySelector('.tape-dot'),pct=t.querySelector('.tape-pct'),track=t.querySelector('.tape-track');
  function upd(){var h=document.documentElement.scrollHeight-window.innerHeight,p=h>0?Math.min(1,(window.scrollY||window.pageYOffset)/h):0,th=track.clientHeight;fill.style.height=(p*th)+'px';dot.style.top=(p*th)+'px';pct.textContent=Math.round(p*100)+'%';}
  window.addEventListener('scroll',upd,{passive:true});window.addEventListener('resize',upd);upd();
})();
