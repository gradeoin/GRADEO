
# GRADEO Assets Pack (drop-in)

This folder lets you self-host fonts + logo with minimal site changes.

## What’s inside
- `assets/css/typography.css`  → Self-hosted `@font-face` + mobile boldness fixes
- `assets/fonts/`              → Put your `.woff2` files here (see names below)
- `assets/img/logo.svg`        → Local logo (use in header across site)
- `_headers.add`               → Cache rules to merge into your existing `_headers`
- `sw-addon.js`                → Optional service worker addon for font/image caching

## 1) Upload
Commit the entire `assets/` folder (and `_headers.add`) at the repo root.

## 2) Add a single line to your global <head>
If you use Jekyll layouts (default for GitHub Pages), add this to `_includes/head.html` or your main layout:

<link rel="preload" as="font" href="/assets/fonts/syne-900.woff2" type="font/woff2" crossorigin>
<link rel="preload" as="font" href="/assets/fonts/dmsans-700.woff2" type="font/woff2" crossorigin>
<link rel="stylesheet" href="/assets/css/typography.css">

(Preload just the weights used above-the-fold.)

## 3) Swap header logo (optional but recommended)
Replace remote logo with the local one:
<img src="/assets/img/logo.svg" alt="GRADEO" width="36" height="36">

## 4) Copy font files
Download the webfont files and place them under `/assets/fonts/` with these names (or adjust the CSS):
- syne-var.woff2  (or at least syne-800.woff2 and syne-900.woff2)
- dmsans-400.woff2
- dmsans-600.woff2
- dmsans-700.woff2

## 5) Merge cache headers
Append `_headers.add` to your existing `_headers` file so fonts/images are cached aggressively.

## 6) (Optional) Service Worker tweak
If you already have `sw.js`, paste the code from `sw-addon.js` into it. Otherwise, register it from your site and serve at the root.

## Notes
- Keep Cloudinary for content images; self-host just the brand/logo and fonts for consistency and offline reliability.
- Make sure font licenses allow web embedding.
