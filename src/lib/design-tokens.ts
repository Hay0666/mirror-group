// ============================================================
// MirrorGroup — Design Tokens
// Single source of truth for all visual constants
// ============================================================

export const colors = {
  void: '#0A0C0F',
  slateDdep: '#111418',
  slateMid: '#1C2028',
  slateLight: '#272D38',
  wire: '#3A424F',
  signal: '#FF6B2B',
  signalDim: '#7A3010',
  data: '#E2E8F0',
  ghost: '#64748B',
  success: '#22C55E',
  caution: '#EAB308',
} as const

export const typography = {
  fontMono: '"JetBrains Mono", "IBM Plex Mono", Consolas, monospace',
  fontSans: 'Inter, "DM Sans", system-ui, sans-serif',
  displayLg: { size: '4rem', lineHeight: '1.1', letterSpacing: '-0.02em' },
  displayMd: { size: '2.5rem', lineHeight: '1.2', letterSpacing: '-0.02em' },
  uiLabel: { size: '0.75rem', lineHeight: '1.3', letterSpacing: '0.08em' },
  body: { size: '0.875rem', lineHeight: '1.6' },
} as const

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '24px',
  '2xl': '32px',
  '3xl': '48px',
  '4xl': '64px',
} as const

export const zIndex = {
  canvas: 0,
  toolbar: 10,
  panel: 20,
  header: 30,
  modal: 40,
  tooltip: 50,
  notification: 60,
} as const

export const animation = {
  precision: [0.25, 0.46, 0.45, 0.94] as const,
  durationFast: 0.15,
  durationMid: 0.2,
  durationSlow: 0.4,
  staggerNode: 0.08,
} as const

export const borderRadius = {
  none: '0',
  sharp: '2px',
} as const
