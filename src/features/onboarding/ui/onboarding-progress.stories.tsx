import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { OnboardingProgress } from "./onboarding-progress";

const meta = {
  title: "Features/Onboarding/Progress",
  component: OnboardingProgress,
  args: { currentStep: 1 },
  decorators: [
    (Story) => (
      <div className="w-[375px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof OnboardingProgress>;

export default meta;
type Story = StoryObj<typeof meta>;

export const FirstStep: Story = {};
export const MiddleStep: Story = { args: { currentStep: 4 } };
export const LastStep: Story = { args: { currentStep: 8 } };
