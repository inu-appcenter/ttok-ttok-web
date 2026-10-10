import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { PapersPage } from "./papers-page";
const meta = {
  title: "Pages/PapersPage",
  component: PapersPage,
  parameters: { layout: "fullscreen", siteHeaderAuthenticated: true },
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
export const Default: Story = {};
export const Empty: Story = { args: { papers: [] } };
export const LoadFailure: Story = { args: { error: true, papers: [] } };
