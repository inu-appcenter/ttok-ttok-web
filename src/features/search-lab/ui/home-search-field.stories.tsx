import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, userEvent, waitFor, within } from "storybook/test";

import { CATEGORY_FIXTURE, COLLEGE_FIXTURE } from "./search-classification-fixtures";
import { HomeSearchField } from "./home-search-field";

const meta = {
  title: "Features/SearchConditions",
  component: HomeSearchField,
  args: { categories: CATEGORY_FIXTURE, colleges: COLLEGE_FIXTURE, requireCondition: false },
  parameters: { layout: "padded" },
} satisfies Meta<typeof HomeSearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Home: Story = { args: { requireCondition: true } };
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

export const CollegeAllSelection: Story = {
  args: { initialDepartment: "컴퓨터공학부" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    getRouter().push.mockClear();
    await userEvent.click(canvas.getByRole("button", { name: "학과: 컴퓨터공학부" }));
    const department = canvas.getByRole("button", { name: "컴퓨터공학부" });
    department.focus();
    department.blur();
    await expect(canvas.getByRole("dialog")).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: /^정보기술대학 전체/ }));
    if (window.matchMedia("(max-width: 767px)").matches) {
      await expect(canvas.getByRole("dialog")).toBeVisible();
      await expect(canvas.queryByRole("button", { name: "학과 초기화" })).not.toBeInTheDocument();
      await userEvent.keyboard("{Escape}");
    } else {
      await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
      await expect(canvas.getByRole("button", { name: "학과 초기화" })).toBeVisible();
    }
    await userEvent.click(canvas.getByRole("button", { name: "검색" }));
    await expect(getRouter().push).toHaveBeenLastCalledWith(`/search?college=${encodeURIComponent("정보기술대학")}`);
    await userEvent.click(canvas.getByRole("button", { name: "학과: 정보기술대학" }));
    await userEvent.click(within(canvas.getByLabelText("단과대학")).getByRole("button", { name: "전체" }));
    await userEvent.click(within(canvas.getByLabelText("학과 목록")).getByRole("button", { name: "전체" }));
    await userEvent.keyboard("{Escape}");
    await expect(canvas.getByRole("button", { name: "학과: 전체" })).toBeVisible();
    await userEvent.click(canvas.getByRole("button", { name: "검색" }));
    await expect(getRouter().push).toHaveBeenLastCalledWith("/search");
  },
};

export const PersistentDividers: Story = {
  args: { initialCategory: "AI", initialDepartment: "컴퓨터공학부" },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const form = canvas.getByRole("form", { name: "연구실 검색 조건" });
    const dividers = Array.from(form.querySelectorAll<HTMLElement>(':scope > div[aria-hidden="true"]'))
      .filter((element) => getComputedStyle(element).display !== "none");
    for (const name of ["분야: AI", "학과: 컴퓨터공학부"]) {
      const trigger = canvas.getByRole("button", { name });
      await userEvent.hover(trigger);
      for (const divider of dividers) await expect(divider).toBeVisible();
      await userEvent.click(trigger);
      for (const divider of dividers) await expect(divider).toBeVisible();
      await userEvent.keyboard("{Escape}");
      for (const divider of dividers) await expect(divider).toBeVisible();
    }
    if (window.matchMedia("(min-width: 768px)").matches) {
      await userEvent.click(canvas.getByRole("button", { name: "학과: 컴퓨터공학부" }));
      canvas.getByRole("searchbox", { name: "연구실 검색" }).focus();
      await waitFor(() => expect(canvas.queryByRole("dialog")).not.toBeInTheDocument());
    }
  },
};
