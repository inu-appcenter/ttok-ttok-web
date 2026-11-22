import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, waitFor, within } from "storybook/test";

import { HomeServiceGuide } from "./home-service-guide";

const meta = {
  title: "Pages/Home/ServiceGuide",
  component: HomeServiceGuide,
  decorators: [(Story) => <div className="mx-auto max-w-[1280px] px-4"><Story /></div>],
} satisfies Meta<typeof HomeServiceGuide>;

export default meta;

type Story = StoryObj<typeof meta>;

function opacityOf(element: Element) {
  return Number(getComputedStyle(element).opacity);
}

// 화면에 들어오면 말풍선과 메일 본문이 차례로 나타나고, 끝나면 시안과 같은 완성 상태가 된다.
export const Playback: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const answer = canvas.getByText("딥러닝이랑 자연어처리요!");
    const lastLine = canvas.getByText((_, element) => element?.tagName === "P" && element.textContent?.startsWith("학부연구생으로 참여하고") === true);
    await waitFor(() => expect(opacityOf(answer)).toBe(1), { timeout: 4000 });
    await waitFor(
      () => {
        // 모션 줄이기 설정에서는 글자를 나누지 않으므로 나눈 글자가 있을 때만 확인한다.
        lastLine.querySelectorAll("span:not(:last-child)").forEach((char) => expect(opacityOf(char)).toBe(1));
      },
      { timeout: 8000 },
    );
    expect(canvas.getByText("비전·그래픽스 연구실")).toBeVisible();
  },
};
