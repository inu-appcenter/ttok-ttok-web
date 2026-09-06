import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { OnboardingPage } from "./onboarding-page";

const meta = {
  title: "Pages/Onboarding",
  component: OnboardingPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof OnboardingPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
