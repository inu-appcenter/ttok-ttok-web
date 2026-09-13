import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { HomeBanner } from "./home-banner";

const meta = {
  title: "Widgets/HomeBanner",
  component: HomeBanner,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof HomeBanner>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
