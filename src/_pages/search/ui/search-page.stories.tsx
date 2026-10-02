import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MOCK_LABS, type LabSummaryPage } from "@/entities/lab";

import { SearchPage } from "./search-page";

const firstPage: LabSummaryPage = {
  content: MOCK_LABS,
  hasNext: true,
  isLast: false,
  page: 0,
  size: 20,
  totalElements: 46,
  totalPages: 3,
};

const meta = {
  title: "Pages/SearchPage",
  component: SearchPage,
  args: {
    result: firstPage,
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
    result: {
      ...firstPage,
      content: MOCK_LABS.slice(0, 3),
      hasNext: false,
      isLast: true,
      totalElements: 3,
      totalPages: 1,
    },
  },
};

export const EmptySearch: Story = {
  args: {
    initialQuery: "양자컴퓨팅",
    result: {
      content: [],
      hasNext: false,
      isLast: true,
      page: 0,
      size: 20,
      totalElements: 0,
      totalPages: 0,
    },
  },
};

export const LastPage: Story = {
  args: {
    result: {
      ...firstPage,
      content: MOCK_LABS.slice(0, 6),
      hasNext: false,
      isLast: true,
      page: 2,
    },
  },
};

export const Loading: Story = {
  args: {
    result: undefined,
    status: "loading",
  },
};

export const Error: Story = {
  args: {
    errorMessage: "API 서버와 연결할 수 없습니다.",
    result: undefined,
    status: "error",
  },
};
