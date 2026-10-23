import assert from "node:assert/strict";
import { after, before, test } from "node:test";
import { createServer } from "node:net";
import { spawn } from "node:child_process";
import { readFile } from "node:fs/promises";

let app;
let appUrl;

before(async () => {
  const probe = createServer();
  await new Promise((resolve) => probe.listen(0, "127.0.0.1", resolve));
  const { port } = probe.address();
  await new Promise((resolve) => probe.close(resolve));
  appUrl = `http://127.0.0.1:${port}`;
  app = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--port", String(port)], {
    env: { ...process.env, API_BASE_URL: "http://127.0.0.1:1" },
    stdio: "ignore",
  });
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const response = await fetch(`${appUrl}/images/og/ttok-og.png`);
      await response.arrayBuffer();
      return;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
  throw new Error("프로덕션 서버를 시작하지 못했습니다. 먼저 pnpm build를 실행해주세요.");
});

after(() => app?.kill());

function content(html, attribute, name) {
  const tags = [...html.matchAll(/<meta\s[^>]*>/g)].map(([tag]) => tag);
  const matches = tags.filter((tag) => tag.includes(`${attribute}="${name}"`));
  assert.equal(matches.length, 1, `${name} 메타 태그는 하나여야 합니다.`);
  return matches[0].match(/content="([^"]*)"/)?.[1];
}

test("비로그인 공유 크롤러가 홈·검색의 절대 OG 이미지 URL과 메타데이터를 받는다", async () => {
  for (const userAgent of ["facebookexternalhit/1.1", "Twitterbot/1.0", "kakaotalk-scrap/1.0"]) {
    for (const path of ["/", "/search"]) {
      const response = await fetch(`${appUrl}${path}`, { headers: { "User-Agent": userAgent } });
      assert.equal(response.status, 200);
      const html = await response.text();
      assert.equal(content(html, "property", "og:title"), "똑똑");
      assert.ok(content(html, "property", "og:description"));
      assert.equal(new URL(content(html, "property", "og:url")).href, `https://ttokttok.inuappcenter.kr${path}`);
      assert.equal(content(html, "property", "og:image"), "https://ttokttok.inuappcenter.kr/images/og/ttok-og.png");
      assert.equal(content(html, "property", "og:image:width"), "1920");
      assert.equal(content(html, "property", "og:image:height"), "1080");
      assert.equal(content(html, "name", "twitter:card"), "summary_large_image");
      assert.equal(content(html, "name", "twitter:image"), content(html, "property", "og:image"));
    }
  }
});

test("OG 이미지가 인증 없이 원본 PNG와 동일한 바이트 및 크기로 제공된다", async () => {
  const response = await fetch(`${appUrl}/images/og/ttok-og.png`);
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type"), /^image\/png/);
  const png = Buffer.from(await response.arrayBuffer());
  assert.deepEqual(png, await readFile(new URL("../public/images/og/ttok-og.png", import.meta.url)));
  assert.equal(png.readUInt32BE(16), 1920);
  assert.equal(png.readUInt32BE(20), 1080);
});
