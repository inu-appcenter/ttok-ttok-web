import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Field, Textarea } from "./field";

const meta = {
  title: "Shared/UI/Field",
  component: Field,
  args: { label: "라벨", placeholder: "Placeholder 내용" },
  decorators: [
    (Story) => (
      <div className="w-[280px]">
        <Story />
      </div>
    ),
  ],
  parameters: { layout: "centered" },
} satisfies Meta<typeof Field>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Focus: Story = { args: { autoFocus: true } };
export const Typing: Story = { args: { defaultValue: "입력중..." } };
export const Error: Story = { args: { error: "입력 내용을 확인해 주세요." } };
export const Invalid: Story = { args: { invalid: true } };
export const Disabled: Story = { args: { disabled: true } };

export const InputStates: Story = {
  render: (args) => (
    <div className="flex w-[280px] flex-col gap-5">
      <Field {...args} />
      <Field {...args} defaultValue="입력중..." />
      <Field {...args} error="입력 내용을 확인해 주세요." />
      <Field {...args} disabled />
    </div>
  ),
};

export const TextareaStates: Story = {
  render: (args) => (
    <div className="flex w-[280px] flex-col gap-5">
      <Textarea label={args.label} placeholder={args.placeholder} />
      <Textarea label={args.label} defaultValue="입력중..." />
      <Textarea
        label={args.label}
        error="입력 내용을 확인해 주세요."
        placeholder={args.placeholder}
      />
      <Textarea label={args.label} disabled placeholder={args.placeholder} />
    </div>
  ),
};
