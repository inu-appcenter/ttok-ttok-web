import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { AiRecommendationButton } from "./ai-recommendation-button";

const meta = {
  title: "Features/RequestAiRecommendation/AiRecommendationButton",
  component: AiRecommendationButton,
} satisfies Meta<typeof AiRecommendationButton>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Enabled: Story = {};

export const Disabled: Story = {
  args: { disabled: true },
};
