import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MOCK_LABS } from "@/entities/lab";

import { MobileLabExplorer } from "./mobile-lab-explorer";

const meta = {
  title: "Features/SearchLab/MobileLabExplorer",
  component: MobileLabExplorer,
  args: {
    labs: MOCK_LABS,
  },
  decorators: [(Story) => <div className="w-[375px] bg-bg-default p-4"><Story /></div>],
} satisfies Meta<typeof MobileLabExplorer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
