/**
 * GRADEO Landing Page Logic
 * Specialized for high-performance animations and UI interactions.
 */
document.addEventListener('DOMContentLoaded', () => {
    // 1. Theme Toggle
    const themeBtn = document.getElementById('theme-toggle');
    if(themeBtn) {
        themeBtn.addEventListener('click', (e) => {
            const ripple = document.getElementById('thRipple');
            const current = document.documentElement.getAttribute('data-theme');
            const next = current === 'dark' ? 'light' : 'dark';
            
            // Effect
            if(ripple) {
                ripple.style.left = e.clientX + 'px';
                ripple.style.top = e.clientY + 'px';
                ripple.classList.remove('go');
                void ripple.offsetWidth;
                ripple.classList.add('go');
            }
            
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('gradeo_theme', next);
        });
    }

    // 2. Mobile Nav (Dynamic Island / Tabs)
    const mTabs = document.querySelectorAll('.mTab');
    const mTrack = document.getElementById('mTrack');
    if(mTrack) {
        mTabs.forEach(tab => {
            tab.addEventListener('click', () => {
                const idx = tab.dataset.idx;
                mTrack.style.transform = `translateX(-${idx * 100}vw)`;
                mTabs.forEach(t => t.classList.remove('on'));
                tab.classList.add('on');
            });
        });
    }

    // 3. FAQ Toggles
    document.querySelectorAll('.fq').forEach(fq => {
        fq.addEventListener('click', () => {
            fq.classList.toggle('on');
        });
    });

    // 4. Smooth Scroll reveal
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if(entry.isIntersecting) {
                entry.target.classList.add('reveal');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal-on-scroll').forEach(el => observer.observe(el));

    // 5. App Ready
});

// ── Navigation Engine ──
window.navTo = (url) => {
    const ov = document.getElementById('ptOv');
    if(ov) ov.classList.add('lift');
    setTimeout(() => {
        window.location.href = url;
    }, 400);
};
