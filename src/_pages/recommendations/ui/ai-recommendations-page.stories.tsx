import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MOCK_LABS } from "@/entities/lab";

import { AiRecommendationsPage } from "./ai-recommendations-page";

const prompt = "추천시스템에 관심이 있고, 파이썬으로 크롤링 프로젝트를 해봤어요. 데이터 다루는 걸 좋아합니다.";

const meta = {
  title: "Pages/AiRecommendationsPage",
  component: AiRecommendationsPage,
  args: {
    labs: MOCK_LABS,
  },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AiRecommendationsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Input: Story = {};

export const Result: Story = {
  args: {
    initialPrompt: prompt,
    initialView: "results",
  },
};
