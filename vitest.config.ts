// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file vitest.config.ts
 * @input Unit Vitest project and Storybook Vitest plugin
 * @output Vitest project workspace for unit tests and Storybook browser tests
 * @position Root Vitest config used by `vitest --project <name>`
 *
 * SYNC: When modified, update this header and root README.md
 */

import path from 'path';
import {defineConfig} from 'vitest/config';
import {storybookTest} from '@storybook/addon-vitest/vitest-plugin';
import {playwright} from '@vitest/browser-playwright';

const storybookRoot = path.resolve(__dirname, 'apps/storybook');
const storybookConfigDir = path.resolve(__dirname, 'apps/storybook/.storybook');

export default defineConfig({
  test: {
    projects: [
      './vitest.unit.config.ts',
      {
        extends: true,
        optimizeDeps: {
          include: ['react/jsx-dev-runtime'],
        },
        plugins: [
          storybookTest({
            configDir: storybookConfigDir,
            storybookScript: 'pnpm -F @astryxdesign/storybook dev --ci',
          }),
        ],
        test: {
          name: 'storybook',
          root: storybookRoot,
          browser: {
            enabled: true,
            provider: playwright({}),
            headless: true,
            instances: [{browser: 'chromium'}],
          },
          setupFiles: ['./.storybook/vitest.setup.ts'],
        },
      },
    ],
  },
});
