# Gradeo Feedback Kit v3 (Light Theme Only)

This version removes system/dark mode and forces a light theme only.

## Includes
- /feedback page (light theme only)
- /thanks page (light theme only)
- /api/feedback proxy (Cloudflare Pages Function) that forwards to Formspree
- email_template.html (logo with rounded corners)

## Deploy
Copy into your existing Cloudflare Pages repo root:
- feedback/
- thanks/
- functions/
- email_template.html

Then push to GitHub. Cloudflare Pages will auto-deploy.
