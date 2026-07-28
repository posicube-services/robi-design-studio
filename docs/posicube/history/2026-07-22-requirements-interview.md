# Deep Interview Spec: robiflow 화면(Screen) 노드 아키텍처

## Metadata
- Interview ID: di-robiflow-screen-node-20260722
- Rounds: 7
- Final Ambiguity Score: 14.5%
- Type: brownfield
- Generated: 2026-07-22
- Threshold: 0.20
- Status: PASSED

## Clarity Breakdown
| Dimension | Score | Weight | Weighted |
|-----------|-------|--------|----------|
| Goal Clarity | 0.90 | 0.35 | 0.315 |
| Constraint Clarity | 0.80 | 0.25 | 0.200 |
| Success Criteria | 0.85 | 0.25 | 0.213 |
| Context Clarity | 0.85 | 0.15 | 0.128 |
| **Total Clarity** | | | **0.855** |
| **Ambiguity** | | | **0.145** |

---

## Goal

robiflow(Dify 포크) 워크플로우 캔버스에 **화면(Screen) 노드**를 추가한다. 이 노드는 LLM으로 **A2UI형 UI 스펙(JSON)** 을 생성하며, 생성된 스펙은 고객사에 배포된 **공용 런타임 렌더러**가 해석해 화면을 그린다. 화면은 같은 워크플로우의 API 노드 출력과 데이터 바인딩되어 실제 비즈니스 로직을 수행한다.

한 문장으로: **워크플로우 캔버스에서 "페이지 = 노드 1개"로 화면을 선언하고, LLM은 고정된 컴포넌트 카탈로그 문법으로만 스펙을 쓰며, 결과는 재빌드 없이 런타임 렌더러로 배포된다.**

목적은 B2B 고객사별 맞춤 화면을 **모든 개발자가 동일한 품질과 일관성으로** 생산하는 것이다. 순수 LLM 코드 생성은 사람마다 결과가 달라지므로 배제한다.

---

## Core Decisions (인터뷰로 확정)

### D1. 배포 모델 — 런타임 스펙 렌더링이 기본, open-design은 역할 분담
- **기본 경로**: 화면 노드 산출물은 A2UI 스펙(JSON). 고객사에 배포된 공용 렌더러 앱이 스펙을 해석해 렌더. 스펙 저장/버전업만으로 즉시 반영(재빌드 없음).
- **open-design의 역할**: 화면 생성기가 아니라 (a) 고객사별 **셸/레이아웃/프로젝트 스캐폴딩**, (b) 카탈로그로 표현 불가능한 **예외 화면의 탈출구**.
- 프레임워크는 Next.js를 기본으로 한다(genui-studio가 이미 Next 16 기반, `/p/[slug]` 동적 라우트 보유).

### D2. 데이터 바인딩 — 순방향 스키마 주입
- API 노드의 **출력 스키마를 런타임에 추출**해 화면 노드의 LLM 프롬프트에 주입한다.
- LLM은 실제 필드명을 보고 바인딩한다. 카탈로그의 데이터 바인딩 어휘는 워크플로우별로 동적 확장된다.
- (역방향 "화면이 계약을 선언하고 어댑터가 맞춘다"는 방식은 채택하지 않음)

### D3. 노드 입자성 — 페이지 노드 + 섹션 재생성
- 캔버스에서는 **페이지 1개 = 화면 노드 1개**. 캔버스 복잡도를 낮게 유지한다.
- 섹션 단위 수정은 노드를 쪼개는 대신 **Preview 상의 편집 연산**으로 제공한다(특정 섹션만 지정 재생성).

### D4. 고객사별 맞춤 범위 — 토큰 + 화면 조합
- 바꿀 수 있는 것: **테마 토큰**(색/폰트/라운드/로고) + **화면 조합**(어떤 화면을 몇 개, 어떤 순서/네비게이션으로).
- 바꿀 수 없는 것: 각 화면 내부는 **동일한 카탈로그 문법**으로만 조립. 고객사 전용 컴포넌트를 카탈로그에 분기 추가하지 않는다.

### D6. 생성 코어의 거처 — genui-studio를 서비스로 승격 (robiflow 내부 이식 아님)
- 생성 코어(프롬프트 빌더 + 카탈로그 + Zod 게이트 + 디자인 규칙 린터 + 스펙 저장소)는 **genui-studio에 남기고 HTTP 서비스로 승격**한다.
- robiflow 화면 노드는 **얇은 HTTP 클라이언트**로만 구현한다. 생성 로직을 robiflow 백엔드로 이식하지 않는다.
- 근거:
  1. **아키텍처가 강제하는 분리다.** D1에서 렌더러는 고객사에 배포되는 별도 앱이다. robiflow 안에 존재할 수 없다.
  2. **genui-studio가 이미 코어다.** 스키마·카탈로그·게이트·렌더러·프롬프트 빌더·`/p/[slug]`가 모두 존재한다. 부족한 것은 린터와 HTTP 표면 둘뿐이다.
  3. **반복 속도.** genui-studio는 `pnpm author` + 브라우저로 초 단위 반복. robiflow는 Docker·Celery·Postgres·Redis 풀스택이라 사이클이 분 단위다. robiflow에 들어갈 코드가 가장 얇으므로 그쪽을 최소화한다.
- **계약 우선(contract-first)**: HTTP 계약을 먼저 확정하고, robiflow 노드는 목(mock)에 대고 개발해 두 저장소의 진행을 분리한다.
- 이 결정이 Open Risk #3의 답이다.

### D5. 일관성 판정 — 게이트 + 디자인 규칙 자동 검사
- 합격 조건 = **Zod 구조 게이트 통과** AND **디자인 규칙 린터 통과**.
- 디자인 규칙 예: primary contained 버튼 화면당 1개, primary 색상 점유율 상한, 타이포그래피 계층 준수, pattern block 우선(primitive 남용 금지), 상태 표현은 semantic chip.
- 사람 리뷰는 게이트 이후의 보조 수단이지 1차 판정 기준이 아니다.

### D7. Authoring/Preview 셸 — 코어는 genui에서 인큐베이트, 셸은 순차 두-트랙
**코어와 셸을 분리한다.** 코어(스키마·카탈로그·Zod 게이트·디자인 규칙 린터·렌더러)의 거처는 genui-studio다(D6). 그 코어를 소비하는 authoring/preview **셸**은 순차 두-트랙으로 탐색한다:

- **트랙 A (먼저) — genui-studio 자체를 최소 워크벤치로.** 가볍고 반복이 빠르므로 여기서 A2UI 코어와 제품 전제(Stage 0 생성기 일관성)를 싸게 검증한다. 없는 것은 수정 루프 UI뿐.
- **트랙 B (성과 후) — open-design fork를 최종 워크벤치 셸로.** 트랙 A에서 검증된 genui 렌더 코어를 fork한 open-design(fe-open-design-minimal-theme 방식)에 임베드한다. 목적은 open-design의 **에이전트 내장 구동(Claude Code/CLI) + 실시간 생성-미리보기 루프 + 통합 workspace**를 얻는 것. upstream(nexu-io)을 따라가며 커스텀.
- **코어는 하나다.** 두 셸 모두 같은 genui 코어를 재사용하므로 트랙 A의 성과가 버려지지 않고 트랙 B로 이식된다. 최종 셸 선택은 트랙 B의 임베드 스파이크(genui 렌더러 번들 임베드 난이도 + 포크 유지보수 비용)를 실측한 뒤 확정한다.
- open-design의 디자인 강제는 prose지만, A2UI 모드의 hard 게이트는 임베드된 genui 코어에서 오므로 hard가 유지된다. skill(prose)과 게이트(schema/runtime)는 층이 다르다.

**실행 순서 (fork 올리기 ≠ fork 커스텀 착수):**
1. **지금 (값싼 준비):** open-design을 posicube-services에 fork로 올려 upstream(nexu-io) 추적을 시작한다. 이 단계는 커스텀이 아니라 추적 준비다.
2. **검증 (병렬, 커스텀 착수 전 필수):** (a) **임베드 스파이크** — genui 렌더러를 open-design에 임베드해 A2UI 스펙 1개를 preview에 렌더 + 에이전트 구동으로 A2UI 스펙 1개 생성. (b) **Stage 0** — 생성기 일관성 반증 실험(계획 §1).
3. **착수 (스파이크 성공 후):** fork를 본격 커스텀(genui 코어 임베드) + Tier 1 thin slice.
4. **폴백:** 스파이크 실패/과비용 시 genui-studio 셸로. 코어는 이미 genui에 있으므로 손실 없음.
- **근거:** fork를 커스텀하기 시작하는 순간 upstream 추적 비용이 발생한다(fe-open-design-minimal-theme가 upstream 0.11.1 대비 0.9.0으로 뒤처진 것이 증거). 검증 전 커스텀은 뒤처지는 fork를 붙들고 두 번 일하는 위험이다.

**임베드 스파이크 실측 결과 (2026-07-23, branch `feature/a2ui-genui-spike`):**
- **경로 Y 타당함 — 검증됨.** genui 렌더 코어(`src/genui/*` 6파일 + `src/blocks/*` 31파일 + `src/authoring/spec-schema.ts` 게이트)를 fe-open-design-minimal-theme의 `minimal-next` seed에 이식하고 `npm run build` 통과. `/a2ui` 라우트가 A2UI 스펙 1개(Page→PageHeader+Form+DataTable)를 게이트 통과 후 SpecRenderer로 정적 프리렌더. 런타임/타입 에러 0.
- **스파이크의 핵심 발견 — 통합 지점은 artifact-srcDoc이 아니라 react-project seed다.** open-design의 artifact 렌더(`buildReactComponentSrcdoc`)는 격리 iframe + unpkg CDN + 브라우저 내 Babel eval로 단일 파일용이라, MUI v7 + `next/navigation` 의존 genui 블록엔 부적합. 정답은 minimal-next seed에 genui를 내장하고 그 Next 프로젝트가 렌더하는 것. seed와 genui-studio가 동일 `@minimal-kit/next-ts` 계보라 성립.
- **이식 난이도: minor-adjustment (순수 복사에 가까움).** 두 가지 조정 필요:
  1. **데이터 레이어 클로저**: data-table/form/chart/key-value/stat-card/analytics-widget 6개 블록이 `hook-registry`/`mutation-registry`에 의존 → `@tanstack/react-query` + `src/lib/react-query` + `src/lib/mock-db` 클로저가 딸려온다(seed에 없어 추가). 흔한 블록이라 불가피.
  2. **컴포넌트 API drift**: seed의 `Chart` primitive가 genui-studio보다 최신 리비전이라 `height` prop이 `sx` 기반으로 바뀜 — callsite당 1줄 수정. "완전 동일 계보"가 그 컴포넌트엔 안 맞음. 31블록 전체를 쓰면 유사 drift가 더 나올 수 있음(전체 exercise 필요).
- **컴포넌트 drift 전체 점검 완료 (2026-07-23, commit 1088669):** 30블록 전체를 인스턴스화한 종합 스펙을 Playwright headless browser + production build로 런타임 검증. **29/30 clean.** 유일한 실패는 `Chart`의 `bar` 모드 — **pre-existing ApexCharts 버전 비호환**(apexcharts@5.15.0 / react-apexcharts@1.9.0, vendored `src/components/chart` wrapper의 컨테이너 측정 이슈), **genui 포팅이 원인 아님**(hook-free 리터럴 bar 차트도 동일 크래시). `chart.tsx`에 isLoading 가드 + series/options memoize 개선으로 에러 클래스 감소. bar 차트 완전 해결은 apexcharts 버전 pin follow-up 필요(genui 밖, seed 공유 컴포넌트). **최종 이식 난이도: minor-adjustment 유지** — block-registry 포팅 자체는 29/30 clean, Chart bar는 별도 vendored 이슈.
- **에이전트 생성 루프 코드 골격 완료 (commit 88cbcb9):** `/a2ui`가 프로젝트 루트 `a2ui-spec.json`을 force-dynamic으로 로드(하드코딩 제거). `design-templates/a2ui-spec/SKILL.md` 추가 — 에이전트가 카탈로그 어휘로 스펙 작성 지시, open-design 기존 agent config 재사용.
- **미검증 — 다음 단계:**
  1. **에이전트 생성 end-to-end**: daemon 실행 + skill로 에이전트가 실제 A2UI 스펙 생성 → seed 렌더. 코드 골격은 완성, daemon 실행 검증 필요.
  2. **디자인 규칙 린터(D5)** 및 **Stage 0 생성기 일관성 실험** — 여전히 미착수, 제품 전제 검증에 필수.
  3. **Chart bar apexcharts 버전 pin** — vendored wrapper follow-up.

**셸이 무엇이든 launch 패턴은 동일**하다 — robiflow 화면 노드가 **새 탭(`window.open`)으로** 셸을 띄운다(iframe 아님). 사내 선례(robi-g-admin → robi-scenario-builder-web)를 그대로 복사:
  - 토큰은 URL **해시 프래그먼트**로 전달(서버 로그에 안 남음).
  - 셸 로드 후 `{sign:"initialize"}` postMessage → 노드가 `{workflow_id, node_id}` + 컨텍스트로 응답 → 셸이 해당 스펙을 fetch/hydrate.
  - 완료 시 셸이 `{sign:"publish"}` **신호만** 보내고, 실제 스펙은 공용 저장소에 직접 쓴 뒤라 노드는 신호를 받고 재fetch → dify 노드에 반영.
  - 인증은 공유 쿠키/SSO가 아니라 **일회성 토큰 seed**(셸이 자기 스토리지에 저장, refresh는 자체 관리).
  - 서로 다른 오리진. 노드 측은 `event.origin` 검증.
- 참고 구현: `robi-g-admin/src/hooks/use-scenario-editor.ts`, `robi-scenario-builder-web/src/sections/dashboard/editor/listeners/admin-message-listener/`.

### D8. Two-Tier 모델 — 규격 화면(A2UI hard) vs 리치 화면(코드 soft)
"고객사별 맞춤"은 두 개의 다른 축으로 갈라진다. 이 둘을 섞으면 답이 안 나온다.

- **축 A — 디자인시스템 다양성 (Tier 1 내부 확장):** MUI Minimal, Untitled UI 등. 같은 A2UI 스펙 모델·같은 카탈로그 구조, 다른 컴포넌트 세트/토큰. 스펙은 그대로, 렌더러 registry만 교체. **A2UI가 깨지는 게 아니라 정상 확장이다.** 단 **유한 큐레이션**(2~4개) — 고객사마다 새 카탈로그를 찍으면 유지보수 폭발.
- **축 B — 규격화의 포기 (Tier 2):** 성형외과·치과처럼 리치/커스텀/브랜드 강한 화면. 카탈로그로 표현 불가. 여기에 A2UI를 강요하지 않는다.

| | Tier 1 — 규격 화면 | Tier 2 — 리치 화면 |
|---|---|---|
| 대상 | 대시보드·폼·리스트·상담 (B2B 대다수) | 리치/커스텀/브랜드 강한 랜딩 등 |
| 산출물 | A2UI 스펙(JSON) → 런타임 렌더 | "약속된 디자인을 먹인" **코드 빌드 결과물** |
| 강제 | **hard** (카탈로그 어휘 경계, Zod 게이트, UnknownNode 실패) | **soft** (디자인 토큰·베이스 컴포넌트·템플릿을 프롬프트로) |
| 셸 | genui-studio (D7) | **open-design 개조** |

- **thin slice는 Tier 1만 만든다.** Tier 2(open-design)는 아키텍처에 **자리만 예약**하고, Tier 1이 커버 못 하는 실제 고객 요구가 올 때 연다(증거 기반, YAGNI).
- **"하나의 툴 통합"은 폐기가 아니라 열린 옵션이다.** open-design 안에 A2UI hard 모드를 넣는 것은 기술적으로 가능하나(content-agnostic 파이프라인 + renderer-registry additive), (1) 강제 엔진은 어차피 둘이라 통합되는 건 셸뿐이고, (2) thin slice엔 자유 모드가 없어 통합 이득이 실현되지 않으며, (3) open-design의 무게(자체 auth/SQLite/포트/포크 유지보수)를 즉시 짊어진다. 통합은 **Tier 2를 실제로 만들어 두 tier의 공통 인프라 공유 실익을 확인한 뒤** 판단할 옵션이지, 지금 설계 목표로 고정하지 않는다.
- genui의 렌더 코어는 어느 경로(별도 툴 / open-design 임베드)를 택하든 필요하다. thin slice에선 가벼운 독립 앱(genui-studio)에 담는 것이 명백히 저비용이다.

---

## Constraints

- LLM은 **JSX/CSS/MUI 코드를 절대 보지 않는다.** 카탈로그 어휘(block type, prop 도메인, hook/mutation 이름)만 노출한다. (genui-studio `src/authoring/prompt.ts`의 기존 원칙 유지)
- 생성 결과는 반드시 Zod 게이트를 통과해야 하며, 실패 시 오류를 모델에 되먹여 재시도한다(현행 max 3회).
- 디자인시스템은 Posicube Minimal(MUI v7 기반) 단일 계보를 유지한다. Tailwind/shadcn/Radix 등 제4의 스타일 언어 도입 금지.
- 화면 노드는 robiflow의 기존 노드 확장 패턴을 따른다. 새로운 확장 메커니즘을 발명하지 않는다.
- 카탈로그 확장은 D2로 인해 **데이터 바인딩 어휘에 한해** 동적 확장을 허용한다. 시각 컴포넌트 카탈로그는 정적으로 유지한다.

## Non-Goals

- 화면 노드가 React/Next **코드**를 직접 생성하는 것 (D1에서 배제)
- 고객사별 전용 컴포넌트를 카탈로그에 추가하는 것 (D4에서 배제)
- 노드를 섹션 단위로 쪼개는 것 (D3에서 배제)
- 여러 페이지를 가진 앱 전체를 노드 하나가 통째로 생성하는 것 (D3에서 배제)
- AG-UI를 UI 생성 프로토콜로 채택하는 것 — AG-UI는 agent↔UI **이벤트 전송** 표준이지 UI 생성 스펙이 아니다. 필요하다면 스트리밍 전송 계층으로만 별도 검토한다.
- thin slice에서 Tier 2(리치 코드 빌드, open-design 개조)를 만드는 것 — D8에서 자리만 예약하고, 실제 리치 디자인 요구가 올 때 연다.
- authoring/preview 셸을 iframe 임베드로 만드는 것 — D7은 새 탭 launch(사내 선례)를 채택한다.
- 고객사마다 새 A2UI 카탈로그를 찍는 것 — 디자인시스템은 유한 큐레이션(D8 축 A).

---

## Acceptance Criteria (씬 슬라이스)

작은 화면 하나(예: "문의 접수 폼 + 접수내역 리스트")로 전 구간을 관통한다.

- [ ] robiflow 워크플로우 캔버스에 화면 노드를 배치할 수 있다 (백엔드 노드 등록 + 프론트 노드/패널 컴포넌트).
- [ ] 화면 노드가 같은 워크플로우 내 API 노드의 출력 스키마를 추출해 프롬프트에 주입한다.
- [ ] 화면 노드 실행 시 Zod 게이트를 통과하는 A2UI 스펙이 산출된다.
- [ ] 산출된 스펙이 Preview에서 렌더된다.
- [ ] Preview에서 특정 섹션만 지정해 재생성할 수 있고, 결과가 다시 게이트를 통과한다.
- [ ] 확정된 스펙이 고객사용 렌더러 앱의 라우트에 게시되고, **재빌드 없이** 실제 URL에서 열린다.
- [ ] 그 URL에서 화면이 API 노드를 호출해 실제 데이터로 동작한다.
- [ ] 테마 토큰을 교체하면 같은 스펙이 다른 고객사 룩앤필로 렌더된다.
- [ ] 디자인 규칙 린터가 존재하고, 규칙 위반 스펙을 실제로 불합격 처리한다.
- [ ] 동일 요구사항을 3회 독립 생성했을 때 3개 모두 게이트 + 린터를 통과한다.

---

## Assumptions Exposed & Resolved

| 가정 | 도전(Challenge) | 해소 |
|---|---|---|
| open-design으로 화면을 만들어야 한다 | genui-studio가 이미 스펙→런타임 렌더→동적 배포까지 되는데 왜 코드 생성기가 필요한가? | 역할 분담. 런타임 스펙 렌더가 기본, open-design은 셸 스캐폴딩 + 예외 탈출구 (D1) |
| 화면 노드가 API 노드에 "연결"된다 | (Contrarian) 화면이 API를 아예 모르게 하면? genui-studio의 hook-registry가 바로 그 방식인데 | 순방향 스키마 주입 채택. 화면이 실제 필드를 본다 (D2) |
| 화면 = 페이지인지 섹션인지 컴포넌트인지 모르겠다 | 입자성을 노드가 아니라 편집 연산으로 분리할 수 있지 않은가? | 페이지=노드 1개, 섹션 재생성은 편집 연산 (D3) |
| 고객사마다 맞춤이 필요하다 | (Simplifier) 가장 좁게 잡아도 영업이 되는 선은? 맞춤 범위가 넓을수록 일관성은 붕괴한다 | 토큰 + 화면 조합까지만. 화면 내부 문법은 고정 (D4) |
| 일관성과 퀄리티가 목표다 | 그런데 무엇이 같아야 "일관되다"고 판정하는가? | 게이트 + 디자인 규칙 린터의 기계적 통과 (D5) |

---

## Technical Context (코드베이스 조사 결과)

### robiflow — `/Users/yeombang87/Documents/posicube/workspaces/robiflow`
Dify 포크(Apache 2.0). Next.js(web) + FastAPI(api) + Celery + PostgreSQL + Redis.

**노드 확장 패턴 (선례 4개 존재: athena, json-parse, json-stringify, lexihub-llm)**
- 백엔드: `api/core/workflow/nodes/<name>/` 에 `Node` 서브클래스 배치 → 메타클래스가 자동 등록.
  등록 부트스트랩: `api/core/workflow/node_factory.py:106-121` (`_import_node_package("core.workflow.nodes")`)
  구현 참고: `api/core/workflow/nodes/json_parse/json_parse_node.py` (`node_type`, `version()`, `_run() -> NodeRunResult`)
- 프론트: `web/app/components/workflow/nodes/<kebab-name>/{node,panel}.tsx` 생성 후
  `web/app/components/workflow/nodes/components.ts:62-126` 의 `NodeComponentMap` / `PanelComponentMap`에 **수동 등록**.
- 노드 메타데이터(Wizard 노출용): `api/core/wizard/node_catalog.py`
- Robi-G 연동: `api/core/athena/passthrough.py`, `node_factory.py:369-376` (`_robi_passthrough` 헤더 주입)

**기존 상태**
- Generative UI 노드: `mydocs/sdlc/01_backlog/021-p2-generative-ui-node-poc.md` — 백로그(P2), **스코프 미정, 구현 전무.**
  문서에 명시된 미해결 질문 3개(렌더 타깃 / 렌더 방식 / XSS 보안)는 본 스펙의 D1·D3가 앞의 둘을 해소한다. **보안은 미해소 — 아래 위험 참조.**
- AG-UI 리서치: `mydocs/research/ag-ui-2026-06/` — "미반영, 관찰 단계"

### posicube-genui-studio — 스펙→렌더 파이프라인 (이미 90% 완성)
Next.js 16 + React 19 + MUI v7.3.6 + Zod 4 + React Query 5.

| 역할 | 파일 |
|---|---|
| UI 스펙 스키마 (flat adjacency list: `{version, root, nodes[]}`) | `src/genui/schema.ts` |
| 컴포넌트 카탈로그 (9 pattern block + 13 primitive block, PropSpec 타입 시스템) | `src/authoring/catalog.ts` |
| Zod 게이트 (구조 + superRefine 의미 검사: ID 유일성, root 존재, child ref 무결성, hook 이름, 도달 가능성) | `src/authoring/spec-schema.ts` |
| 런타임 렌더러 (사이클 감지, 미지 노드 진단) | `src/genui/renderer.tsx` |
| 블록 타입 → React 컴포넌트 레지스트리 (30+) | `src/genui/registry.tsx` |
| 프롬프트 빌더 (카탈로그 어휘만 노출) | `src/authoring/prompt.ts` |
| 디자인 규칙 (**프롬프트 주입용 텍스트 — 검사기 아님**) | `src/authoring/design-rules.ts` |
| 데이터 hook 카탈로그 | `src/authoring/hook-registry.ts` |
| 디자인시스템 문서 (Posicube Minimal v7.6.1, 5단계 컴포넌트 탐색 규칙) | `design-system/DESIGN.md` |
| 동적 배포 라우트 | `/p/[slug]` |
| 스펙 영속화 | JSON 파일, `SPEC_DATA_DIR` |
| 생성 프로바이더 | Claude CLI(`generate-spec-claude.ts`) / AI Gateway `generateObject`(`generate-spec.ts`) |

접근 방식은 `a2ui-poc`에서 먼저 증명되었고(동일 스키마 계보), genui-studio가 그 후속 프로덕션 버전.

### open-design / fe-open-design-minimal-theme
- 출처: nexu-io/open-design. monorepo(`apps/{web,daemon,desktop}`), Express daemon + Next.js web + Electron.
- 프로젝트 생성 = **seed tree 복사**(LLM 코드 생성 아님): `apps/daemon/src/react-scaffold.ts`, seed는 `plugins/_official/examples/react-project/assets/{minimal-vite,minimal-next,scaffold,scaffold-next}`. 멱등(package.json 있으면 skip).
- Preview: sandboxed iframe(srcDoc) + postMessage 브리지. 별도 dev server 불필요.
- 배포: Docker 단일 컨테이너(`ghcr.io/nexu-io/od`), daemon이 API + static web 동시 서빙, 데이터는 `.od/`.
- 외부 API 연결: `.../minimal-vite/src/global-config.ts` 의 `CONFIG` — `NEXT_PUBLIC_SERVER_URL` 등 env 주입 패턴.
- `fe-open-design-minimal-theme`는 v0.9.0(upstream v0.11.1보다 구버전) 로컬 포크. MUI minimal seed를 기본 시드로 우선화한 것이 주 차이. node_modules 번들로 파일 수 2배.

---

## Ontology (Key Entities)

| Entity | Type | Fields | Relationships |
|---|---|---|---|
| Screen Node | core domain | node_type, page_name, requirement_prompt, bound_api_node_ref | robiflow 워크플로우에 속함; A2UI Spec을 산출; API Node를 참조 |
| A2UI Spec | core domain | version, root, nodes[] | Screen Node가 생성; Gate가 검증; Renderer App이 렌더 |
| Component Catalog | core domain | pattern blocks(9), primitive blocks(13), PropSpec | A2UI Spec의 어휘를 정의; Design System에 종속 |
| Validation Gate | core domain | zod schema, superRefine 규칙 | A2UI Spec을 통과/불합격 처리 |
| Design Rule Linter | core domain | 규칙 집합, 위반 리포트 | A2UI Spec을 검사; **현재 미구현(신규 필요)** |
| Renderer App | core domain | routes(/p/[slug]), registry, theme | A2UI Spec을 소비; 고객사에 배포됨 |
| API Node | supporting | output_schema | Screen Node에 스키마 주입; 런타임에 화면이 호출 |
| Schema Injector | supporting | 추출 로직, 프롬프트 병합 | API Node → Screen Node 프롬프트 연결 |
| Theme Token | supporting | color, font, radius, logo | 고객사별 변형 축; Renderer App이 적용 |
| Preview Loop | supporting | 렌더 미리보기, 섹션 지정 재생성 | Screen Node ↔ A2UI Spec 반복 |
| Escape Hatch | external system | open-design 스캐폴딩, seed tree | 카탈로그 밖 예외 화면 처리 |

## Ontology Convergence

| Round | Entity Count | New | Stable | Stability |
|---|---|---|---|---|
| 3 | 7 | 7 | - | (초기) |
| 4 | 8 | 1 (Schema Injector) | 7 | 87.5% |
| 5 | 9 | 1 (Section Regeneration → Preview Loop에 흡수) | 8 | 88.9% |
| 6 | 10 | 1 (Theme Token) | 9 | 90.0% |
| 7 | 11 | 1 (Design Rule Linter) | 10 | 100% |

개체가 교체되지 않고 누적만 되었다 — 도메인 모델이 수렴했다는 신호.

---

## Open Risks (다음 단계에서 반드시 다룰 것)

1. **디자인 규칙 린터가 존재하지 않는다.** `design-rules.ts`는 프롬프트에 넣는 텍스트일 뿐 검사기가 아니다. D5의 합격 판정이 성립하려면 이 린터를 신규 구현해야 한다. 이것이 이 스펙에서 가장 큰 미검증 요소다.
2. **카탈로그 팽창 vs 일관성 긴장.** D2의 스키마 주입은 데이터 어휘를 워크플로우마다 늘린다. "시각 컴포넌트 카탈로그는 정적 유지"라는 경계가 실제로 지켜지는지 씬 슬라이스에서 확인해야 한다.
3. ~~**genui-studio는 CLI(`pnpm author`) 기반이다.**~~ **해소됨 — D6 참조.** 서비스 승격으로 확정. 잔여 과제는 HTTP 계약 설계(동기/비동기, 인증, 멱등성)와 배포 단위 증가에 따른 운영 부담이다.
4. **XSS/인젝션 보안 미해소.** 백로그 021 문서가 제기한 질문이 그대로 남아 있다. 스펙 렌더링은 코드 실행이 아니라 상대적으로 안전하지만, prop에 들어가는 사용자 입력 처리 규칙이 필요하다.
5. **fe-open-design-minimal-theme가 upstream보다 구버전(0.9.0 vs 0.11.1)이다.** 탈출구로 계속 쓸 것이라면 포크 유지보수 정책이 필요하다.

---

## Interview Transcript

<details>
<summary>전체 Q&A (7 rounds)</summary>

### Round 1 — 산출물 실체 (Goal)
**Q:** 화면 노드가 최종적으로 만들어내는 산출물은? 고객사에 배포되는 "화면"의 실체는?
**A:** 아직 모르겠음. A2UI로 화면이 나오고 배포처에도 A2UI 렌더링이 있어서 동적 배포가 될 듯. 프레임워크는 Next.js가 나을 듯.
**Ambiguity:** (초기 탐색 병행)

### Round 2 — 1차 성공 기준 (Criteria)
**Q:** 어떤 데모가 나오면 "방향이 맞다"고 판단하겠는가?
**A:** 배포까지 씬 슬라이스.

### Round 3 — 스펙 vs 코드 (Goal / 온톨로지)
**Q:** genui-studio는 스펙 런타임 렌더 + 동적 배포가 되고, open-design은 코드 프로젝트를 생성한다. 근본적으로 다른 배포 모델인데 최종 형태는 어느 쪽인가?
**A:** 역할 분담 — 런타임 스펙 렌더가 기본, open-design은 셸/레이아웃 스캐폴딩과 카탈로그 밖 예외 화면 탈출구.
**Ambiguity:** 38.5% (Goal 0.75 / Constraints 0.35 / Criteria 0.55 / Context 0.85)

### Round 4 — 데이터 계약 (Constraints, **Contrarian 모드**)
**Q:** 화면이 API를 아예 모른다면? genui-studio는 hook 이름을 고정하는데 dify 노드는 임의 스키마를 뱉는다. 이 간극을 어떻게 메우는가?
**A:** 순방향 — API 노드 출력 스키마를 런타임 추출해 프롬프트에 주입.
**Ambiguity:** 32.5% (0.78 / 0.55 / 0.55 / 0.85)

### Round 5 — 노드 입자성 (Goal)
**Q:** 화면 노드 1개가 책임지는 범위는?
**A:** 페이지 노드 + 섹션 재생성 (입자성을 노드가 아닌 편집 연산으로 분리).
**Ambiguity:** 28.3% (0.90 / 0.55 / 0.55 / 0.85)

### Round 6 — 맞춤 범위 (Constraints, **Simplifier 모드**)
**Q:** 고객사별 맞춤이 실제로 바꿔야 하는 것은 어디까지인가? 가장 좁게 잡아도 영업이 되는 선은?
**A:** 토큰 + 화면 조합. 각 화면은 동일 카탈로그 문법으로만 조립.
**Ambiguity:** 22.5% (0.90 / 0.78 / 0.55 / 0.85)

### Round 7 — 일관성 판정 (Criteria)
**Q:** 개발자 3명이 같은 요구로 돌렸을 때 무엇이 같아야 "일관성 확보"인가?
**A:** 게이트 + 디자인 규칙 자동 검사 통과.
**Ambiguity:** 14.5% (0.90 / 0.80 / 0.85 / 0.85) — **임계값 통과**

</details>
