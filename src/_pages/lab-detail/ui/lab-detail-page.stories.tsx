import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, fn, userEvent, within } from "storybook/test";

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
      title:
        "탄소섬유·고분자 기지재의 제조-구조-물성 상관성을 활용한 CFRP 구조체의 피로수명 예측용 멀티스케일 데이터 기반 설계 플랫폼",
      keywords: ["멀티스케일 해석", "탄소섬유", "고분자 복합소재"],
      isOngoing: true,
      period: "2024.04 – 2027.03",
      agency: "과학기술정보통신부",
      summary: "대규모 그래프 스트림에서 실시간으로 이상을 탐지합니다.",
      url: "https://www.ntis.go.kr/",
    },
    {
      id: "ended",
      title: "LSM 기반 저장 엔진 쓰기 증폭 최적화",
      keywords: ["멀티스케일 해석", "탄소섬유", "고분자 복합소재"],
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
  args: {
    bookmarkActions: {
      initialBookmarks: [],
      onLoad: async () => [],
      onToggle: async () => [],
    },
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

export const NoPublicContact: Story = {
  args: {
    isAuthenticated: true,
    lab: {
      ...DESIGN_LAB,
      contact: { email: "", openChatUrl: "", members: [] },
    },
  },
};

export const LoginRequired: Story = {
  args: { lab: DESIGN_LAB },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas
        .getAllByRole("button", { name: "로그인하고 커피챗 확인하기" })
        .find((button) => button.getClientRects().length > 0)!,
    );
    const dialog = within(canvas.getByRole("dialog", { name: "로그인 필요" }));
    await expect(
      dialog.getByRole("link", { name: "인천대학교 포털 로그인 ↗" }),
    ).toHaveAttribute(
      "href",
      `/login?returnTo=${encodeURIComponent(`/labs/${DESIGN_LAB.laboratoryId}`)}`,
    );
  },
};

export const ProvideInformation: Story = {
  args: {
    lab: DESIGN_LAB,
    isAuthenticated: true,
    canContribute: true,
    onProvideInfo: fn(async () => {}),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas
        .getAllByRole("button", { name: /이 랩 학부연구생이신가요/ })
        .find((button) => button.getClientRects().length > 0)!,
    );
    const dialog = within(
      canvas.getByRole("dialog", { name: "정보 제공하기" }),
    );
    await userEvent.click(
      within(dialog.getByRole("group", { name: "코어타임" })).getByRole(
        "radio",
        { name: "없음" },
      ),
    );
    await userEvent.click(dialog.getByRole("radio", { name: "주 1회" }));
    await userEvent.click(dialog.getByRole("checkbox", { name: "실험/코딩" }));
    await userEvent.click(
      dialog.getByRole("checkbox", { name: "데이터 라벨링" }),
    );
  },
};

export const ProvideInformationSaveFailure: Story = {
  args: {
    lab: DESIGN_LAB,
    isAuthenticated: true,
    canContribute: true,
    onProvideInfo: fn(async () => {
      throw new Error("정보를 저장하지 못했어요.");
    }),
  },
  play: async (context) => {
    await ProvideInformation.play!(context);
    const dialog = within(
      within(context.canvasElement).getByRole("dialog", {
        name: "정보 제공하기",
      }),
    );
    await userEvent.click(dialog.getByRole("button", { name: "완료" }));
    await expect(await dialog.findByRole("alert")).toHaveTextContent(
      "정보를 저장하지 못했어요.",
    );
    await expect(
      dialog.getByRole("checkbox", { name: "실험/코딩" }),
    ).toBeChecked();
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
