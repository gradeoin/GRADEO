import { auth, db } from "../firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import { doc, getDoc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const NEXT_URL = "https://gradeo.in/"; // ✅ main website
const BACK_URL = "/offer";

const countEl = document.getElementById("count");
const fillEl = document.getElementById("fill");
const offerEl = document.getElementById("offerCode");
const helloEl = document.getElementById("helloText");
const noteEl = document.getElementById("noteText");

document.getElementById("goNow").addEventListener("click", () => location.href = NEXT_URL);
document.getElementById("back").addEventListener("click", () => location.href = BACK_URL);

function getPromo(){
  try { return JSON.parse(sessionStorage.getItem("promoParams") || "{}"); }
  catch { return {}; }
}

function setProgress(secondsLeft, total=6){
  const pct = ((total - secondsLeft) / total) * 100;
  fillEl.style.width = `${Math.min(100, Math.max(0, pct))}%`;
}

const promo = getPromo();
if (promo.offer) offerEl.textContent = promo.offer;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = BACK_URL;
    return;
  }

  helloEl.textContent = `Welcome, ${user.displayName || "Student"}! Activating your access…`;

  // Firestore claim write (idempotent)
  const offerKey = (promo.offer || "FREE1YEAR").replace(/\s+/g, "_").toLowerCase();
  const claimId = `${offerKey}_${user.uid}`;
  const ref = doc(db, "offerClaims", claimId);

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      noteEl.textContent = "✅ Offer already active for this Google account.";
    } else {
      await setDoc(ref, {
        uid: user.uid,
        email: user.email,
        name: user.displayName || null,
        offer: promo.offer || "FREE1YEAR",
        campaign: promo.campaign || "students",
        source: promo.src || "email",
        claimedAt: serverTimestamp()
      });
      noteEl.textContent = "✅ Access activated for your Google account.";
    }
  } catch (e) {
    // Still redirect even if Firestore isn't ready
    noteEl.textContent = "✅ Signed in successfully. Redirecting…";
  }

  // Countdown + progress
  let seconds = 6;
  countEl.textContent = seconds;
  setProgress(seconds);

  const timer = setInterval(() => {
    seconds--;
    countEl.textContent = Math.max(0, seconds);
    setProgress(seconds);

    if (seconds < 0) {
      clearInterval(timer);
      sessionStorage.removeItem("promoParams");
      location.href = NEXT_URL;
    }
  }, 1000);
});
window.addEventListener("load", async () => {
  const user = firebase.auth().currentUser;

  if (user && window.location.pathname.includes("/success")) {
    await sendOfferEmailOnce(user);
  }
});
