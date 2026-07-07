// Copyright (c) Meta Platforms, Inc. and affiliates.

/**
 * @file msw-handlers.ts
 * @input Storybook stories that perform browser network requests during render
 * @output Shared MSW handler collection for Storybook preview and browser tests
 * @position Storybook mock-data boundary; add specific endpoint handlers here when stories need them
 */

import type {RequestHandler} from 'msw';

export const mswHandlers: RequestHandler[] = [];
