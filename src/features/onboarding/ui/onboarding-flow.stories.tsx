import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";
import { OnboardingFlow } from "./onboarding-flow";

const lab = {
  laboratoryId: 157,
  labId: "157",
  name: "지능형 데이터 시스템 연구실",
  professorName: "김OO",
  department: "컴퓨터공학부",
  tags: ["데이터베이스", "AI"],
  description: "",
};
const colleges = [
  {
    college: "IT",
    collegeName: "정보기술대학",
    departments: [
      { department: "COMPUTER_ENGINEERING", departmentName: "컴퓨터공학부" },
      {
        department: "INFORMATION_COMMUNICATION_ENGINEERING",
        departmentName: "정보통신공학과",
      },
    ],
  },
];
const meta = {
  title: "Features/Onboarding/ResearcherFlow",
  component: OnboardingFlow,
  parameters: { layout: "fullscreen" },
  args: {
    colleges,
    reviewOptions: {
      coreTime: ["있음", "없음"],
      weeklyMeeting: ["주 1회", "격주"],
      works: ["논문 리딩", "실험/코딩"],
    },
    onComplete: fn().mockResolvedValue(undefined),
    renderLabSearch: ({ onSelect }) => (
      <button type="button" onClick={() => onSelect(lab)}>
        지능형 데이터 시스템 연구실 선택
      </button>
    ),
  },
} satisfies Meta<typeof OnboardingFlow>;
export default meta;
type Story = StoryObj<typeof meta>;

async function answer(canvas: ReturnType<typeof within>, name: string) {
  await userEvent.click(await canvas.findByRole("radio", { name }));
  await userEvent.click(canvas.getByRole("button", { name: "보내기" }));
}
async function selectLab(canvas: ReturnType<typeof within>) {
  await answer(canvas, "학부연구생 / 대학원생이에요");
  await userEvent.click(
    canvas.getByRole("button", { name: "지능형 데이터 시스템 연구실 선택" }),
  );
  await userEvent.click(canvas.getByRole("button", { name: "보내기" }));
}
async function review(canvas: ReturnType<typeof within>) {
  await answer(canvas, "있음");
  await answer(canvas, "주 1회");
  await userEvent.click(canvas.getByRole("checkbox", { name: "논문 리딩" }));
  await userEvent.click(canvas.getByRole("button", { name: "보내기" }));
}
export const DepartmentConfirmation: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await selectLab(canvas);
    await expect(
      canvas.getByText("컴퓨터공학부 소속인가요?"),
    ).toBeInTheDocument();
  },
};
export const OtherDepartment: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await selectLab(canvas);
    await answer(canvas, "아니요, 다른 학과에요");
    await userEvent.type(
      canvas.getByRole("combobox", { name: "학과 검색" }),
      "정보",
    );
  },
};
export const DeclinedCoffeeChat: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await selectLab(canvas);
    await answer(canvas, "네, 맞아요");
    await review(canvas);
    await answer(canvas, "아니요, 괜찮아요");
    await expect(
      canvas.queryByRole("textbox", { name: "오픈채팅 링크" }),
    ).not.toBeInTheDocument();
    await expect(
      canvas.queryByText("연락 가능한 오픈채팅 링크를 남겨주세요"),
    ).not.toBeInTheDocument();
    await userEvent.click(canvas.getByRole("button", { name: "시작하기" }));
    await expect(args.onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        departmentCode: "COMPUTER_ENGINEERING",
        coffeeChat: "아니요, 괜찮아요",
      }),
      "/",
    );
  },
};
export const ChangeCoffeeChat: Story = {
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await selectLab(canvas);
    await answer(canvas, "네, 맞아요");
    await review(canvas);
    await answer(canvas, "네, 좋아요");
    await userEvent.type(
      canvas.getByRole("textbox", { name: "오픈채팅 링크" }),
      "https://open.kakao.com/o/test",
    );
    await userEvent.click(canvas.getByRole("button", { name: "보내기" }));
    await userEvent.click(
      canvas.getByRole("button", { name: "이전 답변 수정" }),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "이전 답변 수정" }),
    );
    await answer(canvas, "아니요, 괜찮아요");
    await expect(
      canvas.queryByText("https://open.kakao.com/o/test"),
    ).not.toBeInTheDocument();
    await userEvent.click(
      canvas.getByRole("button", { name: "이전 답변 수정" }),
    );
    await answer(canvas, "네, 좋아요");
    await expect(
      canvas.getByRole("textbox", { name: "오픈채팅 링크" }),
    ).toHaveValue("");
    await userEvent.click(
      canvas.getByRole("button", { name: "이전 답변 수정" }),
    );
    await answer(canvas, "아니요, 괜찮아요");
    await userEvent.click(canvas.getByRole("button", { name: "시작하기" }));
    await expect(args.onComplete).toHaveBeenCalledWith(
      expect.not.objectContaining({ contact: expect.any(String) }),
      "/",
    );
  },
};
export const SaveFailure: Story = {
  args: {
    onComplete: fn(async () => {
      throw new Error("학과를 저장하지 못했습니다. 다시 시도해주세요.");
    }),
  },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await selectLab(canvas);
    await answer(canvas, "아니요, 다른 학과에요");
    const search = canvas.getByRole("combobox", { name: "학과 검색" });
    await userEvent.type(search, "정보통신");
    await userEvent.click(
      await canvas.findByRole("option", { name: /정보통신공학과/ }),
    );
    await userEvent.click(canvas.getByRole("button", { name: "보내기" }));
    await review(canvas);
    await answer(canvas, "아니요, 괜찮아요");
    await userEvent.click(canvas.getByRole("button", { name: "시작하기" }));
    await waitFor(() =>
      expect(
        canvas.getByText("학과를 저장하지 못했습니다. 다시 시도해주세요."),
      ).toBeInTheDocument(),
    );
    await expect(args.onComplete).toHaveBeenCalledWith(
      expect.objectContaining({
        departmentCode: "INFORMATION_COMMUNICATION_ENGINEERING",
      }),
      "/",
    );
    await expect(
      canvas.getByRole("button", { name: "시작하기" }),
    ).toBeEnabled();
  },
};
