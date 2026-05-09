/* 
  GRADEO Core Behavioral Module
  Modular JS for Professional Scaling
*/

export const escapeHTML = (str) => (str || '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));

export const initAuthUI = (auth, providers) => {
    const siModal = document.getElementById('siModal');
    const openAuthModal = () => siModal?.classList.add('on');
    const closeAuthModal = () => siModal?.classList.remove('on');

    const closeBtn = document.getElementById('close-auth');
    if(closeBtn) closeBtn.onclick = closeAuthModal;

    const googleBtn = document.getElementById('siBtnGoogle');
    if(googleBtn) googleBtn.onclick = () => {
        providers.signInWithPopup(auth, providers.google).then(closeAuthModal).catch(e => alert("Sign-in failed: " + e.message));
    };

    const githubBtn = document.getElementById('siBtnGithub');
    if(githubBtn) githubBtn.onclick = () => {
        providers.signInWithPopup(auth, providers.github).then(closeAuthModal).catch(e => alert("GitHub sign-in failed. Try Google."));
    };

    const emailToggle = document.getElementById('siBtnEmailToggle');
    if(emailToggle) emailToggle.onclick = () => {
        const ef = document.getElementById('siEmailForm');
        if(ef) ef.style.display = ef.style.display === 'none' ? 'flex' : 'none';
    };

    const emailSignIn = document.getElementById('siBtnEmailSignIn');
    if(emailSignIn) emailSignIn.onclick = () => {
        const email = document.getElementById('siEmail')?.value;
        const pass = document.getElementById('siPass')?.value;
        providers.signInWithEmailAndPassword(auth, email, pass).then(closeAuthModal).catch(e => alert(e.message));
    };

    const emailCreate = document.getElementById('siBtnEmailCreate');
    if(emailCreate) emailCreate.onclick = () => {
        const email = document.getElementById('siEmail')?.value;
        const pass = document.getElementById('siPass')?.value;
        providers.createUserWithEmailAndPassword(auth, email, pass).then(closeAuthModal).catch(e => alert(e.message));
    };

    return { openAuthModal, closeAuthModal };
};

export const syncUserUI = (user, lucide) => {
    window._gradeoUser = user;
    const btn = document.getElementById('account-btn');
    if(user && btn) {
        btn.innerHTML = `<img src="${user.photoURL || 'https://api.dicebear.com/7.x/avataaars/svg?seed=' + user.email}" style="width:20px; height:20px; border-radius:50%; border: 1.5px solid var(--o);"> <span>${user.displayName || 'Account'}</span>`;
    } else if(btn) {
        btn.innerHTML = `<i data-lucide="user" size="18"></i> <span>Account</span>`;
        if(lucide) lucide.createIcons();
    }
};

// Auto-initialize theme
const theme = localStorage.getItem('gradeo_theme') || 'light';
document.documentElement.setAttribute('data-theme', theme);
