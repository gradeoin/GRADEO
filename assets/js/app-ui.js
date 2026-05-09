/* GRADEO UI Interactions v2.0 — Parallax, Cursor, Tilt, and Animations */

(function initUI(){
  const isTouch = () => window.matchMedia('(hover:none)').matches;
  const prefersReduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Intro Glitch */
  (function(){
    try{
      if(sessionStorage.getItem('gd_intro_done')) return;
      document.body.classList.add('intro-glitch');
      setTimeout(function(){
        document.body.classList.remove('intro-glitch');
        sessionStorage.setItem('gd_intro_done','1');
      }, 1200);
    }catch(e){}
  })();

  /* Desktop Cursor */
  (function(){
    if(isTouch() || window.innerWidth < 1024 || prefersReduce) return;
    const dot=$('#cur'), ring=$('#curRing'); if(!dot || !ring) return;
    let mx=0,my=0,rx=0,ry=0, rAFid=null, moved=false;
    function moveDot(x,y){ dot.style.transform=`translate(calc(${x}px - 50%),calc(${y}px - 50%))`; }
    function moveRing(){ rx+=(mx-rx)*.18; ry+=(my-ry)*.18; ring.style.transform=`translate(calc(${rx.toFixed(1)}px - 50%),calc(${ry.toFixed(1)}px - 50%))`; if(Math.abs(mx-rx)>0.3 || Math.abs(my-ry)>0.3){ rAFid=requestAnimationFrame(moveRing);} else { rAFid=null; } }
    document.addEventListener('mousemove',e=>{ mx=e.clientX; my=e.clientY; moveDot(mx,my); if(!moved){moved=true; document.body.classList.add('cur-ready');} if(!rAFid) rAFid=requestAnimationFrame(moveRing); }, {passive:true});
    document.addEventListener('mouseleave',()=>{ document.body.classList.remove('cur-ready','ch'); moved=false; });
    document.addEventListener('mouseenter',()=>{ if(moved) document.body.classList.add('cur-ready'); });
    document.addEventListener('mousedown',()=>document.body.classList.add('cc'));
    document.addEventListener('mouseup',  ()=>document.body.classList.remove('cc'));
    let hoverCount=0; $$('a,button,.tile,.feat,.fi2,.card,[role=button]').forEach(el=>{
      el.addEventListener('mouseenter',()=>{hoverCount++;document.body.classList.add('ch');});
      el.addEventListener('mouseleave',()=>{hoverCount=Math.max(0,hoverCount-1); if(!hoverCount) document.body.classList.remove('ch');});
    });
  })();

  /* Scroll Progress & Header */
  const pb=$('#pb'), hdr=$('#hdr'), btt=$('#btt'); let _raf=false;
  window.addEventListener('scroll',()=>{ if(_raf) return; _raf=true; requestAnimationFrame(()=>{ _raf=false; const d=document.documentElement,s=d.scrollTop,h=d.scrollHeight-d.clientHeight; if(pb) pb.style.width=(h>0?Math.round(s/h*1000)/10:0)+'%'; if(hdr) hdr.classList.toggle('scrolled', s>20); if(btt) btt.classList.toggle('on', s>280); }); }, {passive:true});

  /* Parallax Background */
  if(!isTouch()){
    const MAX=5; document.addEventListener('mousemove',e=>{ const cx=(e.clientX/innerWidth-.5)*MAX*2; const cy=(e.clientY/innerHeight-.5)*MAX*2; $$('.bg1,.bg2,.bg3,.bg4').forEach((b,i)=>{ const d=[1.2,1,.8,.6][i]??1; b.style.transform=`translate(${cx*d*.6}px,${cy*d*.4}px)`;}); }, {passive:true});
  }

  /* Tiles & Buttons Tilt */
  if(!isTouch()){
    $$('.tile').forEach(tile=>{ tile.addEventListener('mousemove',e=>{ const r=tile.getBoundingClientRect(); const x=(e.clientX-r.left)/r.width-.5, y=(e.clientY-r.top)/r.height-.5; tile.style.setProperty('--tilt',`translateY(-5px) rotateX(${(-y*6).toFixed(2)}deg) rotateY(${(x*6).toFixed(2)}deg) scale(1.012)`); tile.style.transform='var(--tilt)'; }); tile.addEventListener('mouseleave',()=>{ tile.style.removeProperty('--tilt'); tile.style.transform=''; }); tile.addEventListener('mousedown',()=>tile.style.transform=''); });
    $$('.bp,.bs').forEach(btn=>{ btn.addEventListener('mousemove',e=>{ const r=btn.getBoundingClientRect(); const dx=(e.clientX-r.left-r.width/2)/r.width, dy=(e.clientY-r.top-r.height/2)/r.height; btn.style.setProperty('--btilt',`translateY(-3px) scale(1.02) translate(${(dx*5).toFixed(2)}px,${(dy*3).toFixed(2)}px)`); btn.style.transform='var(--btilt)'; }); btn.addEventListener('mouseleave',()=>{ btn.style.removeProperty('--btilt'); btn.style.transform=''; }); btn.addEventListener('mousedown',()=>btn.style.transform=''); });
  }

  /* FAQ System */
  function faq(el){ const i=el.closest('.fi2'); if(!i) return; const o=i.classList.contains('open'); $$('.fi2.open').forEach(x=>{ x.classList.remove('open'); x.querySelector('.fq')?.setAttribute('aria-expanded','false'); }); if(!o){ i.classList.add('open'); el.setAttribute('aria-expanded','true'); vib([4,8,4]); } }
  $$('.fq').forEach(q=>q.addEventListener('keydown',e=>{ if(e.key==='Enter'|| e.key===' '){ e.preventDefault(); faq(q); }}));
  window.faq = faq;

  /* Haptics Wiring */
  $$('.mTile').forEach(el=>el.addEventListener('pointerdown',()=>vib(HV.medium)));
  $$('.btn.bp').forEach(el=>el.addEventListener('pointerdown',()=>vib(HV.strong)));
  $$('.btn.bs,.hsi-btn').forEach(el=>el.addEventListener('pointerdown',()=>vib(HV.light)));
  $$('.offerCTA').forEach(el=>el.addEventListener('pointerdown',()=>vib(HV.success)));

})();
