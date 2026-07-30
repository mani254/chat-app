import type { Config } from 'tailwindcss';
import path from 'path';

export default {
  content: [
    path.join(__dirname, './index.html'),
    path.join(__dirname, './src/**/*.{js,ts,jsx,tsx}'),
    path.join(__dirname, '../../packages/ui/src/**/*.{js,ts,jsx,tsx}'),
  ],
  theme: {
    extend: {
      colors: {
        background: '#090d16',
      },
    },
  },
  plugins: [],
} satisfies Config;
