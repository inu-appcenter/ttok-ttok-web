import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import Image from "next/image";

import { Button } from "./button";

const meta = {
  title: "Shared/UI/Button",
  component: Button,
  args: { children: "Button Label" },
  parameters: { layout: "centered" },
} satisfies Meta<typeof Button>;

export default meta;
type Story = StoryObj<typeof meta>;

const icon = (
  <Image alt="" height={18} src="/icons/check.svg" width={18} />
);

export const Primary: Story = {};
export const Secondary: Story = { args: { variant: "secondary" } };
export const Tertiary: Story = { args: { variant: "tertiary" } };
export const Outline: Story = { args: { variant: "outline" } };
export const Text: Story = { args: { children: "보내기", variant: "text" } };
export const TextDisabled: Story = {
  args: { children: "보내기", disabled: true, variant: "text" },
};
export const Loading: Story = { args: { isLoading: true } };
export const Disabled: Story = { args: { disabled: true } };

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-6">
      <Button {...args} size="lg" />
      <Button {...args} size="md" />
      <Button {...args} size="sm" />
    </div>
  ),
};

export const IconVariants: Story = {
  render: (args) => (
    <div className="grid grid-cols-2 gap-4">
      <Button {...args} leadingIcon={icon} />
      <Button {...args} trailingIcon={icon} />
      <Button {...args} leadingIcon={icon} trailingIcon={icon} />
      <Button {...args} variant="outline" leadingIcon={icon} />
    </div>
  ),
};

export const FigmaMatrix: Story = {
  render: (args) => (
    <div className="grid grid-cols-3 items-center gap-4">
      {(["primary", "secondary", "tertiary", "outline"] as const).flatMap(
        (variant) =>
          (["lg", "md", "sm"] as const).map((size) => (
            <Button {...args} key={`${variant}-${size}`} size={size} variant={variant} />
          )),
      )}
    </div>
  ),
};
