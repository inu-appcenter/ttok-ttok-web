"use client";

import { useInView, useReducedMotion, type Transition } from "motion/react";
import * as m from "motion/react-m";
import Image from "next/image";
import { useEffect, useRef, useState, type ReactNode } from "react";

type PreviewState = { isPlaying: boolean; isReduced: boolean };

const LOOP_FADE_OUT = 0.4;

// 미리보기는 화면에 보이는 동안 반복 재생하고, 화면 밖에서는 멈춘다.
// 한 바퀴가 끝나면 서서히 사라진 뒤 처음부터 다시 그린다(key로 다시 마운트).
// 모든 요소의 자리를 처음부터 차지하고 opacity·transform만 바꿔 카드 높이가 변하지 않게 한다.
// 모션 줄이기 설정에서는 반복하지 않고 완성 상태만 보여준다.
function PreviewLoop({
  children,
  className,
  loopDuration,
}: {
  children: (state: PreviewState) => ReactNode;
  className: string;
  loopDuration: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { amount: 0.3 });
  const isReduced = useReducedMotion() ?? false;
  const [cycle, setCycle] = useState(0);
  const isLooping = isInView && !isReduced;

  useEffect(() => {
    if (!isLooping) return;
    const intervalId = window.setInterval(() => setCycle((current) => current + 1), loopDuration * 1000);
    return () => window.clearInterval(intervalId);
  }, [isLooping, loopDuration]);

  return (
    <div className="w-full" ref={ref}>
      <m.div
        animate={isLooping ? { opacity: [1, 1, 0] } : undefined}
        className={className}
        key={isReduced ? "static" : isInView ? `cycle-${cycle}` : "idle"}
        transition={{ duration: loopDuration, ease: "linear", times: [0, 1 - LOOP_FADE_OUT / loopDuration, 1] }}
      >
        {children({ isPlaying: isInView || isReduced, isReduced })}
      </m.div>
    </div>
  );
}

/** 모션 줄이기 설정에서는 지연 없이 완성 상태로 바로 둔다. */
function timing(isReduced: boolean, transition: Transition): Transition {
  return isReduced ? { duration: 0 } : transition;
}

const AI_GRADIENT_STOPS = ["#a7c0db", "#b4bade", "#c2aed6", "#d699c5"];
const AI_GRADIENT = `linear-gradient(90deg, ${AI_GRADIENT_STOPS[0]} 0%, ${AI_GRADIENT_STOPS[1]} 33%, ${AI_GRADIENT_STOPS[2]} 66%, ${AI_GRADIENT_STOPS[3]} 100%)`;

const BUBBLE_SPRING: Transition = { damping: 18, stiffness: 320, type: "spring" };

const PREVIEW_LABS = [
  { name: "자연어처리 연구실", tags: "NLP · LLM" },
  { name: "비전·그래픽스 연구실", tags: "딥러닝" },
];

// 메신저 말풍선이 전송되듯 아래에서 살짝 커지며 올라온다.
function Bubble({
  className,
  delay,
  isPlaying,
  isReduced,
  side,
  children,
}: {
  className: string;
  delay: number;
  isPlaying: boolean;
  isReduced: boolean;
  side: "left" | "right";
  children: ReactNode;
}) {
  return (
    <m.div
      animate={isPlaying ? { opacity: 1, scale: 1, y: 0 } : undefined}
      className={className}
      initial={{ opacity: 0, scale: 0.85, y: 10 }}
      style={{ transformOrigin: side === "left" ? "bottom left" : "bottom right" }}
      transition={timing(isReduced, { ...BUBBLE_SPRING, delay, opacity: { delay, duration: 0.15 } })}
    >
      {children}
    </m.div>
  );
}

const QUESTION_AT = 0.15;
const ANSWER_AT = 0.85;
const TYPING_AT = 1.45;
const RESULT_AT = 2.35;

const RECOMMENDATION_LOOP = RESULT_AT + 3.2;

export function RecommendationPreview() {
  return (
    <PreviewLoop className="flex w-full flex-col gap-2 text-[length:var(--font-size-body3)] leading-[1.5]" loopDuration={RECOMMENDATION_LOOP}>
      {({ isPlaying, isReduced }) => (
        <>
          <Bubble className="self-start rounded-xl rounded-tl-sm bg-bg-default px-3 py-1.5" delay={QUESTION_AT} isPlaying={isPlaying} isReduced={isReduced} side="left">
            어떤 분야에 관심이 있어요?
          </Bubble>
          <Bubble className="self-end rounded-xl rounded-tr-sm bg-text-primary px-3 py-1.5 text-text-inverse" delay={ANSWER_AT} isPlaying={isPlaying} isReduced={isReduced} side="right">
            딥러닝이랑 자연어처리요!
          </Bubble>
          <div className="relative self-start">
            {isReduced ? null : (
              <m.div
                animate={isPlaying ? { opacity: [0, 1, 1, 0], scale: [0.85, 1, 1, 0.9] } : undefined}
                className="absolute left-0 top-0 flex items-center gap-1 rounded-xl rounded-tl-sm bg-bg-default px-3 py-2.5"
                initial={{ opacity: 0 }}
                style={{ transformOrigin: "bottom left" }}
                transition={{ delay: TYPING_AT, duration: RESULT_AT - TYPING_AT, times: [0, 0.15, 0.85, 1] }}
              >
                {[0, 1, 2].map((dot) => (
                  <m.span
                    animate={isPlaying ? { opacity: [0.35, 1, 0.35], y: [0, -3, 0] } : undefined}
                    className="size-1.5 rounded-full bg-text-subtlest"
                    initial={{ opacity: 0.35 }}
                    key={dot}
                    transition={{ delay: TYPING_AT + dot * 0.12, duration: 0.5, repeat: 1 }}
                  />
                ))}
              </m.div>
            )}
            <Bubble className="flex w-[270px] max-w-full flex-col gap-1.5 rounded-xl rounded-tl-sm bg-bg-default p-2" delay={RESULT_AT} isPlaying={isPlaying} isReduced={isReduced} side="left">
              <p className="text-text-subtle">이런 연구실을 추천해요</p>
              {PREVIEW_LABS.map((lab, index) => (
                <m.div
                  animate={isPlaying ? { opacity: 1, x: 0 } : undefined}
                  className="flex items-center gap-1.5 rounded-lg border border-[var(--color-primary-primary-200)] bg-bg-primary-subtle py-[5px] pl-2.5 pr-1.5"
                  initial={{ opacity: 0, x: -8 }}
                  key={lab.name}
                  transition={timing(isReduced, { delay: RESULT_AT + 0.25 + index * 0.15, duration: 0.3, ease: "easeOut" })}
                >
                  <span className="min-w-0 flex-1 truncate font-semibold">{lab.name}</span>
                  <span className="shrink-0 rounded-full bg-[var(--color-primary-primary-200)] px-2 py-px text-[11px] text-[var(--color-primary-primary-700)]">{lab.tags}</span>
                  <Image alt="" height={16} src="/icons/home/services/chevron.svg" width={16} />
                </m.div>
              ))}
            </Bubble>
          </div>
        </>
      )}
    </PreviewLoop>
  );
}

const MAIL_LINES = [
  { className: "truncate", color: "var(--color-text-default)", text: "안녕하세요 교수님, [학과] [학번] [이름]입니다." },
  { className: "", color: "var(--color-text-default)", text: "연구실의 [연구 주제]에 관심이 생겨" },
  { className: "truncate", color: "var(--color-text-subtle)", text: "학부연구생으로 참여하고 싶어 연락드립니다 …" },
];
const TYPING_START = 0.6;
const CHAR_INTERVAL = 0.04;
const LINE_PAUSE = 0.2;
const FRESH_COLOR_DURATION = 0.7;

// 각 줄의 시작·끝 시각을 미리 계산해 글자·커서가 같은 시간표를 따른다.
const MAIL_SCHEDULE = MAIL_LINES.reduce<{ end: number; start: number }[]>((schedule, line) => {
  const start = schedule.length ? schedule[schedule.length - 1].end + LINE_PAUSE : TYPING_START;
  return [...schedule, { end: start + Array.from(line.text).length * CHAR_INTERVAL, start }];
}, []);
const TYPING_END = MAIL_SCHEDULE[MAIL_SCHEDULE.length - 1].end;

function gradientStopAt(progress: number) {
  return AI_GRADIENT_STOPS[Math.min(AI_GRADIENT_STOPS.length - 1, Math.floor(progress * AI_GRADIENT_STOPS.length))];
}

function TypingLine({ index, isPlaying, isReduced }: { index: number; isPlaying: boolean; isReduced: boolean }) {
  const line = MAIL_LINES[index];
  const { start } = MAIL_SCHEDULE[index];
  const chars = Array.from(line.text);
  const isLastLine = index === MAIL_LINES.length - 1;
  if (isReduced) return <p className={line.className} style={{ color: line.color }}>{line.text}</p>;
  return (
    <p className={line.className} style={{ color: line.color }}>
      {chars.map((char, charIndex) => {
        const delay = start + charIndex * CHAR_INTERVAL;
        const isLineEnd = charIndex === chars.length - 1;
        // 커서는 방금 입력된 글자 뒤에 있다가 다음 글자가 입력되면 넘어간다. 마지막 글자 뒤에서는 몇 번 깜빡이고 사라진다.
        const caretTransition: Transition =
          isLineEnd && isLastLine
            ? { delay, duration: 1.6, times: [0, 0.01, 0.3, 0.4, 0.55, 0.7, 0.85, 1] }
            : { delay, duration: isLineEnd ? CHAR_INTERVAL + LINE_PAUSE : CHAR_INTERVAL, times: [0, 0.01, 0.99, 1] };
        return (
          // 막 입력된 글자는 AI 그라데이션 색으로 보였다가 원래 글자색으로 돌아간다.
          <m.span
            animate={isPlaying ? { color: line.color, opacity: 1 } : undefined}
            className="relative"
            initial={{ color: gradientStopAt(charIndex / chars.length), opacity: 0 }}
            key={charIndex}
            transition={{ color: { delay: delay + 0.1, duration: FRESH_COLOR_DURATION }, opacity: { delay, duration: 0.08 } }}
          >
            {char}
            <m.span
              animate={isPlaying ? { opacity: isLineEnd && isLastLine ? [0, 1, 1, 0, 1, 0, 1, 0] : [0, 1, 1, 0] } : undefined}
              className="absolute -right-px top-[0.2em] h-[1.1em] w-[1.5px] bg-text-primary"
              initial={{ opacity: 0 }}
              transition={caretTransition}
            />
          </m.span>
        );
      })}
    </p>
  );
}

const MAIL_LOOP = TYPING_END + 2.8;

export function MailPreview() {
  return (
    <PreviewLoop className="relative w-full" loopDuration={MAIL_LOOP}>
      {({ isPlaying, isReduced }) => (
        <>
          {isReduced ? null : (
            // 작성하는 동안 AI 그라데이션 라인이 메일 카드를 감싸고, 다 쓰면 사라진다.
            <m.div
              animate={isPlaying ? { backgroundPosition: ["0% 50%", "100% 50%"], opacity: [0, 1, 1, 0] } : undefined}
              aria-hidden="true"
              className="pointer-events-none absolute -inset-[1.5px] rounded-[calc(var(--radius-lg)+1.5px)]"
              initial={{ opacity: 0 }}
              style={{ backgroundImage: AI_GRADIENT, backgroundSize: "200% 100%" }}
              transition={{
                backgroundPosition: { duration: 1.2, ease: "linear", repeat: Math.ceil((TYPING_END + 0.6) / 1.2), repeatType: "mirror" },
                opacity: { duration: TYPING_END + 0.6, times: [0, 0.1, 0.85, 1] },
              }}
            />
          )}
          <div className="relative flex w-full flex-col gap-1 rounded-lg bg-bg-default px-3.5 py-3 text-[length:var(--font-size-label2)] leading-[1.5]">
            <p><span className="mr-2 text-[length:var(--font-size-caption1)] text-text-subtle">받는 사람</span><strong className="font-semibold">OOO 교수님</strong></p>
            <p className="truncate"><span className="mr-2 text-[length:var(--font-size-caption1)] text-text-subtle">제목</span><strong className="font-semibold">[학과] [이름] 학부연구생 문의드립니다</strong></p>
            <div className="mb-1 h-px bg-border-subtle" />
            {MAIL_LINES.map((line, index) => (
              <TypingLine index={index} isPlaying={isPlaying} isReduced={isReduced} key={line.text} />
            ))}
          </div>
        </>
      )}
    </PreviewLoop>
  );
}

const CONTACT_AT = 0.3;
const CURSOR_AT = 1.1;
const CURSOR_TRAVEL = 0.8;
const PRESS_AT = CURSOR_AT + CURSOR_TRAVEL;

// 장식용 마우스 포인터. 미리보기 전체가 aria-hidden이다.
function PointerIcon() {
  return (
    <svg fill="none" height="18" viewBox="0 0 18 18" width="18">
      <path d="M3 2.5 14.5 9l-5.2 1.2L6.6 15 3 2.5Z" fill="var(--color-text-default)" stroke="white" strokeLinejoin="round" strokeWidth="1.2" />
    </svg>
  );
}

const CONTACTS = [
  { action: "오픈채팅 열기 ↗", name: "학부연구생 A" },
  { action: "ttokttok@inu.ac.kr", name: "학부연구생 B" },
];

// 연락처가 차례로 나타난 뒤 포인터가 오픈채팅 링크로 이동해 누르는 흐름을 보여준다.
const COFFEE_CHAT_LOOP = PRESS_AT + 3;

export function CoffeeChatPreview() {
  return (
    <PreviewLoop className="w-full rounded-[var(--radius-2xl)] bg-bg-default px-4 pb-2 pt-3.5" loopDuration={COFFEE_CHAT_LOOP}>
      {({ isPlaying, isReduced }) => (
        <>
          <p className="mb-2.5 text-[length:var(--font-size-label1)] font-semibold">커피챗</p>
          <div className="py-1 text-[length:var(--font-size-caption1)] text-text-subtle">
            {CONTACTS.map((contact, index) => {
              const isOpenChat = index === 0;
              return (
                <m.p
                  animate={isPlaying ? { opacity: 1, x: 0 } : undefined}
                  className={`flex justify-between gap-2 py-1 ${isOpenChat ? "border-b border-border-subtle" : ""}`}
                  initial={{ opacity: 0, x: -8 }}
                  key={contact.name}
                  transition={timing(isReduced, { delay: CONTACT_AT + index * 0.2, duration: 0.3, ease: "easeOut" })}
                >
                  <span>{contact.name}</span>
                  {isOpenChat ? (
                    <span className="relative text-text-primary">
                      {isReduced ? null : (
                        <m.span
                          animate={isPlaying ? { opacity: [0, 1, 0] } : undefined}
                          className="absolute -inset-x-1.5 -inset-y-0.5 rounded-md bg-bg-primary-subtle"
                          initial={{ opacity: 0 }}
                          transition={{ delay: PRESS_AT, duration: 0.7, times: [0, 0.2, 1] }}
                        />
                      )}
                      <m.span
                        animate={isPlaying && !isReduced ? { scale: [1, 0.94, 1] } : undefined}
                        className="relative inline-block"
                        transition={{ delay: PRESS_AT, duration: 0.3 }}
                      >
                        {contact.action}
                      </m.span>
                      {isReduced ? null : (
                        <m.span
                          animate={
                            isPlaying
                              ? { opacity: [0, 1, 1, 1, 0], scale: [1, 1, 1, 0.85, 1], x: [56, 56, 0, 0, 0], y: [44, 44, 0, 0, 0] }
                              : undefined
                          }
                          className="absolute left-1/2 top-1/2"
                          initial={{ opacity: 0 }}
                          transition={{
                            delay: CURSOR_AT,
                            duration: CURSOR_TRAVEL + 1.1,
                            ease: "easeInOut",
                            times: [0, 0.08, CURSOR_TRAVEL / (CURSOR_TRAVEL + 1.1), (CURSOR_TRAVEL + 0.15) / (CURSOR_TRAVEL + 1.1), 1],
                          }}
                        >
                          <PointerIcon />
                        </m.span>
                      )}
                    </span>
                  ) : (
                    <span className="text-text-primary">{contact.action}</span>
                  )}
                </m.p>
              );
            })}
          </div>
        </>
      )}
    </PreviewLoop>
  );
}
