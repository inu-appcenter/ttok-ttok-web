import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
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
    const detailLink = (
      await canvas.findAllByRole("link", { name: "연구실 보기" })
    )[0];
    await expect(detailLink).toHaveAttribute("href", "/labs/124");
    await expect(detailLink).toHaveAttribute("target", "_blank");
    await expect(detailLink).toHaveAttribute("rel", "noopener noreferrer");
  },
};
// 새로 찾기: 이전 대화는 흐리게 남고 결과 카드는 유지되며, 상세 이동 후 복귀해도 현재 탭에서 복원된다.
export const NewSearchKeepsResults: Story = {
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
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    await userEvent.type(
      canvas.getByRole("textbox", { name: "관심 연구 주제" }),
      initialPrompt,
    );
    await userEvent.click(canvas.getByRole("button", { name: "보내기" }));
    await userEvent.click(
      await canvas.findByRole("checkbox", { name: "추천시스템" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "보내기" }));
    if (isMobile) {
      await userEvent.click(
        await canvas.findByRole("button", { name: /결과 보기/ }),
      );
    }
    await userEvent.click(
      await canvas.findByRole("button", { name: "연구실 추천 다시 받기" }),
    );
    await expect(
      canvas.getByRole("group", { name: "이전 추천 대화" }),
    ).toHaveTextContent(initialPrompt);
    await expect(canvas.getByRole("separator")).toBeInTheDocument();
    await expect(
      canvas.getByRole("textbox", { name: "관심 연구 주제" }),
    ).toHaveValue("");
    if (isMobile) {
      await expect(
        canvas.getByRole("button", { name: /이전 추천/ }),
      ).toBeInTheDocument();
    } else {
      await expect(
        (await canvas.findAllByRole("link", { name: "연구실 보기" }))[0],
      ).toBeInTheDocument();
    }
    const toggle = canvas.getByRole("button", { name: "상세 이동 토글" });
    await userEvent.click(toggle);
    await userEvent.click(toggle);
    await expect(
      canvas.getByRole("group", { name: "이전 추천 대화" }),
    ).toHaveTextContent(initialPrompt);
    await expect(
      canvas.getByRole("textbox", { name: "관심 연구 주제" }),
    ).toHaveValue("");
    clearSessionStore();
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
      await userEvent.click(
        await canvas.findByRole("button", { name: /결과 보기/ }),
      );
    }
    await canvas.findAllByRole("link", { name: "연구실 보기" });
    const toggle = canvas.getByRole("button", { name: "상세 이동 토글" });
    await userEvent.click(toggle);
    await userEvent.click(toggle);
    await expect(canvas.getByText(initialPrompt)).toBeInTheDocument();
    if (window.matchMedia("(max-width: 1023px)").matches) {
      await userEvent.click(
        await canvas.findByRole("button", { name: /결과 보기/ }),
      );
    }
    await expect(
      (await canvas.findAllByRole("link", { name: "연구실 보기" }))[0],
    ).toHaveAttribute("href", "/labs/124");
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
        {visible && <AiRecommendationsPage {...args} sessionKey={sessionKey} />}
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
// 이전 대화가 남은 상태에서 인증이 바뀌면 이전 대화까지 모두 비우고 복귀해도 복원하지 않는다.
export const PastTurnsClearedOnAuthChange: Story = {
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
    const isMobile = window.matchMedia("(max-width: 1023px)").matches;
    await userEvent.type(
      canvas.getByRole("textbox", { name: "관심 연구 주제" }),
      initialPrompt,
    );
    await userEvent.click(canvas.getByRole("button", { name: "보내기" }));
    await userEvent.click(
      await canvas.findByRole("checkbox", { name: "추천시스템" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "보내기" }));
    if (isMobile) {
      await userEvent.click(
        await canvas.findByRole("button", { name: /결과 보기/ }),
      );
    }
    await userEvent.click(
      await canvas.findByRole("button", { name: "연구실 추천 다시 받기" }),
    );
    await canvas.findByRole("group", { name: "이전 추천 대화" });
    notifyAuthChange();
    await waitFor(() =>
      expect(
        canvas.queryByRole("group", { name: "이전 추천 대화" }),
      ).not.toBeInTheDocument(),
    );
    const toggle = canvas.getByRole("button", { name: "상세 이동 토글" });
    await userEvent.click(toggle);
    await userEvent.click(toggle);
    await expect(
      canvas.queryByRole("group", { name: "이전 추천 대화" }),
    ).not.toBeInTheDocument();
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

// 취소된 요청이 뒤늦게 성공해도 새 요청의 키워드를 덮어쓰지 않는다.
export const LateCanceledResponse: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    let resolveCanceled: (keywords: string[]) => void = () => {};
    if (!args.onSuggest) throw new Error("키워드 요청 mock이 필요합니다.");
    args.onSuggest.mockImplementationOnce(
      () =>
        new Promise<string[]>((resolve) => {
          resolveCanceled = resolve;
        }),
    );
    await userEvent.type(
      canvas.getByRole("textbox", { name: "관심 연구 주제" }),
      initialPrompt,
    );
    await userEvent.click(canvas.getByRole("button", { name: "보내기" }));
    await userEvent.click(
      await canvas.findByRole("button", { name: "요청 취소" }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "보내기" }));
    await canvas.findByRole("checkbox", { name: "추천시스템" });
    resolveCanceled(["취소한 요청의 키워드"]);
    await userEvent.click(canvas.getByRole("checkbox", { name: "추천시스템" }));
    await expect(
      canvas.getByRole("checkbox", { name: "추천시스템" }),
    ).toBeChecked();
    await waitFor(() =>
      expect(
        canvas.getByRole("checkbox", { name: "추천시스템" }),
      ).toBeInTheDocument(),
    );
    await expect(
      canvas.queryByRole("checkbox", { name: "취소한 요청의 키워드" }),
    ).not.toBeInTheDocument();
  },
};

export const CustomKeywordLimit: Story = {
  args: { ...Keywords.args },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("checkbox", { name: KEYWORD_OPTIONS[0] }),
    );
    await userEvent.click(
      canvas.getByRole("checkbox", { name: KEYWORD_OPTIONS[1] }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "직접 입력" }));
    const input = canvas.getByRole("textbox", { name: "직접 입력" });
    await userEvent.type(input, "나만의 연구 주제{Enter}");
    await expect(
      canvas.getByRole("checkbox", { name: "나만의 연구 주제" }),
    ).toBeChecked();
    await expect(
      canvas.getByRole("button", { name: "직접 입력" }),
    ).toBeDisabled();
    await expect(
      canvas.getByRole("checkbox", { name: KEYWORD_OPTIONS[2] }),
    ).toBeDisabled();
    await userEvent.click(canvas.getByRole("button", { name: "보내기" }));
    await expect(args.onRecommend).toHaveBeenCalledWith(
      {
        interest: initialPrompt,
        selectedKeywords: [
          KEYWORD_OPTIONS[0],
          KEYWORD_OPTIONS[1],
          "나만의 연구 주제",
        ],
      },
      expect.any(AbortSignal),
    );
  },
};

export const MobileResultKeyboard: Story = {
  args: { ...Result.args },
  play: async ({ canvasElement }) => {
    if (window.matchMedia("(min-width: 1024px)").matches) return;
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: /결과 보기/ });
    await userEvent.click(trigger);
    const dialog = within(await canvas.findByRole("dialog"));
    const close = dialog.getByRole("button", { name: "닫기" });
    await expect(close).toHaveFocus();
    await userEvent.tab({ shift: true });
    await expect(
      dialog.getByRole("button", { name: "연구실 추천 다시 받기" }),
    ).toHaveFocus();
    await userEvent.tab();
    await expect(close).toHaveFocus();
    await userEvent.keyboard("{Escape}");
    await waitFor(() =>
      expect(canvas.queryByRole("dialog")).not.toBeInTheDocument(),
    );
    await expect(trigger).toHaveFocus();
  },
};
