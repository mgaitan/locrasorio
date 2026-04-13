/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts}'],
  theme: {
    extend: {
      colors: {
        cream:       '#FDF6E3',
        'cream-dark':'#F5E8C8',
        amber: {
          warm:    '#E8A838',
          DEFAULT: '#D97706',
          dark:    '#B45309',
        },
        rust:        '#C4612A',
        brown: {
          light:   '#92400E',
          DEFAULT: '#78350F',
          dark:    '#451A03',
        },
        sage: {
          light:   '#8FAE76',
          DEFAULT: '#5F7A4A',
          dark:    '#3D5C2A',
        },
        terracotta:  '#BC5E3A',
        mauve:       '#9C7B6A',
      },
      fontFamily: {
        display: ['"Playfair Display"', 'Georgia', 'serif'],
        script:  ['"Dancing Script"', 'cursive'],
        body:    ['Lato', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'watercolor-hero': "url('/images/watercolor-hero.svg')",
      },
    },
  },
  plugins: [],
}
