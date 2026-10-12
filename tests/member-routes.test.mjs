import assert from "node:assert/strict";
import { after, before, beforeEach, test } from "node:test";
import { createServer } from "node:http";
import { spawn } from "node:child_process";

// 실제 계정을 변경하지 않고 production Route Handler와 Swagger 계약을 검증합니다.
const laboratory = {
  id: 157,
  college: "IT",
  collegeName: "정보기술대학",
  department: "COMPUTER_ENGINEERING",
  departmentName: "컴퓨터공학부",
  labName: "테스트 연구실",
  introduction: null,
  capacity: { graduateStudentCount: 2, undergraduateStudentCount: 3 },
  professor: { id: 1, name: "테스트 교수" },
  researchAreas: ["AI"],
};
let bookmarks, coffee, review, calls, malformed;
let upstream, app, appUrl;
let onboardingFailure, departmentFailure, onboardingDone;
let publicationCount;
let aiFailure, aiMalformed;
let emailStatus, emailMalformed;

beforeEach(() => {
  publicationCount = 7;
  aiFailure = false;
  emailStatus = 200;
  emailMalformed = false;
  aiMalformed = false;
  bookmarks = [];
  coffee = null;
  review = null;
  calls = [];
  malformed = false;
  onboardingFailure = false;
  departmentFailure = false;
  onboardingDone = false;
});
async function listen(server) {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return server.address().port;
}
before(async () => {
  upstream = createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    const token = request.headers.authorization?.replace("Bearer ", "");
    const publicRead = url.pathname.startsWith("/api/laboratory/") || url.pathname.startsWith("/api/college");
    if (!publicRead && (!token || token === "fake-expired")) {
      response.writeHead(401, { "Content-Type": "application/json" });
      response.end(
        JSON.stringify({ message: "만료된 테스트 인증", data: null }),
      );
      return;
    }
    const chunks = [];
    for await (const chunk of request) chunks.push(chunk);
    const body = chunks.length
      ? JSON.parse(Buffer.concat(chunks).toString())
      : null;
    calls.push({ path: url.pathname, method: request.method, body });
    let data = null;
    if (url.pathname === "/api/college") {
      data = [{ college: "IT", collegeName: "정보기술대학" }];
    } else if (url.pathname === "/api/college/department") {
      data = [
        {
          college: "IT",
          collegeName: "정보기술대학",
          department: "COMPUTER_ENGINEERING",
          departmentName: "컴퓨터공학부",
        },
      ];
    } else if (url.pathname === "/api/chat/email-editor") {
      if (emailStatus !== 200) {
        response.writeHead(emailStatus, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ data: null, message: "메일 생성 실패" }));
        return;
      }
      data = emailMalformed
        ? { answer: "미지원 문자열" }
        : { subject: "서버 제목", body: "안녕하세요.\n서버 본문" };
    } else if (url.pathname.startsWith("/api/chat/research-lab")) {
      if (aiFailure) {
        response.writeHead(503, {"Content-Type":"application/json"});
        response.end(JSON.stringify({message:"추천 서비스 장애",data:null}));
        return;
      }
      data = aiMalformed ? {answer:"자유 문자열"} : url.pathname.endsWith("/keywords") ? {keywords:["촉매","에너지"]} : {noMatch:false,recommendations:[{laboratoryId:157,labName:"촉매 연구실",department:"화학과",professorName:"교수",keywords:["촉매"],reason:null}]};
    } else if (url.pathname === "/api/member" && request.method === "PATCH") {
      if (departmentFailure) {
        response.writeHead(400, { "Content-Type": "application/json" });
        response.end(JSON.stringify({ code: "INVALID_INPUT", data: null }));
        return;
      }
      data = { id: 1, department: body.department };
    } else if (url.pathname === "/api/onboarding") {
      if (body.purpose !== "PROFESSOR" && !body.department) {
        response.writeHead(400,{"Content-Type":"application/json"});
        response.end(JSON.stringify({code:"INVALID_INPUT",message:"학생 학과 필수",data:null}));return;
      }
      if (onboardingFailure || onboardingDone) {
        response.writeHead(onboardingDone ? 400 : 500, {
          "Content-Type": "application/json",
        });
        response.end(
          JSON.stringify({
            code: onboardingDone ? "ONBOARDING_ALREADY_DONE" : "INTERNAL_ERROR",
            data: null,
          }),
        );
        return;
      }
      onboardingDone = true;
      data = { id: 1, isNew: false, userType: "RESEARCHER" };
    } else if (url.pathname === "/api/member/me")
      data = {
        id: 1,
        studentNumber: "202501716",
        userType: token === "fake-finder" ? "FINDER" : "RESEARCHER",
        laboratory:
          token === "fake-finder"
            ? null
            : { id: 157, labName: "테스트 연구실" },
        labReview: review,
        coffeeChat: coffee,
        professor: null,
      };
    else if (url.pathname === "/api/bookmark/me")
      data = malformed ? [{ id: 1, laboratory: null }] : bookmarks;
    else if (url.pathname === "/api/bookmark") {
      const id = Number(url.searchParams.get("laboratoryId"));
      bookmarks = bookmarks.length
        ? []
        : [{ id: 8, laboratory: { ...laboratory, id } }];
      data = id;
    } else if (
      url.pathname === "/api/coffee-chat" &&
      request.method === "POST"
    ) {
      coffee = { id: 99, laboratoryId: body.laboratoryId, ...body };
      data = coffee;
    } else if (url.pathname === "/api/coffee-chat/99") {
      if (request.method === "DELETE") {
        coffee = null;
        data = 99;
      } else {
        coffee = { ...coffee, ...body };
        data = coffee;
      }
    } else if (url.pathname === "/api/lab-review") {
      review = { id: 12, laboratoryId: 157, ...body };
      data = review;
    } else if (url.pathname === "/api/laboratory/157") data = laboratory;
    else if (url.pathname === "/api/laboratory/157/publications") {
      const page = Number(url.searchParams.get("page"));
      data = {
        page,
        size: 5,
        totalPages: 2,
        totalElements: publicationCount,
        content: Array.from({ length: Math.min(5, publicationCount - page * 5) }, (_, index) => ({
          title: `논문 ${page * 5 + index + 1}`,
          year: "2026",
          platform: "TEST",
        })),
      };
    } else {
      response.writeHead(404);
      response.end(JSON.stringify({ data: null, message: "테스트 경로 없음" }));
      return;
    }
    response.writeHead(200, { "Content-Type": "application/json" });
    response.end(JSON.stringify({ data, code: null, message: "테스트 응답" }));
  });
  const upstreamPort = await listen(upstream);
  const probe = createServer(),
    appPort = await listen(probe);
  await new Promise((resolve) => probe.close(resolve));
  appUrl = `http://127.0.0.1:${appPort}`;
  app = spawn(
    process.execPath,
    ["node_modules/next/dist/bin/next", "start", "--port", String(appPort)],
    {
      env: { ...process.env, API_BASE_URL: `http://127.0.0.1:${upstreamPort}` },
      stdio: "ignore",
    },
  );
  let ready = false;
  for (let i = 0; i < 100; i++) {
    try {
      await fetch(`${appUrl}/api/bookmarks`);
      ready = true;
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  assert.ok(ready, "먼저 pnpm build를 실행해주세요.");
});
after(async () => {
  app?.kill();
  if (upstream) await new Promise((resolve) => upstream.close(resolve));
});

function request(
  path,
  { token = "fake-researcher", method = "GET", body } = {},
) {
  return fetch(`${appUrl}${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Cookie: `ttok_access_token=${token}` } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
}
const onboardingBody = {
  purpose: "RESEARCHER",
  departmentCode: "INFORMATION_COMMUNICATION_ENGINEERING",
  laboratoryId: 157,
  coreTime: "있음",
  weeklyMeeting: "주 1회",
  doings: ["논문 리딩"],
  coffeeChatAllowed: false,
};
test("연구생은 department를 포함한 단일 POST로 완료하고 프로필 PATCH를 하지 않는다", async () => {
 const {departmentCode,...input}=onboardingBody;
 const response=await request("/api/auth/onboarding",{method:"POST",body:{...input,department:departmentCode}});
 assert.equal(response.status,200);
 assert.deepEqual(calls.map(({path,method})=>[path,method]),[["/api/onboarding","POST"]]);
 assert.equal(calls[0].body.department,departmentCode);
 assert.equal("departmentCode" in calls[0].body,false);
 assert.equal("contactValue" in calls[0].body,false);
});
test("기존 departmentCode 입력도 최신 계약으로 변환하고 탐색자 학과를 포함한다", async () => {
 const first=await request("/api/auth/onboarding",{method:"POST",body:onboardingBody});
 assert.equal(first.status,200);
 assert.equal(calls[0].body.department,onboardingBody.departmentCode);
 onboardingDone=false;
 const second=await request("/api/auth/onboarding",{method:"POST",body:{purpose:"FINDER",department:"COMPUTER_ENGINEERING",coffeeChatAllowed:false}});
 assert.equal(second.status,200);
 assert.equal(calls[1].body.department,"COMPUTER_ENGINEERING");
 assert.equal(calls.some(call=>call.path==="/api/member"),false);
});
test("온보딩 POST 실패는 완료 처리하지 않고 응답 유실 재시도는 중복 등록 없이 복구한다", async () => {
  onboardingFailure = true;
  assert.equal(
    (
      await request("/api/auth/onboarding", {
        method: "POST",
        body: onboardingBody,
      })
    ).status,
    502,
  );
  onboardingFailure = false;
  assert.equal(
    (
      await request("/api/auth/onboarding", {
        method: "POST",
        body: onboardingBody,
      })
    ).status,
    200,
  );
  assert.equal(
    (
      await request("/api/auth/onboarding", {
        method: "POST",
        body: onboardingBody,
      })
    ).status,
    200,
  );
  assert.equal(onboardingDone, true);
});
test("연구생 학과 코드 누락은 서버 요청 전에 거부한다", async () => {
  assert.equal(
    (
      await request("/api/auth/onboarding", {
        method: "POST",
        body: { ...onboardingBody, departmentCode: undefined },
      })
    ).status,
    400,
  );
  assert.equal(calls.length, 0);
});
test("비로그인·만료 인증은 401이고 만료 쿠키를 제거한다", async () => {
  assert.equal((await request("/api/bookmarks", { token: null })).status, 401);
  const response = await request("/api/bookmarks", { token: "fake-expired" });
  assert.equal(response.status, 401);
  assert.match(response.headers.get("set-cookie"), /ttok_access_token=/);
});
test("관심 토글은 실제 연구실 ID를 전달하고 GET 목록으로 최종 상태를 확인한다", async () => {
  assert.equal(
    (
      await request("/api/bookmarks", {
        method: "POST",
        body: { laboratoryId: 157 },
      })
    ).status,
    200,
  );
  const result = await (await request("/api/bookmarks")).json();
  assert.equal(result.data[0].id, 8);
  assert.equal(result.data[0].laboratory.laboratoryId, 157);
  await request("/api/bookmarks", {
    method: "POST",
    body: { laboratoryId: 157 },
  });
  assert.deepEqual((await (await request("/api/bookmarks")).json()).data, []);
});
test("잘못된 북마크 ID와 응답을 거부하고 사용자 데이터를 캐시하지 않는다", async () => {
  assert.equal(
    (
      await request("/api/bookmarks", {
        method: "POST",
        body: { laboratoryId: "157" },
      })
    ).status,
    400,
  );
  const response = await request("/api/bookmarks");
  assert.match(response.headers.get("cache-control"), /no-store/);
  malformed = true;
  assert.equal((await request("/api/bookmarks")).status, 502);
});
test("커피챗 생성은 요청의 다른 연구실 ID를 무시하고 본인 연구실에만 연결한다", async () => {
  const response = await request("/api/member/coffee-chat", {
    method: "POST",
    body: {
      laboratoryId: 999,
      contactType: "EMAIL",
      contactValue: "test@example.com",
    },
  });
  assert.equal(response.status, 200);
  assert.equal(coffee.laboratoryId, 157);
  assert.equal(
    (
      await request("/api/member/coffee-chat", {
        token: "fake-finder",
        method: "POST",
        body: { contactType: "EMAIL", contactValue: "test@example.com" },
      })
    ).status,
    403,
  );
});
test("기존 커피챗은 PATCH하고 공개 중단은 본인의 연락처 ID를 삭제한다", async () => {
  coffee = {
    id: 99,
    laboratoryId: 157,
    contactType: "EMAIL",
    contactValue: "old@example.com",
  };
  await request("/api/member/coffee-chat", {
    method: "POST",
    body: { id: 999, contactType: "EMAIL", contactValue: "new@example.com" },
  });
  assert.ok(
    calls.some(
      (call) => call.path === "/api/coffee-chat/99" && call.method === "PATCH",
    ),
  );
  assert.equal(coffee.contactValue, "new@example.com");
  assert.equal(
    (await request("/api/member/coffee-chat", { method: "DELETE" })).status,
    200,
  );
  assert.equal(coffee, null);
});
test("임의 URL·이메일 및 중복 리뷰 항목은 서버 요청 전에 거부한다", async () => {
  assert.equal(
    (
      await request("/api/member/coffee-chat", {
        method: "POST",
        body: {
          contactType: "KAKAO_TALK",
          contactValue: "javascript:alert(1)",
        },
      })
    ).status,
    400,
  );
  assert.equal(
    (
      await request("/api/member/review", {
        method: "POST",
        body: {
          coreTime: "자율",
          weeklyMeeting: "없음",
          doings: ["논문 리딩", " 논문 리딩 "],
        },
      })
    ).status,
    400,
  );
  assert.deepEqual(calls, []);
});
test("연구실 리뷰는 제공 이력에 따라 생성과 수정을 구분한다", async () => {
  const body = {
    coreTime: "자율",
    weeklyMeeting: "주 1회",
    doings: ["논문 리딩"],
  };
  assert.equal(
    (await request("/api/member/review", { method: "POST", body })).status,
    200,
  );
  assert.equal(
    (
      await request("/api/member/review", {
        method: "POST",
        body: { ...body, coreTime: "없음" },
      })
    ).status,
    200,
  );
  assert.deepEqual(
    calls
      .filter((call) => call.path === "/api/lab-review")
      .map((call) => call.method),
    ["POST", "PATCH"],
  );
});
test("상세의 정보 제공은 현재 상세와 본인 소속 연구실이 일치해야 저장한다", async () => {
  const body = {
    coreTime: "있음",
    weeklyMeeting: "주 1회",
    doings: ["실험/코딩"],
    laboratoryId: 999,
  };
  assert.equal(
    (await request("/api/member/review", { method: "POST", body })).status,
    403,
  );
  assert.equal(
    calls.some((call) => call.path === "/api/lab-review"),
    false,
  );
  assert.equal(
    (
      await request("/api/member/review", {
        method: "POST",
        body: { ...body, laboratoryId: 157 },
      })
    ).status,
    200,
  );
});

test("논문 전체보기는 두 번째 페이지까지 조회해 마지막 논문을 렌더링한다", async () => {
  const response = await request("/labs/157/papers");
  assert.equal(response.status, 200);
  const html = await response.text();
  assert.match(html, /논문 7/);
  assert.equal(
    calls.filter((call) => call.path.endsWith("/publications")).length,
    2,
  );
});


test("논문 전체보기 재조회는 이전 페이지 캐시 대신 변경된 전체 목록을 가져온다", async () => {
  const first = await request("/labs/157/papers");
  assert.match(await first.text(), /논문 7/);
  publicationCount = 8;
  const second = await request("/labs/157/papers");
  const html = await second.text();
  assert.match(html, /논문 8/);
  assert.doesNotMatch(html, /논문을 불러오지 못했어요/);
});


test("추천 키워드와 카드 API는 최신 요청 계약과 서버 순위를 매핑한다", async () => {
 const first = await request("/api/recommendations/keywords", {method:"POST",body:{interest:"촉매 연구"}});
 assert.equal(first.status,200); assert.deepEqual((await first.json()).data,["촉매","에너지"]);
 const response = await request("/api/recommendations", {method:"POST",body:{interest:"촉매 연구",selectedKeywords:["촉매"]}});
 assert.equal(response.status,200); const data=(await response.json()).data;
 assert.equal(data.recommendations[0].id,157); assert.deepEqual(data.recommendations[0].reasons,[]);
 assert.deepEqual(calls.filter(x=>x.path==="/api/chat/research-lab")[0].body,{interest:"촉매 연구",selectedKeywords:["촉매"]});
 assert.equal(response.headers.get("cache-control"),"private, no-store");
});
test("추천 API는 입력 제한, 인증 만료, 서비스 장애 및 비구조화 응답을 구분한다", async () => {
 assert.equal((await request("/api/recommendations/keywords",{method:"POST",body:{interest:"가".repeat(301)}})).status,400);
 assert.equal((await request("/api/recommendations",{method:"POST",body:{interest:"촉매",selectedKeywords:["A","B","C","D"]}})).status,400);
 assert.equal(calls.length,0);
 assert.equal((await request("/api/recommendations/keywords",{token:null,method:"POST",body:{interest:"촉매"}})).status,401);
 aiFailure=true;
 assert.equal((await request("/api/recommendations",{method:"POST",body:{interest:"촉매",selectedKeywords:[]}})).status,503);
 aiFailure=false; aiMalformed=true;
 assert.equal((await request("/api/recommendations",{method:"POST",body:{interest:"촉매",selectedKeywords:[]}})).status,502);
});

const emailInput = {
  laboratoryId: 157,
  purpose: "UNDERGRADUATE_RESEARCH",
  name: "홍길동",
  department: "COMPUTER_ENGINEERING",
  grade: "THIRD",
  email: "student@example.com",
  interest: "촉매 연구",
};
test("메일 API는 서버 학과 코드와 구조화 초안을 전달하며 개인정보 응답을 캐시하지 않는다", async () => {
  const departments = await request("/api/email-drafts/departments");
  assert.equal(departments.status, 200);
  assert.deepEqual((await departments.json()).data, [
    { department: "COMPUTER_ENGINEERING", departmentName: "컴퓨터공학부" },
  ]);
  const response = await request("/api/email-drafts", {
    method: "POST",
    body: { ...emailInput, ignored: "삭제할 필드" },
  });
  assert.equal(response.status, 200);
  assert.deepEqual((await response.json()).data, {
    subject: "서버 제목",
    body: "안녕하세요.\n서버 본문",
  });
  assert.equal(response.headers.get("cache-control"), "private, no-store");
  assert.deepEqual(
    calls.find((call) => call.path === "/api/chat/email-editor").body,
    emailInput,
  );
});
test("메일 API는 입력 경계와 학과를 검증하고 인증·연구실 없음·AI 장애·잘못된 응답을 구분한다", async () => {
  for (const patch of [
    { name: "가".repeat(21) },
    { interest: "가".repeat(301) },
    { grade: "3학년" },
    { purpose: "invalid" },
    { content: "가".repeat(1201) },
    { laboratoryId: -1 },
  ]) {
    assert.equal(
      (
        await request("/api/email-drafts", {
          method: "POST",
          body: { ...emailInput, ...patch },
        })
      ).status,
      400,
    );
  }
  assert.equal(calls.length, 0);
  assert.equal(
    (
      await request("/api/email-drafts", {
        method: "POST",
        body: { ...emailInput, department: "컴퓨터공학부" },
      })
    ).status,
    400,
  );
  assert.equal(
    calls.some((call) => call.path === "/api/chat/email-editor"),
    false,
  );
  assert.equal(
    (
      await request("/api/email-drafts", {
        token: null,
        method: "POST",
        body: emailInput,
      })
    ).status,
    401,
  );
  for (const status of [401, 404, 503]) {
    emailStatus = status;
    const response = await request("/api/email-drafts", {
      method: "POST",
      body: emailInput,
    });
    assert.equal(response.status, status);
    if (status === 401)
      assert.match(response.headers.get("set-cookie"), /Max-Age=0/i);
  }
  emailStatus = 200;
  emailMalformed = true;
  assert.equal(
    (await request("/api/email-drafts", { method: "POST", body: emailInput }))
      .status,
    502,
  );
});
