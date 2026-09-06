import Link from "next/link";

import { Logo } from "@/shared/ui";

export function SiteFooter() {
  return (
    <footer className="hidden bg-bg-subtle md:block">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-4 px-6 pb-8 pt-14 md:px-[clamp(24px,8.89vw,128px)]">
        <div className="flex flex-col justify-between gap-10 sm:flex-row">
          <div className="flex flex-col gap-2">
            <Logo variant="wordmark" />
            <p className="text-[13px] text-text-subtle">
              인천대 학생을 위한 연구실 매칭 서비스
            </p>
          </div>
          <div className="flex gap-16 text-[13px] leading-normal">
            <div className="flex flex-col gap-3">
              <strong className="text-[14px] font-medium text-text-default">
                고객지원
              </strong>
              <Link className="text-text-subtle hover:text-text-primary" href="/report">
                제보하기
              </Link>
            </div>
            <div className="flex flex-col gap-3">
              <strong className="text-[14px] font-medium text-text-default">
                법적고지
              </strong>
              <Link className="text-text-subtle hover:text-text-primary" href="/terms">
                이용약관
              </Link>
              <Link className="text-text-subtle hover:text-text-primary" href="/privacy">
                개인정보처리방침
              </Link>
            </div>
          </div>
        </div>
        <div className="h-px w-full bg-border-subtle" />
        <p className="text-[12px] text-text-subtlest">
          © 2026 똑똑. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
