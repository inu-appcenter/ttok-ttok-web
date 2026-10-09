import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { MOCK_DEPARTMENT_DIRECTORY } from "../model/mock-department-directory";
import { HomeDepartmentDirectory } from "./home-department-directory";

const meta = {
  title: "Pages/HomeDepartmentDirectory",
  component: HomeDepartmentDirectory,
  args: { colleges: MOCK_DEPARTMENT_DIRECTORY },
  parameters: { layout: "fullscreen" },
  decorators: [
    (Story) => (
      <div className="mx-auto max-w-[1440px] px-[clamp(24px,8.89vw,128px)]">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof HomeDepartmentDirectory>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = {};
export const Loading: Story = { args: { status: "loading" } };
export const Error: Story = { args: { status: "error" } };
export const Empty: Story = { args: { colleges: [] } };
export const OneDepartment: Story = {
  args: {
    colleges: [
      {
        college: "HUMANITIES",
        collegeName: "인문대학",
        departments: [
          {
            department: "JAPANESE",
            departmentName: "일본지역문화학과",
            count: 1,
          },
        ],
      },
    ],
  },
};
export const ExpandAndCollapse: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("link", { name: "공과대학", exact: true })).toHaveAttribute(
      "href", "/search?college=%EA%B3%B5%EA%B3%BC%EB%8C%80%ED%95%99",
    );
    const trigger = canvas.getByRole("button", {
      name: "공과대학 학과 더보기",
    });
    await expect(
      canvas.queryByRole("link", { name: "기계공학과 5개" }),
    ).not.toBeInTheDocument();
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "true");
    await expect(
      canvas.getByRole("link", { name: "기계공학과 5개" }),
    ).toHaveAttribute(
      "href",
      "/search?department=%EA%B8%B0%EA%B3%84%EA%B3%B5%ED%95%99%EA%B3%BC",
    );
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(
      canvas.queryByRole("link", { name: "기계공학과 5개" }),
    ).not.toBeInTheDocument();
  },
};
