// Copyright (c) Meta Platforms, Inc. and affiliates.

// This file has been automatically migrated to valid ESM format by Storybook.
/**
 * @file main.ts
 * @input Storybook React/Vite configuration, Astryx StyleX build plugin
 * @output Storybook config with Astryx source aliases, Codex MCP, tests, and static assets
 * @position Storybook app configuration for local development, docs, and Codex review workflows
 *
 * SYNC: When modified, update /apps/storybook/README.md
 */

import type {StorybookConfig} from '@storybook/react-vite';
import {astryxStylex} from '@astryxdesign/build/vite';
import path, {dirname} from 'path';
import {fileURLToPath} from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '../../..');

const lightningcssTargets = {
  chrome: 123 << 16,
  firefox: 120 << 16,
  safari: (17 << 16) | (5 << 8),
};

const viteBuildTargets = ['chrome123', 'firefox120', 'safari17.5'];

const config: StorybookConfig = {
  stories: ['../stories/**/*.stories.tsx'],
  addons: [
    getAbsolutePath('@storybook/addon-links'),
    getAbsolutePath('@storybook/addon-docs'),
    getAbsolutePath('@storybook/addon-vitest'),
    getAbsolutePath('@storybook/addon-mcp'),
  ],
  framework: {
    name: getAbsolutePath('@storybook/react-vite'),
    options: {},
  },
  staticDirs: ['../public'],
  docs: {defaultName: 'Docs'},
  viteFinal: async config => {
    const filteredPlugins =
      config.plugins?.filter(
        plugin =>
          !(
            plugin &&
            typeof plugin === 'object' &&
            'name' in plugin &&
            typeof plugin.name === 'string' &&
            plugin.name.includes('stylex')
          ),
      ) || [];

    return {
      ...config,
      build: {
        ...config.build,
        // esbuild will not downlevel syntax such as destructuring — target modern
        // browsers only.
        target: viteBuildTargets,
      },
      optimizeDeps: {
        ...config.optimizeDeps,
        // Vite waits for all module transforms to finish before committing
        // pre-bundled deps. The StyleX Babel plugin stalls on some Astryx core
        // components, so the crawl never completes and deps are never served.
        holdUntilCrawlEnd: false,
        esbuildOptions: {
          ...config.optimizeDeps?.esbuildOptions,
          // esbuild will not downlevel syntax such as destructuring — target modern
          // browsers only.
          target: viteBuildTargets,
        },
      },
      plugins: [
        {
          name: 'astryx-color-scheme',
          transformIndexHtml() {
            return [
              {
                tag: 'style',
                children: ':root { color-scheme: light; }',
                injectTo: 'head-prepend',
              },
            ];
          },
        },
        ...filteredPlugins,
        ...astryxStylex({
          stylexOptions: {
            dev: false,
            styleResolution: 'application-order',
            aliases: {
              '@astryxdesign/core/*': [
                path.join(rootDir, 'packages/core/src/*'),
              ],
              '@astryxdesign/core': [path.join(rootDir, 'packages/core/src')],
              '@astryxdesign/lab/*': [path.join(rootDir, 'packages/lab/src/*')],
              '@astryxdesign/lab': [path.join(rootDir, 'packages/lab/src')],
              '@astryxdesign/theme-neutral/*': [
                path.join(rootDir, 'packages/themes/neutral/src/*'),
              ],
              '@astryxdesign/theme-stone/*': [
                path.join(rootDir, 'packages/themes/stone/src/*'),
              ],
              '@astryxdesign/theme-y2k/*': [
                path.join(rootDir, 'packages/themes/y2k/src/*'),
              ],
            },
            unstable_moduleResolution: {
              type: 'commonJS',
              rootDir: rootDir,
            },
            lightningcssOptions: {
              targets: lightningcssTargets,
            },
          },
          libraryPattern: 'packages/',
        }),
      ],
      resolve: {
        ...config.resolve,
        alias: {
          ...config.resolve?.alias,
          '@astryxdesign/core': path.resolve(rootDir, 'packages/core/src'),
          '@astryxdesign/lab': path.resolve(rootDir, 'packages/lab/src'),
          '@astryxdesign/theme-neutral': path.resolve(
            rootDir,
            'packages/themes/neutral/src/source.ts',
          ),
          '@astryxdesign/theme-stone': path.resolve(
            rootDir,
            'packages/themes/stone/src/source.ts',
          ),
          '@astryxdesign/theme-y2k': path.resolve(
            rootDir,
            'packages/themes/y2k/src/source.ts',
          ),
          '@astryxdesign/vega': path.resolve(rootDir, 'packages/vega/src'),
        },
      },
      css: {
        transformer: 'lightningcss',
        lightningcss: {
          targets: lightningcssTargets,
        },
      },
    };
  },
};

export default config;

function getAbsolutePath(value: string): string {
  return dirname(fileURLToPath(import.meta.resolve(`${value}/package.json`)));
}
