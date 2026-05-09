/* GRADEO Mobile App Logic v2.0 — Tabs, Swipe, and Panel management */

(function initMobileApp(){
  const isMob = () => window.innerWidth <= 767;
  if(!isMob()) return;

  let curTab=0; const TABS=4; 
  const track=$('#mTrack'); 
  const panels=Array.from($('#mTrack')?.children ?? []);

  function setTrackWidth(){ if(track) track.style.width=(TABS*innerWidth)+'px'; } 
  setTrackWidth();
  window.addEventListener('resize', setTrackWidth);

  function updateDI(){ const di=$('#diIsland'); if(!di) return; di.classList.remove('diPulse'); void di.offsetWidth; di.classList.add('diPulse'); }

  function revealPanel(idx,dir){ 
    const panel=panels[idx]; if(!panel) return; 
    panel.classList.remove('entering-right','entering-left'); 
    if(dir!=null){ 
        void panel.offsetWidth; panel.classList.add(dir>0?'entering-right':'entering-left'); 
        setTimeout(()=>panel.classList.remove('entering-right','entering-left'),380);
    } 
    panel.querySelectorAll('.rv:not(.in)').forEach((el,i)=>{ setTimeout(()=>el.classList.add('in'), i*55); }); 
  }

  function goTab(idx,animate=true){ 
    if(!track) return; 
    const prev=curTab; curTab=Math.max(0,Math.min(TABS-1,idx)); 
    const w=innerWidth; 
    if(!animate){ track.classList.add('no-transition'); track.style.transform=`translateX(-${curTab*w}px)`; setTimeout(()=>track.classList.remove('no-transition'),20);} 
    else { track.classList.remove('no-transition'); track.style.transform=`translateX(-${curTab*w}px)`; } 
    $$('.mTab').forEach((t,i)=>t.classList.toggle('active',i===curTab)); 
    updateDI(); 
    if(curTab!==prev) if(typeof vib === 'function') vib(HV.tick); 
    const dir=curTab>prev?1:-1; 
    revealPanel(curTab, animate?dir:null); 
    if(curTab>0) $('#mBar')?.classList.add('mini'); else $('#mBar')?.classList.remove('mini'); 
  }

  window.goTab = goTab;
  window.revealPanel = revealPanel;

  /* Swipe Detection */
  (function initSwipe(){
    const vp=$('#mViewport'); if(!vp||!track) return;
    let sx=0,sy=0,startTab=0,dragging=false,blocked=false,lastX=0,velX=0,lastT=0;
    function base(){return startTab*innerWidth;}
    vp.addEventListener('touchstart',e=>{ sx=e.touches[0].clientX; sy=e.touches[0].clientY; lastX=sx; lastT=Date.now(); velX=0; startTab=curTab; dragging=false; blocked=false; track.classList.add('no-transition'); }, {passive:true});
    vp.addEventListener('touchmove',e=>{
      const cx=e.touches[0].clientX; const dx=cx-sx; const dy=e.touches[0].clientY-sy;
      const now=Date.now(); velX=(cx-lastX)/Math.max(1, (now-lastT)); lastX=cx; lastT=now;
      if(!dragging && !blocked){ if(Math.abs(dx)>7 && Math.abs(dx)>Math.abs(dy)*1.1) dragging=true; else if(Math.abs(dy)>10) blocked=true; }
      if(!dragging) return;
      e.preventDefault();
      const w=innerWidth; const raw=base()-dx; const clamp=Math.max(0, Math.min((TABS-1)*w, raw));
      track.style.transform=`translateX(-${clamp}px)`;
    }, {passive:false});
    vp.addEventListener('touchend',e=>{
      track.classList.remove('no-transition'); if(!dragging) return;
      const dx=e.changedTouches[0].clientX - sx;
      let next=startTab;
      if(dx<-40 || velX<-0.3) next=Math.min(TABS-1, startTab+1);
      else if(dx>40 || velX>0.3) next=Math.max(0, startTab-1);
      goTab(next);
    }, {passive:true});
  })();

  /* Initial reveal */
  setTimeout(()=>{ goTab(0, false); }, 100);

})();
