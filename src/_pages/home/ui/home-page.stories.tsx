import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MOCK_LABS } from "@/entities/lab";

import { HomePage } from "./home-page";

const meta = {
  title: "Pages/Home",
  component: HomePage,
  args: { categories: ["AI", "로보틱스"] },
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

export const Empty: Story = {
  args: {
    labs: [],
  },
};

export const Error: Story = {
  args: {
    labs: [],
    labsError: "연구실 정보를 불러오지 못했습니다.",
  },
};

export const Authenticated: Story = {
  args: {
    labs: MOCK_LABS,
    isAuthenticated: true,
  },
};

export const LongContent: Story = {
  args: {
    labs: MOCK_LABS.slice(0, 6).map((lab) => ({
      ...lab,
      name: "인공지능 기반 지능형 데이터 분석 및 차세대 정보 시스템 연구실",
      description: "긴 연구실 소개가 카드 너비를 넘지 않고 표시되는지 확인합니다. ".repeat(5),
      tags: [],
    })),
  },
};

export const CategoriesUnavailable: Story = {
  args: {
    labs: MOCK_LABS,
    categories: [],
    categoriesError: "분야 목록을 불러오지 못했습니다. 검색어로 검색해주세요. ",
  },
};
