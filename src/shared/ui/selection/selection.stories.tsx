import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useState } from "react";
import { expect, userEvent, within } from "storybook/test";

import { ChoiceChipGroup } from "./choice-chip-group";
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

function ChoiceChipGroupDemo() {
  const [coreTime, setCoreTime] = useState("있어요");
  // "기타 업무"는 선택지에 없는 저장값으로, 칩으로 덧붙여 보여준다.
  const [doings, setDoings] = useState(["논문 리딩", "기타 업무"]);
  return (
    <div className="flex w-[340px] flex-col gap-4">
      <ChoiceChipGroup
        label="코어타임"
        name="story-core-time"
        onChange={setCoreTime}
        options={["있어요", "없어요"]}
        value={coreTime}
      />
      <ChoiceChipGroup
        hint="최대 3개까지 선택할 수 있어요"
        label="주로 하는 일"
        maxSelected={3}
        multiple
        name="story-doings"
        onChange={setDoings}
        options={["논문 리딩", "실험/코딩", "데이터 라벨링", "세미나 발표"]}
        value={doings}
      />
    </div>
  );
}

export const ChoiceChipGroupStates: Story = {
  render: () => <ChoiceChipGroupDemo />,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("checkbox", { name: "기타 업무" })).toBeChecked();
    await userEvent.click(canvas.getByRole("checkbox", { name: "실험/코딩" }));
    await expect(canvas.getByRole("checkbox", { name: "세미나 발표" })).toBeDisabled();
    await userEvent.click(canvas.getByRole("checkbox", { name: "기타 업무" }));
    await expect(canvas.getByRole("checkbox", { name: "세미나 발표" })).toBeEnabled();
    await userEvent.click(canvas.getByRole("radio", { name: "없어요" }));
    await expect(canvas.getByRole("radio", { name: "없어요" })).toBeChecked();
  },
};
