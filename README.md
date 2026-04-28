# SPECTER

Offline AI subtitle generator for Android. No cloud. No accounts. No uploads.

Drop in audio, video, or a ZIP archive. SPECTER runs transcription on-device and hands you SRT files.

**This repo is the product site**, not the app itself. It's a static single-page build that serves as the public landing page.

🔗 **[specter site](https://mahmoodnizamani94-png.github.io/specter-distro-site/)**

## Tech

- [Astro 5](https://astro.build) static SSG with three [React 19](https://react.dev) islands
- TypeScript strict mode
- OKLCH-native design tokens, self-hosted variable fonts
- Ships zero JS for content sections. Only interactive components hydrate.
- Deploys automatically via GitHub Actions to GitHub Pages on every push to `main`

## Run Locally

```bash
pnpm install
pnpm dev
```

Requires Node 22+ and pnpm.

## Release Configuration

The site's download buttons, hero CTA, and radar display all pull from one file:

```
src/content/release.ts
```

Set `releaseState` to `coming_soon`, `play_live`, or `apk_available` and fill in the matching metadata. TypeScript validates the shape at build time. Push to `main` and CI handles the rest.

## License

See [LICENSE](LICENSE).
