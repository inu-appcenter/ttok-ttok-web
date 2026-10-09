import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, userEvent, within } from "storybook/test";

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
    categories: ["AI", "데이터", "보안"],
    result: firstPage,
    loadPage: async (conditions) => ({
      ...firstPage,
      page: conditions.page,
      content: MOCK_LABS.map((lab) => ({ ...lab, labId: `${lab.labId}-page-${conditions.page}` })),
      hasNext: conditions.page < 2,
      isLast: conditions.page >= 2,
    }),
  },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof SearchPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const CategoryResults: Story = { args: { category: "AI" } };
export const CategoryUnavailable: Story = {
  args: { categories: [], categoriesError: "분야 목록을 불러오지 못했어요." },
};
export const InvalidConditions: Story = {
  args: {
    category: "AI",
    initialQuery: "교수명",
    invalidConditions: true,
    status: "error",
    result: undefined,
    errorMessage:
      "분야와 검색어는 각각 검색할 수 있어요. 하나의 조건만 선택해주세요.",
  },
};

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
    alternativeLabs: MOCK_LABS.slice(0, 3),
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

export const EmptyWithoutAlternatives: Story = {
  args: { ...EmptySearch.args, alternativeLabs: [] },
};

export const LongContent: Story = {
  args: {
    initialQuery: "매우긴검색어".repeat(12),
    result: {
      ...firstPage,
      content: MOCK_LABS.slice(0, 3).map((lab, index) => ({
        ...lab,
        name:
          index === 0
            ? "인공지능 기반 지능형 데이터 분석 및 차세대 정보 시스템 연구실"
            : lab.name,
        tags: index === 1 ? [] : lab.tags,
      })),
    },
  },
};

export const EmptyPage: Story = {
  args: {
    category: "AI",
    result: {
      ...firstPage,
      content: [],
      page: 99,
      hasNext: false,
      isLast: true,
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
  play: async ({ canvasElement }) => {
    getRouter().refresh.mockClear();
    await userEvent.click(
      within(canvasElement).getByRole("button", { name: "다시 시도" }),
    );
    await expect(getRouter().refresh).toHaveBeenCalledOnce();
  },
};
