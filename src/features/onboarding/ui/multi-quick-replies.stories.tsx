import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MultiQuickReplies } from "./quick-replies";

const options = [
  { label: "논문 리딩", value: "paper" },
  { label: "실험 준비", value: "experiment" },
  { label: "코딩/프로그래밍", value: "coding" },
  { label: "데이터 라벨링", value: "labeling" },
  { label: "학회 발표", value: "conference" },
  { label: "실험 데이터 정리", value: "data" },
  { label: "행정 업무", value: "admin" },
  { label: "과제 참여", value: "project" },
  { label: "기타", value: "other" },
];

const meta = {
  title: "Features/Onboarding/MultiQuickReplies",
  component: MultiQuickReplies,
  args: {
    maxSelections: 3,
    options,
  },
  decorators: [
    (Story) => (
      <div className="w-[343px]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof MultiQuickReplies>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Selected: Story = {
  args: { values: ["paper", "experiment", "project"] },
};
