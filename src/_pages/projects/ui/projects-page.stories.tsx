import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";
import { ProjectsPage } from "./projects-page";

const project = {
  id: "1", title: "나노 연구", isOngoing: true,
  period: "2024.01 – 2026.12", agency: "연구기관", summary: "", url: null,
};
const meta = {
  title: "Pages/ProjectsPage",
  component: ProjectsPage,
  parameters: { layout: "fullscreen" },
  args: { laboratoryId: 157, projects: [project], totalElements: 1 },
} satisfies Meta<typeof ProjectsPage>;
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Empty: Story = { args: { projects: [], totalElements: 0 } };
export const LoadFailure: Story = { args: { projects: [], error: true } };
export const AdditionalLoadRetry: Story = {
  args: { nextPage: 20, totalElements: 2 },
  beforeEach: () => {
    const originalFetch = globalThis.fetch;
    let attempts = 0;
    globalThis.fetch = async (input, init) => {
      if (!String(input).startsWith("/api/labs/157/projects")) return originalFetch(input, init);
      attempts += 1;
      return attempts === 1
        ? Response.json({}, { status: 502 })
        : Response.json({ projects: [{ ...project, id: "2", title: "가상 연구" }], nextPage: null, totalElements: 2 });
    };
    return () => { globalThis.fetch = originalFetch; };
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("alert")).toHaveTextContent("나머지 연구과제를 불러오지 못했어요.");
    await userEvent.click(canvas.getByRole("button", { name: "다시 불러오기" }));
    await expect(await canvas.findByRole("heading", { name: "가상 연구" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "이름순" }));
    await expect(canvas.getAllByRole("heading", { level: 2 }).map((element) => element.textContent)).toEqual(["가상 연구", "나노 연구"]);
    await userEvent.click(canvas.getByRole("button", { name: "기본순" }));
    await expect(canvas.getAllByRole("heading", { level: 2 }).map((element) => element.textContent)).toEqual(["나노 연구", "가상 연구"]);
  },
};
