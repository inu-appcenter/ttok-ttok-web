import Image from "next/image";
import Link from "next/link";
import type { Recommendation } from "../model/recommendation-contract";

export function RecommendationResultCards({
  recommendations,
  isMobile = false,
}: {
  recommendations: Recommendation[];
  isMobile?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3">
      {recommendations.map((lab, index) => (
        <article
          key={lab.id}
          className="rounded-xl bg-white px-4 py-[13px] shadow-[0_2px_4px_#0000001a]"
        >
          {index === 0 && (
            <span className="mb-2 inline-block rounded-full bg-[linear-gradient(90deg,#a7c0db,#c2aed6,#d699c5)] px-3 py-1 text-[14px] font-semibold text-white">
              가장 잘 맞아요
            </span>
          )}
          <h3 className="text-[20px] font-semibold leading-[1.5]">
            {lab.name}
          </h3>
          <p className="text-[13px] text-text-subtle">
            {lab.professor} 교수 · {lab.department}
          </p>
          <div className="my-2 flex flex-wrap gap-1">
            {lab.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-bg-primary px-2 py-0.5 text-[13px] text-white"
              >
                {tag}
              </span>
            ))}
          </div>
          {!isMobile && (
            <ul className="space-y-1 text-[14px] leading-[1.5] text-text-subtle">
              {lab.reasons.map((reason) => (
                <li key={reason} className="flex gap-2">
                  <span className="text-text-primary">•</span>
                  {reason}
                </li>
              ))}
            </ul>
          )}
          <Link
            href={`/labs/${lab.id}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-2 flex items-center justify-end gap-1 text-[14px] text-text-primary"
          >
            연구실 보기
            <Image
              src="/icons/recommendations/chevron-right.svg"
              width={13}
              height={13}
              alt=""
            />
          </Link>
        </article>
      ))}
    </div>
  );
}
