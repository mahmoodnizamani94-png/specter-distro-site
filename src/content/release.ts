/**
 * SPECTER SITE — Release Configuration
 *
 * Single source of truth for all CTA rendering across the site.
 * Updated manually or via CI on each SPECTER app release.
 *
 * To update: change the values below, commit, and push to main.
 * TypeScript validates the manifest shape at build time.
 *
 * @see PRD §11.1 Release Configuration
 * @see src/types/release.ts for the ReleaseManifest interface
 */

import type { ReleaseManifest } from '../types/release';

export const RELEASE: ReleaseManifest = {
  product: 'SPECTER',
  releaseState: 'coming_soon',
  lastUpdated: '2026-04-24',
  play: {
    enabled: false,
    url: '', // https://play.google.com/store/apps/details?id=app.specter
  },
  apk: {
    enabled: false,
    versionName: '',
    releaseDate: '',
    fileSizeDisplay: '',
    sha256: '',
    downloadUrl: '', // https://github.com/{owner}/{repo}/releases/latest/download/specter-{version}.apk
    releaseNotesUrl: '', // https://github.com/{owner}/{repo}/releases/latest
  },
  compatibility: {
    platform: 'Android',
    minimumAndroid: 'Android 8.0+ (API 26)',
    distributionNote: 'Google Play is recommended. APK install is for advanced users.',
  },
} as const;
