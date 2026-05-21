import { defineConfig } from 'vitest/config';
import { sveltekit } from '@sveltejs/kit/vite';
import os from 'os';
import path from 'path';

// Node 22+ exposes a native localStorage global (via --localstorage-file) that
// vitest's happy-dom environment does not override. Providing a valid temp file
// path silences the warning. On Node <22 the flag is unknown and crashes the
// worker, so we only set it when supported (e.g. CI's Ubuntu Node 20 image).
const nodeMajor = Number(process.versions.node.split('.')[0]);
const localStorageArgv =
  nodeMajor >= 22
    ? [`--localstorage-file=${path.join(os.tmpdir(), 'vitest-localstorage.json')}`]
    : [];

export default defineConfig({
  plugins: [sveltekit()],
  resolve: {
    conditions: ['browser']
  },
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
      forks: { execArgv: localStorageArgv },
      threads: { execArgv: localStorageArgv }
    }
  }
});
