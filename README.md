# Gradeo Feedback Kit (Cloudflare Pages)

This kit adds:
- `https://gradeo.in/feedback` – feedback form (Material-like, dark mode)
- `https://gradeo.in/thanks` – thank-you page
- `/api/feedback` – Cloudflare Pages Function proxy that forwards to Formspree (keeps Formspree URL hidden from users)

## Folder structure

```
feedback/index.html
thanks/index.html
functions/api/feedback.js
email_template.html
```

## Deploy
1. Upload these files into your GitHub repo (keeping the folders exactly as-is).
2. Cloudflare Pages auto-deploys.
3. Test:
   - https://gradeo.in/feedback
   - https://gradeo.in/thanks

## Manual email sending (Gmail)
1. Open `email_template.html` in a browser.
2. Select all and copy the rendered content.
3. Paste into Gmail compose.
4. Replace `{{NAME}}` with the recipient name (or remove it).

## Notes
- Form submits to `/api/feedback` so users cannot see your Formspree endpoint.
- On success, page redirects to `/thanks`.
