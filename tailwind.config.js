/** @type {import('tailwindcss').Config} */
export default {
  theme: {
    extend: {
      fontFamily: {
        cairo: ['Cairo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        tajawal: ['Tajawal', 'Cairo', 'ui-sans-serif', 'system-ui', 'sans-serif'],
      },
      colors: {
        glass: {
          base: 'rgba(255, 255, 255, 0.7)',
          border: 'rgba(255, 255, 255, 0.4)',
          shadow: 'rgba(15, 23, 42, 0.08)',
          accent: '#0891B2',
          accentSoft: '#10B981',
        },
      },
      boxShadow: {
        glass: '0 18px 50px rgba(15, 23, 42, 0.08), 0 2px 14px rgba(37, 99, 235, 0.08)',
      },
      backgroundColor: {
        canvas: '#F8FAFC',
      },
    },
  },
}
