import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

const PREVIEW_LABS = [
  { name: "자연어처리 연구실", tags: "NLP · LLM" },
  { name: "비전·그래픽스 연구실", tags: "딥러닝" },
];

function RecommendationPreview() {
  return (
    <div className="flex w-full flex-col gap-2 text-[length:var(--font-size-body3)] leading-[1.5]">
      <p className="self-start rounded-xl rounded-tl-sm bg-bg-default px-3 py-1.5">어떤 분야에 관심이 있어요?</p>
      <p className="self-end rounded-xl rounded-tr-sm bg-text-primary px-3 py-1.5 text-text-inverse">딥러닝이랑 자연어처리요!</p>
      <div className="flex w-[270px] max-w-full flex-col gap-1.5 rounded-xl rounded-tl-sm bg-bg-default p-2">
        <p className="text-text-subtle">이런 연구실을 추천해요</p>
        {PREVIEW_LABS.map((lab) => (
          <div className="flex items-center gap-1.5 rounded-lg border border-[var(--color-primary-primary-200)] bg-bg-primary-subtle py-[5px] pl-2.5 pr-1.5" key={lab.name}>
            <span className="min-w-0 flex-1 truncate font-semibold">{lab.name}</span>
            <span className="shrink-0 rounded-full bg-[var(--color-primary-primary-200)] px-2 py-px text-[11px] text-[var(--color-primary-primary-700)]">{lab.tags}</span>
            <Image alt="" height={16} src="/icons/home/services/chevron.svg" width={16} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MailPreview() {
  return (
    <div className="flex w-full flex-col gap-1 rounded-lg bg-bg-default px-3.5 py-3 text-[length:var(--font-size-label2)] leading-[1.5]">
      <p><span className="mr-2 text-[length:var(--font-size-caption1)] text-text-subtle">받는 사람</span><strong className="font-semibold">OOO 교수님</strong></p>
      <p className="truncate"><span className="mr-2 text-[length:var(--font-size-caption1)] text-text-subtle">제목</span><strong className="font-semibold">[학과] [이름] 학부연구생 문의드립니다</strong></p>
      <div className="mb-1 h-px bg-border-subtle" />
      <p className="truncate">안녕하세요 교수님, [학과] [학번] [이름]입니다.</p>
      <p>연구실의 [연구 주제]에 관심이 생겨</p>
      <p className="truncate text-text-subtle">학부연구생으로 참여하고 싶어 연락드립니다 …</p>
    </div>
  );
}

function CoffeeChatPreview() {
  return (
    <div className="w-full rounded-[var(--radius-2xl)] bg-bg-default px-4 pb-2 pt-3.5 shadow-[0_4px_8px_var(--color-opacity-black-10)]">
      <p className="mb-2.5 text-[length:var(--font-size-label1)] font-semibold">커피챗</p>
      <div className="py-1 text-[length:var(--font-size-caption1)] text-text-subtle">
        <p className="flex justify-between gap-2 border-b border-border-subtle py-1"><span>학부연구생 A</span><span className="text-text-primary">오픈채팅 열기 ↗</span></p>
        <p className="flex justify-between gap-2 py-1"><span>학부연구생 B</span><span className="text-text-primary">ttokttok@inu.ac.kr</span></p>
      </div>
    </div>
  );
}

function ServiceCard({ title, description, children, href }: {
  title: string;
  description: ReactNode;
  children: ReactNode;
  href?: string;
}) {
  return (
    <article className="flex min-h-[116px] min-w-0 overflow-hidden rounded-[var(--radius-xl)] bg-bg-default shadow-[0_2px_8px_var(--color-opacity-black-10)] md:flex-col md:rounded-[var(--radius-2xl)] md:shadow-[0_4px_16px_var(--color-opacity-black-10)]">
      <div aria-hidden="true" className="relative flex w-[min(160px,46.65%)] shrink-0 items-center justify-center overflow-hidden bg-[var(--color-primary-primary-100)] md:h-[218px] md:w-full md:px-6 md:py-4"><div className="absolute top-1/2 w-[333.333px] shrink-0 -translate-y-1/2 scale-[0.4] md:static md:w-full md:shrink md:translate-y-0 md:scale-100">{children}</div></div>
      <div className="flex min-w-0 flex-1 flex-col items-start justify-center gap-1 py-3 pl-4 pr-3 md:justify-start md:gap-2.5 md:p-6">
        <h3 className="text-[length:var(--font-size-headline2)] font-semibold leading-[1.4] tracking-[-0.01em] md:text-[length:var(--font-size-heading2)] md:leading-[1.5]">{title}</h3>
        <p className="text-[length:var(--font-size-label2)] leading-[1.5] text-text-subtle md:text-[length:var(--font-size-body2)]">{description}</p>
        {href ? <Link className="text-[length:var(--font-size-label1)] font-semibold leading-[1.5] text-text-primary focus-visible:outline-2 focus-visible:outline-border-primary md:hidden" href={href}>추천 받으러 가기 →</Link> : null}
      </div>
    </article>
  );
}

export function HomeServiceGuide({ headingId = "home-services-heading" }: { headingId?: string }) {
  return (
    <section aria-labelledby={headingId} className="flex flex-col gap-3 py-8 md:gap-5 md:py-12">
      <h2 className="text-[20px] font-semibold leading-[1.5] tracking-[-0.01em] md:text-[length:var(--font-size-heading2)]" id={headingId}>처음이라면 이렇게 시작해 보세요</h2>
      <div className="grid grid-cols-1 gap-2 md:gap-5 lg:grid-cols-3">
        <ServiceCard href="/recommendations" title="AI 추천 받기" description="대화하듯 관심사를 말하면 연구실을 추천해드려요"><RecommendationPreview /></ServiceCard>
        <ServiceCard title="교수님께 메일 쓰기" description={<>원하는 연구실을 고르고,<br />교수님께 보낼 메일을 첨삭받아 보세요</>}><MailPreview /></ServiceCard>
        <ServiceCard title="커피챗 신청하기" description={<>궁금한 연구실 선배에게<br />커피챗으로 연구실 생활을 물어보세요</>}><CoffeeChatPreview /></ServiceCard>
      </div>
    </section>
  );
}
