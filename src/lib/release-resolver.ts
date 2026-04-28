/**
 * SPECTER SITE — Release CTA Resolver
 *
 * Pure function that takes a ReleaseManifest and returns ResolvedCTAs.
 * Zero side effects, zero imports beyond the type system, fully testable.
 *
 * Handles all 3 release states and all bad-state codes from PRD §13.2:
 *   WEB_RELEASE_NONE, WEB_PLAY_MISSING, WEB_APK_META_INCOMPLETE, WEB_UNKNOWN_STATE
 *
 * @see PRD §11.1–11.4
 * @see src/types/release.ts
 */

import type {
  ReleaseManifest,
  ReleaseState,
  CTAAction,
  ResolvedCTAs,
} from '../types/release';

/** Valid release states — used for runtime validation since TS types are erased. */
const VALID_STATES: readonly ReleaseState[] = [
  'coming_soon',
  'play_live',
  'apk_available',
] as const;

/** HTTPS URL pattern — must start with https:// */
const HTTPS_PATTERN = /^https:\/\//i;

/** Play Store URL pattern — must be a play.google.com domain */
const PLAY_STORE_PATTERN = /^https:\/\/play\.google\.com\//i;

/** SHA-256 checksum pattern — exactly 64 lowercase hex characters */
const SHA256_PATTERN = /^[0-9a-f]{64}$/;

// ─── Validation Helpers ───

function isValidHttpsUrl(url: string): boolean {
  return HTTPS_PATTERN.test(url);
}

function isPlayStoreUrl(url: string): boolean {
  return PLAY_STORE_PATTERN.test(url);
}

function isValidSha256(hash: string): boolean {
  return SHA256_PATTERN.test(hash);
}

/**
 * Checks whether a URL is a same-origin GitHub Pages path.
 * Pages URLs follow the pattern: https://{owner}.github.io/{repo}/...
 * This prevents accidentally linking to a file hosted on Pages itself.
 */
function isSameOriginPagesPath(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.hostname.endsWith('.github.io');
  } catch {
    return false;
  }
}

// ─── State Resolvers ───

function resolveComingSoon(): Omit<ResolvedCTAs, 'warnings'> {
  return {
    primary: {
      type: 'scroll_to_download',
      label: 'View release status',
    },
    secondary: {
      type: 'external_link',
      label: 'View source',
      url: 'https://github.com/', // Assumption: repo URL injected at content layer, not resolver
    },
    downloadPanel: 'coming_soon',
  };
}

function resolvePlayLive(
  manifest: ReleaseManifest,
  warnings: string[],
): Omit<ResolvedCTAs, 'warnings'> {
  const { play, apk } = manifest;

  // WEB_PLAY_MISSING: play_live but no valid Play URL
  if (!play.enabled || !play.url) {
    warnings.push(
      '[WEB_PLAY_MISSING] releaseState is "play_live" but play.url is empty or play is disabled. Falling back to scroll CTA.',
    );
    return {
      primary: {
        type: 'scroll_to_download',
        label: 'View release status',
      },
      secondary: {
        type: 'external_link',
        label: 'View source',
        url: 'https://github.com/',
      },
      downloadPanel: 'unavailable',
    };
  }

  // Validate Play URL format
  if (!isValidHttpsUrl(play.url)) {
    warnings.push(
      `[WEB_PLAY_MISSING] play.url "${play.url}" is not a valid HTTPS URL. Hiding Play CTA.`,
    );
    return {
      primary: {
        type: 'scroll_to_download',
        label: 'View release status',
      },
      secondary: {
        type: 'external_link',
        label: 'View source',
        url: 'https://github.com/',
      },
      downloadPanel: 'unavailable',
    };
  }

  if (!isPlayStoreUrl(play.url)) {
    warnings.push(
      `play.url "${play.url}" does not match play.google.com domain. CTA will render but URL may be incorrect.`,
    );
  }

  // Determine secondary CTA
  let secondary: CTAAction;
  if (apk.enabled && apk.downloadUrl && isValidHttpsUrl(apk.downloadUrl)) {
    secondary = {
      type: 'external_link',
      label: 'Download signed APK',
      url: apk.downloadUrl,
    };
  } else {
    secondary = {
      type: 'external_link',
      label: 'View source',
      url: 'https://github.com/',
    };
  }

  return {
    primary: {
      type: 'external_link',
      label: 'Download SPECTER',
      url: play.url,
    },
    secondary,
    downloadPanel: 'play_primary',
  };
}

function resolveApkAvailable(
  manifest: ReleaseManifest,
  warnings: string[],
): Omit<ResolvedCTAs, 'warnings'> {
  const { play, apk } = manifest;

  // If Play is also available, it becomes the primary CTA
  const playAvailable =
    play.enabled && play.url && isValidHttpsUrl(play.url) && isPlayStoreUrl(play.url);

  // WEB_APK_META_INCOMPLETE: APK enabled but critical metadata missing
  const apkMetaComplete =
    apk.enabled &&
    apk.versionName &&
    apk.downloadUrl &&
    apk.sha256 &&
    isValidHttpsUrl(apk.downloadUrl) &&
    isValidSha256(apk.sha256);

  if (apk.enabled && !apkMetaComplete) {
    const missing: string[] = [];
    if (!apk.versionName) missing.push('versionName');
    if (!apk.sha256) missing.push('sha256');
    if (!apk.downloadUrl) missing.push('downloadUrl');
    if (apk.downloadUrl && !isValidHttpsUrl(apk.downloadUrl))
      missing.push('downloadUrl (not HTTPS)');
    if (apk.sha256 && !isValidSha256(apk.sha256))
      missing.push('sha256 (invalid format)');

    warnings.push(
      `[WEB_APK_META_INCOMPLETE] APK is enabled but metadata is incomplete: missing ${missing.join(', ')}. APK download button will be hidden.`,
    );
  }

  // Validate APK download URL is not same-origin Pages path
  if (apk.enabled && apk.downloadUrl && isSameOriginPagesPath(apk.downloadUrl)) {
    warnings.push(
      `apk.downloadUrl "${apk.downloadUrl}" appears to be a GitHub Pages path. APK must be hosted on GitHub Releases, not Pages.`,
    );
  }

  if (playAvailable) {
    return {
      primary: {
        type: 'external_link',
        label: 'Download SPECTER',
        url: play.url,
      },
      secondary: apkMetaComplete
        ? {
            type: 'external_link',
            label: `Download signed APK v${apk.versionName}`,
            url: apk.downloadUrl,
          }
        : { type: 'hidden' },
      downloadPanel: 'apk_primary',
    };
  }

  if (apkMetaComplete) {
    return {
      primary: {
        type: 'external_link',
        label: `Download SPECTER v${apk.versionName}`,
        url: apk.downloadUrl,
      },
      secondary: apk.releaseNotesUrl
        ? {
            type: 'external_link',
            label: 'View all releases',
            url: apk.releaseNotesUrl,
          }
        : { type: 'hidden' },
      downloadPanel: 'apk_primary',
    };
  }

  // APK state declared but nothing is actually downloadable
  warnings.push(
    '[WEB_APK_META_INCOMPLETE] releaseState is "apk_available" but no valid download is configured. Falling back to coming_soon panel.',
  );
  return {
    primary: {
      type: 'scroll_to_download',
      label: 'View release status',
    },
    secondary: {
      type: 'external_link',
      label: 'View source',
      url: 'https://github.com/',
    },
    downloadPanel: 'unavailable',
  };
}

// ─── Main Resolver ───

/**
 * Resolves a ReleaseManifest into concrete CTA actions.
 *
 * This function is pure: no side effects, no DOM access, no fetch calls.
 * Every code path returns a valid ResolvedCTAs — it never throws or
 * returns undefined.
 *
 * @param manifest - The typed release configuration
 * @returns Fully resolved CTA state with warnings for dev diagnostics
 */
export function resolveReleaseCTAs(manifest: ReleaseManifest): ResolvedCTAs {
  const warnings: string[] = [];
  const state = manifest.releaseState;

  // Runtime guard against invalid state values (TS types are erased at runtime)
  if (!VALID_STATES.includes(state as ReleaseState)) {
    warnings.push(
      `[WEB_UNKNOWN_STATE] releaseState "${state}" is not a recognized value. Valid states: ${VALID_STATES.join(', ')}. Falling back to coming_soon behavior.`,
    );
    return {
      ...resolveComingSoon(),
      warnings,
    };
  }

  let resolved: Omit<ResolvedCTAs, 'warnings'>;

  switch (state) {
    case 'coming_soon':
      resolved = resolveComingSoon();
      break;
    case 'play_live':
      resolved = resolvePlayLive(manifest, warnings);
      break;
    case 'apk_available':
      resolved = resolveApkAvailable(manifest, warnings);
      break;
    default: {
      // Exhaustiveness check — TypeScript will error if a case is missing.
      // At runtime, this is unreachable due to the VALID_STATES guard above.
      const _exhaustive: never = state;
      warnings.push(
        `[WEB_UNKNOWN_STATE] Unhandled state: ${_exhaustive as string}. Falling back to coming_soon.`,
      );
      resolved = resolveComingSoon();
    }
  }

  return {
    ...resolved,
    warnings,
  };
}
