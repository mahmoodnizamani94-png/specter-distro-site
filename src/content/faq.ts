/**
 * SPECTER SITE — FAQ Content Data
 *
 * All 8 Q&A pairs from PRD §FR-09.
 * Used by FAQAccordion.astro component.
 *
 * @see PRD §FR-09
 */

import type { FAQItem } from '../types/release';

export const FAQ_ITEMS: readonly FAQItem[] = [
  {
    id: 'faq-upload',
    question: 'Does SPECTER upload my media?',
    answer:
      'No. All processing happens on your device. No audio, video, or transcript data leaves your phone.',
  },
  {
    id: 'faq-formats',
    question: 'What files does it support?',
    answer:
      'Audio (MP3, WAV, M4A, AAC, FLAC, OGG, OPUS, WMA), video (MP4, MKV, MOV, AVI, M4V, WebM, TS, FLV), and ZIP archives containing up to 50 files.',
  },
  {
    id: 'faq-play-vs-apk',
    question: 'Is Google Play or APK download safer?',
    answer:
      'Google Play is the recommended path. It handles signing verification automatically. APK install is for advanced users who want to verify the release themselves.',
  },
  {
    id: 'faq-offline',
    question: 'Does it work offline after install?',
    answer:
      'Yes. SPECTER works fully offline, including airplane mode. The bundled AI model is included with the app.',
  },
  {
    id: 'faq-languages',
    question: 'Which languages are supported?',
    answer:
      'The Whisper AI model recognizes speech in 99+ languages. You can transcribe in the original language or translate to English.',
  },
  {
    id: 'faq-translate',
    question: 'Can it translate subtitles to English?',
    answer:
      'Yes. SPECTER supports translate-to-English mode for non-English source audio.',
  },
  {
    id: 'faq-storage',
    question: 'Why does the app need storage access?',
    answer:
      'To read your media files and save the generated subtitle files. No other file access is required.',
  },
  {
    id: 'faq-portfolio',
    question: 'Is this website the portfolio?',
    answer:
      'No. This is the SPECTER product site. It is designed to be strong enough to appear as one piece of portfolio work.',
  },
] as const;
