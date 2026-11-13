/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{vue,js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        // 设计稿主色 #FEDA44
        brand: {
          50: '#FFF9E1',
          100: '#FFF3BF',
          200: '#FFEB8F',
          300: '#FFE36E',
          400: '#FFD324',
          500: '#FEDA44',
          600: '#F5C518',
          700: '#A68A17',
          800: '#8A6D00',
          900: '#6B5500',
          950: '#3D3100',
        },
        // 暖白背景 / 分割线
        surface: {
          DEFAULT: '#FBF8F0',
          50: '#FFFFFF',
          100: '#F7F2E6',
          200: '#F3EDDF',
          300: '#EFE8D8',
          400: '#DDD4BC',
          500: '#C8C1AD',
          600: '#9A947F',
          700: '#5B5647',
          800: '#3A362B',
          900: '#1E1C16',
          950: '#14120C',
        },
        ink: {
          DEFAULT: '#1E1C16',
          soft: '#5B5647',
          muted: '#9A947F',
        },
        line: '#EFE8D8',
        income: '#1FA968',
        expense: '#F0654A',
      },
      fontFamily: {
        sans: [
          '-apple-system',
          'BlinkMacSystemFont',
          '"SF Pro SC"',
          '"PingFang SC"',
          '"HarmonyOS Sans SC"',
          '"Microsoft YaHei"',
          'system-ui',
          'sans-serif',
        ],
      },
    },
  },
  plugins: [],
};
