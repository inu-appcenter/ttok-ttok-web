import Image from "next/image";
import type { ButtonHTMLAttributes } from "react";

export type AiRecommendationButtonProps =
  ButtonHTMLAttributes<HTMLButtonElement>;

export function AiRecommendationButton({
  className,
  disabled,
  ...props
}: AiRecommendationButtonProps) {
  return (
    <button
      className={`inline-flex h-[49px] w-[240px] items-center justify-center gap-1 rounded-[var(--radius-xl)] bg-[linear-gradient(90deg,#a7c0db_0%,#b4bade_33%,#c2aed6_66%,#d699c5_100%)] px-4 py-2 text-[length:var(--font-size-heading1)] font-semibold leading-[1.5] tracking-[-0.01em] text-text-inverse transition-opacity hover:opacity-90 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary disabled:cursor-not-allowed disabled:bg-[#acacac] disabled:bg-none disabled:hover:opacity-100 ${className ?? ""}`}
      disabled={disabled}
      type="button"
      {...props}
    >
      <Image
        alt=""
        height={24}
        src="/icons/recommendations/ai-recommendation-sparkles.svg"
        width={24}
      />
      맞춤 연구실 추천받기
    </button>
  );
}
