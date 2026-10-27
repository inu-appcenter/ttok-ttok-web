// 탭 수명 동안만 유지되는 메모리 전용 클라이언트 상태 저장소.
// localStorage 등 영구 저장을 쓰지 않으므로 새로고침이나 탭 종료로 사라진다.
// 각 항목은 memberId와 서버가 검증한 세션 키로 스코프한다. 같은 계정이라도
// 다시 로그인하면 세션 키가 바뀌어 이전 상태가 복원되지 않는다.
// 인증이 바뀌면 notifyAuthChange로 이 탭과 다른 탭의 저장소를 모두 비운다.

export type SessionScope = {
  memberId: number;
  sessionKey: string;
};

type SessionEntry = SessionScope & {
  value: unknown;
};

// 탭 간에는 내용 없는 신호만 보낸다. 회원 정보·입력값은 전달하지 않는다.
const AUTH_CHANNEL = "ttok-auth";
const AUTH_CHANGED = "auth-changed";

const store = new Map<string, SessionEntry>();
const listeners = new Set<() => void>();
let channel: BroadcastChannel | null | undefined;

function getChannel(): BroadcastChannel | null {
  if (typeof window === "undefined") return null;
  if (channel !== undefined) return channel;
  if (typeof BroadcastChannel === "undefined") {
    // 지원하지 않는 브라우저는 탭 간 신호 없이 세션 키 비교와 서버 검증에 의존한다.
    return (channel = null);
  }
  channel = new BroadcastChannel(AUTH_CHANNEL);
  channel.addEventListener("message", (event: MessageEvent<unknown>) => {
    if (event.data === AUTH_CHANGED) handleAuthChange();
  });
  return channel;
}

function handleAuthChange(): void {
  store.clear();
  listeners.forEach((listener) => listener());
}

export function isSessionScope(scope: Partial<SessionScope>): scope is SessionScope {
  return (
    typeof scope.memberId === "number" &&
    Number.isSafeInteger(scope.memberId) &&
    scope.memberId > 0 &&
    typeof scope.sessionKey === "string" &&
    scope.sessionKey.length > 0
  );
}

export function readSessionEntry<T>(
  key: string,
  scope: SessionScope,
  validate: (value: unknown) => value is T,
): T | undefined {
  if (typeof window === "undefined") return undefined;

  const entry = store.get(key);

  if (
    !entry ||
    entry.memberId !== scope.memberId ||
    entry.sessionKey !== scope.sessionKey
  ) {
    return undefined;
  }

  return validate(entry.value) ? entry.value : undefined;
}

export function writeSessionEntry(
  key: string,
  scope: SessionScope,
  value: unknown,
): void {
  // 서버 모듈은 요청 간에 공유되므로 서버 렌더 중에는 절대 기록하지 않는다.
  if (typeof window === "undefined") return;
  getChannel();
  store.set(key, { ...scope, value });
}

export function clearSessionEntry(key: string): void {
  store.delete(key);
}

export function clearSessionStore(): void {
  store.clear();
}

// 로그인·로그아웃·탈퇴·401 등 인증이 바뀐 시점에 호출한다.
export function notifyAuthChange(): void {
  handleAuthChange();
  getChannel()?.postMessage(AUTH_CHANGED);
}

// 다른 탭에서 인증이 바뀌었을 때 화면 상태도 비우도록 구독한다.
export function subscribeAuthChange(listener: () => void): () => void {
  getChannel();
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
