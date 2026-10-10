import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { MOCK_BOOKMARKS } from "@/entities/bookmark";
import { BookmarksPage } from "./bookmarks-page";

const meta = {
  title: "Pages/BookmarksPage",
  component: BookmarksPage,
  parameters: { layout: "fullscreen", siteHeaderAuthenticated: true },
  args: {
    initialBookmarks: MOCK_BOOKMARKS,
    onLoad: async () => MOCK_BOOKMARKS,
  },
} satisfies Meta<typeof BookmarksPage>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Empty: Story = {
  args: { initialBookmarks: [], onLoad: async () => [] },
};
export const LoadFailure: Story = {
  args: {
    initialBookmarks: undefined,
    onLoad: async () => {
      throw new Error("목록 조회 실패");
    },
  },
};
