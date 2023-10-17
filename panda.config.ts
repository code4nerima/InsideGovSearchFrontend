import { defineConfig, defineGlobalStyles } from '@pandacss/dev'

const globalCss = defineGlobalStyles({
  '*': {
    boxSizing: 'border-box',
  },
  'html, body': {
    fontFamily: '"M PLUS 2 Variable", sans-serif',
    color: '#000',
    lineHeight: '1.55',
    margin: '0',
    padding: '0',
  },
  'ul, ol': {
    margin: '0',
    padding: '0',
    listStyle: 'none',
  },
})

export default defineConfig({
  // Whether to use css reset
  preflight: false,

  // Where to look for your css declarations
  include: [
    './src/components/**/*.{ts,tsx,js,jsx}',
    './src/app/**/*.{ts,tsx,js,jsx}',
  ],

  // Files to exclude
  exclude: [],

  // Useful for theme customization
  theme: {
    extend: {
      keyframes: {
        FloatHorizontal: {
          '0%': { transform: 'translate3d(5px,0,0)' },
          '50%': { transform: 'translate3d(-5px,0,0)' },
          '100%': { transform: 'translate3d(5px,0,0)' },
        },
        FloatVertical: {
          '0%': { transform: 'translate3d(0,5px,0)' },
          '50%': { transform: 'translate3d(0,-5px,0)' },
          '100%': { transform: 'translate3d(0,5px,0)' },
        },
        ScaleAlpha: {
          '0%': {
            opacity: '1',
          },
          '33%': {
            opacity: '0.25',
          },
          '66%': {
            opacity: '0.25',
          },
          '100%': {
            opacity: '1',
          },
        },
        ScaleAlphaBefore: {
          '0%': {
            opacity: '0.25',
          },
          '33%': {
            opacity: '1',
          },
          '66%': {
            opacity: '0.25',
          },
        },
        ScaleAlphaAfter: {
          '33%': {
            opacity: '0.25',
          },
          '66%': {
            opacity: '1',
          },
          '100%': {
            opacity: '0.25',
          },
        },
      },
    },
    tokens: {
      colors: {
        nerimaDark: { value: '#004B38' },
        nerimaVivid: { value: '#4DA635' },
        nerimaLight: { value: '#CEE4AE' },
        nerimaPale: { value: '#E7F2D9' },
      },
      fontWeights: {
        thin: { value: '100' },
        normal: { value: '400' },
        bold: { value: '700' },
        black: { value: '900' },
      },
      shadows: {
        default: { value: '1px 1px 1px rgba(0, 0, 0, 0.25)' },
        box: { value: '2px 2px 4px rgba(0, 0, 0, 0.25)' },
      },
    },
  },

  conditions: {
    extend: {
      supportTouchCalloutNone: '@supports (-webkit-touch-callout: none)',
    },
  },

  // The output directory for your css system
  outdir: 'styled-system',

  globalCss,
})
