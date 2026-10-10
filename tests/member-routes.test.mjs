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

beforeEach(() => {
  bookmarks = [];
  coffee = null;
  review = null;
  calls = [];
  malformed = false;
});
async function listen(server) {
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  return server.address().port;
}
before(async () => {
  upstream = createServer(async (request, response) => {
    const url = new URL(request.url, "http://localhost");
    const token = request.headers.authorization?.replace("Bearer ", "");
    const publicRead = url.pathname.startsWith("/api/laboratory/");
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
    if (url.pathname === "/api/member/me")
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
        totalElements: 7,
        content: Array.from({ length: page === 0 ? 5 : 2 }, (_, index) => ({
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
