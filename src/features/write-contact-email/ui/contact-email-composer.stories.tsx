import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, spyOn, userEvent, waitFor, within } from "storybook/test";
import { createMockEmailDraft } from "../model/email-draft";
import type { EmailInput } from "../model/email-draft";
import { ContactEmailComposer } from "./contact-email-composer";
const recipient = {
  professorName: "김다윤",
  labName: "지능형 데이터 시스템 연구실",
  email: "professor@example.com",
};
const input: EmailInput = {
  purpose: "학부연구생 지원",
  name: "홍길동",
  department: "컴퓨터공학부",
  year: "3학년",
  email: "student@example.com",
  phone: "010-1234-5678",
  interest: "추천시스템과 데이터 분석",
  experience: "파이썬으로 데이터를 수집하는 프로젝트를 진행했습니다.",
};
const meta = {
  title: "Features/WriteContactEmail/Composer",
  component: ContactEmailComposer,
  args: { recipient, isOpen: true, onClose: fn() },
  parameters: { layout: "fullscreen" },
} satisfies Meta<typeof ContactEmailComposer>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Input: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
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
      await expect(clipboard).toHaveBeenCalledWith(
        createMockEmailDraft(input, recipient).subject,
      );
      await userEvent.click(canvas.getByRole("button", { name: /^복사$/ }));
      await expect(clipboard).toHaveBeenLastCalledWith(
        createMockEmailDraft(input, recipient).body,
      );
    } finally {
      clipboard.mockRestore();
    }
  },
  args: {
    initialInput: input,
    initialDraft: createMockEmailDraft(input, recipient),
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
    initialDraft: createMockEmailDraft(input, { ...recipient, email: null }),
  },
};

export const CopyFailure: Story = {
  args: {
    initialInput: input,
    initialDraft: createMockEmailDraft(input, recipient),
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
