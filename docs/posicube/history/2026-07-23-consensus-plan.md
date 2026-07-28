# Consensus Plan: robiflow 화면(Screen) 노드 — Thin Slice

- 출처 스펙: `.omc/specs/deep-interview-robiflow-screen-node.md` (deep-interview 7라운드, ambiguity 14.5%)
- 합의 루프: Planner(opus) → Architect(opus) → Critic(opus), deliberate 모드
- **Critic 최종 판정: ITERATE** — 아래 MUST-FIX 6건을 반영하면 실행 가능. 계획 라운드 재실행은 불필요.
- 작성: 2026-07-23

---

## 0. 한 문장 요약

계획의 조사는 실하지만 **두 개의 치명적 결함**이 있다. D5의 합격 기준인 린터가 "일관성"을 측정하지 못하고(측정 타당성 문제), D6의 서비스가 조직 자신의 ADR 0017/0002 경계 밖에 놓여 있다(거버넌스 문제). 그리고 **아무것도 만들기 전에 반나절이면 전제를 검증할 수 있다** — 그 실험을 먼저 한다.

---

## 1. Stage 0 — 반나절 반증 실험 (다른 모든 것보다 먼저)

기존 도구만 쓴다. 새로 만들 것 없음.

```
cd posicube-genui-studio
# 재시도 비활성화, 오늘의 base catalog 그대로
pnpm author "문의 접수 폼 + 접수내역 리스트" run01   # ... run10 까지 N=10
# 매 실행 새 세션, 동일 모델/temperature, raw spec JSON 10개 전부 보존
```

세 수치를 계산해 계획 문서에 적는다. 모두 **린터와 무관하게** spec JSON만으로 계산된다 — 그 독립성이 린터를 반증할 수 있게 하는 조건이다.

| 지표 | 정의 |
|---|---|
| **modal-skeleton share** | `nodes[root].children.map(n => n.type)` (순서 보존)의 최빈 시퀀스를 공유하는 실행 비율 |
| **pairwise Jaccard** | 전체 spec에 등장하는 pattern-block 타입 multiset의 쌍별 Jaccard 평균 |
| **intent-agreement** | 요구사항의 각 의도(list/create/filter/summarize)를 같은 block 타입으로 실현한 쌍의 비율 |

**해석 규칙 (실행 전에 확정):**

| 결과 | 의미 | 조치 |
|---|---|---|
| modal-skeleton share ≥ 0.9 | 생성기가 이미 일관적이다. 변동성의 원인이 아니다. | 린터의 가치가 계획의 가정보다 훨씬 낮다. **계획 전면 재스코프.** |
| 0.3 < share < 0.9 | 모호. | Stage 1(1주)로 진행. |
| share ≤ 0.3 | prop 수준 린터로는 skeleton 수준 변동을 못 막는다. | **F-1의 `page-archetype` 규칙은 선택이 아니라 제품 그 자체.** 계획 재구성. |

Stage 0이 끝나기 전에는 계약도, 서비스도, robiflow 코드도 시작하지 않는다.

---

## 2. Stage 1 — 1주 (Stage 0이 모호할 때만)

genui-studio 단독. robiflow 작업 없음.

- **N = 10** (N=3은 쌍이 3개뿐이라 통계적으로 무의미. 10이면 45쌍)
- **요구사항 2종**:
  - (a) 확정적: `문의 접수 폼 + 접수내역 리스트`
  - (b) **미확정적**: `상담 이력 대시보드 — 기간 필터와 담당자별 현황`
  - **(b)가 진짜 시험이다.** (a)는 모델이 훈련에서 만 번 본 정규 CRUD 화면이고 `Form`+`DataTable`에 1:1로 매핑되어 사실상 하나의 skeleton만 허용한다. (a)에서의 성공은 시스템이 아니라 *요구사항*이 변동을 제거했음을 보일 뿐이다.
- **첫 시도(first-attempt) 출력과 재시도 후 출력을 분리 측정.** 임계값은 첫 시도에 적용한다.
- **사전 등록 임계값** (실행 전에 문서에 기록):

| 지표 | (a) 확정적 | (b) 미확정적 |
|---|---|---|
| modal-skeleton share | ≥ 0.80 | ≥ 0.60 |
| intent-agreement | ≥ 0.90 | ≥ 0.75 |
| first-attempt gate+lint 통과율 | ≥ 0.70 | ≥ 0.70 |

- **통과율 1.0은 그 자체로 실패 신호**다 — 규칙이 아무것도 걸러내지 못한다는 뜻이므로 rule-set 점검을 촉발한다.
- **반증 조건 (사전 명시):** gate+lint 통과율은 높은데 modal-skeleton share가 낮으면 → **D5는 반증된다.** 합격 기준이 일관성을 추적하지 못한다는 직접 증거다.
- **정지 규칙 (반드시 이 문장 그대로 계획에 넣는다):**
  > *"일관성 실행 실패에 대응한 rule-set 수정은 최대 2회. 3회차 실행이 여전히 사전 등록 임계값에 미달하면 D5는 반증된 것이다 — prop 수준 린터로는 skeleton 수준 변동을 닫을 수 없으며, 작업은 다른 메커니즘(생성 이전 단계의 archetype 선택)에 대한 결정이 날 때까지 중단한다."*

  이 문장이 없으면 실험은 종료 조건 없는 튜닝 루프가 된다.
- 디자이너 blind-sort는 **참고 신호 및 `should-have-failed/` 코퍼스 공급원**으로만 병행한다. **합격 판정 도구가 아니다** — 판정자 1명, 신뢰도 교차검증 없음, 연속적 현상에 이분법 강요, 요구사항을 알고 보므로 앵커링 미통제, 관대한 판정자면 규칙이 거짓 검증된다. 주관적 판단을 다른 주관적 판단으로 바꾸는 것은 D5의 목적 자체를 무효화한다.

---

## 3. MUST-FIX (코드 착수 전)

### MF-1. Stage 0를 계획의 문자 그대로 첫 행동으로 삽입
§1 그대로. 반나절. 세 수치를 계획에 기록. 다른 어떤 것도 시작하지 않는다.

### MF-2. AC#10 재작성 + AC#11 신설
**문제**: 린터가 재시도 루프 *안*에 있으므로 "3회 생성이 모두 gate+linter 통과"는 재시도 루프의 수렴 여부를 측정할 뿐이며, 구조상 통과율 1.0으로 수렴한다. **동어반복이다.**

- **AC#10 (개정)**: *"두 요구사항(확정적 1 + 미확정적 1)에 대한 10회 독립 첫시도 생성이 사전 등록 임계값을 충족한다 — modal-skeleton share ≥ 0.8 / ≥ 0.6, intent-agreement ≥ 0.9 / ≥ 0.75, first-attempt gate+lint 통과 ≥ 0.7. 측정은 첫 시도 출력에 대해 하며, rule-set content hash를 함께 기록한다."*
- **AC#11 (신설)**: *"스펙을 작성하지 않은 제3자가 렌더된 각 화면을 원 요구사항 텍스트와 대조해 ship / don't-ship을 판정한다. 수용률 ≥ 8/10이며 기록된다."*

**AC#11이 없으면 프로그램 전체가 초록불인 채로 고객이 돈을 내지 않을 화면을 생산할 수 있다.** 현재 10개 AC는 두 가지 실패 모드를 전부 통과시킨다: (a) 일관되게 평범함 — 10/10 동일, 전부 쓸 수 없음. (b) 일관되게 틀림 — 화면들끼리는 일치하고 고객 요구와는 불일치. 목표 문장의 핵심어는 **품질**과 **자동**인데 실행 간 일치도는 둘 다 측정하지 않는다.

### MF-3. 정지 규칙을 계획에 문자 그대로 기입
§2의 인용 문장. 없으면 무한 튜닝 루프.

### MF-4. A2의 하드코딩 클로저를 **전부** 명시 (F-3, Architect가 놓친 부분 포함)
검증됨: `src/app/(shell)/p/[slug]/page.tsx:34`가 `validateSpec(data)`를 호출하고, 실패 시 계획의 AC#3이 실패 오라클로 쓰는 바로 그 `검증 게이트를 통과하지 못했습니다` alert를 렌더한다. `spec-schema.ts`는 모듈 로드 시점에 `case 'hook': base = z.enum(HOOK_NAMES...)`를 고정한다. 주입된 hook 이름은 전부 거부된다 → **AC#3, #4, #7 전멸.**

Architect의 수정(`validateSpecWith`로 전환)은 **필요하지만 불충분**하다. `superRefine` 안에 `propsSchemaByType`과 **독립적인** 두 번째 하드코딩 클로저가 있다 — StatCard의 json-kind `source.hook`을 리터럴 `HOOK_NAMES.includes(sourceHook)`로 검사한다. `MUTATION_NAMES`도 Form 경로에서 동일하게 노출된다.

계획 문구에 이렇게 쓴다:
> *"`makeSpecSchema(catalog)`는 `propsSchemaByType` **및** `superRefine` 내부의 모든 직접 `HOOK_NAMES`/`MUTATION_NAMES` 참조(특히 StatCard `source.hook` 검사)를 파라미터화해야 한다. `makeSpecSchema`는 주입 데이터소스가 0개인 카탈로그를 포함해 어떤 카탈로그에 대해서도 전역함수여야 한다(`zodForProp`의 `catalog enum prop has no values` throw 금지 — 요청 스코프가 되면 이 throw가 422가 아니라 500이 된다)."*
> *"`src/app/(shell)/p/[slug]/page.tsx`는 `data/specs/<slug>.datasources.json`을 로드하고 `withDataSources`로 카탈로그를 재구성한 뒤 `validateSpec(data)` 대신 `validateSpecWith(catalog, data)`를 호출한다."*

E2E 단언 추가: **StatCard의 `source.hook`을 주입 hook에 바인딩한 spec이 gate alert 없이 렌더된다.**

### MF-5. Step 0 (거버넌스) 신설 — **Track B만** 게이팅
`mydocs/decisions/`에 ADR을 기안하고 승인을 기다린다. 포함 사항:
- 노드 타입 추가 (ADR 0003 선례)
- **genui 서비스의 위치: ADR 0001 토폴로지상 같은 배포 단위 내 internal dependency. public ingress 없음.** (ADR 0017의 external host 금지 및 G5 조건 5 준수)
- **인증: `Authorization: Bearer` 대신 `X-Atelier-Internal-Token`** (ADR 0002). 한 배포에 내부 인증 스킴 2개는 ADR 0002가 막으려던 바로 그것이다.
- **상태 소유권: spec store가 spec을 소유하고, node는 request를 소유한다.**
- backlog-021의 `Won't: 기존 노드 체계 변경`에 `BlockEnum` 멤버 추가가 해당하는지에 대한 명시적 답변.

Issue를 연결하거나 없는 이유를 명시한다(robiflow CLAUDE.md). **이 단계는 Track B만 막고 Stage 0 / Track A는 막지 않는다** — ADR 0017/0002/0003과 `mydocs/` 거버넌스는 robiflow 저장소의 거버넌스이며 genui-studio 실험에는 관할권이 없다.

### MF-6. 리댁션을 의도가 아니라 규칙으로 기술
`schema_injector`는 **variable pool의 실제 런타임 값**에서 manifest를 추론하므로 `statusValues`는 구조상 **실제 고객 데이터 값**(라이브 레코드의 저카디널리티 문자열)이다. 이것이 LLM 프롬프트로 나간다. 스키마 메타데이터 유출 가설이 아니라 **설계상의 고객 데이터 egress**다. ADR 0017의 리댁션 의무가 정면으로 적용된다.

계약에 이 문장을 쓴다:
> *"프롬프트 조립 전에 `dataSources[].statusValues`는 `{cardinality, type}`으로 치환한다. 단 운영자가 노드 패널에서 데이터소스별로 명시적으로 opt-in한 경우는 예외다. 필드명은 통과시킨다. 감사 기록은 ADR 0017에 따라 `{actor, workspace, provider, action, result}`만 저장한다."*

담당자를 지정한다.

---

## 4. FIX-DURING (해당 단계 머지 전)

| # | 변경 | 닫는 항목 |
|---|---|---|
| FD-1 | **`slug`을 `specKey` + `route`로 분리.** `specKey`는 `{workflow_id, node_id}`에서 파생(안정적, 충돌 없음, 버저닝 소유), `route`는 운영자 지정 고객 대면 별칭. `/p/wf_a3f9c2-node_7b1e88`은 B2B 고객에게 줄 URL이 아니다(AC#6 충돌). store는 append-only(`data/specs/<specKey>/v<N>.json` + 포인터). 계약에 `baseSpecVersion` 추가 — `mode:"create"`가 갈라진 키에 오면 **현재 버전과 함께** 409를 반환해 덮어쓰기를 가시화한다. draft vs published를 A5 이전에 답한다. | F-4, M6 |
| FD-2 | **`lintMode: "enforce" \| "report"` + rule-set 버전/해시**를 계약과 authoring 로그에 추가. 버그 있는 `error` 규칙을 배포 없이 강등할 수 있어야 한다. 계획 스스로 "린터 버그가 모든 authoring을 막는다"고 인정했는데 완화책이 "warn은 막지 않는다"뿐이다 — 정작 문제가 되는 유일한 경우가 `error` 규칙 버그다. | M8 |
| FD-3 | **F-1 규칙을 이 순서로 추가**: (a) `primary-color-share`와 blocking primitive-budget 규칙(`count(primitive)/count(pattern) ≤ K` **및** `count(root depth ≤ 2의 primitive) === 0`, `no-fake-card` 대체) — 둘 다 사전에 안전. (b) blocking interaction-pattern 규칙(mutation은 반드시 `Form` pattern block 경유). (c) `page-archetype`은 **Stage 1 이후에만**, 템플릿을 실험의 렌더 출력에서 도출해 작성(사전에 발명 금지 — 규칙 작성자가 임의로 정한 닫힌 archetype 집합은 정당한 화면을 오탈락시키고 우회로가 없다). 그 뒤 `grid-nesting-depth`를 `error`로 승격하거나, ADR에 한 문장으로 **"D5의 합격 기준에는 구조 규칙이 없다"**고 명기한다. 둘 중 하나를 글로 택한다. | F-1 |
| FD-4 | **A5의 idempotency store와 `GET /api/health`를 슬라이스에서 제외.** 어느 AC도 지원하지 않으며 backlog-021의 `Won't: Production-grade 구현`에 걸린다. `Idempotency-Key` **헤더**는 계약에 남긴다(공짜, 전방호환). A7(테마)는 유지 — AC#8이 의존. | M9 |
| FD-5 | **Track B에 red-first 명시**(robiflow CLAUDE.md가 red→green→refactor 의무화, 현재 모든 단계가 구현을 테스트보다 먼저 나열). **A1에 CI job 추가**("나중에" 금지 — vitest만 넣고 CI 없으면 스위트가 썩는다). **`contract.ts`를 OpenAPI yaml에서 생성**하고 canned request/response 쌍을 yaml에 대조하는 pytest 추가. 포크 유지보수 팀이 두 언어로 손수 유지하는 계약 표현 3개 + 적합성 테스트 0개는 영구 드리프트 표면이다. | F-5, F-9 |
| FD-6 | **R10과 B3 근거를 토폴로지 기반으로 재작성.** 60s ingress idle timeout이 존재한다면 90도 120도 소용없다(산술적으로 무의미한 완화책). 그리고 올바른 internal compose 토폴로지에서는 Celery worker와 서비스 사이에 ALB/nginx가 없고 Docker 네트워킹에는 idle timeout이 없다 — 위협 자체가 대부분 사라진다. **sync는 옳은 선택이나 근거가 틀렸다**: ingress가 없기 때문이지 90/120 산술 때문이 아니다. Celery worker slot 점유를 "슬라이스 규모에선 허용 가능"이라는 일축에서 측정 항목으로 승격(동시 screen-node 수 방출, 풀 고갈 임계값 명시). | F-6 |
| FD-7 | **R11을 참인 근거로 재작성하고 기존 어휘 재사용.** "robiflow에 `output_schema` 개념이 없다"는 **거짓**이다(검증됨 — tools/datasources/triggers/MCP에 존재하고 `workflow_as_tool/provider.py:166-178`이 workflow graph에서 파생한다). 정확한 프레이밍으로 교체: *기존 파생은 design-time이고 end-node 전용인데, Screen Node는 mid-graph의 value-shaped 스키마가 필요하다.* `DataSourceManifest`를 발명하는 대신 `OutputVariableEntity`의 `{variable, value_type}` 형태를 재사용하거나 안 하는 이유를 밝힌다(병렬 어휘 발명은 "새 확장 메커니즘 발명 금지" 제약의 경미한 위반). **"패널의 design-time 필드 가시성"을 Open Question에서 명명된 결정으로 승격** — 런타임 전용 추론은 패널이 가용 필드를 못 보여준다는 뜻이고 AC#2 검증에 워크플로우 실행이 필요해진다. ※ end-node-only 주장은 재작성 전에 직접 확인할 것. 산문만 바뀌고 계획 단계는 안 바뀐다. | F-7 |
| FD-8 | **렌더 측 XSS 불변식 추가**: `src/genui/registry.tsx`와 `src/blocks/`에 `dangerouslySetInnerHTML` 호출 지점 0개임을 단언하고, 비리터럴 데이터가 `href`/`src`로 흐르지 않음을 단언. 20분이며 backlog-021의 실제 Q3(**렌더 시점의** 사용자 입력)에 대한 방어 가능한 부분 답변이다 — R4의 authoring 시점 prop 정규식은 그 표면에 닿을 수 없다. R4 규칙은 유지하되 라벨을 고친다. | F-8 |

---

## 5. 계획에서 살릴 것 (Critic이 명시적으로 인정한 강점)

기각이 아닌 이유다. 재작업 시 이것들은 건드리지 않는다.

- **R6, R7, R9는 진짜 발견**이다. 특히 R7(hook-registry가 build-time 싱글턴)은 **AC#7이 명세 그대로는 도달 불가능함을 증명**했다 — 스펙을 실질적으로 개선한 성과.
- **메타 테스트**(모든 위반 fixture가 `validateSpec`을 통과해야 한다)는 계획에서 가장 날카로운 아이디어이며 load-bearing으로 올바르게 식별됐다.
- 에러 rule id에 `toContain`이 아니라 **집합 동등성**을 쓴 것이 옳다.
- **`DESIGN_RULES`를 `RULES[].promptText`에서 파생**시킨 것은 프로세스 약속이 아니라 구조적 수정이다. 프롬프트/검사기 드리프트를 기계적으로 막는다.
- **A2의 block-reference-identity 테스트**는 D4 경계(시각 카탈로그 정적 / 데이터 어휘 동적)에 대한 진짜 불변식이다.
- 대안 논증(A1/A2/A3, B1/B2/B3)은 허수아비 없이 공정하다. 특히 **선언적 rule DSL을 graph-join 근거로 기각**한 것은 옳고 논증이 탄탄하다.
- 검증 단계 대부분이 구체적이고 제3자가 실행 가능하다 — 실질적 강점.

## 6. 계획이 놓친 세 번째 선택지 (Architect 지적, 반영 필요)

D6과 "robiflow로 이식" 사이에 검토되지 않은 안이 있다: **catalog와 rule 정의를 버전 관리되는 데이터 아티팩트로 배포하면서 genui-studio는 빠른 로컬 워크벤치로 유지**하는 것. D6의 반복 속도 논거는 *개발자가 어디서 반복하는가*에 관한 것이고 이는 *런타임 토폴로지*와 직교한다. 계획은 "저기가 반복이 빠르다"에서 "따라서 영구 HTTP 의존성"으로 건너뛰었다.

Critic의 종합 입장: 서비스로 노출할 것은 **아티팩트가 될 수 없는 것만** — LLM 호출 + gate + lint 재시도 루프(TypeScript). catalog JSON, rule 정의와 그 프롬프트 텍스트, 테마 토큰, 그리고 `contract.ts`/`contract.py`는 아티팩트로 배포하고 **단일 OpenAPI yaml에서 생성**한다(손으로 유지하는 쌍둥이 금지).

---

## 7. Ralplan 요약 행

| 항목 | 판정 |
|---|---|
| Principle/Option Consistency | **FAIL** — P1("게이트가 제품")이 순서로 뒤집힘(배관이 전부를 막고 게이트 타당성은 마지막에 검증). P4 위반: D5가 명명한 규칙 2개가 구현 없음. P5 위반: 미정의 필드 2개를 담은 계약을 blocking으로 선언. |
| Alternatives Depth | **PASS** — 단, §6의 제3안 미검토. |
| Risk/Verification Rigor | **FAIL** — R10 산술적 비정합, R11 거짓 전제, R4 잘못된 표면 조준, 린터 롤백 경로 부재, AC#7/#10 제3자 검증 불가. |
| Deliberate Additions | **PARTIAL** — pre-mortem 3종은 실질적 대응책을 갖춘 계획의 최고 성과. 다만 fixture 스위트가 구조상 자기확인적(규칙 작성자가 자기 규칙을 걸리게 손수 변형한 10개)이고, rule set을 무효화할 수 있는 유일한 장치(`should-have-failed/`)가 빈 채로 출시되며 아무것도 그리로 라우팅되지 않는다. |

---

## 8. 다음 행동

1. **Stage 0를 돌린다** (반나절, genui-studio, 기존 도구). 세 수치를 이 문서에 기록.
2. 결과에 따라 분기 (§1의 해석 규칙).
3. 병행: MF-5의 ADR 기안 (Track B 게이팅용, Stage 0/Track A는 막지 않음).
4. Stage 0/1 통과 시 MF-2·3·4·6 반영 후 Track A 착수, ADR 승인 후 Track B 착수.
