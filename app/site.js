(function(){
  // reveal-on-scroll — pre-reveals BEFORE content enters view (no scrolling into a void),
  // with a hard failsafe so nothing is ever left invisible.
  var reveals=document.querySelectorAll('.reveal');
  function showAll(){reveals.forEach(function(el){el.classList.add('in');});}
  if('IntersectionObserver' in window){
    var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target);}});},
      {threshold:0,rootMargin:'0px 0px 240px 0px'});   // reveal ~240px before it reaches the viewport
    reveals.forEach(function(el){io.observe(el);});
    // failsafe: reveal anything still hidden shortly after load (covers fast scroll / observer misses)
    setTimeout(showAll,2200);
  } else { showAll(); }

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
  var nav=document.querySelector(".topnav");
  if(nav){var tg=nav.querySelector(".nav-toggle");
    if(tg)tg.addEventListener("click",function(){nav.classList.toggle("open");});
    nav.querySelectorAll(".nav-links a").forEach(function(a){a.addEventListener("click",function(){nav.classList.remove("open");});});
  }

  // hero launch-video sound toggle — click is a user gesture, so audio is allowed
  window.heroSound=function(){
    var v=document.getElementById('heroVid'),b=document.getElementById('hvSound');if(!v)return;
    if(v.muted){v.muted=false;v.loop=false;v.currentTime=0;var p=v.play();if(p&&p.catch)p.catch(function(){});b.textContent='🔇 Mute';b.classList.add('on');}
    else{v.muted=true;b.textContent='🔊 Play with sound';b.classList.remove('on');}
  };

})();
