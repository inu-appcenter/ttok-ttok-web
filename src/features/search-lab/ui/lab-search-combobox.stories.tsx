import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LabSearchCombobox } from "./lab-search-combobox";

const meta = {
  title: "Features/SearchLab/LabSearchCombobox",
  component: LabSearchCombobox,
  args: {
    onSelect: () => undefined,
  },
  decorators: [
    (Story) => (
      <div className="w-[343px] py-10">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof LabSearchCombobox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Loading: Story = { args: { isLoading: true } };
export const Error: Story = {
  args: { errorMessage: "연구실을 불러오지 못했어요" },
};
