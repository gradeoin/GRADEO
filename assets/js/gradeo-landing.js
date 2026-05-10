/**
 * GRADEO Landing Page Logic
 * Specialized for high-performance animations and PWA experience.
 */

import { auth } from '../../core/firebase.js';
import { onAuthStateChanged, GoogleAuthProvider, GithubAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { initAuthUI, syncUserUI } from './gradeo-core.js';

// ── Auth Initialization ──
const providers = {
    google: new GoogleAuthProvider(),
    github: new GithubAuthProvider(),
    signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword
};

const { openAuthModal, closeAuthModal } = initAuthUI(auth, providers);

// Global user state
window._gradeoUser = null;

onAuthStateChanged(auth, user => {
    window._gradeoUser = user;
    syncUserUI(user, window.lucide);
    if(user) closeAuthModal();
});

// ── Interaction Logic ──
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
    setTimeout(() => {
        document.documentElement.classList.remove('loading');
    }, 100);
});

// ── Navigation Engine ──
window.navTo = (url) => {
    const ov = document.getElementById('ptOv');
    if(ov) ov.classList.add('lift');
    setTimeout(() => {
        window.location.href = url;
    }, 400);
};
