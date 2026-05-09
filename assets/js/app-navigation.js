/* GRADEO Navigation Module v2.0 — Recents, Tile events, and internal routing */

(function initNavigation(){
  /* Recents Management */
  window.rr = function(){ 
    ['#rl','#mRl'].forEach(sel=>{ 
        const b=$(sel); if(!b) return; 
        const a=JSON.parse(localStorage.getItem(RK) ?? '[]'); 
        b.innerHTML=''; 
        if(!a.length){ b.innerHTML='<span style="font-size:11px;color:var(--muted2)">No recents yet</span>'; return; } 
        const l={m1:'Planner',m2:'SGPA',m3:'CGPA'}; 
        a.forEach(m=>{ 
            const x=document.createElement('button'); x.className='rc'; x.type='button'; 
            x.innerHTML=`<span class="rd"></span>${l[m] ?? m}`; 
            x.addEventListener('click',()=>om2(m)); 
            b.appendChild(x); 
        }); 
    }); 
  };

  window.pr = function(m){ 
    const a=JSON.parse(localStorage.getItem(RK) ?? '[]'); 
    const n=[m, ...a.filter(x=>x!==m)].slice(0,3); 
    localStorage.setItem(RK, JSON.stringify(n)); 
    localStorage.setItem('gradeo_last_mode', m); 
    rr(); 
  };

  window.om2 = function(m){ if(m) pr(m); navTo(MU[m] ?? MU.m2); };

  /* Tile & Link Event Wiring */
  $$('.tile[data-mode]').forEach(el=>{ 
    el.addEventListener('click',()=>om2(el.dataset.mode)); 
    el.addEventListener('keydown',e=>{ if(e.key==='Enter' || e.key===' '){ e.preventDefault(); om2(el.dataset.mode); }}); 
  });
  $$('.mTile[data-mode]').forEach(el=>el.addEventListener('click',()=>om2(el.dataset.mode)));

  /* Shared UI Actions */
  $('#rcl')?.addEventListener('click',()=>{ localStorage.removeItem(RK); localStorage.removeItem('gradeo_last_mode'); rr(); toast('Recents cleared'); });
  $('#mRcl')?.addEventListener('click',()=>{ localStorage.removeItem(RK); localStorage.removeItem('gradeo_last_mode'); rr(); toast('Recents cleared'); });
  
  window.goM = function(){ if(isMob()){ if(typeof goTab === 'function') goTab(1);} else { $('#modes')?.scrollIntoView({behavior:'smooth',block:'start'});} };
  
  $('#brd')?.addEventListener('click', e => {
      if(location.hostname === new URL(SITE).hostname) window.scrollTo({top:0,behavior:'smooth'});
      else location.href = '/';
  });

  /* Initial call */
  rr();

})();
