/**
 * SPECTER SITE — Features Content Data
 *
 * Proof strip tokens (4 items, PRD §FR-02) and
 * workflow steps (3 items, PRD §FR-03).
 *
 * @see PRD §FR-02 Proof Strip
 * @see PRD §FR-03 Workflow Section
 */

import type { ProofToken, WorkflowStep } from '../types/release';

// ─── Proof Strip Tokens ───

export const PROOF_TOKENS: readonly ProofToken[] = [
  {
    id: 'proof-on-device',
    title: 'On-device transcription',
    description: 'Processing stays on your phone',
  },
  {
    id: 'proof-formats',
    title: 'Audio, video, ZIP input',
    description: 'MP3, MP4, MKV, WAV, and ZIP archives',
  },
  {
    id: 'proof-output',
    title: 'One SRT per file',
    description: 'One subtitle file per source file',
  },
  {
    id: 'proof-no-account',
    title: 'No account required',
    description: 'No login. No signup. No cloud.',
  },
] as const;

// ─── Workflow Steps ───

export const WORKFLOW_STEPS: readonly WorkflowStep[] = [
  {
    index: '01',
    title: 'IMPORT',
    description: 'Drop audio, video, or ZIP files',
  },
  {
    index: '02',
    title: 'PROCESS',
    description: 'On-device AI generates subtitles',
  },
  {
    index: '03',
    title: 'EXPORT',
    description: 'One .srt file per source file',
  },
] as const;
