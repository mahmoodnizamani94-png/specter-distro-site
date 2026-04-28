/**
 * SPECTER SITE — Showcase SRT Simulation Data
 *
 * Hardcoded SRT cues for the terminal showcase animation.
 * These are pre-scripted — the showcase does not process real audio.
 * The simulation loops through these cues for a ~20 second demonstration.
 *
 * @see PRD §FR-04 Showcase Section
 */

import type { SRTCue } from '../types/release';

export const SHOWCASE_CUES: readonly SRTCue[] = [
  {
    index: 1,
    startTime: '00:00:01,200',
    endTime: '00:00:04,800',
    text: 'The signal was clear for the first time',
  },
  {
    index: 2,
    startTime: '00:00:05,100',
    endTime: '00:00:08,900',
    text: 'in twelve years of listening',
  },
  {
    index: 3,
    startTime: '00:00:09,200',
    endTime: '00:00:13,400',
    text: 'What they found changed everything we knew',
  },
  {
    index: 4,
    startTime: '00:00:14,000',
    endTime: '00:00:17,600',
    text: 'about the boundary between signal and noise',
  },
] as const;

/** Terminal window title text for the showcase. */
export const SHOWCASE_TERMINAL_TITLE = 'SPECTER v1.0.0 — Processing' as const;

/** Interval in milliseconds between SRT line reveals. */
export const SHOWCASE_LINE_INTERVAL_MS = 800 as const;
