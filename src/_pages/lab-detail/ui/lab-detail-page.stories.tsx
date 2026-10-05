import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, userEvent, within } from "storybook/test";

import { MOCK_LAB_DETAILS } from "@/entities/lab";

import { LabDetailPage } from "./lab-detail-page";

const DESIGN_LAB = {
  ...MOCK_LAB_DETAILS[0],
  description: MOCK_LAB_DETAILS[0].aiSummary.join("\n\n"),
  professor: {
    name: "김OO",
    position: "교수",
    email: "kimookyosu@inu.ac.kr",
    phone: "010-0000-0000",
  },
  projects: [
    {
      id: "ongoing",
      title: "그래프 스트림 이상 탐지 고도화 연구",
      isOngoing: true,
      period: "2024.04 – 2027.03",
      agency: "과학기술정보통신부",
      summary: "대규모 그래프 스트림에서 실시간으로 이상을 탐지합니다.",
      url: "https://www.ntis.go.kr/",
    },
    {
      id: "ended",
      title: "LSM 기반 저장 엔진 쓰기 증폭 최적화",
      isOngoing: false,
      period: "2021.06 – 2023.12",
      agency: "산업통상자원부",
      summary: "",
      url: null,
    },
  ],
  news: [
    {
      id: "kdd",
      title: "박OO 학생, KDD 2026 논문 발표",
      date: "2026.08.12",
      source: "컴퓨터공학부 홈페이지",
      url: "https://www.inu.ac.kr/",
    },
    {
      id: "award",
      title: "이OO 학생, 한국정보과학회 우수논문상 수상",
      date: "2026.05.02",
      source: "인천대 뉴스",
      url: "https://www.inu.ac.kr/",
    },
  ],
  metrics: {
    hIndex: 14,
    citations: 1240,
    fiveYearPapers: 23,
    hIndexPercentile: 25,
    citationPercentile: 30,
  },
};

const meta = {
  title: "Pages/LabDetailPage",
  component: LabDetailPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof LabDetailPage>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    lab: DESIGN_LAB,
  },
};

export const Authenticated: Story = {
  args: {
    isAuthenticated: true,
    lab: DESIGN_LAB,
  },
};

export const EmptyResearchInformation: Story = {
  args: {
    lab: {
      ...MOCK_LAB_DETAILS[1],
      aiSummary: [],
      location: null,
      projects: [],
    },
  },
};

export const MetricsExplanation: Story = {
  args: { lab: DESIGN_LAB, isAuthenticated: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "피인용 설명" });
    await userEvent.click(trigger);
    await expect(canvas.getByRole("tooltip")).toBeVisible();
    await expect(
      canvas.getByText("전부 더하면 21회 → 피인용지수 21"),
    ).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect(canvas.queryByRole("tooltip")).not.toBeInTheDocument();
    await expect(trigger).toHaveFocus();
  },
};

export const PartialFailure: Story = {
  args: {
    lab: {
      ...MOCK_LAB_DETAILS[1],
      aiSummary: [],
      projects: [],
      papers: [],
      projectState: { status: "error", page: 0, totalPages: 0 },
      publicationState: { status: "error", page: 0, totalPages: 0 },
    },
  },
  play: async ({ canvasElement }) => {
    const router = getRouter();
    router.refresh.mockClear();
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getAllByRole("button", { name: "다시 시도" })[0],
    );
    await expect(router.refresh).toHaveBeenCalledTimes(1);
  },
};

export const LongContent: Story = {
  args: {
    lab: {
      ...DESIGN_LAB,
      name: "분산 시스템과 대규모 인공지능 데이터베이스 최적화를 위한 지능형 연구실",
      professor: {
        ...DESIGN_LAB.professor,
        email: "very-long-professor-email-address@university.example.com",
      },
      papers: [
        {
          title:
            "매우 긴 논문 제목이 여러 줄에 걸쳐 표시되는 분산 시스템 및 인공지능 데이터베이스 환경에서의 새로운 최적화 연구",
          url: null,
          venue: "International Journal of Distributed Systems",
          year: 2026,
        },
      ],
    },
  },
};
