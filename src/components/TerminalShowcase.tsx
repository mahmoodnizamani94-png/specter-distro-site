/**
 * SPECTER SITE — Terminal Showcase
 *
 * React island (client:visible). Terminal-styled product visualization
 * that simulates SRT subtitle output with timed line reveals.
 *
 * - Terminal window frame with decorative dots and title
 * - Animated SRT lines appearing every 800ms with segment-reveal
 * - Progress bar with leading-edge glow
 * - ~20s loop cycle
 * - Reduced motion: all lines visible, progress at 100%
 *
 * @see PRD §FR-04 Showcase Section
 */

import { useEffect, useRef, useState } from 'react';
import type { SRTCue } from '../types/release';
import {
  SHOWCASE_CUES,
  SHOWCASE_TERMINAL_TITLE,
  SHOWCASE_LINE_INTERVAL_MS,
} from '../content/showcase-data';

export default function TerminalShowcase() {
  const [visibleLines, setVisibleLines] = useState<number>(0);
  const [progress, setProgress] = useState<number>(0);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const progressRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const mql = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mql.matches);
    if (mql.matches) {
      setVisibleLines(SHOWCASE_CUES.length);
      setProgress(100);
    }
    const handler = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches);
      if (e.matches) {
        setVisibleLines(SHOWCASE_CUES.length);
        setProgress(100);
      }
    };
    mql.addEventListener('change', handler);
    return () => mql.removeEventListener('change', handler);
  }, []);

  useEffect(() => {
    if (prefersReducedMotion) return;

    const totalDuration = SHOWCASE_CUES.length * SHOWCASE_LINE_INTERVAL_MS;
    // Assumption: add 4s pause after all lines shown before reset = ~20s total cycle
    const pauseAfterComplete = 4000;
    const cycleDuration = totalDuration + pauseAfterComplete;

    let lineCount = 0;

    const startCycle = () => {
      lineCount = 0;
      setVisibleLines(0);
      setProgress(0);

      intervalRef.current = setInterval(() => {
        lineCount++;
        setVisibleLines(lineCount);

        if (lineCount >= SHOWCASE_CUES.length) {
          if (intervalRef.current) clearInterval(intervalRef.current);
        }
      }, SHOWCASE_LINE_INTERVAL_MS);

      // Progress runs over the line-reveal portion only
      const progressInterval = 50;
      let elapsed = 0;
      progressRef.current = setInterval(() => {
        elapsed += progressInterval;
        const pct = Math.min((elapsed / totalDuration) * 100, 100);
        setProgress(pct);
        if (pct >= 100) {
          if (progressRef.current) clearInterval(progressRef.current);
        }
      }, progressInterval);
    };

    startCycle();

    const cycleInterval = setInterval(() => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
      startCycle();
    }, cycleDuration);

    return () => {
      clearInterval(cycleInterval);
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (progressRef.current) clearInterval(progressRef.current);
    };
  }, [prefersReducedMotion]);

  return (
    <div className="terminal-showcase" role="figure" aria-label="SRT subtitle generation preview">
      {/* Title bar */}
      <div className="terminal-title-bar">
        <div className="terminal-dots" aria-hidden="true">
          <span className="terminal-dot terminal-dot-1" />
          <span className="terminal-dot terminal-dot-2" />
          <span className="terminal-dot terminal-dot-3" />
        </div>
        <span className="terminal-title type-code">{SHOWCASE_TERMINAL_TITLE}</span>
      </div>

      {/* Terminal body */}
      <div className="terminal-body">
        {/* Scan-line overlay */}
        <div className="terminal-scanlines" aria-hidden="true" />

        <div className="terminal-output" role="log" aria-live="polite">
          {SHOWCASE_CUES.map((cue: SRTCue, i: number) => {
            const isVisible = i < visibleLines;
            return (
              <div
                key={cue.index}
                className={`srt-line ${isVisible ? 'srt-line-visible' : ''}`}
                aria-hidden={!isVisible}
              >
                <span className="srt-index">{cue.index}</span>
                <div className="srt-timestamp">
                  <span className="srt-time">{cue.startTime}</span>
                  <span className="srt-arrow"> {'-->'} </span>
                  <span className="srt-time">{cue.endTime}</span>
                </div>
                <p className="srt-text">{cue.text}</p>
              </div>
            );
          })}
        </div>

        {/* Progress bar */}
        <div className="terminal-progress-track" role="progressbar" aria-valuenow={Math.round(progress)} aria-valuemin={0} aria-valuemax={100}>
          <div
            className="terminal-progress-fill"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
