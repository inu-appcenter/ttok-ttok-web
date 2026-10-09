import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { CATEGORY_FIXTURE, COLLEGE_FIXTURE } from "./search-classification-fixtures";
import { HomeSearchField } from "./home-search-field";

const meta = {
  title: "Features/SearchConditions",
  component: HomeSearchField,
  args: { categories: CATEGORY_FIXTURE, colleges: COLLEGE_FIXTURE, showRecommendations: false },
  parameters: { layout: "padded" },
} satisfies Meta<typeof HomeSearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Home: Story = { args: { showRecommendations: true } };
export const SelectedField: Story = {
  args: { initialCategory: "데이터베이스" },
};
export const EmptyLists: Story = { args: { categories: [], colleges: [] } };
export const CategoriesUnavailable: Story = { args: { categories: [], categoriesError: "분야 목록을 불러오지 못했어요." } };
export const CollegesUnavailable: Story = { args: { colleges: [], collegesError: "학과 목록을 불러오지 못했어요." } };
export const Disabled: Story = { args: { isDisabled: true } };

export const KeyboardSelection: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    canvas.getByRole("button", { name: "분야: 전체" }).focus();
    await userEvent.keyboard("{ArrowDown}");
    const input = canvas.getByRole("textbox", { name: "분야 검색" });
    await expect(input).toHaveFocus();
    await userEvent.type(input, "데이터");
    await userEvent.keyboard("{ArrowDown}{ArrowRight}{Enter}");
    await expect(canvas.getByRole("button", { name: "분야: 데이터베이스" })).toHaveFocus();
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.keyboard("{ArrowDown}{Escape}");
    await expect(canvas.getByRole("button", { name: "분야: 데이터베이스" })).toHaveFocus();
    canvas.getByRole("button", { name: "학과: 전체" }).focus();
    await userEvent.keyboard("{ArrowDown}{ArrowLeft}{ArrowDown}{ArrowRight}{ArrowDown}{Enter}");
    await expect(canvas.getByRole("button", { name: "학과: 컴퓨터공학부" })).toHaveFocus();
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
  },
};
