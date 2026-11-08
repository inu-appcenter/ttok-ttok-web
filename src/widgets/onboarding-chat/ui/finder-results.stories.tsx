import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { FinderResults } from "./finder-results";

const interest = "추천시스템에 관심이 있고, 파이썬으로 크롤링 프로젝트를 해봤어요.";
const result = {
  noMatch: false,
  recommendations: [
    {
      id: 157,
      name: "지능형 데이터 시스템 연구실",
      professor: "김OO",
      department: "컴퓨터공학부",
      tags: ["데이터베이스", "빅데이터"],
      reasons: ["추천시스템·데이터 분야가 겹쳐요"],
    },
  ],
};

const meta = {
  title: "Widgets/Onboarding/FinderResults",
  component: FinderResults,
  args: {
    disabled: false,
    interest,
    onHome: fn(),
    onOpen: fn(),
  },
  parameters: { layout: "centered" },
} satisfies Meta<typeof FinderResults>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Result: Story = {
  args: { onRecommend: fn(async () => result) },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("heading", { name: result.recommendations[0].name })).toBeVisible();
    await expect(args.onRecommend).toHaveBeenCalledWith(
      { interest, selectedKeywords: [] },
      expect.any(AbortSignal),
    );
    await expect(canvas.queryByText("예시 추천 결과")).not.toBeInTheDocument();
    await expect(canvas.queryByRole("button", { name: "입력 내용 수정" })).not.toBeInTheDocument();
    await expect(canvas.getByRole("button", { name: "홈에서 더 둘러보기" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: `${result.recommendations[0].name} 보기` }));
    await expect(args.onOpen).toHaveBeenCalledWith("/labs/157");
  },
};

export const NoMatch: Story = {
  args: { onRecommend: fn(async () => ({ noMatch: true, recommendations: [] })) },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByText("맞는 연구실을 찾지 못했어요.")).toBeVisible();
    await expect(canvas.getByRole("button", { name: "홈에서 더 둘러보기" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "홈에서 더 둘러보기" }));
    await expect(args.onHome).toHaveBeenCalledTimes(1);
  },
};

export const RequestError: Story = {
  args: { onRecommend: fn(async () => { throw new Error("추천 서비스를 사용할 수 없습니다."); }) },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("alert")).toHaveTextContent("추천 서비스를 사용할 수 없습니다.");
    await expect(canvas.getByRole("button", { name: "다시 시도하기" })).toBeVisible();
    await expect(canvas.getByRole("button", { name: "홈에서 더 둘러보기" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "다시 시도하기" }));
    await waitFor(() => expect(args.onRecommend).toHaveBeenCalledTimes(2));
  },
};
