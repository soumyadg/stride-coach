(function(){
  // reveal-on-scroll
  var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},{threshold:.12,rootMargin:'0px 0px -8% 0px'});
  document.querySelectorAll('.reveal').forEach(function(el){io.observe(el);});

  // scroll-progress "tape" — eased with requestAnimationFrame so it glides smoothly
  var t=document.createElement('div');t.className='scrolltape';t.setAttribute('aria-hidden','true');
  t.innerHTML='<span class="tape-label">TAPE</span><div class="tape-track"><div class="tape-fill"></div><div class="tape-dot"></div></div><span class="tape-pct">0%</span>';
  document.body.appendChild(t);
  var fill=t.querySelector('.tape-fill'),dot=t.querySelector('.tape-dot'),pct=t.querySelector('.tape-pct'),track=t.querySelector('.tape-track');
  var target=0,current=0,raf=0;
  function measure(){var h=document.documentElement.scrollHeight-window.innerHeight;target=h>0?Math.min(1,Math.max(0,(window.scrollY||window.pageYOffset)/h)):0;if(!raf)raf=requestAnimationFrame(tick);}
  function tick(){
    current+=(target-current)*0.14;                    // ease toward the scroll position
    if(Math.abs(target-current)<0.0004)current=target; // settle
    var th=track.clientHeight,y=current*th;
    fill.style.height=y+'px';dot.style.top=y+'px';pct.textContent=Math.round(current*100)+'%';
    if(Math.abs(target-current)>0.0004){raf=requestAnimationFrame(tick);}else{raf=0;}
  }
  window.addEventListener('scroll',measure,{passive:true});
  window.addEventListener('resize',measure);
  measure();
})();
