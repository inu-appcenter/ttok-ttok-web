import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MOCK_LABS } from "@/entities/lab";

import { SearchPage } from "./search-page";

const meta = {
  title: "Pages/SearchPage",
  component: SearchPage,
  args: {
    isAuthenticated: false,
    labs: MOCK_LABS,
  },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SearchPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const SearchResults: Story = {
  args: {
    initialQuery: "데이터",
  },
};

export const EmptySearch: Story = {
  args: {
    initialQuery: "양자컴퓨팅",
  },
};
