import forms from '@tailwindcss/forms';

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx,ts,tsx}',
  ],

  theme: {
    extend: {
      colors: {
        brand: {
          50: '#EEF4FD',
          100: '#DBE7FA',
          200: '#B8CEF3',
          500: '#2A63C2',
          600: '#2352A3',
          700: '#1C4283',
        },
        teal: {
          DEFAULT: '#1C998F',
          50: '#E3F6F4',
          700: '#0F766E',
        },
        orange: {
          DEFAULT: '#E5832A',
          50: '#FDF1E1',
          700: '#9A5B0A',
        },
        canvas: '#FAF6EE',
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#FDFBF6',
        },
        line: {
          DEFAULT: '#E8E1D4',
          strong: '#D6CCB8',
        },
        ink: '#162543',
        body: '#252F3F',
        muted: '#5B6B82',
        danger: {
          DEFAULT: '#B42318',
          50: '#FDECEA',
          border: '#F7C1BB',
        },
        success: {
          DEFAULT: '#0F766E',
          bg: '#E3F6F4',
          border: '#A7E3DC',
        },
        warning: {
          DEFAULT: '#9A5B0A',
          bg: '#FDF1E1',
          border: '#F6D3A6',
        },
        info: {
          DEFAULT: '#2352A3',
          bg: '#EEF4FD',
          border: '#B8CEF3',
        },
        status: {
          reported: { fg: '#475569', bg: '#EEF2F7' },
          assigned: { fg: '#0369A1', bg: '#E0F2FE' },
          progress: { fg: '#4338CA', bg: '#E8EAFD' },
          resolved: { fg: '#0F766E', bg: '#DDF5F2' },
          closed: { fg: '#334155', bg: '#E2E8F0' },
          reopened: { fg: '#B42318', bg: '#FDECEA' },
          rejected: { fg: '#6B7280', bg: '#F1F2F4' },
          merged: { fg: '#7C3AED', bg: '#F1EBFD' },
        },
        priority: {
          low: { fg: '#15803D', bg: '#E4F6EA', dot: '#22A559' },
          medium: { fg: '#8A6A00', bg: '#FFF5CC', dot: '#E0B000' },
          high: { fg: '#B8500A', bg: '#FFE9D6', dot: '#ED7D1E' },
          critical: { fg: '#FFFFFF', bg: '#D92D20', dot: '#D92D20' },
        },
      },

      fontFamily: {
        sans: [
          'Inter',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        mono: [
          '"JetBrains Mono"',
          'ui-monospace',
          'SFMono-Regular',
          'Menlo',
          'monospace',
        ],
      },

      borderRadius: {
        md: '8px',
        lg: '12px',
        xl: '16px',
      },

      boxShadow: {
        card: '0 1px 2px rgba(22,37,67,.05), 0 1px 3px rgba(22,37,67,.06)',
        hover: '0 4px 12px rgba(22,37,67,.08)',
        modal: '0 12px 32px rgba(22,37,67,.14)',
      },

      maxWidth: {
        content: '1200px',
        form: '640px',
      },
    },
  },

  plugins: [forms],
};