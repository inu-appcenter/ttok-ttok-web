import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MOCK_LABS } from "@/entities/lab";

import { HomePage } from "./home-page";

const meta = {
  title: "Pages/Home",
  component: HomePage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof HomePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    labs: MOCK_LABS,
  },
};
