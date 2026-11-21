import react from '@vitejs/plugin-react';
import tailwind from '@tailwindcss/vite';
import { defineConfig } from 'vitest/config';
import { fileURLToPath } from 'node:url';

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwind()],
  resolve: {
    alias: mode === 'test' ? [{
      find: /^\.\.\/config\/birthday$/,
      replacement: fileURLToPath(new URL('./src/test/fixtures/birthday.ts', import.meta.url)),
    }] : [],
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
}));
