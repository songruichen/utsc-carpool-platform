import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        utsc: {
          blue: '#002A5C',
          teal: '#00A6A6',
          green: '#2E7D32'
        }
      }
    }
  },
  plugins: []
} satisfies Config;

