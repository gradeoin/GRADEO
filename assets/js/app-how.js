/* GRADEO 'How It Works' Animation Module v2.0 */

(function initHowItWorks(){
  const isMob = () => window.innerWidth <= 767;
  if(!isMob()) return;

  const steps=[ 
    'Enter your internal marks and credits for each subject — takes about 30 seconds.', 
    'Set your target CGPA and your current CGPA so GRADEO knows the gap.', 
    'Instantly see the minimum marks you need in each final exam. Zero guesswork.' 
  ];
  const cgpaFrom=['7.4','7.8','8.1'], cgpaTo=['7.8','8.1','8.5'];
  const barW=[[.72,.58,.85],[.60,.74,.68],[.82,.65,.91]], pcts=[['72%','58%','85%'],['60%','74%','68%'],['82%','65%','91%']];
  let curStep=0, running=true;

  function animateCGPA(from,to,el){
    const s=performance.now(), fN=parseFloat(from), tN=parseFloat(to), dur=900;
    (function f(now){
      const p=Math.min((now-s)/dur,1), e=1-Math.pow(1-p,3);
      el.textContent=(fN+(tN-fN)*e).toFixed(1);
      if(p<1) requestAnimationFrame(f); else el.textContent=to;
    })(performance.now());
  }

  function goStep(n){
    curStep=((n%3)+3)%3;
    const desc=$('#mHowDesc'), cgpa=$('#mHowCGPA'); if(!desc || !cgpa) return;
    $$('.mHowStep').forEach((s,i)=>s.classList.toggle('active',i===curStep));
    desc.style.opacity='0';
    setTimeout(()=>{ desc.textContent=steps[curStep]; desc.style.opacity='1'; },200);
    animateCGPA(cgpaFrom[curStep], cgpaTo[curStep], cgpa);
    $$('.mHowBarFill').forEach((b,i)=>{ b.style.transform='scaleX('+barW[curStep][i]+')'; });
    $$('.mHowBarPct').forEach((el,i)=>{ el.textContent=pcts[curStep][i]; });
    if(typeof vib === 'function') vib([5]);
  }

  let auto=setInterval(()=>{ if(running) goStep(curStep+1); },2800);
  $$('.mHowStep').forEach((s,i)=>{ s.addEventListener('click',()=>{ clearInterval(auto); goStep(i); auto=setInterval(()=>{ if(running) goStep(curStep+1); },2800); }); });
  document.addEventListener('visibilitychange',()=>{ running=!document.hidden; });
  window._howRestart=()=>{ curStep=0; goStep(0); };
})();
