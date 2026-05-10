/* GRADEO Auth Module v2.0 — Firebase integration and user management */

(function initAuth(){
  let ps=false; // post-signin status

  function sIn(u){ 
    const n=u.displayName || 'Student', e=u.email||'', p=u.photoURL||''; 
    const hsl=$('#hsl'); if(hsl) hsl.textContent='Sign out'; 
    ['#gsb','#mGsb'].forEach(s=>{ const el=$(s); if(!el) return; el.textContent='Open calculator →'; el.onclick=()=>goM(); el.style.display=''; }); 
    const hw=$('#mHowCard'); if(hw) hw.style.display='none'; 
    ['#pout'].forEach(s=>{ const el=$(s); if(el) el.style.display='none';}); 
    ['#pin','#mPin','#prec','#mPrec'].forEach(s=>{ const el=$(s); if(el) el.style.display='';}); 
    ['#offp','#mOffp'].forEach(s=>{ const el=$(s); if(el) el.style.display='none';}); 
    const lm=localStorage.getItem('gradeo_last_mode'); 
    ['#olb','#mOlb'].forEach(s=>{ const el=$(s); if(el) el.style.display=lm?'':'none';}); 
    ['#un','#mUn'].forEach(s=>{ const el=$(s); if(el) el.textContent=n;}); 
    ['#ue','#mUe'].forEach(s=>{ const el=$(s); if(el) el.textContent=e;}); 
    [['#avi2','#avii'],['#mAvi2','#mAvii']].forEach(([imgSel,iniSel])=>{ const img=$(imgSel), ini=$(iniSel); if(!img||!ini) return; if(p){ img.src=p; img.style.display='block'; ini.style.display='none'; } else { ini.textContent=n[0].toUpperCase(); ini.style.display=''; img.style.display='none'; } }); 
    if(typeof rr === 'function') rr(); 
  }

  function sOut(){ 
    const hsl=$('#hsl'); if(hsl) hsl.textContent='Sign in'; 
    ['#gsb','#mGsb'].forEach(s=>{ const el=$(s); if(!el) return; el.textContent='Get started →'; el.onclick=()=>{ if(window.__a?.currentUser){ if(typeof goM === 'function') goM(); return;} doSI(()=>{ ps=true;}); }; el.style.display=''; }); 
    const hw=$('#mHowCard'); if(hw) hw.style.display=''; 
    if(typeof window._howRestart==='function') window._howRestart(); 
    ['#pout'].forEach(s=>{ const el=$(s); if(el) el.style.display='';}); 
    ['#pin','#mPin','#prec','#mPrec'].forEach(s=>{ const el=$(s); if(el) el.style.display='none';}); 
    ['#offp','#mOffp'].forEach(s=>{ const el=$(s); if(el) el.style.display='';}); 
    if(isMob() && typeof goTab === 'function') goTab(0); 
  }

  function doSI(after){ 
    if(!window.__a || !window.__p){ toast('Sign-in unavailable'); return; } 
    if(window.__a.currentUser){ if(after) after(); return; } 
    window._siAfter = after ?? null; $('#siModal')?.classList.add('on'); 
    const ef=$('#siEmailForm'); if(ef) ef.style.display='none'; 
  }

  function _doProviderSI(provider, btnId){ 
    const btn=$(btnId); if(btn) btn.classList.add('loading'); 
    const bs=[$('#hsi'),$('#gsb'),$('#mGsb')].filter(Boolean); 
    bs.forEach(b=>b.disabled=true); 
    window.__a.signInWithPopup(provider).then(()=>{ 
      if(btn) btn.classList.remove('loading'); 
      bs.forEach(b=>b.disabled=false); 
      $('#siModal')?.classList.remove('on'); 
      vib(HV.success); 
      if(window._siAfter){ window._siAfter(); window._siAfter=null; } 
      else if(ps){ ps=false; if(typeof goM === 'function') setTimeout(goM,160);} 
    }).catch(e=>{ 
      console.error(e); if(btn) btn.classList.remove('loading'); 
      bs.forEach(b=>b.disabled=false); 
      const msg = e.code==='auth/popup-closed-by-user'?'Sign-in cancelled' : 'Sign-in failed. Try again.'; 
      toast(msg); 
    }); 
  }

  /* Event Listeners */
  $('#siBtnGoogle')?.addEventListener('click',()=>{ if(!window.__a || !window.__p) return; _doProviderSI(window.__p, '#siBtnGoogle'); });
  $('#hsi')?.addEventListener('click',()=>{ if(window.__a?.currentUser){ window.__a.signOut().then(()=>{ toast('Signed out'); sOut(); }); return;} doSI(); });
  $('#gsb')?.addEventListener('click',()=>{ if(window.__a?.currentUser){ goM(); return;} doSI(()=>{ ps=true; }); });
  $('#mGsb')?.addEventListener('click',()=>{ if(window.__a?.currentUser){ goM(); return;} doSI(()=>{ ps=true; }); });

  /* Firebase Initialization */
  if(location.protocol!=='file:'){
    try {
      firebase.initializeApp({apiKey:'AIzaSyDB_FK8-3ATZBpuvfL34EMp9WHTTd5sfIo',authDomain:'gradeo-in.firebaseapp.com',projectId:'gradeo-in',storageBucket:'gradeo-in.firebasestorage.app',messagingSenderId:'784963451684',appId:'1:784963451684:web:9d57beed639d488e4891b1',measurementId:'G-JSNGKKMJEH'});
      const a=firebase.auth(), p=new firebase.auth.GoogleAuthProvider();
      a.setPersistence(firebase.auth.Auth.Persistence.LOCAL).catch(()=>{});
      window.__a=a; window.__p=p;
      a.onAuthStateChanged(u=>{ if(u) sIn(u); else sOut(); });
    } catch(e) { console.error('Firebase failed', e); sOut(); }
  } else { sOut(); }

})();
