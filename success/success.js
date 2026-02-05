import { auth, db } from "../firebase.js";
import { onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// ====== CONFIG ======
const NEXT_URL = "https://gradeo.in/"; // main website
const BACK_URL = "/offer";

// ✅ EmailJS (provided by you)
const EMAILJS_PUBLIC_KEY = "jBp2SNoQciWnlU2Fo";
const EMAILJS_SERVICE_ID = "service_wsd8g2w";
const EMAILJS_TEMPLATE_ID = "template_sgha506";
// =====================

const countEl = document.getElementById("count");
const fillEl = document.getElementById("fill");
const offerEl = document.getElementById("offerCode");
const helloEl = document.getElementById("helloText");
const noteEl = document.getElementById("noteText");

document.getElementById("goNow")?.addEventListener("click", () => (location.href = NEXT_URL));
document.getElementById("back")?.addEventListener("click", () => (location.href = BACK_URL));

function getPromo() {
  try {
    return JSON.parse(sessionStorage.getItem("promoParams") || "{}");
  } catch {
    return {};
  }
}

function setProgress(secondsLeft, total = 6) {
  const pct = ((total - secondsLeft) / total) * 100;
  if (fillEl) fillEl.style.width = `${Math.min(100, Math.max(0, pct))}%`;
}

// ---------- EmailJS helpers ----------
function loadEmailJS() {
  return new Promise((resolve, reject) => {
    if (window.emailjs) return resolve(window.emailjs);

    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/@emailjs/browser@4/dist/email.min.js";
    s.async = true;
    s.onload = () => resolve(window.emailjs);
    s.onerror = reject;
    document.head.appendChild(s);
  });
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function formatDateIN(d = new Date()) {
  return d.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function addOneYear(d = new Date()) {
  const x = new Date(d);
  x.setFullYear(x.getFullYear() + 1);
  return x;
}

function makeInvoiceId() {
  const d = new Date();
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  const rand = Math.floor(10000 + Math.random() * 90000); // 5 digits
  return `INV-${y}${m}${day}-${rand}`;
}

function makeOrderId() {
  const rand = Math.floor(100000 + Math.random() * 900000); // 6 digits
  return `ORD-${rand}`;
}

async function sendOfferClaimEmail({ user, promo, now }) {
  // Send only if claim button was clicked
  const intent = sessionStorage.getItem("offer_claim_intent");
  if (intent !== "1") return;

  // Avoid duplicates in the same session for this user+offer
  const sentKey = `offer_email_sent_${user.uid}_${(promo.offer || "FREE1YEAR")}`;
  if (sessionStorage.getItem(sentKey) === "1") return;

  const emailjs = await loadEmailJS();
  emailjs.init(EMAILJS_PUBLIC_KEY);

  const templateParams = {
    name: user.displayName || "Student",
    email: user.email,

    invoice_id: makeInvoiceId(),
    order_id: makeOrderId(),
    order_date: formatDateIN(now),
    expiry_date: formatDateIN(addOneYear(now)),
    year: String(now.getFullYear()),

    offer_code: promo.offer || "FREE1YEAR",
    plan_name: "Gradeo Premium — 1 Year",
    price_original: "₹150",
    price_paid: "₹0"
  };

  await emailjs.send(EMAILJS_SERVICE_ID, EMAILJS_TEMPLATE_ID, templateParams);

  sessionStorage.setItem(sentKey, "1");
  sessionStorage.removeItem("offer_claim_intent");
}
// -----------------------------------

const promo = getPromo();
if (promo.offer && offerEl) offerEl.textContent = promo.offer;

onAuthStateChanged(auth, async (user) => {
  if (!user) {
    location.href = BACK_URL;
    return;
  }

  if (helloEl) {
    helloEl.textContent = `Welcome, ${user.displayName || "Student"}! Activating your access…`;
  }

  // Firestore claim write (idempotent)
  const offerKey = (promo.offer || "FREE1YEAR").replace(/\s+/g, "_").toLowerCase();
  const claimId = `${offerKey}_${user.uid}`;
  const ref = doc(db, "offerClaims", claimId);

  let shouldSendEmail = false;

  try {
    const snap = await getDoc(ref);
    if (snap.exists()) {
      if (noteEl) noteEl.textContent = "✅ Offer already active for this Google account.";
      // do not send email again
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
      if (noteEl) noteEl.textContent = "✅ Access activated for your Google account.";
      shouldSendEmail = true;
    }
  } catch (e) {
    // If Firestore fails, still allow email once per session (best-effort)
    if (noteEl) noteEl.textContent = "✅ Signed in successfully. Redirecting…";
    shouldSendEmail = true;
  }

  if (shouldSendEmail) {
    try {
      await sendOfferClaimEmail({ user, promo, now: new Date() });
    } catch (err) {
      console.error("EmailJS send failed:", err);
    }
  }

  // Countdown + progress
  let seconds = 6;
  if (countEl) countEl.textContent = seconds;
  setProgress(seconds);

  const timer = setInterval(() => {
    seconds--;
    if (countEl) countEl.textContent = Math.max(0, seconds);
    setProgress(seconds);

    if (seconds < 0) {
      clearInterval(timer);
      sessionStorage.removeItem("promoParams");
      location.href = NEXT_URL;
    }
  }, 1000);
});
