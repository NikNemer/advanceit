# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

Static single-page website for **AdvanceIT FZ LLC** — a cybersecurity consulting firm based in Fujairah, UAE. No build step: pure HTML/CSS/JS deployed directly to Netlify.

## Local development

```bash
python3 -m http.server 8080   # serve from repo root → http://localhost:8080
```

No build, no npm, no dependencies. Edit files and refresh the browser.

## File structure

```
index.html        ← the entire site (single page)
css/styles.css    ← all styles
js/main.js        ← all JavaScript
static/img/       ← images
admin/            ← Netlify CMS (config.yml + preview templates)
netlify.toml      ← Netlify config: publish = ".", no build command, security headers
.netlifyignore    ← excludes non-web files from Netlify deploy
```

## Page structure (`index.html`)

Single-page layout with anchor-based navigation. Sections in order:

| Section | `id` / class | Description |
|---------|-------------|-------------|
| Header | `.fixed-top` | Fixed nav, fades in/out on scroll |
| Hero | `#section_main` | Full-width background image, H1 + subheading |
| About Us | `#about .section0` | Company origin story |
| Mission | `.section1` | Value proposition with left green border accent |
| Services | `#services .section2` | 6 cards in CSS Grid |
| Tools & Technologies | `#tech .section5` | Logo grids by category |
| Contacts | `#contact .section6` | Address + Google Maps iframe |
| Form | `#sendf` | Netlify form with honeypot |

## Typography

- **Body / UI / nav:** `Figtree` (Google Fonts, 400/600/700)
- **Headings (H1, H2, H3, service titles):** `Bitcount Single` (Google Fonts, 400)
- Both loaded in one `<link>` in `<head>`

## CSS architecture (`css/styles.css`)

All design tokens are in `:root` at the top of the file — colors, max-width, nav-height. Edit there first before touching individual rules.

Key layout patterns:
- Services grid: `display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 365px))`
- Tech logo rows: flexbox + `flex-wrap`
- About section: flexbox with `gap`
- Header nav: flexbox; mobile hamburger toggled via `.open` class on `#mmenu`

## JavaScript (`js/main.js`)

Three behaviours, no dependencies:
1. **Netlify Identity** — redirects to `/admin/` after login
2. **Mobile menu** — toggles `.open` class on `#mmenu`; auto-closes after 3 s; resets on resize above 601 px
3. **Header scroll** — `requestAnimationFrame`-throttled: fades nav opacity 0.15→1 over first 300 px of scroll; hides entirely after 500 px

## Deployment (Netlify)

`netlify.toml` sets `publish = "."` with no build command. Security headers are declared there:
- `Content-Security-Policy` — whitelists only used origins (self, Netlify Identity, Google Fonts, jsDelivr, Google Maps)
- `X-Frame-Options: SAMEORIGIN`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` — camera, mic, geolocation, payment all off

## Netlify CMS (`admin/`)

Accessible at `/admin`. Protected by Netlify Identity (Git Gateway). Ensure Netlify Identity is set to **Invite only** in the Netlify dashboard. Media uploads go to `static/img/`. The preview templates (`admin/preview-templates/`) are legacy React components from the original Eleventy boilerplate — not actively used.

## Contact form

Uses Netlify Forms (`data-netlify="true"`). Honeypot field (`data-netlify-honeypot="bot-field"`) is present for bot protection. No backend needed.
