import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MobileBottomNav } from "./mobile-bottom-nav";

const meta = {
  title: "Widgets/MobileBottomNav",
  component: MobileBottomNav,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof MobileBottomNav>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
