import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { MOCK_LABS, type LabSummaryPage } from "@/entities/lab";
import { InfiniteLabResults, type SearchPageLoader } from "./infinite-lab-results";

const initialResult: LabSummaryPage = {
  content: [MOCK_LABS[0]], page: 0, size: 20,
  totalElements: 2, totalPages: 2, hasNext: true, isLast: false,
};
const finalResult: LabSummaryPage = {
  ...initialResult, page: 1, content: [MOCK_LABS[0], MOCK_LABS[1]],
  hasNext: false, isLast: true,
};
const defaultLoader: SearchPageLoader = async () => finalResult;
const pendingLoader = fn<SearchPageLoader>(async () => {
  await new Promise((resolve) => setTimeout(resolve, 250));
  return finalResult;
});

const meta = {
  title: "Features/SearchLab/InfiniteResults",
  component: InfiniteLabResults,
  args: { conditions: { query: "", category: "", page: 0 }, initialResult, loadPage: defaultLoader },
  decorators: [(Story) => <div className="mx-auto max-w-[1184px] p-4"><Story /></div>],
} satisfies Meta<typeof InfiniteLabResults>;
export default meta;
type Story = StoryObj<typeof meta>;

export const AutomaticAppend: Story = {
  args: { loadPage: fn(async () => finalResult) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getAllByRole("link")).toHaveLength(2));
    await expect(args.loadPage).toHaveBeenCalledTimes(1);
    await expect(canvas.queryByRole("button", { name: "더 보기" })).not.toBeInTheDocument();
    await expect(canvas.getByText("모든 검색 결과를 표시했어요.")).toBeInTheDocument();
  },
};

let retryAttempts = 0;
export const RetryFailure: Story = {
  beforeEach: () => { retryAttempts = 0; },
  args: { loadPage: fn<SearchPageLoader>(async () => {
    retryAttempts += 1;
    if (retryAttempts === 1) throw new Error("temporary failure");
    return finalResult;
  }) },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(canvas.getByRole("alert")).toBeInTheDocument());
    await expect(canvas.getAllByRole("link")).toHaveLength(1);
    await userEvent.click(canvas.getByRole("button", { name: "다시 시도" }));
    await waitFor(() => expect(canvas.getAllByRole("link")).toHaveLength(2));
    await expect(args.loadPage).toHaveBeenCalledTimes(2);
  },
};

export const LastPage: Story = {
  args: { initialResult: { ...initialResult, hasNext: false, isLast: true }, loadPage: fn(async () => finalResult) },
  play: async ({ canvasElement, args }) => {
    await expect(within(canvasElement).queryByRole("button")).not.toBeInTheDocument();
    await expect(args.loadPage).not.toHaveBeenCalled();
  },
};

export const ConditionChangeDuringRequest: Story = {
  render: function ConditionScenario(args) {
    const [category, setCategory] = useState("");
    return <>
      <button onClick={() => setCategory("AI")} type="button">AI 조건으로 변경</button>
      <InfiniteLabResults {...args} key={category} conditions={{ query: "", category, page: 0 }} initialResult={category ? { ...initialResult, content: [MOCK_LABS[2]], hasNext: false, isLast: true } : initialResult} />
    </>;
  },
  args: {
    loadPage: pendingLoader,
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await waitFor(() => expect(args.loadPage).toHaveBeenCalledOnce());
    const signal = pendingLoader.mock.calls[0][1];
    await userEvent.click(canvas.getByRole("button", { name: "AI 조건으로 변경" }));
    await expect(signal.aborted).toBe(true);
    await new Promise((resolve) => setTimeout(resolve, 300));
    await expect(canvas.getAllByRole("link")).toHaveLength(1);
    await expect(canvas.getByRole("link", { name: `${MOCK_LABS[2].name} 상세 보기` })).toBeInTheDocument();
  },
};
