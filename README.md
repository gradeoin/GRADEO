
# Gradeo Deployment Modules (Cloudflare Pages)
This repository contains two independent modules for the Gradeo platform:

1. **Offer Pages** – `/offer` and `/success` claim flow
2. **Feedback Kit v3** – `/feedback` and `/thanks` feedback system

---

## 1. Gradeo Offer Pages (Cloudflare Pages)
This module contains two mobile-first, light-theme-only pages:

- `/offer` → Offer landing page with classic Google sign-in
- `/success` → Offer claimed page with animation, Firestore write, and redirect

### Routes
After deploying to Cloudflare Pages:
- https://gradeo.in/offer
- https://gradeo.in/success

### Email Link Example
```
https://gradeo.in/offer?offer=FREE1YEAR&campaign=students&src=email
```

### Redirect
After a successful claim, the `/success` page redirects to:
```
https://gradeo.in/
```

### Firestore Rules (Recommended)
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /offerClaims/{docId} {
      allow create: if request.auth != null && request.resource.data.uid == request.auth.uid;
      allow read: if request.auth != null && resource.data.uid == request.auth.uid;
      allow update, delete: if false;
    }
  }
}
```

### Notes
- Uses the same Firebase config as your main Gradeo site.
- Popup Google sign-in is attempted first; if blocked, redirect fallback is used.

---

## 2. Gradeo Feedback Kit v3 (Light Theme Only)
This version forces **light mode only** and removes system/dark mode.

### Includes
- `/feedback` page (light theme only)
- `/thanks` page (light theme only)
- `/api/feedback` → Cloudflare Pages Function forwarding to Formspree
- `email_template.html` (logo with rounded corners)

### Deployment Instructions
Copy the following into your Cloudflare Pages repo root:
```
feedback/
thanks/
functions/
email_template.html
```
Then commit & push to GitHub. Cloudflare Pages will auto-deploy.
