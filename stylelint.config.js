/** @type {import('stylelint').Config} */
export default {
  extends: [
    'stylelint-config-standard',
    'stylelint-config-html',
  ],

  rules: {
    // ─── Block non-OKLCH color functions ───
    'function-disallowed-list': ['rgb', 'rgba', 'hsl', 'hsla'],
    'color-function-notation': 'modern',
    'color-no-hex': true,

    // ─── OKLCH notation: SIGNAL uses decimal lightness and bare hue ───
    // oklch(0.76 0.20 145) is valid CSS — disable forced percentage/degree conversion
    'lightness-notation': null,
    'hue-degree-notation': null,
    'alpha-value-notation': null,

    // ─── Structural ───
    'declaration-block-no-duplicate-properties': true,
    'block-no-empty': true,
    'color-no-invalid-hex': true,
    'no-duplicate-at-import-rules': true,
    'no-duplicate-selectors': true,

    // ─── No !important except in overrides (handled via file-level config) ───
    'declaration-no-important': true,

    // ─── Allow design system formatting conventions ───
    'custom-property-pattern': null,
    'custom-property-empty-line-before': null,
    'comment-empty-line-before': null,
    'rule-empty-line-before': null,
    'at-rule-empty-line-before': null,

    // ─── Allow Astro :global() pseudo-class ───
    'selector-pseudo-class-no-unknown': [
      true,
      { ignorePseudoClasses: ['global'] },
    ],

    // ─── Allow oklch and other modern CSS functions ───
    'function-no-unknown': null,

    // ─── Allow vendor-prefixed properties needed for browser compat ───
    // All vendor prefixes in this codebase are intentional:
    // -webkit-backdrop-filter (Safari), -webkit-text-size-adjust (iOS),
    // -moz-text-size-adjust (Firefox), -webkit-font-smoothing, -moz-osx-font-smoothing
    'property-no-vendor-prefix': null,

    // ─── Allow vendor-prefixed values for scrollbar compat ───
    'value-no-vendor-prefix': null,

    // ─── Allow max-width media queries (not all browsers support range notation) ───
    'media-feature-range-notation': null,

    // ─── Allow system color keywords in forced-colors overrides ───
    'value-keyword-case': ['lower', {
      ignoreProperties: ['/^--/'],
      ignoreKeywords: [
        'Canvas', 'CanvasText', 'GrayText', 'LinkText',
        'ButtonFace', 'ButtonText', 'Highlight',
        'optimizeLegibility',
      ],
    }],

    // ─── Allow font family names with quotes (Syne, Source Sans 3) ───
    'font-family-name-quotes': null,

    // ─── Allow BEM-style double-dash selectors ───
    'selector-class-pattern': null,

    // ─── Allow 0px units in design token values ───
    'length-zero-no-unit': null,

    // ─── Allow deprecated clip property for sr-only utility ───
    'property-no-deprecated': null,

    // ─── Allow longhand properties for explicit control ───
    'declaration-block-no-redundant-longhand-properties': null,
  },

  overrides: [
    {
      // print.css deliberately uses hex for print media simplicity
      files: ['**/print.css'],
      rules: {
        'color-no-hex': null,
        'declaration-no-important': null,
      },
    },
    {
      // Relax !important for global reduced-motion and forced-colors overrides
      files: ['**/global.css'],
      rules: {
        'declaration-no-important': null,
      },
    },
    {
      // Relax !important for noscript overrides in .astro component styles
      files: ['**/*.astro'],
      rules: {
        'declaration-no-important': null,
      },
    },
  ],
};
