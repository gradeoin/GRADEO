import { auth } from "../firebase.js";
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.8.0/firebase-auth.js";

const btn = document.getElementById("googleClaimBtn");
const statusEl = document.getElementById("status");
const offerCodeEl = document.getElementById("offerCode");
const campaignEl = document.getElementById("campaign");

function setStatus(msg) {
  statusEl.textContent = msg || "";
}

function readParams() {
  const url = new URL(location.href);
  return {
    offer: url.searchParams.get("offer") || "FREE1YEAR",
    campaign: url.searchParams.get("campaign") || "students",
    src: url.searchParams.get("src") || "email",
    // Fixed redirect target requested
    next: "https://gradeo.in/"
  };
}

const promo = readParams();

// Update UI chips
if (offerCodeEl) offerCodeEl.textContent = promo.offer;
if (campaignEl) campaignEl.textContent = promo.campaign;

// Store for success page
sessionStorage.setItem("promoParams", JSON.stringify(promo));

const provider = new GoogleAuthProvider();

// Handle redirect sign-in return (mobile/popup blocked)
try {
  const result = await getRedirectResult(auth);
  if (result?.user) {
    // If user came back from redirect flow, intent already set before redirect
    location.href = "/success";
  }
} catch (e) {
  // ignore
}

btn?.addEventListener("click", async () => {
  btn.disabled = true;
  setStatus("Opening Google sign-in…");

  // ✅ Mark intent only when user actually clicks Claim
  sessionStorage.setItem("offer_claim_intent", "1");

  try {
    await signInWithPopup(auth, provider);
    setStatus("Signed in ✅ Redirecting…");
    location.href = "/success";
  } catch (e) {
    setStatus("Popup blocked. Using redirect sign-in…");
    await signInWithRedirect(auth, provider);
  } finally {
    btn.disabled = false;
  }
});

// If already logged in on gradeo.in, skip (DO NOT set claim intent here)
onAuthStateChanged(auth, (user) => {
  if (user) {
    setStatus(`Welcome ${user.displayName || ""}! Redirecting…`);
    setTimeout(() => (location.href = "/success"), 400);
  }
});
