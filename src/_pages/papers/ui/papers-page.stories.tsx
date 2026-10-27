import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, within } from "storybook/test";
import { PapersPage } from "./papers-page";
const meta = {
  title: "Pages/PapersPage",
  component: PapersPage,
  parameters: { layout: "fullscreen", authenticated: true },
  args: {
    laboratoryId: 157,
    papers: [
      {
        title:
          "Ranking Collaborative Filtering for Personalized Recommendations",
        year: 2025,
        venue: "KDD",
        url: "https://doi.org/10.1145/example",
      },
      {
        title:
          "A Very Long Paper Title about Intelligent Data Systems and Large Scale Personalized Recommendation Models with Graph Neural Networks",
        year: 2024,
        venue: "ACM",
        url: "https://example.com/paper",
      },
      {
        title: "Efficient Database Query Processing",
        year: 2026,
        venue: "IEEE",
        url: null,
      },
    ],
  },
} satisfies Meta<typeof PapersPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const name =
      "A Very Long Paper Title about Intelligent Data Systems and Large Scale Personalized Recommendation Models with Graph Neural Networks";
    const link = canvas.getByRole("link", { name });
    await expect(link).toHaveAttribute("href", "https://example.com/paper");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", expect.stringContaining("noreferrer"));
    const title = within(link).getByText(name);
    await expect(title.scrollWidth).toBeGreaterThan(title.clientWidth);
    await expect(within(link).getByText("↗")).toBeVisible();
    const unlinked = canvas.getByRole("heading", {
      name: "Efficient Database Query Processing",
    });
    await expect(within(unlinked).queryByRole("link")).not.toBeInTheDocument();
    await expect(unlinked).not.toHaveTextContent("↗");
  },
};
export const Empty: Story = { args: { papers: [] } };
export const LoadFailure: Story = { args: { error: true, papers: [] } };
