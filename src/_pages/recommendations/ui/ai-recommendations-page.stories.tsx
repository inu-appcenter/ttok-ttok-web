import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { AiRecommendationsPage } from "./ai-recommendations-page";
const meta = {
  title: "Pages/AiRecommendationsPage",
  component: AiRecommendationsPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof AiRecommendationsPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Input: Story = {};
const initialPrompt =
  "추천시스템에 관심이 있고, 파이썬으로 크롤링 프로젝트를 해봤어요.";
export const Keywords: Story = {
  args: { initialPrompt, initialStep: "keywords" },
};
export const Atmosphere: Story = {
  args: { initialPrompt, initialStep: "atmosphere" },
};
export const Result: Story = {
  args: { initialPrompt, initialStep: "results" },
};
