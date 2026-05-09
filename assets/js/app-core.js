/* GRADEO Core Engine v2.0 — Navigation, Theme, and global helpers */

const $  = (s) => document.querySelector(s);
const $$ = (s) => document.querySelectorAll(s);
const SITE='https://gradeo.in';
const MU={m1:'calculators/planner/index.html', m2:'calculators/sgpa/index.html', m3:'calculators/cgpa/index.html'};
const RK='gradeo_recents';
const isMob   = () => window.innerWidth <= 767;
const isTouch = () => window.matchMedia('(hover:none)').matches;

const HV={light:[8], medium:[14], strong:[20], tick:[6,8,6], success:[10,40,10,40,18], soft:[5,5,5]};
function vib(ms){ if(!isMob() || !('vibrate' in navigator)) return; try{navigator.vibrate(ms);}catch{} }

/* Year update */
['#yr','#mYr'].forEach(id=>{const el=$(id); if(el) el.textContent=new Date().getFullYear();});

/* Theme Management */
const htmlEl=document.documentElement, tc=$('#tcMeta');
function applyTheme(t, animate){
  const nextBg = (t==='dark'?'#080604':'#FFF6ED');
  if(animate){
    const ripple=$('#thRipple');
    const btn = isMob()? $('#mThBtn') : $('#thBtn');
    const rect = btn?.getBoundingClientRect?.();
    const cx = rect ? rect.left+rect.width/2 : innerWidth/2;
    const cy = rect ? rect.top +rect.height/2 : innerHeight/2;
    const d  = Math.hypot(innerWidth, innerHeight)*2.6;
    if(ripple){
      ripple.style.cssText = `background:${nextBg};width:${d}px;height:${d}px;left:${cx-d/2}px;top:${cy-d/2}px;`;
      ripple.classList.remove('go'); void ripple.offsetWidth; ripple.classList.add('go');
      setTimeout(()=>ripple.classList.remove('go'),460);
    }
    setTimeout(()=>{ htmlEl.setAttribute('data-theme',t); tc?.setAttribute('content',nextBg); },150);
  } else { htmlEl.setAttribute('data-theme',t); tc?.setAttribute('content',nextBg); }
  localStorage.setItem('gradeo_theme', t);
}
(function initTheme(){ 
    const s=localStorage.getItem('gradeo_theme'); 
    if(s) applyTheme(s,false); 
    else if(window.matchMedia('(prefers-color-scheme:dark)').matches) applyTheme('dark',false); 
})();

const toggleTheme=()=>{ applyTheme(htmlEl.dataset.theme==='dark'?'light':'dark',true); vib(HV.light); };
$('#thBtn')?.addEventListener('click',toggleTheme); $('#mThBtn')?.addEventListener('click',toggleTheme);

/* Navigation & Transitions */
window.addEventListener('pageshow', function(){
  window._navigating = false;
  const ov = $('#ptOv');
  if(ov) ov.classList.remove('lift');
  __gd_hideLoader();
});

function navTo(url){
  if(window._navigating) return;
  __gd_showLoader("Opening…");
  window._navigating = true;
  setTimeout(function(){ window._navigating = false; }, 2000);
  const ov = $('#ptOv');
  if(ov){
    ov.classList.add('lift');
    setTimeout(function(){ location.href=url; },380);
  } else {
    location.href = url;
  }
}

/* Loader Patches */
function __gd_showLoader(msg){
  try{const ov=document.getElementById('ldOv'); if(!ov) return; const m=document.getElementById('ldMsg'); if(m&&msg) m.textContent=msg; ov.classList.add('on'); ov.setAttribute('aria-hidden','false');}catch(e){}
}
function __gd_hideLoader(){
  try{const ov=document.getElementById('ldOv'); if(!ov) return; ov.classList.remove('on'); ov.setAttribute('aria-hidden','true');}catch(e){}
}

/* Toast System */
let _tt; function toast(msg){ const t=$('#toast'); if(!t) return; $('#tm').textContent=msg; t.classList.add('on'); clearTimeout(_tt); _tt=setTimeout(()=>t.classList.remove('on'),2600);} 
$('#tx')?.addEventListener('click',()=>$('#toast')?.classList.remove('on'));

/* Exporting globals for other modules */
window.$ = $; window.$$ = $$; window.navTo = navTo; window.toast = toast; window.vib = vib; window.HV = HV;

/* Initialization — Remove loading lock after assets are ready */
window.addEventListener('DOMContentLoaded', () => {
  requestAnimationFrame(()=>{
    requestAnimationFrame(()=>{
      document.documentElement.classList.remove('loading');
      document.body.classList.add('theme-ready');
      /* Fade in bg orbs smoothly */
      document.querySelectorAll('.bg1,.bg2,.bg3,.bg4').forEach(function(b){
        b.style.transition='opacity .6s ease';
        b.style.opacity='1';
      });
      __gd_hideLoader();
    });
  });
});
