import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Logo } from "./logo";

const meta = {
  title: "Shared/UI/Logo",
  component: Logo,
  parameters: { layout: "centered" },
} satisfies Meta<typeof Logo>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Horizontal: Story = {};
export const Wordmark: Story = { args: { variant: "wordmark" } };
export const Stacked: Story = { args: { variant: "stacked" } };
export const Vertical: Story = { args: { variant: "vertical" } };
