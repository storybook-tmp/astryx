// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {Meta, StoryObj} from '@storybook/react-vite';
import {expect} from 'storybook/test';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Text} from '@astryxdesign/core/Text';

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

export const RandomComponentSampler: Story = {
  args: {
    label: 'Random component sampler',
  },
  render: () => (
    <Card width={420}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 16}}>
        <div style={{display: 'flex', flexDirection: 'column', gap: 4}}>
          <Text type="label" weight="semibold">
            Random XDS component sampler
          </Text>
          <Text type="supporting" color="secondary">
            A compact grab bag of design-system primitives rendered together.
          </Text>
        </div>

        <div style={{display: 'flex', gap: 8, flexWrap: 'wrap'}}>
          <Badge variant="info" label="Docs" />
          <Badge variant="success" label="Ready" />
          <Badge variant="purple" label="Beta" />
        </div>

        <div style={{display: 'flex', gap: 8, alignItems: 'center'}}>
          <StatusDot variant="success" label="System healthy" isPulsing />
          <Text type="supporting" color="secondary">
            Components are online
          </Text>
        </div>

        <ProgressBar
          value={68}
          label="Setup coverage"
          variant="accent"
          hasValueLabel
        />

        <div style={{display: 'flex', gap: 8}}>
          <Button label="Secondary action" variant="secondary" size="sm" />
          <Button label="Primary action" variant="primary" size="sm" />
        </div>
      </div>
    </Card>
  ),
  play: async ({canvas}) => {
    await expect(
      canvas.getByText('Random XDS component sampler'),
    ).toBeInTheDocument();
    await expect(
      canvas.getByRole('button', {name: 'Primary action'}),
    ).toBeInTheDocument();
    await expect(canvas.getByText('68%')).toBeInTheDocument();
  },
};
