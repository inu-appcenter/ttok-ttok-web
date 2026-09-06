import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SearchField } from "./search-field";

const meta = {
  title: "Shared/UI/SearchField",
  component: SearchField,
  args: { placeholder: "검색어를 입력해 주세요" },
  decorators: [(Story) => <div className="w-[280px]"><Story /></div>],
  parameters: { layout: "centered" },
} satisfies Meta<typeof SearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Small: Story = { args: { size: "sm" } };
export const Typing: Story = { args: { defaultValue: "인공지능 연구실" } };
export const TopRounded: Story = { args: { rounded: "top" } };
export const Disabled: Story = { args: { disabled: true } };
