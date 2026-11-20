import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { MOCK_LABS } from "../model/mock-labs";

import { LabCard, LabCardSkeleton } from "./lab-card";

const meta = {
  title: "Entities/Lab/LabCard",
  component: LabCard,
  args: { lab: MOCK_LABS[0] },
  decorators: [(Story) => <div className="w-[343px] bg-bg-default md:w-[361px]"><Story /></div>],
} satisfies Meta<typeof LabCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByRole("link");
    // 홈·탐색 목록의 카드는 같은 탭에서 상세로 이동한다.
    await expect(card).not.toHaveAttribute("target");
    const tag = within(card).getByText(MOCK_LABS[0].tags[0]);
    const container = tag.parentElement?.parentElement;
    await waitFor(() => expect(getComputedStyle(container!).maskImage).toBe("none"));
  },
};

export const OpensInNewTab: Story = {
  args: { opensInNewTab: true },
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByRole("link");
    await expect(card).toHaveAttribute("target", "_blank");
    await expect(card).toHaveAttribute("rel", "noopener noreferrer");
  },
};

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

export const NoTags: Story = {
  args: { lab: { ...MOCK_LABS[0], tags: [] } },
};

export const ManyTags: Story = {
  args: { lab: { ...MOCK_LABS[0], tags: ["데이터베이스", "빅데이터", "인공지능연구", "머신러닝시스템", "AI"] } },
  play: async ({ canvasElement }) => {
    const card = within(canvasElement).getByRole("link");
    const tag = within(card).getByText("AI");
    const row = tag.parentElement;
    const container = row?.parentElement;
    await expect(within(card).queryByText(/외 \d+개/)).not.toBeInTheDocument();
    await expect(row?.children).toHaveLength(5);
    await waitFor(() => expect(getComputedStyle(container!).maskImage).toContain("linear-gradient"));
    await expect(getComputedStyle(row!).flexWrap).toBe("nowrap");
  },
};

export const LongTag: Story = {
  args: { lab: { ...MOCK_LABS[0], tags: ["매우긴연구분야태그".repeat(8)] } },
};

export const ResizableTags: Story = {
  render: function ResizableCard(args) {
    const [isWide, setIsWide] = useState(false);
    return (
      <div>
        <button onClick={() => setIsWide(!isWide)} type="button">너비 변경</button>
        <div style={{ width: isWide ? 600 : 180 }}><LabCard {...args} /></div>
      </div>
    );
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const card = canvas.getByRole("link");
    const container = within(card).getByText(MOCK_LABS[0].tags[0]).parentElement?.parentElement;
    await waitFor(() => expect(getComputedStyle(container!).maskImage).toContain("linear-gradient"));
    await userEvent.click(canvas.getByRole("button", { name: "너비 변경" }));
    await waitFor(() => expect(getComputedStyle(container!).maskImage).toBe("none"));
  },
};

export const Skeleton: Story = {
  render: () => <LabCardSkeleton />,
};
