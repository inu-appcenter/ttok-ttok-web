import Image from "next/image";

import type { LabDetail } from "@/entities/lab";
import {
  LabContactCard,
  ProvideLabInfoCard,
  ReportLabButton,
} from "@/features/lab-detail-actions";
import { Tag } from "@/shared/ui";
import { MobileBottomNav } from "@/widgets/mobile-bottom-nav";
import { SiteHeader } from "@/widgets/site-header";

import { MobileAiSummary } from "./mobile-ai-summary";

export type LabDetailPageProps = {
  lab: LabDetail;
};

function getHomepageLabel(homepageUrl: string) {
  try {
    return new URL(homepageUrl).hostname.replace(/^www\./, "");
  } catch {
    return homepageUrl;
  }
}

export function LabDetailPage({ lab }: LabDetailPageProps) {
  const { memberCounts } = lab;

  return (
    <div className="min-h-screen bg-bg-default text-text-default">
      <SiteHeader activeItem="search" />
      <main className="flex flex-col gap-5 px-4 pb-[calc(111px_+_env(safe-area-inset-bottom))] pt-[27px] md:hidden">
        <MobileAiSummary paragraphs={lab.aiSummary} />

        <header>
          <h1 className="text-[length:var(--font-size-headline1)] font-semibold leading-[1.4] tracking-[-0.01em] text-text-default">
            {lab.name}
          </h1>
          <p className="text-[length:var(--font-size-caption1)] leading-[1.5] text-text-subtle">
            {lab.professorName} 교수 · {lab.department}
          </p>
        </header>

        <section className="rounded-[var(--radius-2xl)] bg-bg-default px-4 py-[14px] shadow-[0_4px_16px_var(--color-opacity-black-10)]">
          <h2 className="text-[length:var(--font-size-label1)] font-semibold leading-[1.5]">
            기본 정보
          </h2>
          <div className="mt-[10px] flex flex-wrap gap-[14px]">
            {lab.tags.map((tag) => (
              <Tag className="!bg-[#bfd5f3] py-0" key={tag} tone="primary">
                {tag}
              </Tag>
            ))}
          </div>
          <dl className="mt-[10px] flex flex-col gap-[6px] text-[length:var(--font-size-caption1)] leading-[1.5] text-text-subtle">
            <div className="flex gap-1">
              <dt>위치 ·</dt>
              <dd>{lab.location}</dd>
            </div>
            <div className="flex gap-1">
              <dt>홈페이지 ·</dt>
              <dd>
                <a
                  className="text-[#2a78d6] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
                  href={lab.homepageUrl}
                  rel="noreferrer"
                  target="_blank"
                >
                  {getHomepageLabel(lab.homepageUrl)} ↗
                </a>
              </dd>
            </div>
            <div className="flex gap-1">
              <dt>인원 ·</dt>
              <dd>
                박사 {memberCounts.doctoral} · 석사 {memberCounts.masters} · 학부{" "}
                {memberCounts.undergraduate}
              </dd>
            </div>
          </dl>
        </section>

        <section className="rounded-[var(--radius-2xl)] bg-bg-default px-4 py-[14px] shadow-[0_4px_16px_var(--color-opacity-black-10)]">
          <h2 className="text-[length:var(--font-size-label1)] font-semibold leading-[1.5]">
            최근 논문
          </h2>
          {lab.papers.length > 0 ? (
            <ul className="mt-[6px] flex flex-col">
              {lab.papers.map((paper) => (
                <li className="py-[2px]" key={`${paper.year}-${paper.title}`}>
                  <a
                    className="block text-[length:var(--font-size-caption1)] font-semibold leading-[1.5] text-text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
                    href={paper.url}
                    rel="noreferrer"
                    target="_blank"
                  >
                    {paper.title} <span className="font-normal">↗</span>
                  </a>
                  <p className="text-[length:var(--font-size-caption1)] leading-[1.5] text-text-subtlest">
                    {paper.year} · {paper.venue}
                  </p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-[6px] text-[length:var(--font-size-caption1)] text-text-subtle">
              등록된 논문 정보가 아직 없어요.
            </p>
          )}
        </section>

        <section className="rounded-[var(--radius-2xl)] bg-bg-default px-4 py-[14px] shadow-[0_4px_16px_var(--color-opacity-black-10)]">
          <h2 className="text-[length:var(--font-size-label1)] font-semibold leading-[1.5]">
            학부연구생이 말하는 이 랩 · {lab.experience.participantCount}명 참여
          </h2>
          {lab.experience.participantCount > 0 ? (
            <dl className="mt-[10px] flex flex-col text-[length:var(--font-size-caption1)] leading-[1.5]">
              {[
                ["코어타임", lab.experience.coreTime],
                ["주간 미팅", lab.experience.weeklyMeeting],
                ["하는 일", lab.experience.primaryTasks],
              ].map(([term, description]) => (
                <div className="flex justify-between gap-4 border-b border-border-subtlest py-1 last:border-0" key={term}>
                  <dt className="shrink-0 text-text-subtle">{term}</dt>
                  <dd className="text-right text-text-primary">{description}</dd>
                </div>
              ))}
            </dl>
          ) : (
            <p className="mt-[10px] text-[length:var(--font-size-caption1)] leading-[1.5] text-text-subtle">
              아직 정보가 없어요.
            </p>
          )}
        </section>

        <LabContactCard contact={lab.contact} />
        <ProvideLabInfoCard />
        <div className="text-center">
          <ReportLabButton />
        </div>
      </main>

      <main className="mx-auto hidden w-full max-w-[1440px] gap-6 px-10 pb-20 md:grid md:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="flex min-w-0 flex-col gap-[30px]">
          <header className="border-b border-border-subtle py-[30px]">
            <div className="flex flex-wrap gap-[14px]">
              {lab.tags.map((tag) => (
                <Tag className="!bg-[#bfd5f3] py-0" key={tag} tone="primary">
                  {tag}
                </Tag>
              ))}
            </div>
            <div className="mt-[6px]">
              <h1 className="text-[length:var(--font-size-title1)] font-bold leading-[1.5] text-text-default">
                {lab.name}
              </h1>
              <p className="text-[length:var(--font-size-heading2)] font-medium leading-[1.5] text-text-subtle">
                {lab.professorName} 교수 · {lab.department}
              </p>
            </div>
            <div className="mt-[6px] flex flex-wrap items-center gap-x-6 gap-y-2 text-[length:var(--font-size-label1)] font-medium leading-[1.5] text-text-subtle">
              <span>{lab.location}</span>
              <span>
                박사 {memberCounts.doctoral} · 석사 {memberCounts.masters} · 학부{" "}
                {memberCounts.undergraduate}
              </span>
              <a
                className="text-[#2a78d6] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
                href={lab.homepageUrl}
                rel="noreferrer"
                target="_blank"
              >
                {getHomepageLabel(lab.homepageUrl)} ↗
              </a>
            </div>
          </header>

          <section className="rounded-[var(--radius-2xl)] bg-bg-default px-6 py-5 shadow-[0_4px_16px_var(--color-opacity-black-10)]">
            <h2 className="text-[length:var(--font-size-heading1)] font-semibold leading-[1.5]">
              최근 논문
            </h2>
            {lab.papers.length > 0 ? (
              <ul className="mt-5 flex flex-col gap-4">
                {lab.papers.map((paper) => (
                  <li key={`${paper.year}-${paper.title}`}>
                    <a
                      className="inline-block max-w-full text-[length:var(--font-size-heading2)] font-bold leading-normal text-text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
                      href={paper.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      {paper.title} <span className="font-normal">↗</span>
                    </a>
                    <p className="text-[length:var(--font-size-body2)] leading-normal text-text-subtlest">
                      {paper.year} · {paper.venue}
                    </p>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-5 text-[length:var(--font-size-body2)] text-text-subtlest">
                등록된 논문 정보가 아직 없어요.
              </p>
            )}
          </section>

          <section className="rounded-[var(--radius-2xl)] bg-bg-default px-6 py-5 shadow-[0_4px_16px_var(--color-opacity-black-10)]">
            <h2 className="text-[length:var(--font-size-heading1)] font-semibold leading-[1.5]">
              학부연구생이 말하는 이 랩 · {lab.experience.participantCount}명 참여
            </h2>
            <dl className="mt-5">
              {[
                ["코어타임", lab.experience.coreTime],
                ["주간 미팅", lab.experience.weeklyMeeting],
                ["하는 일", lab.experience.primaryTasks],
              ].map(([term, description], index) => (
                <div
                  className={`flex items-center justify-between gap-6 py-[6px] ${index < 2 ? "border-b border-border-subtlest" : ""}`}
                  key={term}
                >
                  <dt className="shrink-0 text-[length:var(--font-size-heading2)] font-medium leading-[1.5] text-text-subtle">
                    {term}
                  </dt>
                  <dd className="text-right text-[18px] font-medium leading-[1.5] text-text-primary">
                    {description}
                  </dd>
                </div>
              ))}
            </dl>
          </section>

          <div>
            <ReportLabButton />
          </div>
        </div>

        <aside className="flex min-w-0 flex-col pb-[51px] pt-[30px]">
          <section>
            <div className="flex items-center gap-2">
              <Image
                alt=""
                height={24}
                src="/icons/header/ai-active.svg"
                width={24}
              />
              <h2 className="bg-[linear-gradient(90deg,#a7c0db_0%,#b4bade_33%,#c2aed6_66%,#d699c5_100%)] bg-clip-text text-[length:var(--font-size-title3)] font-bold leading-[1.3] tracking-[-0.02em] text-transparent">
                AI 연구실 요약
              </h2>
            </div>
            <div className="mt-2 rounded-[var(--radius-xl)] border border-[#a7c0db] p-4 text-[length:var(--font-size-label2)] leading-[1.5] text-text-subtle">
              {lab.aiSummary.map((paragraph) => (
                <p className="not-last:mb-4" key={paragraph}>
                  {paragraph}
                </p>
              ))}
            </div>
          </section>

          <div className="mt-10 flex flex-col gap-[18px] lg:mt-[296px]">
            <LabContactCard contact={lab.contact} />
            <ProvideLabInfoCard />
          </div>
        </aside>
      </main>
      <MobileBottomNav />
    </div>
  );
}
