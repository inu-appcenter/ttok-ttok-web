import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MOCK_LAB_DETAILS } from "@/entities/lab";

import { LabDetailPage } from "./lab-detail-page";

const meta = {
  title: "Pages/LabDetailPage",
  component: LabDetailPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof LabDetailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    lab: MOCK_LAB_DETAILS[0],
  },
};

export const EmptyResearchInformation: Story = {
  args: {
    lab: MOCK_LAB_DETAILS[1],
  },
};
