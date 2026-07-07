// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file preview.tsx
 * @input Storybook preview globals, Astryx themes, MSW handlers, docs controls,
 *   and reset CSS
 * @output Shared decorators/loaders/parameters for rendering stories with
 *   production-like theme context
 * @position Storybook preview runtime; keep provider and mock setup centralized for stories
 *
 * SYNC: When modified, update /apps/storybook/README.md
 */

import type {Preview, Decorator} from '@storybook/react-vite';
import * as React from 'react';
import {Theme, LayerProvider} from '@astryxdesign/core';
import {neutralTheme} from '@astryxdesign/theme-neutral';
import {stoneTheme} from '@astryxdesign/theme-stone';
import {y2kTheme} from '@astryxdesign/theme-y2k';
import MockDate from 'mockdate';
import {initialize, mswLoader} from 'msw-storybook-addon';
import {mswHandlers} from './msw-handlers';
// Import the base reset stylesheet
import '@astryxdesign/core/reset.css';

initialize({onUnhandledRequest: 'bypass'});

/**
 * Map of available themes
 */
const themes = {
  neutral: neutralTheme,
  stone: stoneTheme,
  y2k: y2kTheme,
};

/**
 * Decorator that wraps all stories in the Astryx Theme provider.
 *
 * Sets `color-scheme` on the document root so that CSS `light-dark()`
 * resolves correctly at every level of the page — not just inside the
 * Theme wrapper div.  Without this, the iframe's `<html>` and
 * `<body>` keep the browser-default `color-scheme` (typically "light")
 * and toggling the toolbar has no visible effect.
 */
const withTheme: Decorator = (Story, context) => {
  // Get theme selection from toolbar
  const themeKey = (context.globals?.astryxTheme || 'neutral') as string;
  const mode = context.globals?.colorMode === 'dark' ? 'dark' : 'light';

  // Sync color-scheme to the document root so light-dark() works
  // everywhere, including on <html>/<body> backgrounds and any
  // elements rendered outside the Theme wrapper.
  React.useEffect(() => {
    document.documentElement.style.setProperty('color-scheme', mode);
  }, [mode]);

  // No theme — render with just base defineVars defaults
  if (themeKey === 'none') {
    return (
      <div
        style={{
          colorScheme: mode,
          padding: 16,
        }}>
        <Story />
      </div>
    );
  }

  const theme = themes[themeKey as keyof typeof themes] || neutralTheme;

  return (
    <Theme theme={theme} mode={mode}>
      <LayerProvider>
        <div
          style={{
            backgroundColor: 'var(--color-background-surface)',
            padding: 16,
          }}>
          <Story />
        </div>
      </LayerProvider>
    </Theme>
  );
};

const preview: Preview = {
  parameters: {
    docs: {
      codePanel: true,
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      disabled: true,
    },
    layout: 'fullscreen',
    msw: {
      handlers: mswHandlers,
    },
  },
  loaders: [mswLoader],
  async beforeEach() {
    MockDate.set('2024-04-01T12:00:00Z');

    return () => {
      MockDate.reset();
    };
  },
  globalTypes: {
    astryxTheme: {
      description: 'Astryx Theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          {value: 'none', title: 'None (base tokens)', icon: 'close'},
          {value: 'neutral', title: 'Neutral', icon: 'circle'},
          {value: 'stone', title: 'Stone', icon: 'circlehollow'},
          {value: 'y2k', title: 'Y2K', icon: 'lightning'},
        ],
        dynamicTitle: true,
      },
    },
    colorMode: {
      description: 'Color mode',
      toolbar: {
        title: 'Mode',
        icon: 'contrast',
        items: [
          {value: 'light', title: 'Light', icon: 'sun'},
          {value: 'dark', title: 'Dark', icon: 'moon'},
        ],
        dynamicTitle: true,
      },
    },
  },
  initialGlobals: {
    astryxTheme: 'neutral',
    colorMode: 'light',
  },
  decorators: [withTheme],
};

export default preview;
