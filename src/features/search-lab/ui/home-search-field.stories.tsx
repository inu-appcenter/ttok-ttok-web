import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { FIELD_PREVIEW } from "../model/search-options";
import { HomeSearchField } from "./home-search-field";

const meta = {
  title: "Features/SearchConditions",
  component: HomeSearchField,
  args: { categories: FIELD_PREVIEW, showRecommendations: false },
  parameters: { layout: "padded" },
} satisfies Meta<typeof HomeSearchField>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {};
export const Home: Story = { args: { showRecommendations: true } };
export const SelectedField: Story = {
  args: { initialCategory: "데이터베이스" },
};
export const CategoriesUnavailable: Story = { args: { categories: [] } };
export const Disabled: Story = { args: { isDisabled: true } };
