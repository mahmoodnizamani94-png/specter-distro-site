/**
 * SPECTER SITE — Download Panel
 *
 * React island (client:load). Release-state-aware CTA resolver.
 * Renders three distinct layouts based on release state:
 * - coming_soon: status message with dossier link, no disabled buttons
 * - play_live: Play Store primary, optional APK details in collapsible
 * - apk_available: GitHub Release APK primary, full metadata
 *
 * Bad states are handled gracefully per PRD §13.2:
 * - Missing Play URL with play_live → hide CTA, show explanation
 * - Missing checksum → hide APK button, show explanation with fallback link
 * - Unknown state → fall back to coming_soon with console warning
 *
 * @see PRD §FR-07, §11.2, §13.2, §18.8
 */

import { useState, useCallback, useEffect } from 'react';
import type { ReleaseManifest } from '../types/release';
import { resolveReleaseCTAs } from '../lib/release-resolver';

interface DownloadPanelProps {
  release: ReleaseManifest;
}

/** HTTPS URL validation — download URLs must be external HTTPS */
const HTTPS_RE = /^https:\/\//i;
/** SHA-256 format — 64 lowercase hex characters */
const SHA256_RE = /^[0-9a-f]{64}$/;

function isValidDownloadUrl(url: string): boolean {
  if (!HTTPS_RE.test(url)) return false;
  // Reject Pages-origin URLs per guardrails
  try {
    const parsed = new URL(url);
    if (parsed.hostname.endsWith('.github.io')) return false;
  } catch {
    return false;
  }
  return true;
}

export default function DownloadPanel({ release }: DownloadPanelProps) {
  const resolved = resolveReleaseCTAs(release);
  const [checksumCopied, setChecksumCopied] = useState(false);

  // Emit warnings in development
  useEffect(() => {
    if (resolved.warnings.length > 0) {
      resolved.warnings.forEach((w) => console.warn(w));
    }
  }, [resolved.warnings]);

  const handleCopyChecksum = useCallback(async () => {
    if (!release.apk.sha256) return;
    try {
      await navigator.clipboard.writeText(release.apk.sha256);
      setChecksumCopied(true);
      setTimeout(() => setChecksumCopied(false), 2000);
    } catch {
      // Clipboard API may fail in insecure contexts
      setChecksumCopied(false);
    }
  }, [release.apk.sha256]);

  const panelMode = resolved.downloadPanel;

  return (
    <div
      className="download-panel"
      id="download-panel"
      role="region"
      aria-label="Download SPECTER"
    >
      <h2 className="download-heading type-heading" id="download-heading">Download</h2>

      {panelMode === 'coming_soon' && <ComingSoonPanel />}
      {panelMode === 'play_primary' && (
        <PlayPrimaryPanel
          release={release}
          onCopyChecksum={handleCopyChecksum}
          checksumCopied={checksumCopied}
        />
      )}
      {panelMode === 'apk_primary' && (
        <ApkPrimaryPanel
          release={release}
          onCopyChecksum={handleCopyChecksum}
          checksumCopied={checksumCopied}
        />
      )}
      {panelMode === 'unavailable' && <UnavailablePanel release={release} />}
    </div>
  );
}

// ─── Coming Soon ───

function ComingSoonPanel() {
  return (
    <div className="download-state-panel">
      <div className="download-status-block">
        <span className="download-status-indicator" aria-hidden="true">&#9632;</span>
        <span className="download-status-text type-code">STATUS: PENDING RELEASE</span>
      </div>
      <p className="download-message type-body">
        SPECTER is not publicly downloadable yet. The technical dossier is
        available while release packaging is finalized.
      </p>
      <a href="#dossier" className="download-dossier-link type-label">
        View technical dossier
      </a>
    </div>
  );
}

// ─── Play Primary ───

interface PlayPanelProps {
  release: ReleaseManifest;
  onCopyChecksum: () => void;
  checksumCopied: boolean;
}

function PlayPrimaryPanel({ release, onCopyChecksum, checksumCopied }: PlayPanelProps) {
  const playUrl = release.play.url;
  const hasValidPlay = release.play.enabled && playUrl && isValidDownloadUrl(playUrl);

  const apkMetaComplete =
    release.apk.enabled &&
    release.apk.versionName &&
    release.apk.downloadUrl &&
    release.apk.sha256 &&
    isValidDownloadUrl(release.apk.downloadUrl) &&
    SHA256_RE.test(release.apk.sha256);

  return (
    <div className="download-state-panel">
      {hasValidPlay ? (
        <>
          <a
            href={playUrl}
            className="download-cta-primary type-label"
            target="_blank"
            rel="noopener noreferrer"
            id="download-cta-play"
          >
            Download SPECTER
          </a>
          <p className="download-fallback-text type-caption">
            If the store does not open, use this Play Store link:{' '}
            <a
              href={playUrl}
              className="download-url-visible type-code"
              target="_blank"
              rel="noopener noreferrer"
            >
              {playUrl}
            </a>
          </p>
        </>
      ) : (
        <div className="download-warning-block">
          <p className="download-warning-text type-body">
            Download link is temporarily unavailable.
          </p>
        </div>
      )}

      {/* Advanced APK panel */}
      {release.apk.enabled && (
        <details className="download-advanced">
          <summary className="download-advanced-toggle type-label">
            <span className="toggle-text">Advanced: APK download</span>
            <span className="toggle-chevron" aria-hidden="true">&#9660;</span>
          </summary>
          <div className="download-advanced-content">
            {apkMetaComplete ? (
              <>
                <ApkMetadata
                  release={release}
                  onCopyChecksum={onCopyChecksum}
                  checksumCopied={checksumCopied}
                />
                <a
                  href={release.apk.downloadUrl}
                  className="download-cta-secondary type-label"
                  target="_blank"
                  rel="noopener noreferrer"
                  id="download-cta-apk"
                >
                  Download signed APK v{release.apk.versionName}
                </a>
              </>
            ) : (
              <IncompleteApkMessage releaseNotesUrl={release.apk.releaseNotesUrl} />
            )}
          </div>
        </details>
      )}

      {/* Install instructions */}
      <details className="download-instructions">
        <summary className="download-instructions-toggle type-label">
          <span className="toggle-text">Install instructions</span>
          <span className="toggle-chevron" aria-hidden="true">&#9660;</span>
        </summary>
        <div className="download-instructions-content">
          <ol className="install-steps type-body">
            <li>Open the Play Store link on your Android device.</li>
            <li>Tap "Install" and wait for the download to complete.</li>
            <li>Open SPECTER from your app drawer.</li>
          </ol>
        </div>
      </details>
    </div>
  );
}

// ─── APK Primary ───

function ApkPrimaryPanel({ release, onCopyChecksum, checksumCopied }: PlayPanelProps) {
  const apkMetaComplete =
    release.apk.enabled &&
    release.apk.versionName &&
    release.apk.downloadUrl &&
    release.apk.sha256 &&
    isValidDownloadUrl(release.apk.downloadUrl) &&
    SHA256_RE.test(release.apk.sha256);

  return (
    <div className="download-state-panel">
      {apkMetaComplete ? (
        <>
          <a
            href={release.apk.downloadUrl}
            className="download-cta-primary type-label"
            target="_blank"
            rel="noopener noreferrer"
            id="download-cta-apk-primary"
          >
            Download SPECTER v{release.apk.versionName}
          </a>
          <ApkMetadata
            release={release}
            onCopyChecksum={onCopyChecksum}
            checksumCopied={checksumCopied}
          />
        </>
      ) : (
        <IncompleteApkMessage releaseNotesUrl={release.apk.releaseNotesUrl} />
      )}

      {/* Install instructions */}
      <details className="download-instructions">
        <summary className="download-instructions-toggle type-label">
          <span className="toggle-text">APK install instructions</span>
          <span className="toggle-chevron" aria-hidden="true">&#9660;</span>
        </summary>
        <div className="download-instructions-content">
          <ol className="install-steps type-body">
            <li>Download the APK file to your Android device.</li>
            <li>Open Settings, then Security. Enable "Install from unknown sources" for your browser.</li>
            <li>Open the downloaded APK file and tap "Install."</li>
            <li>Open SPECTER from your app drawer.</li>
          </ol>
        </div>
      </details>

      {/* Alternative link */}
      {release.apk.releaseNotesUrl && isValidDownloadUrl(release.apk.releaseNotesUrl) && (
        <p className="download-alt-link type-caption">
          Available on{' '}
          <a
            href={release.apk.releaseNotesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="download-url-visible"
          >
            GitHub Releases
          </a>
        </p>
      )}

      <p className="download-legal type-caption">
        Only process media you have the right to use.
      </p>
    </div>
  );
}

// ─── Unavailable ───

function UnavailablePanel({ release }: { release: ReleaseManifest }) {
  const hasReleaseNotes =
    release.apk.releaseNotesUrl && isValidDownloadUrl(release.apk.releaseNotesUrl);

  return (
    <div className="download-state-panel">
      <div className="download-warning-block">
        <p className="download-warning-text type-body">
          Download link is temporarily unavailable.
        </p>
        {hasReleaseNotes && (
          <p className="download-warning-fallback type-caption">
            Check{' '}
            <a
              href={release.apk.releaseNotesUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="download-url-visible"
            >
              GitHub Releases
            </a>{' '}
            for the latest version.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Shared: APK Metadata ───

function ApkMetadata({
  release,
  onCopyChecksum,
  checksumCopied,
}: PlayPanelProps) {
  const [checksumExpanded, setChecksumExpanded] = useState(false);
  const sha = release.apk.sha256;
  const shortSha = sha.slice(0, 16);

  return (
    <div className="apk-metadata">
      <div className="apk-meta-row">
        <span className="apk-meta-label type-caption">VERSION</span>
        <span className="apk-meta-value type-code">{release.apk.versionName}</span>
      </div>
      {release.apk.releaseDate && (
        <div className="apk-meta-row">
          <span className="apk-meta-label type-caption">RELEASED</span>
          <span className="apk-meta-value type-code tnum">{release.apk.releaseDate}</span>
        </div>
      )}
      {release.apk.fileSizeDisplay && (
        <div className="apk-meta-row">
          <span className="apk-meta-label type-caption">SIZE</span>
          <span className="apk-meta-value type-code">{release.apk.fileSizeDisplay}</span>
        </div>
      )}
      <div className="apk-meta-row apk-meta-checksum">
        <span className="apk-meta-label type-caption">SHA-256</span>
        <span className="apk-meta-value type-code apk-sha">
          {checksumExpanded ? sha : `${shortSha}\u2026`}
        </span>
        <div className="apk-checksum-actions">
          <button
            type="button"
            className="checksum-action-btn type-caption"
            onClick={() => setChecksumExpanded(!checksumExpanded)}
            aria-label={checksumExpanded ? 'Collapse checksum' : 'Expand checksum'}
          >
            {checksumExpanded ? 'Collapse' : 'Expand'}
          </button>
          <button
            type="button"
            className="checksum-action-btn type-caption"
            onClick={onCopyChecksum}
            aria-label="Copy checksum to clipboard"
          >
            {checksumCopied ? 'Copied' : 'Copy'}
          </button>
        </div>
      </div>
      <p className="apk-signing-note type-caption">
        Signed with the SPECTER release key. Verify the checksum before installing.
      </p>
    </div>
  );
}

// ─── Shared: Incomplete APK Message ───

function IncompleteApkMessage({ releaseNotesUrl }: { releaseNotesUrl: string }) {
  const hasUrl = releaseNotesUrl && isValidDownloadUrl(releaseNotesUrl);

  return (
    <div className="download-warning-block">
      <p className="download-warning-text type-body">
        Advanced APK download is unavailable because release metadata is incomplete.
      </p>
      {hasUrl && (
        <p className="download-warning-fallback type-caption">
          Check{' '}
          <a
            href={releaseNotesUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="download-url-visible"
          >
            GitHub Releases
          </a>{' '}
          for the latest version.
        </p>
      )}
    </div>
  );
}
