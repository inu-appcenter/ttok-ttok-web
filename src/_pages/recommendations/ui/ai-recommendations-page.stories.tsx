import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn, userEvent, within } from "storybook/test";
import {
  clearSessionStore,
  notifyAuthChange,
} from "@/shared/lib/session-store";
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
// 상세 이동(언마운트) 후 복귀(재마운트)를 흉내 낸다.
export const RestoredAfterDetail: Story = {
  args: { memberId: 7001, sessionKey: "session-a" },
  render: function Render(args) {
    const [visible, setVisible] = useState(true);
    return (
      <>
        <button type="button" onClick={() => setVisible((value) => !value)}>
          상세 이동 토글
        </button>
        {visible && <AiRecommendationsPage {...args} />}
      </>
    );
  },
  play: async ({ canvasElement, args }) => {
    clearSessionStore();
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole("textbox", { name: "관심 연구 주제" }),
      initialPrompt,
    );
    await userEvent.click(canvas.getByRole("button", { name: "보내기" }));
    await userEvent.click(
      await canvas.findByRole("checkbox", { name: "추천시스템" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "보내기" }));
    if (window.matchMedia("(max-width: 1023px)").matches) {
      await userEvent.click(await canvas.findByRole("button", { name: /결과 보기/ }));
    }
    await canvas.findAllByRole("link", { name: "연구실 보기" });
    const toggle = canvas.getByRole("button", { name: "상세 이동 토글" });
    await userEvent.click(toggle);
    await userEvent.click(toggle);
    await expect(canvas.getByText(initialPrompt)).toBeInTheDocument();
    if (window.matchMedia("(max-width: 1023px)").matches) {
      await userEvent.click(await canvas.findByRole("button", { name: /결과 보기/ }));
    }
    await expect((await canvas.findAllByRole("link", { name: "연구실 보기" }))[0]).toHaveAttribute("href", "/labs/124");
    await expect(args.onSuggest).toHaveBeenCalledTimes(1);
    await expect(args.onRecommend).toHaveBeenCalledTimes(1);
    clearSessionStore();
  },
};
// 같은 계정으로 다시 로그인하면 세션 키가 달라져 이전 대화를 복원하지 않는다.
export const NotRestoredAfterRelogin: Story = {
  args: { memberId: 7001, sessionKey: "session-a" },
  render: function Render(args) {
    const [sessionKey, setSessionKey] = useState(args.sessionKey);
    const [visible, setVisible] = useState(true);
    return (
      <>
        <button
          type="button"
          onClick={() => {
            setVisible(false);
            setSessionKey("session-b");
          }}
        >
          재로그인
        </button>
        <button type="button" onClick={() => setVisible(true)}>
          다시 열기
        </button>
        {visible && (
          <AiRecommendationsPage {...args} sessionKey={sessionKey} />
        )}
      </>
    );
  },
  play: async ({ canvasElement }) => {
    clearSessionStore();
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole("textbox", { name: "관심 연구 주제" }),
      initialPrompt,
    );
    await userEvent.click(canvas.getByRole("button", { name: "보내기" }));
    await canvas.findByRole("checkbox", { name: "추천시스템" });
    await userEvent.click(canvas.getByRole("button", { name: "재로그인" }));
    await userEvent.click(canvas.getByRole("button", { name: "다시 열기" }));
    await expect(
      canvas.getByRole("textbox", { name: "관심 연구 주제" }),
    ).toHaveValue("");
    clearSessionStore();
  },
};
// 다른 탭의 로그인·로그아웃 신호를 받으면 현재 화면과 메모리 상태를 비운다.
export const ClearedOnAuthChange: Story = {
  args: { memberId: 7001, sessionKey: "session-a" },
  render: function Render(args) {
    const [visible, setVisible] = useState(true);
    return (
      <>
        <button type="button" onClick={() => setVisible((value) => !value)}>
          상세 이동 토글
        </button>
        {visible && <AiRecommendationsPage {...args} />}
      </>
    );
  },
  play: async ({ canvasElement }) => {
    clearSessionStore();
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole("textbox", { name: "관심 연구 주제" }),
      initialPrompt,
    );
    await userEvent.click(canvas.getByRole("button", { name: "보내기" }));
    await canvas.findByRole("checkbox", { name: "추천시스템" });
    notifyAuthChange();
    await expect(
      await canvas.findByRole("textbox", { name: "관심 연구 주제" }),
    ).toHaveValue("");
    const toggle = canvas.getByRole("button", { name: "상세 이동 토글" });
    await userEvent.click(toggle);
    await userEvent.click(toggle);
    await expect(
      canvas.getByRole("textbox", { name: "관심 연구 주제" }),
    ).toHaveValue("");
    clearSessionStore();
  },
};
export const NotRestoredWithoutMemberId: Story = {
  render: function Render(args) {
    const [visible, setVisible] = useState(true);
    return (
      <>
        <button type="button" onClick={() => setVisible((value) => !value)}>
          상세 이동 토글
        </button>
        {visible && <AiRecommendationsPage {...args} />}
      </>
    );
  },
  play: async ({ canvasElement }) => {
    clearSessionStore();
    const canvas = within(canvasElement);
    await userEvent.type(
      canvas.getByRole("textbox", { name: "관심 연구 주제" }),
      initialPrompt,
    );
    await userEvent.click(canvas.getByRole("button", { name: "보내기" }));
    await canvas.findByRole("checkbox", { name: "추천시스템" });
    const toggle = canvas.getByRole("button", { name: "상세 이동 토글" });
    await userEvent.click(toggle);
    await userEvent.click(toggle);
    await expect(
      canvas.getByRole("textbox", { name: "관심 연구 주제" }),
    ).toHaveValue("");
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
