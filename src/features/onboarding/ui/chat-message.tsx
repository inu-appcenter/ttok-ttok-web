import type { ReactNode } from "react";

export type ChatMessageProps = {
  children: ReactNode;
  emphasis?: "default" | "subtle";
  sender: "bot" | "user";
};

export function ChatMessage({
  children,
  emphasis = "default",
  sender,
}: ChatMessageProps) {
  const isUser = sender === "user";
  const isSubtle = sender === "bot" && emphasis === "subtle";

  return (
    <div
      className={`w-fit max-w-full break-words rounded-[var(--radius-xl)] px-[var(--spacing-spacing-6)] py-[var(--spacing-spacing-4)] shadow-[0_2px_4px_var(--color-opacity-black-10)] ${
        isUser
          ? "ml-auto bg-bg-primary text-text-inverse"
          : "bg-bg-neutral text-text-default"
      }`}
    >
      <p
        className={
          isUser
            ? "text-[length:var(--font-size-headline2)] font-semibold leading-[1.4] tracking-[-0.01em]"
            : isSubtle
              ? "text-[length:var(--font-size-body3)] font-normal leading-[1.5] text-text-subtle"
              : "text-[length:var(--font-size-heading2)] font-semibold leading-[1.5] tracking-[-0.01em]"
        }
      >
        {children}
      </p>
    </div>
  );
}
