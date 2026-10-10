import Image from "next/image";
import { MOCK_RECOMMENDATIONS } from "@/features/request-ai-recommendation";

export function FinderResults({
  onOpen,
  disabled,
}: {
  onOpen: (href: string) => void;
  disabled: boolean;
}) {
  return (
    <div className="flex w-full max-w-[400px] flex-col gap-4">
      <p className="text-[13px] text-text-subtle">예시 추천 결과</p>
      {MOCK_RECOMMENDATIONS.map((lab, index) => (
        <article
          className="rounded-xl border border-transparent bg-bg-default px-4 py-3 shadow-[0_4px_16px_var(--color-opacity-black-10)] transition-colors hover:border-border-primary hover:bg-bg-primary-subtle focus-within:border-border-primary focus-within:bg-bg-primary-subtle"
          key={lab.id}
        >
          {index === 0 ? (
            <span className="mb-2 inline-block rounded-full bg-[linear-gradient(90deg,#a7c0db,#c2aed6,#d699c5)] px-3 py-1 text-sm font-semibold text-white">
              가장 잘 맞아요
            </span>
          ) : null}
          <h3 className="break-words text-xl font-semibold leading-[1.5] tracking-[-0.01em]">
            {lab.name}
          </h3>
          <p className="text-[13px] leading-[1.5] text-text-subtle">
            {lab.professor} 교수
          </p>
          <div className="my-2 flex flex-wrap gap-2">
            {lab.tags.map((tag) => (
              <span
                className="rounded-full bg-bg-primary px-2.5 text-[13px] leading-[1.5] text-white"
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
          <ul className="space-y-1 text-sm leading-[1.5]">
            {lab.reasons.map((reason) => (
              <li className="flex gap-2" key={reason}>
                <span aria-hidden="true" className="text-text-primary">
                  •
                </span>
                {reason}
              </li>
            ))}
          </ul>
          <button
            aria-label={`${lab.name} 보기`}
            className="mt-2 ml-auto flex cursor-pointer items-center gap-1 text-sm font-semibold text-text-primary disabled:cursor-not-allowed disabled:opacity-50"
            disabled={disabled}
            onClick={() => onOpen(`/labs/${lab.id}`)}
            type="button"
          >
            연구실 보기
            <Image
              alt=""
              height={13}
              src="/icons/recommendations/chevron-right.svg"
              width={13}
            />
          </button>
        </article>
      ))}
    </div>
  );
}
