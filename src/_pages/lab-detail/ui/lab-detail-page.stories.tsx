import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { getRouter } from "@storybook/nextjs-vite/navigation.mock";
import { expect, fn, userEvent, within } from "storybook/test";

import { MOCK_LAB_DETAILS } from "@/entities/lab";
import { ProvideLabInfoCard } from "@/features/lab-detail-actions";

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
    isAuthenticated: false,
    bookmarkActions: { onLoad: fn().mockResolvedValue([]) },
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await expect(
      canvas.getByRole("link", { name: "관심 연구실" }),
    ).toHaveAttribute("href", "/login");
    await expect(args.bookmarkActions?.onLoad).not.toHaveBeenCalled();
    await userEvent.click(canvas.getByRole("button", { name: "AI 메일 첨삭" }));
    await expect(
      canvas.getByText("로그인 후 AI 메일 첨삭을 이용할 수 있어요."),
    ).toBeVisible();
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole("button", { name: /이 랩 학부연구생이신가요/ }),
    );
    await expect(
      canvas.getByText("로그인 후 소속 학부연구생만 정보를 제공할 수 있어요."),
    ).toBeVisible();
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
  },
};

export const Authenticated: Story = {
  args: {
    isAuthenticated: true,
    lab: DESIGN_LAB,
  },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("button", { name: /이 랩 학부연구생이신가요/ })).not.toBeInTheDocument();
  },
};

export const AuthenticatedResearcher: Story = {
  args: { isAuthenticated: true, canContribute: true, lab: DESIGN_LAB },
  play: Authenticated.play,
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
  render: (args) => (
    <ProvideLabInfoCard isAuthenticated canContribute laboratoryId={args.lab.laboratoryId} onSave={args.onProvideInfo} />
  ),
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
  render: (args) => (
    <ProvideLabInfoCard isAuthenticated canContribute laboratoryId={args.lab.laboratoryId} onSave={args.onProvideInfo} />
  ),
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
    await userEvent.click(trigger);
    await expect(canvas.getByRole("tooltip")).toBeVisible();
  },
};

export const HIndexExplanation: Story = {
  args: { lab: DESIGN_LAB, isAuthenticated: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "h-index 설명" });
    await userEvent.click(trigger);
    const tooltip = canvas.getByRole("tooltip");
    await expect(tooltip).toBeVisible();
    await expect(within(tooltip).getByLabelText("h-index 계산 예시")).toBeVisible();
    await expect(within(tooltip).getByText("3번 이상 인용된 논문이 3편 → h-index는 3")).toBeVisible();
    await userEvent.keyboard("{Escape}");
    await expect(canvas.queryByRole("tooltip")).not.toBeInTheDocument();
  },
};

export const MissingMetrics: Story = {
  args: { lab: { ...DESIGN_LAB, metrics: undefined }, isAuthenticated: true },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const trigger = canvas.getByRole("button", { name: "h-index 설명" });
    await expect(trigger).toHaveTextContent("—");
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

export const ContributionRestricted: Story = {
  args: { lab: DESIGN_LAB, isAuthenticated: true, canContribute: false },
  play: async ({ canvasElement }) => {
    await expect(within(canvasElement).queryByRole("button", { name: /이 랩 학부연구생이신가요/ })).not.toBeInTheDocument();
  },
};

const previewProjects = Array.from({ length: 4 }, (_, index) => ({
  ...DESIGN_LAB.projects[0],
  id: `preview-${index + 1}`,
  title: `연구과제 ${index + 1}`,
}));
const previewPapers = Array.from({ length: 4 }, (_, index) => ({
  title: `논문 제목 ${index + 1}`,
  url: index === 0 ? "https://example.com/paper" : null,
  venue: "학술지",
  year: 2026 - index,
}));

export const PreviewWithMore: Story = {
  args: {
    lab: {
      ...DESIGN_LAB,
      projects: previewProjects,
      papers: previewPapers,
      projectState: { page: 0, totalPages: 2, status: "success" },
      publicationState: { page: 0, totalPages: 2, status: "success" },
    },
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const projectSection = canvas.getByRole("heading", { name: "연구과제" }).closest("section");
    const paperSection = canvas.getByRole("link", { name: "최근 논문" }).closest("section");
    if (!projectSection || !paperSection) throw new Error("상세 섹션을 찾을 수 없어요.");
    const projects = within(projectSection);
    const papers = within(paperSection);
    await expect(projects.getByRole("heading", { name: "연구과제 3" })).toBeVisible();
    await expect(projects.getByText("연구과제 4")).not.toBeVisible();
    await expect(papers.getByRole("heading", { name: "논문 제목 3" })).toBeVisible();
    await expect(papers.queryByRole("heading", { name: "논문 제목 4" })).not.toBeInTheDocument();
    await expect(papers.getByRole("link", { name: "최근 논문" })).toHaveAttribute("href", `/labs/${DESIGN_LAB.laboratoryId}/papers`);
    await userEvent.click(projects.getByText("연구과제 더보기"));
    await expect(projects.getByRole("heading", { name: "연구과제 4" })).toBeVisible();
    await expect(projects.getByRole("link", { name: "다음 연구과제" })).toHaveAttribute("href", expect.stringContaining("projects=1"));
  },
};

export const PreviewThree: Story = {
  args: { lab: { ...DESIGN_LAB, projects: previewProjects.slice(0, 3), papers: previewPapers.slice(0, 3) } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("연구과제 더보기")).not.toBeInTheDocument();
    await expect(canvas.getByRole("heading", { name: "연구과제 3" })).toBeVisible();
    await expect(canvas.getByRole("heading", { name: "논문 제목 3" })).toBeVisible();
  },
};

export const PreviewOne: Story = {
  args: { lab: { ...DESIGN_LAB, projects: previewProjects.slice(0, 1), papers: previewPapers.slice(0, 1) } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.queryByText("연구과제 더보기")).not.toBeInTheDocument();
    await expect(canvas.getByRole("heading", { name: "연구과제 1" })).toBeVisible();
    await expect(canvas.getByRole("heading", { name: /논문 제목 1/ })).toBeVisible();
  },
};

const LONG_LINKED_PAPER_TITLE =
  "A Very Long Paper Title about Intelligent Data Systems and Large Scale Personalized Recommendation Models with Graph Neural Networks";
const UNLINKED_PAPER_TITLE = "원문 링크가 없는 논문 제목";

export const PaperLinks: Story = {
  args: {
    lab: {
      ...DESIGN_LAB,
      papers: [
        { title: LONG_LINKED_PAPER_TITLE, url: "https://example.com/paper", venue: "ACM", year: 2026 },
        { title: UNLINKED_PAPER_TITLE, url: null, venue: "학술지", year: 2025 },
      ],
    },
  },
  play: async ({ canvasElement }) => {
    const section = within(canvasElement).getByRole("link", { name: "최근 논문" }).closest("section");
    if (!section) throw new Error("최근 논문 섹션을 찾을 수 없어요.");
    const papers = within(section);
    const link = papers.getByRole("link", { name: LONG_LINKED_PAPER_TITLE });
    await expect(link).toHaveAttribute("href", "https://example.com/paper");
    await expect(link).toHaveAttribute("target", "_blank");
    await expect(link).toHaveAttribute("rel", expect.stringContaining("noreferrer"));
    const title = within(link).getByText(LONG_LINKED_PAPER_TITLE);
    await expect(title.scrollWidth).toBeGreaterThan(title.clientWidth);
    await expect(within(link).getByText("↗")).toBeVisible();
    const unlinked = papers.getByRole("heading", { name: UNLINKED_PAPER_TITLE });
    await expect(within(unlinked).queryByRole("link")).not.toBeInTheDocument();
    await expect(unlinked).not.toHaveTextContent("↗");
  },
};

export const PreviewEmpty: Story = {
  args: { lab: { ...DESIGN_LAB, projects: [], papers: [] } },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(canvas.getByRole("heading", { name: "연구과제" }).closest("section")).toHaveTextContent("등록된 연구과제가 없어요.");
    await expect(canvas.getByRole("link", { name: "최근 논문" }).closest("section")).toHaveTextContent("등록된 논문이 없어요.");
    await expect(canvas.queryByText("연구과제 더보기")).not.toBeInTheDocument();
  },
};
