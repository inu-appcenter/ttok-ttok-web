import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { Checkbox, Radio, Toggle } from "./selection";

const meta = {
  title: "Shared/UI/Selection",
  component: Checkbox,
  args: { children: "옵션" },
  parameters: { layout: "centered" },
} satisfies Meta<typeof Checkbox>;

export default meta;
type Story = StoryObj<typeof meta>;

export const CheckboxStates: Story = {
  render: () => (
    <div className="flex flex-col gap-5">
      <Checkbox name="department" value="computer">체크박스</Checkbox>
      <Checkbox defaultChecked name="department" value="information">체크박스</Checkbox>
      <Checkbox size="sm" name="department" value="small">작은 체크박스</Checkbox>
      <Checkbox disabled name="department" value="disabled">비활성화</Checkbox>
    </div>
  ),
};

export const RadioCardStates: Story = {
  render: () => (
    <div className="flex flex-col gap-3">
      <Radio defaultChecked name="status" value="all">Radio Button</Radio>
      <Radio description="Supporting Text" name="status" value="support">Radio Button</Radio>
      <Radio name="status" value="open">Radio Button</Radio>
      <Radio disabled name="status" value="disabled">비활성화</Radio>
    </div>
  ),
};

export const RadioChipStates: Story = {
  render: () => (
    <div className="flex gap-3">
      <Radio appearance="chip" defaultChecked name="chip" value="selected">선택시</Radio>
      <Radio appearance="chip" name="chip" value="default">기본값</Radio>
      <Radio appearance="chip" disabled name="chip" value="disabled">비활성화</Radio>
    </div>
  ),
};

export const ToggleStates: Story = {
  render: () => (
    <div className="flex flex-col gap-5">
      <Toggle defaultChecked>켜짐</Toggle>
      <Toggle>꺼짐</Toggle>
      <Toggle disabled>비활성화</Toggle>
    </div>
  ),
};
