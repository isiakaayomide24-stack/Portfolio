# Ayomide Isiaka — Portfolio

A hand-built personal portfolio for Ayomide Isiaka. Dark, developer-focused, no frameworks, no template.

## What's inside

- **Hero** — large typographic intro with a live terminal panel and local clock.
- **Selected work** — Nova and Ciphera as full index rows, each linking to a working build inside this repository.
- **About** — short, specific, and free of buzzwords.
- **Stack** — the tools actually used across these projects.
- **Contact** — direct email plus a form that composes a message in the visitor's mail app.
- **Details** — scroll progress, section-aware navigation, staggered reveals, focus states, reduced-motion support, and a keyboard-friendly mobile menu.

## Structure

```
portfolio/
├── index.html          # markup and content
├── styles.css          # design system, layout, responsive rules
├── script.js           # navigation, reveals, clock, contact form
├── demos/
│   ├── nova/           # live Nova build (HTML, CSS, JS)
│   └── ciphera/        # live Ciphera build (HTML, CSS, JS)
└── README.md
```

The `demos` folder contains complete copies of both projects, so every project row on the site opens something real. The standalone repositories remain the source of truth for each app.

## Run it locally

Open `index.html` in any browser. There is no build step and no dependencies.

If you prefer a local server:

```powershell
python -m http.server 5500
```

Then visit `http://localhost:5500`.

## Publishing

Two options:

1. **GitHub Pages (recommended)** — push the folder to a repository named `<username>.github.io`, then enable Pages in *Settings → Pages*. The site goes live at `https://<username>.github.io`.
2. **Any static host** — Netlify, Vercel, Cloudflare Pages. Upload the folder as-is.

`setup-git.ps1` initialises the repository and makes the first commit. `SETUP_GITHUB.md` has the full walkthrough.

## Contact form

The form is intentionally backend-free: it opens the visitor's default mail client with the message pre-filled. That keeps the site deployable anywhere with zero cost. To collect messages without email, point the form at a service such as Formspree.

## License

MIT — see `LICENSE`.
