/* GRADEO PWA Module v2.0 — Service Worker, Install Prompts, and Offline handling */

(function initPWA(){
  if(location.protocol === 'file:') return;

  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) && !window.MSStream;
  const isInStandaloneMode = window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const ICON = 'https://res.cloudinary.com/djy3mjtsz/image/upload/v1770296454/Untitled-2_i2ezfh.png';

  /* Sheet helpers */
  const sheet = $('#pwaSheet');
  const backdrop = $('#pwaBackdrop');

  function openSheet(){
    if(!sheet || !backdrop) return;
    backdrop.style.display = 'block';
    sheet.style.display = 'block';
    requestAnimationFrame(() => { backdrop.classList.add('show'); sheet.classList.add('open'); });
  }
  function closeSheet(){
    if(!sheet || !backdrop) return;
    sheet.classList.remove('open');
    backdrop.classList.remove('show');
    setTimeout(() => { sheet.style.display = 'none'; backdrop.style.display = 'none'; }, 360);
  }
  backdrop?.addEventListener('click', closeSheet);

  /* Service Worker */
  let swReg = null;
  if('serviceWorker' in navigator){
    navigator.serviceWorker.register('/sw.js', { scope:'/', updateViaCache:'none' }).then(reg => {
      swReg = reg;
      reg.addEventListener('updatefound', () => {
        const nw = reg.installing;
        nw?.addEventListener('statechange', () => {
          if(nw.state === 'installed' && navigator.serviceWorker.controller){
            const upd = $('#swUpdate');
            if(upd){
              upd.style.display = 'block';
              requestAnimationFrame(() => upd.classList.add('show'));
              upd._doUpdate = () => reg.waiting?.postMessage({ type: 'SKIP_WAITING' });
            }
          }
        });
      });
    }).catch(e => console.warn('[GRADEO SW]', e));
  }

  /* Pull-to-refresh */
  if(isInStandaloneMode || isIOS){
    const hint = $('#ptrHint');
    const THRESHOLD = 80;
    let startY = 0, curY = 0, pulling = false;

    document.addEventListener('touchstart', e => { if(window.scrollY === 0) startY = e.touches[0].clientY; }, { passive: true });
    document.addEventListener('touchmove', e => {
      if(!startY || window.scrollY > 0) return;
      curY = e.touches[0].clientY;
      const dy = curY - startY;
      if(dy > 10){
        pulling = true;
        hint.style.display = 'block';
        hint.style.transform = `translate(-50%, ${Math.min(dy*0.5, 50)}px)`;
        hint.style.opacity = Math.min(dy/THRESHOLD, 1);
      }
    }, { passive: true });
    document.addEventListener('touchend', () => {
      if(pulling && (curY - startY) > THRESHOLD) location.reload();
      else if(hint){ hint.style.opacity = '0'; setTimeout(()=>hint.style.display='none',300); }
      pulling = false; startY = 0;
    });
  }

})();
