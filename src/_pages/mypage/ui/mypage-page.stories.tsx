import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useRef, useState } from "react";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { MOCK_BOOKMARKS } from "@/entities/bookmark";
import { MOCK_LABS } from "@/entities/lab";

import { MOCK_MEMBER_PROFILE } from "@/entities/member";

import { MyPage, type MyPageProps } from "./mypage-page";

function MockMyPage(args: MyPageProps) {
  const backend = useRef(args.initialBookmarks ?? []);
  return (
    <MyPage
      {...args}
      onLoad={args.onLoad ?? (async () => backend.current)}
      onToggle={
        args.onToggle ??
        (async (id) => {
          backend.current = backend.current.filter(
            (item) => item.laboratory.laboratoryId !== id,
          );
          return [...backend.current];
        })
      }
    />
  );
}

const meta = {
  title: "Pages/MyPage",
  component: MyPage,
  render: (args) => <MockMyPage {...args} />,
  parameters: {
    layout: "fullscreen",
  },
  args: {
    profile: MOCK_MEMBER_PROFILE,
    initialBookmarks: MOCK_BOOKMARKS,
    onLogout: async () => {},
    onWithdraw: async () => {},
    onEdit: () => {},
    onSaveContact: async () => {},
  },
} satisfies Meta<typeof MyPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};

export const ResearcherDesignMock: Story = {
  args: {
    onChangeResearcherStatus: () => {},
    mockContacts: [
      {
        contactType: "KAKAO_TALK",
        contactValue: "https://open.kakao.com/o/g123456",
      },
      { contactType: "EMAIL", contactValue: "researcher@inu.ac.kr" },
    ],
  },
};
export const Finder: Story = {
  args: {
    profile: {
      ...MOCK_MEMBER_PROFILE,
      userType: "FINDER",
      isUndergraduateResearcher: false,
      researchProfile: undefined,
      hasContributedReview: false,
    },
    onChangeResearcherStatus: () => {},
  },
};
const FINDER_PROFILE = {
  ...MOCK_MEMBER_PROFILE,
  userType: "FINDER" as const,
  isUndergraduateResearcher: false,
  researchProfile: undefined,
  hasContributedReview: false,
};
const REVIEW_OPTIONS = {
  coreTime: ["있어요", "없어요"],
  weeklyMeeting: ["매일", "주 2~3회", "주 1회", "격주", "월 1회"],
};

// 연구실 검색(GET)과 등록(POST)만 대체해 실제 요청 경로와 본문을 검증한다.
function stubRegistrationFetch({
  labs = MOCK_LABS.slice(0, 2),
  register = async () => Response.json({ ok: true }),
}: {
  labs?: typeof MOCK_LABS;
  register?: () => Promise<Response>;
} = {}) {
  const originalFetch = window.fetch;
  const post = fn<(body: unknown) => Promise<Response>>(register);
  window.fetch = (async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = String(input);
    if (url.startsWith("/api/onboarding/laboratories")) return Response.json({ content: labs });
    if (url === "/api/member/researcher" && init?.method === "POST") return post(JSON.parse(String(init.body)));
    return originalFetch(input, init);
  }) as typeof fetch;
  return { post, restore: () => (window.fetch = originalFetch) };
}

async function openRegistrationDialog(canvasElement: HTMLElement) {
  const canvas = within(canvasElement);
  await userEvent.click(canvas.getByRole("button", { name: "변경" }));
  return within(canvas.getByRole("dialog", { name: "소속 연구실을 알려주세요" }));
}

export const FinderStatusDialog: Story = {
  args: { profile: FINDER_PROFILE, reviewOptions: REVIEW_OPTIONS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const dialog = await openRegistrationDialog(canvasElement);
    await expect(dialog.getByText("연구실을 고르면 학부연구생으로 저장돼요.")).toBeVisible();
    await expect(dialog.getByRole("combobox")).toHaveAttribute("placeholder", "연구실 이름을 입력해주세요.");
    await expect(dialog.getByRole("group", { name: "코어타임" })).toBeVisible();
    await expect(dialog.getByRole("group", { name: "미팅 빈도" })).toBeVisible();
    await expect(dialog.getByRole("button", { name: "정보 제공하기" })).toBeDisabled();
    await userEvent.click(dialog.getByRole("button", { name: "취소" }));
    await expect(canvas.queryByRole("dialog")).not.toBeInTheDocument();
  },
};

export const FinderRegistrationFlow: Story = {
  args: { profile: FINDER_PROFILE, reviewOptions: REVIEW_OPTIONS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { post, restore } = stubRegistrationFetch();
    try {
      const dialog = await openRegistrationDialog(canvasElement);
      const input = dialog.getByRole("combobox");
      await userEvent.type(input, "연구실");
      await userEvent.click(await dialog.findByRole("button", { name: new RegExp(MOCK_LABS[0].name) }));
      // 선택 후 입력은 비우고 선택한 연구실을 카드로 보여준다.
      await expect(input).toHaveValue("");
      await expect(dialog.getByRole("heading", { name: MOCK_LABS[0].name })).toBeVisible();
      const submit = dialog.getByRole("button", { name: "정보 제공하기" });
      await expect(submit).toBeDisabled();

      // 다시 검색하면 기존 선택 연구실이 선택 상태로 보인다.
      await userEvent.type(input, "연구실");
      const selectedOption = await dialog.findByRole("option", { selected: true });
      await expect(selectedOption).toHaveTextContent(MOCK_LABS[0].name);
      // Escape는 결과 목록만 닫고 모달은 유지한다.
      await userEvent.keyboard("{Escape}");
      await expect(dialog.queryByRole("listbox")).not.toBeInTheDocument();
      await expect(canvas.getByRole("dialog")).toBeInTheDocument();

      await userEvent.click(dialog.getByRole("radio", { name: "있어요" }));
      await expect(submit).toBeDisabled();
      await userEvent.click(dialog.getByRole("radio", { name: "주 2~3회" }));
      await expect(submit).toBeEnabled();
      await userEvent.click(submit);
      await waitFor(() => expect(post).toHaveBeenCalledTimes(1));
      await expect(post).toHaveBeenCalledWith({
        coreTime: "있어요",
        laboratoryId: MOCK_LABS[0].laboratoryId,
        weeklyMeeting: "주 2~3회",
      });
      await waitFor(() => expect(canvas.queryByRole("dialog")).not.toBeInTheDocument());
    } finally {
      restore();
    }
  },
};

export const FinderRegistrationNoResults: Story = {
  args: { profile: FINDER_PROFILE, reviewOptions: REVIEW_OPTIONS },
  play: async ({ canvasElement }) => {
    const { restore } = stubRegistrationFetch({ labs: [] });
    try {
      const dialog = await openRegistrationDialog(canvasElement);
      await userEvent.type(dialog.getByRole("combobox"), "없는 연구실");
      const report = await dialog.findByRole("link", { name: "제보하기" });
      await expect(report).toHaveAttribute("target", "_blank");
      await expect(dialog.getByText("찾는 연구실이 없나요?")).toBeVisible();
      await expect(dialog.queryByText("검색 결과가 없어요")).not.toBeInTheDocument();
    } finally {
      restore();
    }
  },
};

export const FinderRegistrationReviewFailure: Story = {
  args: { profile: FINDER_PROFILE, reviewOptions: REVIEW_OPTIONS },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const { restore } = stubRegistrationFetch({
      register: async () =>
        Response.json(
          { message: "코어타임·미팅 빈도를 저장하지 못했어요. 정보 수정하기에서 다시 입력해주세요.", registered: true },
          { status: 502 },
        ),
    });
    try {
      const dialog = await openRegistrationDialog(canvasElement);
      await userEvent.type(dialog.getByRole("combobox"), "연구실");
      await userEvent.click(await dialog.findByRole("button", { name: new RegExp(MOCK_LABS[0].name) }));
      await userEvent.click(dialog.getByRole("radio", { name: "없어요" }));
      await userEvent.click(dialog.getByRole("radio", { name: "주 1회" }));
      await userEvent.click(dialog.getByRole("button", { name: "정보 제공하기" }));
      // 등록은 반영됐으므로 모달을 닫고 다시 입력할 곳을 안내한다.
      await waitFor(() => expect(canvas.queryByRole("dialog")).not.toBeInTheDocument());
      await expect(await canvas.findByText(/정보 수정하기에서 다시 입력해주세요/)).toBeVisible();
    } finally {
      restore();
    }
  },
};

export const FinderRegistrationOptionsUnavailable: Story = {
  args: { profile: FINDER_PROFILE, reviewOptions: undefined },
  play: async ({ canvasElement }) => {
    const dialog = await openRegistrationDialog(canvasElement);
    await expect(dialog.getByRole("alert")).toHaveTextContent("선택지를 불러오지 못했어요");
    await expect(dialog.getByRole("button", { name: "정보 제공하기" })).toBeDisabled();
  },
};

export const ResearcherStatusMock: Story = {
  render: function Render(args) {
    const [researcher, setResearcher] = useState(false);
    return (
      <MockMyPage
        {...args}
        profile={{
          ...MOCK_MEMBER_PROFILE,
          userType: researcher ? "RESEARCHER" : "FINDER",
          isUndergraduateResearcher: researcher,
          researchProfile: researcher
            ? MOCK_MEMBER_PROFILE.researchProfile
            : undefined,
        }}
        onChangeResearcherStatus={() => setResearcher((value) => !value)}
      />
    );
  },
};
export const Professor: Story = {
  args: {
    profile: {
      ...MOCK_MEMBER_PROFILE,
      userType: "PROFESSOR",
      isUndergraduateResearcher: false,
      hasContributedReview: false,
      researchProfile: {
        ...MOCK_MEMBER_PROFILE.researchProfile!,
        coffeeChatPublic: false,
        coffeeChat: undefined,
        tags: [],
      },
    },
  },
};
export const EmptyBookmarks: Story = {
  args: { initialBookmarks: [], onLoad: async () => [] },
};
export const ContactSaveFailure: Story = {
  args: {
    onSaveContact: async () => {
      throw new Error("연락처를 저장하지 못했어요.");
    },
  },
};
export const WithdrawalWithoutReview: Story = {
  args: {
    initialWithdrawalDialogOpen: true,
    profile: {
      ...MOCK_MEMBER_PROFILE,
      userType: "FINDER",
      isUndergraduateResearcher: false,
      researchProfile: undefined,
      hasContributedReview: false,
    },
  },
};
export const WithdrawalFailure: Story = {
  args: {
    initialWithdrawalDialogOpen: true,
    onWithdraw: async () => {
      throw new Error("회원 탈퇴를 완료하지 못했습니다.");
    },
  },
  play: async ({ canvasElement }) => {
    const dialog = within(canvasElement).getByRole("dialog");
    await userEvent.click(
      within(dialog).getByRole("button", { name: "탈퇴하기" }),
    );
    await expect(within(dialog).getByRole("alert")).toHaveTextContent(
      "회원 탈퇴를 완료하지 못했습니다.",
    );
  },
};
export const BookmarkRemoval: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(
      canvas.getByRole("button", {
        name: "지능형 데이터 시스템 연구실 관심 연구실 해제",
      }),
    );
    await expect(
      canvas.queryByRole("button", {
        name: "지능형 데이터 시스템 연구실 관심 연구실 해제",
      }),
    ).not.toBeInTheDocument();
    await expect(
      await canvas.findByText("관심 연구실에서 해제했어요."),
    ).toBeVisible();
  },
};

export const Mobile: Story = {
  parameters: {
    viewport: {
      defaultViewport: "mobile375",
      options: {
        mobile375: {
          name: "Mobile 375",
          styles: {
            height: "812px",
            width: "375px",
          },
          type: "mobile",
        },
      },
    },
  },
};

export const WithdrawalDialogOpen: Story = {
  args: {
    initialWithdrawalDialogOpen: true,
  },
};
