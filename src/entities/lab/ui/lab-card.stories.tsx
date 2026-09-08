import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { MOCK_LABS } from "../model/mock-labs";

import { LabCard } from "./lab-card";

const meta = {
  title: "Entities/Lab/LabCard",
  component: LabCard,
  args: { lab: MOCK_LABS[0] },
  decorators: [(Story) => <div className="w-[343px] bg-bg-default p-4 md:w-[361px]"><Story /></div>],
} satisfies Meta<typeof LabCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const LongContent: Story = {
  args: {
    lab: {
      ...MOCK_LABS[0],
      description:
        "대규모 트래픽에서 침입 탐지 모델을 만들고, 캠퍼스망 데이터로 검증합니다. 긴 설명은 두 줄까지 표시되고 이후 내용은 생략됩니다.",
      name: "매우 긴 이름도 생략하지 않는 지능형 데이터 시스템 연구실",
      tags: ["데이터베이스", "빅데이터", "ML시스템", "분산시스템"],
    },
  },
};
