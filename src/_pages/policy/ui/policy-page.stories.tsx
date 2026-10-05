import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { TermsPage } from "./terms-page";
import { PrivacyPage } from "./privacy-page";

const meta = {
  title: "Pages/Policy",
  component: TermsPage,
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof TermsPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Terms: Story = {};
export const Privacy: Story = { render: () => <PrivacyPage /> };
