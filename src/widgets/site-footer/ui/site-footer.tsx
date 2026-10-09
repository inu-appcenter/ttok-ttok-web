import Link from "next/link";
import Image from "next/image";

import { Logo } from "@/shared/ui";

export function SiteFooter({ showOnMobile = false }: { showOnMobile?: boolean }) {
  return (
    <footer className={`${showOnMobile ? "block" : "hidden"} bg-bg-neutral md:block md:bg-bg-subtle`}>
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-5 px-5 pb-[calc(120px_+_env(safe-area-inset-bottom))] pt-6 md:gap-4 md:px-[clamp(24px,8.89vw,128px)] md:pb-8 md:pt-14">
        <div className="flex items-center md:hidden" aria-label="똑똑">
          <span className="mr-[-1.475px] flex h-[40.394px] w-[40.982px] items-center justify-center"><Image alt="" className="rotate-[-12.81deg]" height={33.608} src="/images/home/footer-wordmark-left.png" width={34.388} /></span>
          <Image alt="" height={33.608} src="/images/home/footer-wordmark-right.png" width={34.388} />
        </div>
        <Logo className="hidden md:block" variant="wordmark" />
        <div className="flex flex-col justify-between gap-5 md:flex-row md:gap-10">
          <p className="-mt-3 text-[length:var(--font-size-body3)] text-text-subtle md:mt-0 md:text-[length:var(--font-size-label2)]">
            인천대 학생을 위한 연구실 매칭 서비스
          </p>
          <div className="flex gap-12 text-[14px] leading-[1.5] md:gap-16 md:text-[13px] md:leading-normal">
            <div className="flex flex-col gap-2.5 md:gap-3">
              <strong className="text-[14px] font-semibold text-text-default md:font-medium">
                고객지원
              </strong>
              <a className="text-text-subtle hover:text-text-primary" href="mailto:ttokttok.team@gmail.com">
                제보하기
              </a>
            </div>
            <div className="flex flex-col gap-2.5 md:gap-3">
              <strong className="text-[14px] font-semibold text-text-default md:font-medium">
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
          <span className="md:hidden">© 2026 TTOK. All rights reserved.</span>
          <span className="hidden md:inline">© 2026 똑똑. All rights reserved.</span>
        </p>
      </div>
    </footer>
  );
}
