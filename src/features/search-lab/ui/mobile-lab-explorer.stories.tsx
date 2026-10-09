import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, userEvent, within } from "storybook/test";

import { CATEGORY_FIXTURE, COLLEGE_FIXTURE } from "./search-classification-fixtures";

import { MobileLabExplorer } from "./mobile-lab-explorer";

const meta = {
  title: "Features/SearchLab/MobileLabExplorer",
  component: MobileLabExplorer,
  args: {
    categories: CATEGORY_FIXTURE,
    colleges: COLLEGE_FIXTURE,
  },
  decorators: [(Story) => <div className="w-[375px] bg-bg-default p-4"><Story /></div>],
} satisfies Meta<typeof MobileLabExplorer>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const EmptyLists: Story = { args: { categories: [], colleges: [] } };
export const Unavailable: Story = { args: { categories: [], colleges: [], categoriesError: "분야 목록을 불러오지 못했어요.", collegesError: "학과 목록을 불러오지 못했어요." } };

export const SearchAll: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    getRouter().push.mockClear();
    await userEvent.click(canvas.getByRole("button", { name: "검색" }));
    await expect(getRouter().push).toHaveBeenCalledWith("/search");
  },
};

export const CombinedConditions: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    getRouter().push.mockClear();
    await userEvent.click(canvas.getByRole("button", { name: "분야: 전체" }));
    await userEvent.type(canvas.getByRole("textbox", { name: "분야 검색" }), "AI");
    await userEvent.click(canvas.getByRole("button", { name: /^AI$/ }));
    await userEvent.click(canvas.getByRole("button", { name: "학과: 전체" }));
    await userEvent.click(canvas.getByRole("button", { name: /^정보기술대학$/ }));
    await userEvent.click(canvas.getByRole("button", { name: /^컴퓨터공학부$/ }));
    await userEvent.type(canvas.getByRole("searchbox", { name: "연구실 검색" }), "김 교수");
    await userEvent.click(canvas.getByRole("button", { name: "검색" }));
    await expect(getRouter().push).toHaveBeenCalledWith("/search?q=%EA%B9%80+%EA%B5%90%EC%88%98&category=AI&department=%EC%BB%B4%ED%93%A8%ED%84%B0%EA%B3%B5%ED%95%99%EB%B6%80");
    await userEvent.click(canvas.getByRole("button", { name: "분야 초기화" }));
    await userEvent.click(canvas.getByRole("button", { name: "학과 초기화" }));
    await userEvent.clear(canvas.getByRole("searchbox", { name: "연구실 검색" }));
    await userEvent.click(canvas.getByRole("button", { name: "검색" }));
    await expect(getRouter().push).toHaveBeenLastCalledWith("/search");
  },
};
