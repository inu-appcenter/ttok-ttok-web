import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { Toast } from "./toast";
import { TOAST_DURATION, useToast } from "./toast-provider";

const meta = {
  title: "Shared/UI/Toast",
  component: Toast,
  args: { title: "토스트 메시지" },
  parameters: { layout: "centered" },
} satisfies Meta<typeof Toast>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Success: Story = { args: { state: "success" } };
export const Warning: Story = { args: { state: "warning" } };
export const Error: Story = { args: { state: "error" } };
export const Loading: Story = { args: { state: "loading" } };
export const WithDescription: Story = {
  args: { description: "토스트 설명 메시지가 들어갑니다.", state: "success" },
};

function ToastTriggers() {
  const showToast = useToast();
  return (
    <div className="flex gap-2">
      <button type="button" onClick={() => showToast({ state: "warning", title: "첫 번째 안내" })}>
        첫 번째
      </button>
      <button type="button" onClick={() => showToast({ state: "error", title: "두 번째 안내" })}>
        두 번째
      </button>
    </div>
  );
}

// 새 토스트는 이전 토스트를 대체해 화면에 하나만 남는다. 데코레이터가 ToastProvider를 제공한다.
export const SingleActiveToast: Story = {
  render: () => <ToastTriggers />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "첫 번째" }));
    await userEvent.click(canvas.getByRole("button", { name: "두 번째" }));
    await expect(canvas.getAllByRole("alert")).toHaveLength(1);
    await expect(canvas.getByRole("alert")).toHaveTextContent("두 번째 안내");
    await waitFor(
      () => expect(canvas.queryByRole("alert")).not.toBeInTheDocument(),
      { timeout: TOAST_DURATION + 1000 },
    );
  },
};
