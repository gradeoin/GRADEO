/* GRADEO Legal & Compliance Module v2.0 */

(function initLegal(){
  /* Legal modal data */
  const MD={ 
    p:{t:'Privacy Policy', b:'<p><strong>Last updated 2026.</strong></p><p style="margin-top:9px">GRADEO stores your Google user ID, name and email in Firebase when you sign in. We do not sell or share this data.</p>'}, 
    t:{t:'Terms of Use', b:'<p>GRADEO is free for personal educational use. Results are estimates only.</p>'}, 
    d:{t:'Disclaimer', b:'<p>GRADEO is independent — not affiliated with any university. Actual grades may vary.</p>'} 
  };

  window.om = function(k){ const m=MD[k]; if(!m) return; $('#mt').textContent=m.t; $('#mb').innerHTML=m.b; $('#mbd').classList.add('on'); };
  window.cm = function(){ $('#mbd').classList.remove('on'); };

  /* Cookie Consent */
  window.accCookies = function(){ localStorage.setItem('gradeo_cookies','1'); $('#cb-banner').style.display='none'; };
  
  window.addEventListener('load',()=>{ 
    if(!localStorage.getItem('gradeo_cookies')) $('#cb-banner').style.display='block'; 
  });

  /* Event wiring */
  $('#fd')?.addEventListener('click',e=>{ e.preventDefault(); om('d'); });
  document.addEventListener('keydown',e=>{ if(e.key==='Escape'){ cm(); $('#siModal')?.classList.remove('on'); } });
})();
