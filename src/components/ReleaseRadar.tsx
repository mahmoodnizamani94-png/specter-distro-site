/**
 * SPECTER SITE — Release Radar
 *
 * React island (client:visible). The hero's signature visual.
 * SVG-based radar with rotating sweep line, fading 90° trail,
 * center release state text, outer ring metadata, and side readouts.
 *
 * @see PRD §FR-01 Hero Section — Radar Module
 * @see PRD §18.7 Radar Component Spec
 */

import { useEffect, useRef, useState } from 'react';
import type { CSSProperties } from 'react';
import type { ReleaseManifest, ReleaseState } from '../types/release';

interface ReleaseRadarProps {
  release: ReleaseManifest;
}

const STATE_LABEL: Record<ReleaseState, string> = {
  coming_soon: 'PENDING RELEASE',
  play_live: 'PLAY LIVE',
  apk_available: 'APK READY',
};

export default function ReleaseRadar({ release }: ReleaseRadarProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  const stateLabel = STATE_LABEL[release.releaseState];
  const version = release.apk.versionName || '0.0.0';
  const platform = release.compatibility.platform;
  const lastUpdated = release.lastUpdated;

  // Determine install route label
  let installRoute = 'Pending';
  if (release.releaseState === 'play_live') installRoute = 'Play Store';
  else if (release.releaseState === 'apk_available') installRoute = 'GitHub Releases';

  // Checksum status
  const checksumStatus = release.apk.sha256 ? 'Verified' : 'Pending';

  const radarStyles: CSSProperties = {
    '--radar-bg': 'var(--radar-bg)',
    '--radar-ring': 'var(--radar-ring)',
    '--radar-sweep': 'var(--radar-sweep)',
  } as CSSProperties;

  return (
    <div
      ref={containerRef}
      className="release-radar"
      style={radarStyles}
      role="status"
      aria-label={`Release status: ${stateLabel}`}
    >
      <div className="radar-visual">
        <svg
          viewBox="0 0 320 320"
          className="radar-svg"
          aria-hidden="true"
        >
          {/* Background circle */}
          <circle
            cx="160"
            cy="160"
            r="148"
            fill="var(--surface-sunken)"
            stroke="var(--radar-ring)"
            strokeWidth="2"
          />

          {/* Grid rings */}
          <circle cx="160" cy="160" r="110" fill="none" stroke="var(--border-subtle)" strokeWidth="0.5" opacity="0.4" />
          <circle cx="160" cy="160" r="74" fill="none" stroke="var(--border-subtle)" strokeWidth="0.5" opacity="0.3" />
          <circle cx="160" cy="160" r="37" fill="none" stroke="var(--border-subtle)" strokeWidth="0.5" opacity="0.2" />

          {/* Cross-hairs */}
          <line x1="12" y1="160" x2="308" y2="160" stroke="var(--border-subtle)" strokeWidth="0.5" opacity="0.2" />
          <line x1="160" y1="12" x2="160" y2="308" stroke="var(--border-subtle)" strokeWidth="0.5" opacity="0.2" />

          {/* Sweep group — rotating */}
          {!prefersReducedMotion && (
            <g className="radar-sweep-group">
              {/* Fading 90° trail — conic gradient simulated with multiple lines */}
              {Array.from({ length: 18 }).map((_, i) => {
                const angle = -(i * 5); // 5° increments over 90°
                const opacity = 1 - i / 18;
                return (
                  <line
                    key={i}
                    x1="160"
                    y1="160"
                    x2="160"
                    y2="14"
                    stroke="var(--radar-sweep)"
                    strokeWidth="1.5"
                    opacity={opacity * 0.3}
                    transform={`rotate(${angle} 160 160)`}
                  />
                );
              })}
              {/* Primary sweep line */}
              <line
                x1="160"
                y1="160"
                x2="160"
                y2="14"
                stroke="var(--radar-sweep)"
                strokeWidth="2"
                opacity="0.8"
              />
            </g>
          )}
        </svg>

        {/* Center text overlay */}
        <div className="radar-center">
          <span className="radar-state-label">{stateLabel}</span>
          <span className="radar-version">v{version}</span>
        </div>
      </div>

      {/* Outer readouts */}
      <div className="radar-readouts">
        <div className="radar-readout">
          <span className="radar-readout-label">PLATFORM</span>
          <span className="radar-readout-value">{platform}</span>
        </div>
        <div className="radar-readout">
          <span className="radar-readout-label">ROUTE</span>
          <span className={`radar-readout-value${installRoute === 'Pending' ? ' readout-pending' : ''}`}>{installRoute}</span>
        </div>
        <div className="radar-readout">
          <span className="radar-readout-label">CHECKSUM</span>
          <span className={`radar-readout-value${checksumStatus === 'Pending' ? ' readout-pending' : ''}`}>{checksumStatus}</span>
        </div>
        <div className="radar-readout">
          <span className="radar-readout-label">UPDATED</span>
          <span className="radar-readout-value tnum">{lastUpdated}</span>
        </div>
      </div>
    </div>
  );
}
