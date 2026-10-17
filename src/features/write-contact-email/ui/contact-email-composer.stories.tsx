import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, spyOn, userEvent, waitFor, within } from "storybook/test";
import { createMockEmailDraft } from "../model/email-draft";
import type { EmailInput } from "../model/email-draft";
import { ContactEmailComposer } from "./contact-email-composer";
const recipient = {
  laboratoryId: 157,
  professorName: "김다윤",
  labName: "지능형 데이터 시스템 연구실",
  email: "professor@example.com",
};
const input: EmailInput = {
  purpose: "학부연구생 지원",
  name: "홍길동",
  department: "COMPUTER_ENGINEERING",
  year: "3학년",
  email: "student@example.com",
  phone: "010-1234-5678",
  interest: "추천시스템과 데이터 분석",
  experience: "파이썬으로 데이터를 수집하는 프로젝트를 진행했습니다.",
};
const draft = createMockEmailDraft(
  { ...input, department: "컴퓨터공학부" },
  recipient,
);
const departments = [
  { department: "COMPUTER_ENGINEERING", departmentName: "컴퓨터공학부" },
  { department: "KOREAN", departmentName: "국어국문학과" },
];
const meta = {
  title: "Features/WriteContactEmail/Composer",
  component: ContactEmailComposer,
  args: {
    recipient,
    isOpen: true,
    onClose: fn(),
    onLoadDepartments: fn(async () => departments),
    onGenerate: fn(async () => ({ subject: draft.subject, body: draft.body })),
  },
  parameters: { layout: "fullscreen", nextjs: { appDirectory: true } },
} satisfies Meta<typeof ContactEmailComposer>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Input: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "AI로 메일 초안 만들기" }),
      ).toBeEnabled(),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "AI로 메일 초안 만들기" }),
    );
    await expect(canvas.getByLabelText("이름")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(
      canvas.queryByRole("button", { name: "제목 복사" }),
    ).not.toBeInTheDocument();
  },
};
export const Filled: Story = {
  args: { initialInput: input },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "AI로 메일 초안 만들기" }),
      ).toBeEnabled(),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "AI로 메일 초안 만들기" }),
    );
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "제목 복사" }),
      ).toBeInTheDocument(),
    );
    await expect(canvas.getByLabelText("이름")).toHaveValue(input.name);
  },
};
export const Draft: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const clipboard = spyOn(
      navigator.clipboard,
      "writeText",
    ).mockResolvedValue();
    try {
      await userEvent.click(canvas.getByRole("button", { name: "제목 복사" }));
      await expect(clipboard).toHaveBeenCalledWith(draft.subject);
      await userEvent.click(canvas.getByRole("button", { name: /^복사$/ }));
      await expect(clipboard).toHaveBeenLastCalledWith(draft.body);
    } finally {
      clipboard.mockRestore();
    }
  },
  args: {
    initialInput: input,
    initialDraft: draft,
  },
};
export const MissingRecipient: Story = {
  play: async ({ canvasElement }) => {
    await expect(
      within(canvasElement).getByRole("button", { name: "받는 사람 복사" }),
    ).toBeDisabled();
  },
  args: {
    recipient: { ...recipient, email: null },
    initialInput: input,
    initialDraft: { ...draft, recipient: "" },
  },
};

export const CopyFailure: Story = {
  args: {
    initialInput: input,
    initialDraft: draft,
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    const clipboard = spyOn(navigator.clipboard, "writeText").mockRejectedValue(
      new Error("Permission denied"),
    );
    try {
      await userEvent.click(canvas.getByRole("button", { name: "제목 복사" }));
      await waitFor(() =>
        expect(canvas.getByRole("alert")).toHaveTextContent(
          "복사하지 못했어요",
        ),
      );
      await expect(canvas.getByLabelText("이름")).toHaveValue(input.name);
    } finally {
      clipboard.mockRestore();
    }
  },
};

export const Regenerate: Story = {
  args: { initialInput: input, initialDraft: draft },
  play: async ({ canvasElement, args }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "입력 내용으로 다시 생성" }),
      ).toBeEnabled(),
    );
    await userEvent.clear(canvas.getByLabelText("관심 있는 연구"));
    await userEvent.type(
      canvas.getByLabelText("관심 있는 연구"),
      "자연어 처리",
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "입력 내용으로 다시 생성" }),
    );
    await expect(args.onGenerate).toHaveBeenCalledWith(
      {
        laboratoryId: 157,
        purpose: "UNDERGRADUATE_RESEARCH",
        name: "홍길동",
        department: "COMPUTER_ENGINEERING",
        grade: "THIRD",
        email: input.email,
        phoneNumber: input.phone,
        interest: "자연어 처리",
        content: input.experience,
      },
      expect.any(AbortSignal),
    );
    await expect(
      await canvas.findByRole("button", { name: "제목 복사" }),
    ).toBeEnabled();
  },
};
export const GenerationFailure: Story = {
  args: {
    initialInput: input,
    initialDraft: draft,
    onGenerate: fn(async () => {
      throw new Error("메일 초안을 일시적으로 만들 수 없습니다.");
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "입력 내용으로 다시 생성" }),
      ).toBeEnabled(),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "입력 내용으로 다시 생성" }),
    );
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "메일 초안을 일시적으로 만들 수 없습니다.",
    );
    await expect(canvas.getByLabelText("관심 있는 연구")).toHaveValue(
      input.interest,
    );
    await expect(canvas.getByText(draft.subject)).toBeInTheDocument();
  },
};
export const CancelLateResponse: Story = {
  args: {
    initialInput: input,
    initialDraft: draft,
    onGenerate: fn(
      (
        _input: import("../model/email-contract").EmailRequest,
        signal: AbortSignal,
      ) =>
        new Promise<{ subject: string; body: string }>((resolve) =>
          signal.addEventListener(
            "abort",
            () => resolve({ subject: "취소한 응답", body: "취소한 본문" }),
            { once: true },
          ),
        ),
    ),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "입력 내용으로 다시 생성" }),
      ).toBeEnabled(),
    );
    await userEvent.click(
      canvas.getByRole("button", { name: "입력 내용으로 다시 생성" }),
    );
    await userEvent.click(
      await canvas.findByRole("button", { name: "요청 취소" }),
    );
    await expect(canvas.getByText(draft.subject)).toBeInTheDocument();
    await expect(canvas.queryByText("취소한 응답")).not.toBeInTheDocument();
  },
};
export const DepartmentFailure: Story = {
  args: {
    initialInput: input,
    onLoadDepartments: fn(async () => departments),
  },
  beforeEach: ({ args }) => {
    if (!args.onLoadDepartments) return;
    args.onLoadDepartments.mockReset();
    args.onLoadDepartments
      .mockRejectedValueOnce(new Error("offline"))
      .mockResolvedValue(departments);
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await expect(await canvas.findByRole("alert")).toHaveTextContent(
      "학과 목록을 불러오지 못했어요",
    );
    await expect(
      canvas.getByRole("button", { name: "AI로 메일 초안 만들기" }),
    ).toBeDisabled();
    await userEvent.click(
      canvas.getByRole("button", { name: "다시 불러오기" }),
    );
    await waitFor(() =>
      expect(
        canvas.getByRole("button", { name: "AI로 메일 초안 만들기" }),
      ).toBeEnabled(),
    );
  },
};
