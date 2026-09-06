import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { SearchResultItem } from "./search-result-item";

const meta = {
  title: "Shared/UI/SearchResultItem",
  component: SearchResultItem,
  parameters: { layout: "centered" },
} satisfies Meta<typeof SearchResultItem>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutTags: Story = { args: { showTags: false } };
export const LongContent: Story = {
  args: {
    name: "지능형 데이터 시스템 연구실",
    info: "김다윤 교수 · 컴퓨터공학부",
    tags: ["데이터베이스", "빅데이터", "인공지능"],
  },
};
