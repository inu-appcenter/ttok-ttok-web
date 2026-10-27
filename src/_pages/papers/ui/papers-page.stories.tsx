import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
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
    await expect(link).toHaveAttribute(
      "rel",
      expect.stringContaining("noreferrer"),
    );
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

export const AdditionalLoadRetry: Story = {
  args: { nextPage: 20, totalElements: 4 },
  beforeEach: () => {
    const originalFetch = globalThis.fetch;
    let attempts = 0;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith("/api/labs/157/publications"))
        return originalFetch(input, init);
      attempts += 1;
      return attempts === 1
        ? Response.json({ message: "조회 실패" }, { status: 502 })
        : Response.json({
            papers: [
              { title: "추가 논문", year: 2020, venue: "TEST", url: null },
            ],
            nextPage: null,
            totalElements: 4,
          });
    };
    return () => {
      globalThis.fetch = originalFetch;
    };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "나머지 논문을 불러오지 못했어요.",
    );
    await expect(canvas.getAllByRole("heading", { level: 2 })).toHaveLength(3);
    await userEvent.click(
      canvas.getByRole("button", { name: "다시 불러오기" }),
    );
    await expect(
      await canvas.findByRole("heading", { name: "추가 논문" }),
    ).toBeVisible();
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    await expect(canvas.getAllByRole("heading", { level: 2 })).toHaveLength(4);
    await userEvent.click(canvas.getByRole("button", { name: "이름순" }));
    const titles = canvas
      .getAllByRole("heading", { level: 2 })
      .map((element) => element.textContent?.replace("↗", "").trim() ?? "");
    await expect(titles).toEqual(
      [...titles].sort((a, b) => a.localeCompare(b, "ko")),
    );
  },
};
