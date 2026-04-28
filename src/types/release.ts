/**
 * SPECTER SITE — Release State Type System
 *
 * This is the contract that every component, page, and content module
 * builds on. The TypeScript compiler validates the release manifest
 * at build time — invalid config fails `pnpm build`, not production.
 *
 * @see PRD §11.1 Release Configuration
 */

// ─── Release State ───

/** The three possible states of SPECTER's public availability. */
export type ReleaseState = 'coming_soon' | 'play_live' | 'apk_available';

// ─── Release Manifest ───

/**
 * Single source of truth for all CTA rendering, download panel behavior,
 * and release metadata display. Implemented in `src/content/release.ts`.
 *
 * All fields are readonly to prevent accidental mutation.
 * Updated manually or via CI on each SPECTER app release.
 */
export interface ReleaseManifest {
  readonly product: 'SPECTER';
  readonly releaseState: ReleaseState;
  /** ISO 8601 date string (YYYY-MM-DD) of last config update. */
  readonly lastUpdated: string;
  readonly play: {
    readonly enabled: boolean;
    /** HTTPS play.google.com URL when enabled. Empty string when disabled. */
    readonly url: string;
  };
  readonly apk: {
    readonly enabled: boolean;
    /** Semver version string (e.g., "1.0.0"). Non-empty when enabled. */
    readonly versionName: string;
    /** ISO 8601 date string of APK release. */
    readonly releaseDate: string;
    /** Human-readable file size (e.g., "42 MB"). */
    readonly fileSizeDisplay: string;
    /** 64 lowercase hex characters. Empty string when disabled. */
    readonly sha256: string;
    /** HTTPS GitHub Releases asset URL. Must NOT be a Pages-origin path. */
    readonly downloadUrl: string;
    /** URL to the GitHub Releases page for this version. */
    readonly releaseNotesUrl: string;
  };
  readonly compatibility: {
    readonly platform: 'Android';
    readonly minimumAndroid: string;
    readonly distributionNote: string;
  };
}

// ─── CTA Actions ───

/**
 * Discriminated union representing the resolved action for a CTA button.
 * Used by the release resolver to determine button behavior.
 */
export type CTAAction =
  | { readonly type: 'scroll_to_download'; readonly label: string }
  | { readonly type: 'external_link'; readonly label: string; readonly url: string }
  | { readonly type: 'hidden' };

// ─── Resolved CTAs ───

/** The download panel display mode, determined by release state + config. */
export type DownloadPanelMode =
  | 'coming_soon'
  | 'play_primary'
  | 'apk_primary'
  | 'unavailable';

/**
 * The fully resolved CTA configuration for a given release manifest.
 * Returned by `resolveReleaseCTAs()` in `src/lib/release-resolver.ts`.
 */
export interface ResolvedCTAs {
  readonly primary: CTAAction;
  readonly secondary: CTAAction;
  readonly downloadPanel: DownloadPanelMode;
  /** Console warnings for dev mode — invalid URLs, missing checksums, etc. */
  readonly warnings: readonly string[];
}

// ─── Navigation ───

/** A navigation link in the site header. */
export interface NavLink {
  readonly label: string;
  readonly href: string;
  /** If true, this link opens in a new tab with rel="noopener noreferrer". */
  readonly external?: boolean;
}

/** The navigation state driven by scroll position. */
export type NavState = 'transparent' | 'scrolled';

// ─── Section Identifiers ───

/** Anchor IDs for each content section. Used by nav and scroll behavior. */
export type SectionId =
  | 'hero'
  | 'proof'
  | 'workflow'
  | 'showcase'
  | 'specs'
  | 'privacy'
  | 'download'
  | 'dossier'
  | 'faq';

// ─── Content Types ───

/** A single FAQ entry. */
export interface FAQItem {
  readonly id: string;
  readonly question: string;
  readonly answer: string;
}

/** A proof strip token — compact claim in the proof section. */
export interface ProofToken {
  readonly id: string;
  readonly title: string;
  readonly description: string;
}

/** A workflow step in the import → process → export rail. */
export interface WorkflowStep {
  readonly index: string;
  readonly title: string;
  readonly description: string;
}

/** A single SRT subtitle cue for the terminal showcase simulation. */
export interface SRTCue {
  readonly index: number;
  readonly startTime: string;
  readonly endTime: string;
  readonly text: string;
}

// ─── Privacy Readout ───

/** A single privacy guarantee displayed as a terminal status readout. */
export interface PrivacyGuarantee {
  readonly id: string;
  readonly label: string;
  readonly status: string;
  readonly description: string;
}

// ─── Specs ───

/** A row in the technical specifications table. */
export interface SpecRow {
  readonly label: string;
  readonly value: string;
}

/** A table group in the specs section. */
export interface SpecTable {
  readonly title: string;
  readonly headers: readonly string[];
  readonly rows: readonly SpecRow[];
}

/** An AI model entry in the specs section. */
export interface AIModelSpec {
  readonly model: string;
  readonly size: string;
  readonly ram: string;
  readonly speed: string;
  readonly tier: string;
}

// ─── Dossier ───

/** A pipeline stage in the dossier architecture visualization. */
export interface PipelineStage {
  readonly label: string;
  readonly description: string;
}

// ─── Footer ───

/** A footer link. */
export interface FooterLink {
  readonly label: string;
  readonly href: string;
  readonly external?: boolean;
}
