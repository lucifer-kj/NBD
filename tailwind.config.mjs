const config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx}',
    './components/**/*.{js,ts,jsx,tsx}',
    './store/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Semantic brand tokens
        'naaz-green': 'var(--islamic-green)',
        'naaz-green-light': 'var(--islamic-green-light)',
        'naaz-green-dark': 'var(--islamic-green-dark)',
        'naaz-gold': 'var(--islamic-gold)',
        'naaz-gold-dark': 'var(--islamic-gold-dark)',
        'naaz-beige': 'var(--islamic-beige)',
        'naaz-cream': 'var(--islamic-cream)',
        // Functional aliases
        primary: 'var(--primary)',
        secondary: 'var(--islamic-gold)',
        background: 'var(--background)',
        accent: 'var(--accent)',
        surface: 'var(--white)',
        'surface-hover': 'var(--light-gray)',
        'border-subtle': 'var(--medium-gray)',
      },
      borderRadius: {
        xl: '0.75rem',
        '2xl': '1rem',
        '3xl': '1.5rem',
        full: '9999px',
      },
      fontFamily: {
        sans: [
          'Inter',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Roboto',
          'sans-serif',
        ],
        headings: [
          'Playfair Display',
          'Georgia',
          'serif',
        ],
        arabic: [
          'Amiri',
          'Scheherazade New',
          'serif',
        ],
      },
      fontSize: {
        // Fluid typography using clamp()
        'hero': 'clamp(2.25rem, 5vw + 1rem, 4rem)',
        'section': 'clamp(1.75rem, 3vw + 0.5rem, 3rem)',
        'subtitle': 'clamp(1rem, 1.5vw + 0.5rem, 1.25rem)',
      },
      letterSpacing: {
        'editorial': '0.04em',
        'wide-editorial': '0.08em',
      },
      animation: {
        'marquee': 'ticker-scroll 30s linear infinite',
        'fade-in': 'fadeIn 0.6s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'scale-in': 'scaleIn 0.5s ease-out forwards',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(24px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        scaleIn: {
          '0%': { opacity: '0', transform: 'scale(0.95)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;