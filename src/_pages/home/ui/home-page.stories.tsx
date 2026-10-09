import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, userEvent, within } from "storybook/test";

import { MOCK_LABS } from "@/entities/lab";

import { MOCK_DEPARTMENT_DIRECTORY } from "../model/mock-department-directory";
import { HomeDepartmentDirectory } from "./home-department-directory";

import { HomePage } from "./home-page";

const meta = {
  title: "Pages/Home",
  component: HomePage,
  args: {
    categories: ["AI", "로보틱스"],
    colleges: [{ college: "ENGINEERING", collegeName: "공과대학", departments: [{ department: "ELECTRICAL", departmentName: "전기공학과" }] }],
    departmentSection: (
      <HomeDepartmentDirectory colleges={MOCK_DEPARTMENT_DIRECTORY} />
    ),
  },
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof HomePage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    labs: MOCK_LABS.slice(0, 6),
  },
};

export const Empty: Story = {
  args: {
    labs: [],
  },
};

export const Error: Story = {
  args: {
    labs: [],
    labsError: "연구실 정보를 불러오지 못했습니다.",
  },
};

export const Authenticated: Story = {
  args: {
    labs: MOCK_LABS.slice(0, 6),
  },
  parameters: { siteHeaderAuthenticated: true },
};

export const LongContent: Story = {
  args: {
    labs: MOCK_LABS.slice(0, 6).map((lab) => ({
      ...lab,
      name: "인공지능 기반 지능형 데이터 분석 및 차세대 정보 시스템 연구실",
      description:
        "긴 연구실 소개가 카드 너비를 넘지 않고 표시되는지 확인합니다. ".repeat(
          5,
        ),
      tags: [],
    })),
  },
};

export const CategoriesUnavailable: Story = {
  args: {
    labs: MOCK_LABS.slice(0, 6),
    categories: [],
    categoriesError: "분야 목록을 불러오지 못했습니다. 검색어로 검색해주세요. ",
  },
};

export const Mobile: Story = {
  args: { labs: MOCK_LABS.slice(0, 6) },
  parameters: { viewport: { options: { mobile375: { name: "Mobile 375", styles: { width: "375px", height: "812px" }, type: "mobile" } } } },
  globals: { viewport: { value: "mobile375", isRotated: false } },
};

export const MobileNarrow: Story = {
  ...Mobile,
  parameters: { viewport: { options: { mobile320: { name: "Mobile 320", styles: { width: "320px", height: "812px" }, type: "mobile" } } } },
  globals: { viewport: { value: "mobile320", isRotated: false } },
};

export const MobileAccordion: Story = {
  ...Mobile,
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "공과대학 학과 접기" });
    await expect(canvas.getByRole("link", { name: "전기공학과 연구실 6개" })).toHaveAttribute("href", "/search?department=%EC%A0%84%EA%B8%B0%EA%B3%B5%ED%95%99%EA%B3%BC");
    await userEvent.click(trigger);
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await expect(canvas.queryByRole("link", { name: "전기공학과 연구실 6개" })).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "도시과학대학 학과 펼치기" }));
    await expect(canvas.getByRole("button", { name: "도시과학대학 학과 접기" })).toHaveAttribute("aria-expanded", "true");
    await expect(canvas.getByRole("link", { name: "도시공학과 연구실 6개" })).toBeVisible();
  },
};
