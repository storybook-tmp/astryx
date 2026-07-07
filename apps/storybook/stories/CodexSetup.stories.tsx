// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect} from 'storybook/test';
import {Button} from '@astryxdesign/core/Button';

const meta = {
  component: Button,
  tags: ['ai-generated'],
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

export const PrimaryAction: Story = {
  args: {
    label: 'Run Codex check',
    variant: 'primary',
  },
  play: async ({canvas}) => {
    await expect(
      canvas.getByRole('button', {name: 'Run Codex check'}),
    ).toHaveAttribute('data-variant', 'primary');
  },
};

export const CssCheck: Story = {
  args: {
    label: 'Styled by Astryx',
    variant: 'primary',
  },
  play: async ({canvas}) => {
    const button = canvas.getByRole('button', {name: 'Styled by Astryx'});

    await expect(getComputedStyle(button).backgroundColor).toBe(
      'rgb(38, 38, 38)',
    );
  },
};
