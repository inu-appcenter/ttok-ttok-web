import {
  useEffect,
  useEffectEvent,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter } from "next/navigation";
import {
  useRecommendationFlow,
  type RecommendationFlowOptions,
} from "@/features/request-ai-recommendation";
import { useLoginRequiredRedirect } from "@/shared/lib/auth/login-required";
import {
  clearSessionStore,
  isSessionScope,
  notifyAuthChange,
  subscribeAuthChange,
} from "@/shared/lib/session-store";
import {
  readRecommendationSnapshot,
  saveRecommendationSnapshot,
} from "./recommendation-session";

export type RecommendationsPageOptions = Omit<
  RecommendationFlowOptions,
  "initialSnapshot" | "onUnauthorized"
> & {
  memberId?: number;
  sessionKey?: string;
};
const subscribeNothing = () => () => {};

export function useRecommendationsPage({
  memberId,
  sessionKey,
  ...options
}: RecommendationsPageOptions) {
  // 하이드레이션 중에는 false를 돌려 서버 HTML과 같은 초기 상태로 렌더한다.
  // 클라이언트 이동으로 새로 마운트될 때만 true다.
  const isClientMount = useSyncExternalStore(
    subscribeNothing,
    () => true,
    () => false,
  );
  // 회원 ID와 검증된 세션 키가 모두 확인되고 클라이언트에서 마운트될 때만 복원한다.
  const [restored] = useState(() => {
    const scope = { memberId, sessionKey };
    return isClientMount && isSessionScope(scope)
      ? readRecommendationSnapshot(scope)
      : undefined;
  });
  // 인증이 바뀐 뒤에는 이 화면의 상태를 다시 저장하지 않는다.
  const isInvalidated = useRef(false);
  const router = useRouter();
  const redirectToLogin = useLoginRequiredRedirect();
  const flow = useRecommendationFlow({
    ...options,
    initialSnapshot: restored,
    onUnauthorized() {
      isInvalidated.current = true;
      notifyAuthChange();
      redirectToLogin({ replace: true });
    },
  });
  const {
    step,
    interest,
    suggestions,
    keywords,
    customKeywords,
    pastTurns,
    result,
  } = flow.snapshot;
  useEffect(() => {
    const scope = { memberId, sessionKey };
    if (isInvalidated.current || !isSessionScope(scope)) return;
    saveRecommendationSnapshot(scope, {
      step,
      interest,
      suggestions,
      keywords,
      customKeywords,
      pastTurns,
      result,
    });
  }, [
    memberId,
    sessionKey,
    step,
    interest,
    suggestions,
    keywords,
    customKeywords,
    pastTurns,
    result,
  ]);
  // 인증 변경(다른 탭 포함)이나 bfcache 복귀 시 화면 상태를 비우고 서버에서
  // 세션을 다시 확인한다. 유효하지 않으면 서버가 로그인으로 보낸다.
  const handleSessionUncertain = useEffectEvent(() => {
    isInvalidated.current = true;
    clearSessionStore();
    flow.handleReset();
    router.refresh();
  });
  useEffect(() => subscribeAuthChange(handleSessionUncertain), []);
  useEffect(() => {
    function handlePageShow(event: PageTransitionEvent) {
      if (event.persisted) handleSessionUncertain();
    }
    window.addEventListener("pageshow", handlePageShow);
    return () => window.removeEventListener("pageshow", handlePageShow);
  }, []);
  return flow;
}
