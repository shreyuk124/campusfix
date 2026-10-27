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
          50: '#EFF6FF',
          100: '#DBEAFE',
          200: '#BFDBFE',
          500: '#1D64EC',
          600: '#1A56CA',
          700: '#1545A3',
        },
        action: {
          DEFAULT: '#EA580C',
          hover: '#C2410C',
          orange: '#F97316',
        },
        kpi: {
          sky: '#0284C7',
          emerald: '#10B981',
          blue: '#2563EB',
          orange: '#EA580C',
        },
        teal: {
          DEFAULT: '#10B981',
          50: '#ECFDF5',
          700: '#047857',
        },
        orange: {
          DEFAULT: '#EA580C',
          50: '#FFF7ED',
          700: '#C2410C',
        },
        canvas: '#F4F7FB',
        surface: {
          DEFAULT: '#FFFFFF',
          muted: '#F8FAFC',
        },
        line: {
          DEFAULT: '#E2E8F0',
          strong: '#CBD5E1',
          skeleton: '#E2E8F0',
        },
        ink: '#0F172A',
        body: '#1E293B',
        muted: '#64748B',
        danger: {
          DEFAULT: '#EF4444',
          50: '#FEF2F2',
          border: '#FECACA',
        },
        success: {
          DEFAULT: '#10B981',
          bg: '#ECFDF5',
          border: '#A7F3D0',
        },
        warning: {
          DEFAULT: '#F59E0B',
          bg: '#FFFBEB',
          border: '#FDE68A',
        },
        info: {
          DEFAULT: '#1D64EC',
          bg: '#EFF6FF',
          border: '#BFDBFE',
        },
        status: {
          reported: { fg: '#475569', bg: '#F1F5F9' },
          assigned: { fg: '#FFFFFF', bg: '#1D64EC' },
          progress: { fg: '#FFFFFF', bg: '#2563EB' },
          resolved: { fg: '#FFFFFF', bg: '#10B981' },
          closed: { fg: '#64748B', bg: '#F1F5F9' },
          reopened: { fg: '#FFFFFF', bg: '#EF4444' },
          rejected: { fg: '#64748B', bg: '#F1F5F9' },
          merged: { fg: '#FFFFFF', bg: '#7C3AED' },
        },
        priority: {
          low: { fg: '#475569', bg: '#F1F5F9', dot: '#94A3B8' },
          medium: { fg: '#334155', bg: '#F1F5F9', dot: '#64748B' },
          high: { fg: '#FFFFFF', bg: '#EA580C', dot: '#FFFFFF' },
          critical: { fg: '#FFFFFF', bg: '#EF4444', dot: '#FFFFFF' },
        },
      },

      fontFamily: {
        sans: [
          'Inter',
          'Manrope',
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        display: [
          'Manrope',
          'Inter',
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
        xl: '14px',
        '2xl': '18px',
      },

      boxShadow: {
        xs: '0 1px 2px rgba(15, 23, 42, 0.04)',
        card: '0 1px 3px rgba(15, 23, 42, 0.05), 0 1px 2px -1px rgba(15, 23, 42, 0.05)',
        hover: '0 4px 12px rgba(15, 23, 42, 0.08)',
        modal: '0 12px 32px rgba(15, 23, 42, 0.14)',
      },

      maxWidth: {
        content: '1160px',
        form: '640px',
      },
    },
  },

  plugins: [forms],
};
