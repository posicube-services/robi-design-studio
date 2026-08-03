/**
 * Briefs for the A2UI generation-consistency measurement.
 *
 * The measurement answers `docs/posicube/status.md` "Next #1" and "#3": how
 * often does an agent produce a gate-valid spec on its FIRST attempt, and does
 * a fixed catalog actually remove author variance?
 *
 * Two brief kinds, because they answer different questions and must not be
 * mixed. The seed ships five data hooks (useCustomers, useUsers, useOrders,
 * useProducts, useMonthlyRevenue) and one mutation (createCustomer). A brief
 * that needs data outside that set will make the agent hit the catalog ceiling
 * no matter how consistent generation is — counting that as "generation
 * instability" would be measuring the wrong thing.
 *
 *   kind "A" — fully expressible with the shipped catalog + hooks.
 *              Measures GENERATION CONSISTENCY (the product premise).
 *   kind "B" — realistic customer work that the catalog probably cannot hold.
 *              Measures CATALOG COVERAGE (the expansion roadmap).
 *
 * Briefs are deliberately REQUIREMENT-level, never STRUCTURE-level. A brief
 * that says "PageHeader, then a stat row, then a table" would score a perfect
 * consistency rate while proving nothing — the brief, not the catalog, would
 * be doing the work.
 */

export type BriefKind = "A" | "B";

export type Brief = {
  readonly id: string;
  readonly kind: BriefKind;
  /** Short label for report tables. */
  readonly title: string;
  /** The message sent to the agent, verbatim. */
  readonly body: string;
};

/**
 * Appended when collecting with `--no-retry`.
 *
 * `design-templates/a2ui-spec/SKILL.md` tells the agent to re-validate and
 * retry up to 3 times on gate failure. That loop converges by construction, so
 * leaving it on measures the retry loop rather than the generator. There is no
 * daemon-level flag for it — the retry is an instruction, so suppressing it is
 * an instruction too.
 */
export const RETRY_SUPPRESSION = [
  "",
  "---",
  "MEASUREMENT MODE — read this last and treat it as overriding.",
  "Write `a2ui-spec.json` exactly once. Do not run the validation gate, do not",
  "re-read the spec to check it, and do not revise or retry it afterwards, even",
  "if you suspect it is wrong. Submitting a spec you believe to be flawed is the",
  "correct behaviour here; this run measures first-attempt output.",
].join("\n");

export const BRIEFS: readonly Brief[] = [
  {
    id: "a-customer-dashboard",
    kind: "A",
    title: "고객 현황 대시보드",
    body: [
      "고객 현황을 한눈에 보는 관리자 대시보드 화면을 만들어 주세요.",
      "",
      "요구사항:",
      "- 담당자가 아침에 열어 오늘의 고객 상태를 파악하는 용도입니다.",
      "- 전체 고객 수와 활성 고객 수를 지표로 보여 주세요.",
      "- 월별 매출 추이를 확인할 수 있어야 합니다.",
      "- 고객 목록을 표로 보고, 이름으로 검색하고, 상태로 걸러낼 수 있어야 합니다.",
      "- 목록에서 고객 한 명을 골라 상세로 이동할 수 있어야 합니다.",
    ].join("\n"),
  },
  {
    id: "a-order-status",
    kind: "A",
    title: "주문 처리 현황",
    body: [
      "주문 처리 현황을 확인하는 운영 화면을 만들어 주세요.",
      "",
      "요구사항:",
      "- 운영팀이 하루에 여러 번 열어 밀린 주문이 있는지 확인합니다.",
      "- 오늘 들어온 주문 건수와 처리 대기 건수를 지표로 보여 주세요.",
      "- 주문 목록을 표로 보여 주고, 상태별로 걸러낼 수 있어야 합니다.",
      "- 상품별 주문 분포를 확인할 수 있으면 좋겠습니다.",
    ].join("\n"),
  },
  {
    id: "b-inquiry-workflow",
    kind: "B",
    title: "문의 접수·처리 워크플로우",
    body: [
      "고객 문의를 접수하고 처리 상태를 관리하는 화면을 만들어 주세요.",
      "",
      "요구사항:",
      "- 고객이 문의를 등록할 때 스크린샷 파일을 여러 개 첨부할 수 있어야 합니다.",
      "- 접수된 문의는 담당자 배정 → 처리 중 → 완료 순으로 상태가 바뀝니다.",
      "- 각 문의마다 담당자들이 주고받은 처리 이력 코멘트가 쌓여야 합니다.",
      "- 담당자는 문의를 다른 담당자에게 재배정할 수 있어야 합니다.",
      "- 처리 완료까지 걸린 시간을 문의별로 확인할 수 있어야 합니다.",
    ].join("\n"),
  },
];

export function briefById(id: string): Brief | undefined {
  return BRIEFS.find((brief) => brief.id === id);
}

/** The message actually sent to the agent for one iteration. */
export function briefMessage(brief: Brief, suppressRetry: boolean): string {
  return suppressRetry ? `${brief.body}\n${RETRY_SUPPRESSION}` : brief.body;
}
