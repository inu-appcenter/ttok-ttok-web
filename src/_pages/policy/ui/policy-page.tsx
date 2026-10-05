import Link from "next/link";
import type { ReactNode } from "react";

import { SiteFooter } from "@/widgets/site-footer";

type PolicyPageProps = {
  kind: "terms" | "privacy";
  title: string;
  sections: { id: string; title: string }[];
  children: ReactNode;
};

const POLICIES = [
  { kind: "terms", href: "/terms", title: "이용약관" },
  { kind: "privacy", href: "/privacy", title: "개인정보 처리방침" },
];

export function PolicyPage({
  kind,
  title,
  sections,
  children,
}: PolicyPageProps) {
  return (
    <div className="flex flex-1 flex-col bg-bg-default text-text-default">
      <main className="mx-auto w-full max-w-4xl px-5 py-8 md:px-8 md:py-16">
        <nav
          aria-label="정책 문서"
          className="mb-8 flex flex-wrap gap-2 md:mb-12"
        >
          {POLICIES.map((policy) => (
            <Link
              key={policy.kind}
              href={policy.href}
              aria-current={kind === policy.kind ? "page" : undefined}
              className={`rounded-lg px-4 py-2 text-sm font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary ${
                kind === policy.kind
                  ? "bg-bg-primary-subtle text-text-primary"
                  : "text-text-subtle hover:bg-bg-subtle"
              }`}
            >
              {policy.title}
            </Link>
          ))}
        </nav>
        <header className="mb-8 border-b border-border-subtle pb-8">
          <h1 className="text-[length:var(--font-size-heading1)] font-bold leading-snug md:text-[length:var(--font-size-display3)]">
            {title}
          </h1>
          <p className="mt-4 text-sm text-text-subtle">
            시행일: <time dateTime="2026-09-09">2026년 9월 9일</time>
          </p>
        </header>
        <details className="mb-10 rounded-xl border border-border-subtle bg-bg-subtle p-5">
          <summary className="cursor-pointer font-medium focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary">
            목차
          </summary>
          <nav aria-label={`${title} 목차`} className="mt-4">
            <ul className="space-y-3 text-sm leading-6">
              {sections.map((section) => (
                <li key={section.id}>
                  <a
                    href={`#${section.id}`}
                    className="text-text-subtle hover:text-text-primary hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-border-primary"
                  >
                    {section.title}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
        </details>
        <article
          aria-label={title}
          className="min-w-0 break-words text-base leading-8 [&_h2]:mb-5 [&_h2]:mt-12 [&_h2]:scroll-mt-28 [&_h2]:text-xl [&_h2]:font-bold [&_h3]:mb-4 [&_h3]:mt-8 [&_h3]:scroll-mt-28 [&_h3]:text-lg [&_h3]:font-semibold [&_p]:mb-3 [&_ol]:mb-5 [&_ol]:list-decimal [&_ol]:space-y-2 [&_ol]:pl-6 [&_a]:text-text-primary [&_a]:underline [&_a]:underline-offset-4 [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-border-primary"
        >
          {children}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}
