# /apps/storybook

Storybook application for component development and visual documentation.

<!-- SYNC: When files in this directory change, update this document. -->

| File                     | Role   | Purpose                                                                                |
| ------------------------ | ------ | -------------------------------------------------------------------------------------- |
| `.storybook/main.ts`     | Config | Storybook Vite integration, preview build target, docgen service, and aliases          |
| `.storybook/preview.tsx` | Config | Storybook preview decorators, docs parameters, globals, theme providers, and MSW setup |
| `package.json`           | Config | Package dependencies and scripts                                                       |
| `tsconfig.json`          | Config | TypeScript compiler configuration                                                      |
| `vite.config.ts`         | Config | Vite bundler configuration with path aliases                                           |
