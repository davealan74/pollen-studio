import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import os from 'os';
import path from 'path';

// Node 25 exposes a native localStorage global (via --localstorage-file) that
// vitest's happy-dom environment does not override. Providing a valid temp file
// path silences the warning and gives Node's localStorage a proper implementation,
// which happy-dom then shadows correctly in each test worker.
const localStorageFile = path.join(os.tmpdir(), 'vitest-localstorage.json');

export default defineConfig({
  plugins: [sveltekit()],
  test: {
    environment: 'happy-dom',
    environmentOptions: {
      happyDOM: {
        url: 'http://localhost/'
      }
    },
    setupFiles: ['./tests/setup.ts'],
    include: [
      'src/**/*.{test,spec}.ts',
      'tests/unit/**/*.{test,spec}.ts',
      'tests/mock-pollinations/**/*.{test,spec}.ts'
    ],
    globals: true,
    poolOptions: {
      forks: {
        execArgv: [`--localstorage-file=${localStorageFile}`]
      },
      threads: {
        execArgv: [`--localstorage-file=${localStorageFile}`]
      }
    }
  }
});
