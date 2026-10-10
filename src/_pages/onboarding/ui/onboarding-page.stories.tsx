import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { OnboardingPage } from "./onboarding-page";
import { OnboardingFlow } from "@/features/onboarding";
import { FinderResults } from "@/widgets/onboarding-chat/ui/finder-results";
import { OnboardingHeader } from "@/widgets/onboarding-chat/ui/onboarding-header";

const colleges = [
  {
    college: "COLLEGE_OF_INFORMATION_TECHNOLOGY",
    collegeName: "정보기술대학",
    departments: [
      { department: "COMPUTER_ENGINEERING", departmentName: "컴퓨터공학부" },
      {
        department: "INFORMATION_COMMUNICATION_ENGINEERING",
        departmentName: "정보통신공학과",
      },
      { department: "EMBEDDED_SYSTEM", departmentName: "임베디드시스템공학과" },
    ],
  },
];

const meta = {
  title: "Pages/Onboarding",
  component: OnboardingPage,
  parameters: {
    layout: "fullscreen",
  },
} satisfies Meta<typeof OnboardingPage>;

export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = { args: { colleges } };

export const Finder: Story = {
  render: () => (
    <main className="flex min-h-screen flex-col bg-bg-default max-md:h-dvh max-md:min-h-0 max-md:overflow-hidden">
      <OnboardingHeader />
      <OnboardingFlow
        colleges={colleges}
        onComplete={async () => {}}
        renderFinderResults={(props) => <FinderResults {...props} />}
        renderLabSearch={() => null}
      />
    </main>
  ),
};

export const CompletionError: Story = {
  render: () => (
    <main className="flex min-h-screen flex-col bg-bg-default max-md:h-dvh max-md:min-h-0 max-md:overflow-hidden">
      <OnboardingHeader />
      <OnboardingFlow
        colleges={colleges}
        onComplete={async () => {
          throw new Error("학과를 저장하지 못했습니다. 다시 시도해주세요.");
        }}
        renderFinderResults={(props) => <FinderResults {...props} />}
        renderLabSearch={() => null}
      />
    </main>
  ),
};

export const DepartmentError: Story = {
  args: {
    colleges: [],
    collegesError:
      "학과 목록을 불러오지 못했습니다. 새로고침 후 다시 시도해주세요.",
  },
};
