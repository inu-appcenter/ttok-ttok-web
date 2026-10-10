import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { useRef, useState } from "react";
import { expect, userEvent, within } from "storybook/test";
import { MOCK_BOOKMARKS } from "@/entities/bookmark";

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
