import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { LoginPage } from "./login-page";

const meta = {
  title: "Pages/Login",
  component: LoginPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof LoginPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const Error: Story = {
  args: {
    initialHasError: true,
  },
};
