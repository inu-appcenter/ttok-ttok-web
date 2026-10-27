import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import { expect, fn, userEvent, waitFor, within } from "storybook/test";

import { MOCK_BOOKMARKS, type Bookmark } from "@/entities/bookmark";
import { getLoginPath, LOGIN_REQUIRED_NOTICE } from "@/shared/lib/auth/return-path";

import { BookmarkToggle } from "./bookmark-toggle";

const LAB_ID = MOCK_BOOKMARKS[0].laboratory.laboratoryId;
const REGISTERED = [MOCK_BOOKMARKS[0]];

const meta = {
  title: "Features/BookmarkToggle",
  component: BookmarkToggle,
  parameters: { layout: "centered" },
  args: { laboratoryId: LAB_ID, isAuthenticated: true, initialBookmarks: [] },
} satisfies Meta<typeof BookmarkToggle>;

export default meta;
type Story = StoryObj<typeof meta>;

// 실제 fetch 경로(POST 후 서버 재조회)를 검증하려고 POST 응답만 대체한다. 목록 조회는 onLoad가 담당한다.
function stubBookmarkPost(respond: () => Promise<Response>) {
  const originalFetch = window.fetch;
  const post = fn(respond);
  window.fetch = ((input: RequestInfo | URL, init?: RequestInit) =>
    init?.method === "POST" ? post() : originalFetch(input, init)) as typeof fetch;
  return { post, restore: () => (window.fetch = originalFetch) };
}

export const LoggedOut: Story = {
  args: { isAuthenticated: false, onLoad: fn(async () => []) },
  parameters: { nextjs: { navigation: { pathname: `/labs/${LAB_ID}` } } },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const link = canvas.getByRole("link", { name: "관심 연구실" });
    // 로그인 후 같은 연구실 상세로 돌아오도록 안내 값과 복귀 경로를 함께 전달한다.
    await expect(link).toHaveAttribute(
      "href",
      getLoginPath({ notice: LOGIN_REQUIRED_NOTICE, returnTo: `/labs/${LAB_ID}` }),
    );
    await userEvent.click(link);
    link.focus();
    await userEvent.keyboard("{Enter}");
    await expect(canvas.queryByRole("alert")).not.toBeInTheDocument();
    await expect(args.onLoad).not.toHaveBeenCalled();
  },
};

const deferredLoad = fn<() => Promise<Bookmark[]>>();

export const RegisterSuccessAfterRefetch: Story = {
  args: { onLoad: deferredLoad },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    let resolveRefetch: (items: Bookmark[]) => void = () => {};
    deferredLoad.mockReset();
    deferredLoad.mockImplementation(
      () => new Promise<Bookmark[]>((resolve) => (resolveRefetch = resolve)),
    );
    const { post, restore } = stubBookmarkPost(async () =>
      Response.json({ ok: true }),
    );
    try {
      await userEvent.click(canvas.getByRole("button", { name: "관심 연구실" }));
      await waitFor(() => expect(args.onLoad).toHaveBeenCalled());
      await expect(post).toHaveBeenCalledTimes(1);
      // 서버 재조회가 끝나기 전에는 성공을 알리지 않는다.
      await expect(canvas.queryByRole("status")).not.toBeInTheDocument();
      resolveRefetch(REGISTERED);
      await expect(await canvas.findByRole("status")).toHaveTextContent(
        "관심 연구실에 등록했어요.",
      );
      await expect(
        canvas.getByRole("button", { name: "관심 연구실 ✓" }),
      ).toHaveAttribute("aria-pressed", "true");
    } finally {
      restore();
    }
  },
};

export const DefiniteFailure: Story = {
  args: {
    onToggle: fn(async (): Promise<Bookmark[]> => {
      throw new Error("존재하지 않는 연구실이에요.");
    }),
  },
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement);
    await userEvent.click(canvas.getByRole("button", { name: "관심 연구실" }));
    const alert = await canvas.findByRole("alert");
    await expect(alert).toHaveTextContent("관심 연구실을 변경하지 못했어요.");
    await expect(alert).toHaveTextContent("존재하지 않는 연구실이에요.");
    // 실패가 확정되면 바로 다시 시도할 수 있다.
    await expect(canvas.getByRole("button", { name: "관심 연구실" })).toBeEnabled();
    await expect(canvas.queryByRole("button", { name: "다시 불러오기" })).not.toBeInTheDocument();
  },
};

export const UncertainResponse: Story = {
  args: { onLoad: fn(async () => REGISTERED) },
  play: async ({ args, canvasElement }) => {
    const canvas = within(canvasElement);
    const { post, restore } = stubBookmarkPost(async () => {
      throw new TypeError("Failed to fetch");
    });
    try {
      const toggle = canvas.getByRole("button", { name: "관심 연구실" });
      await userEvent.click(toggle);
      await expect(
        await canvas.findByText("변경 결과를 확인하지 못했어요."),
      ).toBeVisible();
      await expect(canvas.queryByRole("status")).not.toBeInTheDocument();
      // 결과가 불확실하면 토글을 다시 보내지 않도록 막고 목록 재조회만 허용한다.
      await expect(toggle).toBeDisabled();
      await userEvent.click(toggle);
      await expect(post).toHaveBeenCalledTimes(1);

      await userEvent.click(canvas.getByRole("button", { name: "다시 불러오기" }));
      await waitFor(() =>
        expect(
          canvas.getByRole("button", { name: "관심 연구실 ✓" }),
        ).toBeEnabled(),
      );
      await expect(args.onLoad).toHaveBeenCalled();
      await expect(post).toHaveBeenCalledTimes(1);
      // 재조회는 사용자가 바꾼 결과가 아니므로 성공 토스트를 띄우지 않는다.
      await expect(canvas.queryByRole("status")).not.toBeInTheDocument();
    } finally {
      restore();
    }
  },
};
