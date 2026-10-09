import type { Meta, StoryObj } from "@storybook/nextjs-vite";

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
