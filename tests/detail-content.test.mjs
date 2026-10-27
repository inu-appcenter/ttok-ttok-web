import assert from "node:assert/strict";
import test from "node:test";
import {
  decodeHtmlEntities,
  getExternalUrl,
  parseDetailPage,
  toPublication,
  toResearchMetrics,
  toResearchProject,
} from "../src/entities/lab/model/map-detail-content.ts";

test("논문은 원문 링크 없는 경우 텍스트로 표시하고 DOI가 있으면 안전한 링크를 만든다", () => {
  assert.equal(
    toPublication({
      title: "논문",
      year: "2025",
      platform: "KDD",
      sourceURL: null,
      doi: null,
    }).url,
    null,
  );
  assert.equal(
    toPublication({ title: "논문", year: "2025", doi: "10.1155/2022/9563019" })
      .url,
    "https://doi.org/10.1155/2022/9563019",
  );
  assert.equal(
    toPublication({
      title: "논문",
      year: "unknown",
      sourceURL: "javascript:alert(1)",
    }).year,
    null,
  );
  assert.equal(getExternalUrl("javascript:alert(1)"), null);
});

test("논문 제목과 학술지의 HTML 엔티티는 한 번만 해석한 일반 텍스트로 보존한다", () => {
  const paper = toPublication({
    title: "Graph &amp; Data &lt;i&gt;Mining&lt;/i&gt; &#8211; &#x2014; &amp;amp;",
    platform: "IEEE Trans. &quot;KDE&quot;&nbsp;&unknown;",
    year: "2025",
  });
  assert.equal(paper.title, "Graph & Data <i>Mining</i> – — &amp;");
  assert.equal(paper.venue, 'IEEE Trans. "KDE" &unknown;');
  assert.equal(decodeHtmlEntities("&#0; &#xD800; &#1114112;"), "&#0; &#xD800; &#1114112;");
  assert.throws(() => toPublication({ title: "&nbsp;" }));
  assert.equal(
    decodeHtmlEntities("&constructor; &toString; &__proto__; &hasOwnProperty;"),
    "&constructor; &toString; &__proto__; &hasOwnProperty;",
  );
  assert.equal(decodeHtmlEntities("&#38;amp; &#x26;lt; &amp;#60;"), "&amp; &lt; &#60;");
});

test("연구과제는 어노테이션의 기간과 키워드 및 서버 진행 상태를 보존한다", () => {
  const project = toResearchProject({
    id: 3,
    titleKorean: "과제",
    ongoing: false,
    totalPeriodStart: "2015-10-01 00:00:00.0",
    totalPeriodEnd: "2020-06-30 00:00:00.0",
    periodStart: "20160701",
    periodEnd: "20170630",
    keywordKorean: "나노 멤브레인, NEMS,가스 센서, NEMS",
    ntisDetailUrl: "https://www.ntis.go.kr/",
  });
  assert.equal(project.period, "2016.07 – 2017.06");
  assert.deepEqual(project.keywords, ["나노 멤브레인", "NEMS", "가스 센서"]);
  assert.equal(project.isOngoing, false);
  assert.throws(() =>
    toResearchProject({ id: 3, titleKorean: "과제", ongoing: "true" }),
  );
});

test("빈 응답과 잘못된 페이지 응답을 구분한다", () => {
  assert.equal(
    parseDetailPage({ content: [], page: 0, totalPages: 0 }, toPublication)
      .content.length,
    0,
  );
  assert.throws(() =>
    parseDetailPage({ content: [], page: -1, totalPages: 1 }, toPublication),
  );
  assert.throws(() =>
    parseDetailPage(
      { content: [{ title: null }], page: 0, totalPages: 1 },
      toPublication,
      toResearchMetrics,
    ),
  );
});

test("연구 지표는 최신 응답 필드를 연결하고 0과 매칭 전 null을 구분한다", () => {
  assert.deepEqual(
    toResearchMetrics({
      hIndex: 3,
      citationCount: 25,
      recentPublicationCount: 5,
      syncedAt: "2026-10-05T04:30:19",
    }),
    {
      hIndex: 3,
      citations: 25,
      fiveYearPapers: 5,
      syncedAt: "2026-10-05T04:30:19",
    },
  );
  assert.equal(toResearchMetrics({ hIndex: 0 }).hIndex, 0);
  assert.equal(toResearchMetrics(null).hIndex, null);
  assert.equal(toResearchMetrics({ citationCount: -1 }).citations, null);
});
