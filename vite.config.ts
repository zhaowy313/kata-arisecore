import { defineConfig } from 'vite';

// https://vitejs.dev/config/
export default defineConfig(({ mode, command }) => {
  return {
    root: './dev',
    publicDir: '../public',
    test: {
      include: ['../**/*.test.ts'],
      exclude: ['../node_modules'],
    },
  };
});
