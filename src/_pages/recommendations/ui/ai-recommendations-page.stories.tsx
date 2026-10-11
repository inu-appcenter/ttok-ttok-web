import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, within } from "storybook/test";
import {
  KEYWORD_OPTIONS,
  MOCK_RECOMMENDATIONS,
} from "@/features/request-ai-recommendation";
import { AiRecommendationsPage } from "./ai-recommendations-page";
const result = {
  noMatch: false,
  recommendations: MOCK_RECOMMENDATIONS.map((lab) => ({
    ...lab,
    department: "컴퓨터공학부",
  })),
};
const meta = {
  title: "Pages/AiRecommendationsPage",
  component: AiRecommendationsPage,
  parameters: { layout: "fullscreen" },
  args: {
    onSuggest: fn(async () => KEYWORD_OPTIONS),
    onRecommend: fn(async () => result),
  },
} satisfies Meta<typeof AiRecommendationsPage>;
export default meta;
type Story = StoryObj<typeof meta>;
const initialPrompt =
  "추천시스템에 관심이 있고, 파이썬으로 크롤링 프로젝트를 해봤어요.";
export const Input: Story = {};
export const Keywords: Story = {
  args: {
    initialPrompt,
    initialStep: "keywords",
    initialKeywords: KEYWORD_OPTIONS,
  },
};
export const Result: Story = {
  args: {
    initialPrompt,
    initialStep: "results",
    initialKeywords: KEYWORD_OPTIONS.slice(0, 2),
    initialResult: result,
  },
};
export const NoMatch: Story = {
  args: {
    ...Result.args,
    initialResult: { noMatch: true, recommendations: [] },
  },
};
export const EmptyKeywords: Story = {
  args: { ...Keywords.args, initialKeywords: [] },
};
export const SearchFallback: Story = {
  args: {
    ...Result.args,
    initialResult: {
      noMatch: false,
      recommendations: [{ ...result.recommendations[0], reasons: [] }],
    },
  },
};
export const CompleteFlow: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole("textbox", { name: "관심 연구 주제" }),
      initialPrompt,
    );
    await userEvent.click(canvas.getByRole("button", { name: "보내기" }));
    await expect(args.onSuggest).toHaveBeenCalledWith(
      initialPrompt,
      expect.any(AbortSignal),
    );
    await userEvent.click(
      await canvas.findByRole("checkbox", { name: "추천시스템" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "보내기" }));
    await expect(args.onRecommend).toHaveBeenCalledWith(
      { interest: initialPrompt, selectedKeywords: ["추천시스템"] },
      expect.any(AbortSignal),
    );
    if (window.matchMedia("(max-width: 1023px)").matches) {
      await userEvent.click(
        await canvas.findByRole("button", { name: /결과 보기/ }),
      );
    }
    await expect(
      (await canvas.findAllByRole("link", { name: "연구실 보기" }))[0],
    ).toHaveAttribute("href", "/labs/124");
  },
};
export const Failure: Story = {
  args: {
    ...Keywords.args,
    onRecommend: fn(async () => {
      throw new Error("추천을 일시적으로 사용할 수 없어요.");
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("checkbox", { name: "추천시스템" }));
    await userEvent.click(canvas.getByRole("button", { name: "보내기" }));
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "추천을 일시적으로 사용할 수 없어요.",
    );
    await expect(
      canvas.getByRole("checkbox", { name: "추천시스템" }),
    ).toBeChecked();
  },
};
export const CanceledRequest: Story = {
  args: {
    onSuggest: fn(
      (_interest: string, signal: AbortSignal) =>
        new Promise<string[]>((_resolve, reject) =>
          signal.addEventListener(
            "abort",
            () => reject(new DOMException("Canceled", "AbortError")),
            { once: true },
          ),
        ),
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole("textbox", { name: "관심 연구 주제" }),
      initialPrompt,
    );
    await userEvent.click(canvas.getByRole("button", { name: "보내기" }));
    await userEvent.click(
      await canvas.findByRole("button", { name: "요청 취소" }),
    );
    await expect(canvas.getByRole("button", { name: "보내기" })).toBeEnabled();
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
  },
};
