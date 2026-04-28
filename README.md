# SPECTER SITE

Product page for [SPECTER](https://github.com/), an offline AI subtitle generator for Android. This is the public-facing site that converts visitors into installers and demonstrates the engineering behind the app.

The site is a single-page static build — no JavaScript ships for content sections. Only three React islands hydrate for interactive features (radar animation, terminal simulation, download panel).

## Stack

| Layer | Technology |
|:------|:-----------|
| Framework | [Astro 5](https://astro.build) (static SSG) |
| Islands | [React 19](https://react.dev) (3 interactive components) |
| Language | TypeScript (strict mode) |
| Package Manager | pnpm |
| Design System | SIGNAL (OKLCH color, 3-layer token architecture) |
| Deploy | GitHub Actions → GitHub Pages |

## Local Development

```bash
pnpm install        # Install dependencies
pnpm dev            # Start dev server at localhost:4321
pnpm build          # Production build → dist/
pnpm preview        # Preview production build locally
pnpm typecheck      # Run astro check + tsc --noEmit
pnpm lint           # Run ESLint + Stylelint
pnpm lint:fix       # Auto-fix lint violations
```

Requires Node.js ≥ 22 and pnpm.

## Updating Release State

The site's CTAs, download panel, and radar display all derive from a single manifest:

```
src/content/release.ts
```

Change `releaseState` to one of three values:

| State | `releaseState` | Effect |
|:------|:---------------|:-------|
| Coming soon | `coming_soon` | Hero CTA scrolls to download section. Panel shows status message. |
| Play Store live | `play_live` | Hero CTA links to Play Store. Panel shows Play primary + optional APK. |
| APK available | `apk_available` | Hero CTA links to GitHub Release. Panel shows full APK metadata. |

Fill in the corresponding `play.url`, `apk.downloadUrl`, `apk.sha256`, etc. TypeScript validates the manifest shape at build time — invalid config fails `pnpm build`, not production.

Commit and push to `main`. The CI pipeline handles the rest.

## Deployment

Automatic via GitHub Actions on push to `main`. The pipeline runs 7 verification steps before deploying:

1. **Typecheck** — `astro check` + `tsc --noEmit`
2. **Lint** — ESLint (TS/Astro/React) + Stylelint (CSS/Astro)
3. **Binary scan** — Fails if `.apk`, `.aab`, or `.obb` files exist in the repo
4. **Build** — Astro SSG static generation
5. **Asset budget** — Warns at 25 MB, fails at 40 MB
6. **Upload** — `actions/upload-pages-artifact`
7. **Deploy** — `actions/deploy-pages` to GitHub Pages

To set up: go to repo Settings → Pages → Source → select **GitHub Actions**.

Update the `site` URL in `astro.config.ts` before the first deploy.

## Design System — SIGNAL

SIGNAL is the web sibling of SPECTER's Android design system (PHOSPHOR). Both share a three-layer token architecture:

```
Primitive → Semantic → Component
```

**Primitive tokens** are raw OKLCH color values (e.g., `--color-phosphor-300: oklch(0.76 0.20 145)`). Reference only inside `variables.css`.

**Semantic tokens** assign roles (`--text-accent: var(--color-phosphor-300)`). Use in all component styles.

**Component tokens** are scoped aliases (`--radar-sweep: var(--text-accent)`). Use in their specific component.

### Color

All colors are OKLCH. No hex values in the design system (print.css is exempt for print media).

### Typography

Seven type roles applied via utility classes:

| Role | Font | Class |
|:-----|:-----|:------|
| Display | Syne 700 | `.type-display` |
| Heading | Syne 600 | `.type-heading` |
| Subheading | Syne 500 | `.type-subheading` |
| Body | Source Sans 3 400 | `.type-body` |
| Label | Source Sans 3 600 | `.type-label` |
| Caption | Source Sans 3 400 | `.type-caption` |
| Code | JetBrains Mono 400 | `.type-code` |

All fonts are self-hosted as variable WOFF2 files in `public/fonts/`.

## Project Structure

```
src/
├── layouts/
│   └── BaseLayout.astro          # HTML shell, meta, CSP, fonts, skip-link
├── pages/
│   ├── index.astro               # Single-page (all 9 sections + footer)
│   └── 404.astro                 # Terminal-style not-found page
├── components/
│   ├── *.astro                   # Static components (zero JS shipped)
│   └── *.tsx                     # React islands (3 total)
├── content/
│   ├── release.ts                # Release manifest (single source of truth)
│   ├── faq.ts                    # FAQ Q&A pairs
│   ├── features.ts               # Proof tokens + workflow steps
│   └── showcase-data.ts          # Terminal SRT simulation cues
├── types/
│   └── release.ts                # All TypeScript interfaces
├── lib/
│   └── release-resolver.ts       # CTA state resolution (pure function)
└── styles/
    ├── variables.css              # SIGNAL design tokens
    ├── global.css                 # Reset, typography, focus, scrollbar
    ├── animations.css             # All @keyframes
    ├── islands.css                # React island styles
    └── print.css                  # Print media overrides
```

## CI Pipeline Details

### ESLint

TypeScript-aware linting for `.ts`, `.tsx`, and `.astro` files:
- `no-console` blocks `console.log` in production code (allows `console.warn` for release resolver diagnostics)
- `@typescript-eslint/consistent-type-imports` enforces `import type` usage
- `eslint-plugin-astro` handles `.astro` file parsing

### Stylelint

CSS standard compliance with SIGNAL-specific overrides:
- Blocks `rgb()`, `rgba()`, `hsl()`, `hsla()` — enforces OKLCH-only colors
- Allows OKLCH decimal notation (`oklch(0.76 0.20 145)` not `oklch(76% 0.20 145deg)`)
- Allows vendor prefixes required for Safari (`-webkit-backdrop-filter`) and iOS (`-webkit-text-size-adjust`)
- Print.css exempt from hex ban (print media uses simple fallback colors)

### Binary Scan

Prevents accidental check-in of APK/AAB/OBB files. The APK is distributed via GitHub Releases, not the site repository.

### Asset Budget

The `dist/` directory is checked after build:
- **Warning** at 25 MB
- **Failure** at 40 MB

## Performance Targets

| Metric | Target | Current |
|:-------|:-------|:--------|
| Total font weight | ≤ 200 KB | ~103 KB |
| Body font display | `swap` | ✓ |
| Code font display | `optional` | ✓ |
| CLS | ≤ 0.05 | No dynamic images, fixed nav/terminal heights |
| JS islands | Minimal | 3 islands, hydrated on visibility/load |
| External requests | 0 | CSP `connect-src: 'none'` |

## Cross-Browser Notes

| Browser | Status |
|:--------|:-------|
| Chrome | Full support. All animations, nav, download panel. |
| Edge | Matches Chrome (same engine). |
| Firefox | Full support. OKLCH rendering verified. |
| Safari | `backdrop-filter` requires `-webkit-` prefix (included). `font-display: optional` may flash on slow connections. Variable font support verified. |

### Fallbacks

- `backdrop-filter`: `-webkit-backdrop-filter` included alongside standard property
- `@supports (color: oklch(from white l c h))`: Progressive enhancement for relative color syntax
- `@media (forced-colors: active)`: Degrades to system colors, removes box-shadow glows
- `@media (prefers-contrast: more)`: Boosts border weights and text contrast
- `@media (prefers-reduced-motion: reduce)`: Disables all non-essential animations
- `@media (scripting: none)`: Hero body text visible immediately without decrypt animation

## Accessibility

- Skip-to-content link (first focusable element)
- Single `<h1>` per page, no skipped heading levels
- All `target="_blank"` links include `rel="noopener noreferrer"`
- Touch targets ≥ 44×44px on all interactive elements
- FAQ uses native `<details>`/`<summary>` — keyboard-operable without JS
- Mobile nav: focus trap when open, Escape closes, body scroll locked
- Focus indicators: 2px solid ring at ΔL ≥ 0.45 contrast
- Primary CTA: two-ring focus treatment
- Color is never the sole signal — all status readouts include text labels

## License

See [LICENSE](LICENSE) in this repository.
