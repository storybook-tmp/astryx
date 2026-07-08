// Copyright (c) Meta Platforms, Inc. and affiliates.

import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {storybookTest} from '@storybook/addon-vitest/vitest-plugin';
import {playwright} from '@vitest/browser-playwright';
import {defineConfig} from 'vitest/config';

const dirname =
  typeof __dirname !== 'undefined'
    ? __dirname
    : path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  optimizeDeps: {
    include: [
      'aria-query',
      'lz-string',
      'pretty-format',
      'react/jsx-dev-runtime',
    ],
  },
  test: {
    projects: [
      {
        extends: true,
        plugins: [
          storybookTest({
            configDir: path.join(dirname, '.storybook'),
            storybookUrl: 'http://localhost:6006',
          }),
        ],
        test: {
          name: 'storybook',
          browser: {
            enabled: true,
            headless: true,
            provider: playwright({}),
            instances: [{browser: 'chromium'}],
          },
        },
      },
    ],
  },
});
