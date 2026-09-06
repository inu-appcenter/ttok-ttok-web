import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { BottomSheet } from "./bottom-sheet";

const meta = {
  title: "Shared/UI/BottomSheet",
  component: BottomSheet,
  args: {
    children: (
      <div className="rounded-[var(--radius-lg)] border border-dashed border-border-default px-4 py-8 text-center text-[length:var(--font-size-label2)] text-text-subtle">
        콘텐츠 영역
      </div>
    ),
    title: "Sheet Title",
  },
  decorators: [(Story) => <div className="w-[402px] bg-bg-neutral pt-8"><Story /></div>],
} satisfies Meta<typeof BottomSheet>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const WithoutCloseButton: Story = { args: { showCloseButton: false } };
