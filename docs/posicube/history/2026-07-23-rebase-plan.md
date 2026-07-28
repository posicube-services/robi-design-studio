# robi-design-studio 재정비(re-fork) 계획

- 작성: 2026-07-23
- 대상: `fe-open-design-minimal-theme`(posicube-services) → 진짜 fork로 재정비 → `robi-design-studio`
- 근거 분석: 두 저장소 이력 단절 확인 + fe-minimal 커스텀 인벤토리 + upstream react/next 현황

---

## 1. 진단 — 현재는 fork가 아니다

| 증거 | 값 |
|---|---|
| fe-minimal ↔ open-design **공통 커밋 해시** | **0개** (이력 완전 단절) |
| fe-minimal 총 커밋 | 60 (전부 새 이력, `first commit`으로 시작) |
| open-design 총 커밋 | 11,884 |
| upstream remote | 없음 |

fe-minimal은 open-design v0.9.0 시점의 **파일 스냅샷 복사**다. `git fetch/merge`로 upstream 최신을 따라갈 수 없다(공통 조상 없음). 방치하면 갭이 계속 벌어진다.

## 2. upstream 현황 — 여전히 runnable React/Next 프로젝트를 못 만든다

- upstream(v0.11.1)의 "react-component" artifact = **단일 JSX 파일**을 CDN Babel로 iframe에서 in-browser eval. `package.json`·프로젝트 트리·dev-server·build **전무**. (`apps/web/src/runtime/react-component.ts`)
- upstream에 `react-scaffold.ts`/`react-build.ts`/`react-dev.ts` **없음**, minimal-next/vite seed **없음**.
- **결론: fork의 react-project 파이프라인은 upstream에 없는 진짜 value-add.** 재정비 시 upstream 위에 얹어야 하고(ADD), upstream 기여 후보이기도 하다.

## 3. 재정비 난이도 — **낮음** (커스텀이 ADD 위주, ADD:MODIFY ≈ 9:2)

"방대한 diff"의 정체: fork 수정이 아니라 **upstream의 v0.9.0→0.11.1 자체 진화**. 증거 — `apps/daemon/src/artifact-manifest.ts`가 두 저장소에서 **byte-for-byte 동일**(diff 결과 없음). upstream이 파일을 `artifacts/`·`media/`·`routes/` 등 하위 디렉토리로 재구성하고 ~25개 새 서브시스템을 추가했을 뿐, fork는 그 내용을 **한 줄도 안 고쳤다**.

## 4. 커스텀 인벤토리

### ADD — upstream에 없는 순수 추가 (fresh fork에 그대로 복사)
| 커스텀 | 경로 | 비고 |
|---|---|---|
| **react-project 파이프라인** | `apps/daemon/src/react-{scaffold,build,dev,framework,build-routes}.ts` | 핵심 value-add. 다중 파일 Next/Vite 스캐폴딩+dev+build |
| **seed trees** | `plugins/_official/examples/react-project/assets/{minimal-next,minimal-vite,scaffold,scaffold-next}` | react/next 프로젝트 시드 |
| **mui-packages/minimal** | `mui-packages/minimal/` (@minimal-kit/next-ts v7.6.1) | vendored 3rd-party, workspace 미등록(격리). 1808파일/16MB |
| **design-systems** | `design-systems/mui-minimal/`, `design-systems/untitled-ui/` | 디자인시스템 카탈로그 |
| **a2ui-spec 템플릿** | `design-templates/a2ui-spec/` | genui 스파이크에서 추가(88cbcb9) |
| **UI 컴포넌트** | `apps/web/src/components/{ReactBuildPanel,GenerationPreviewStage,OpenFileInEditorButton,ProjectDesignSystemPicker,WorkingDirPill}.tsx` | react-project UI 표면 |
| **genui 렌더 코어(스파이크)** | seed 내 `src/genui/*` + `src/blocks/*` + `src/authoring/` + `/a2ui` 라우트 | 커밋 b7482a0·88cbcb9·1088669 |
| **packages/contracts 타입** | `ReactScaffoldFramework/Variant/State` | react-project 계약 타입 |

### MODIFY — upstream에도 있는 파일 수정 (손으로 재적용, 작음)
| 위치 | 변경 | 재적용 |
|---|---|---|
| `apps/daemon/src/server.ts` | import 2줄 + call site 2줄 (`registerReactBuildRoutes`/`materializeReactScaffold`) | `registerTerminalRoutes` 옆에 upstream 현재 시그니처로 |
| `apps/web/src/components/{ProjectView,FileWorkspace,FileViewer}.tsx` | 새 패널 import/render | upstream 리팩터된 prop shape에 맞춰 |

## 5. 재정비 절차

1. GitHub에서 **nexu-io/open-design을 진짜 fork** → `posicube-services/robi-design-studio`
2. 로컬 clone + upstream remote: `git remote add upstream https://github.com/nexu-io/open-design.git`
3. **ADD 커스텀 복사** (§4 ADD 목록 그대로 — verbatim)
4. **MODIFY 훅 재적용** (§4 MODIFY, ~6곳)
5. **조율 필요(reconcile)** — 양쪽이 독립 진화한 같은 기능일 수 있음:
   - fork `ProjectDesignSystemPicker.tsx` ↔ upstream `DesignSystemPicker.tsx`
   - fork `WorkingDirPill.tsx` ↔ upstream `WorkingDirPicker.tsx`
   - upstream의 `design-systems/posicube-minimal/vendor/next-ts/` 빈 스텁 — fork의 mui-minimal과 이름 수렴 검토
6. **`server.ts` 등 대용량 파일은 통째 diff/merge 금지** — upstream 현재 버전에서 시작해 작은 훅만 얹기
7. 이후 `git fetch upstream && git rebase/merge upstream/main`으로 최신 추적

## 6. upstream 기여(반영) 후보 — "나중에라도 추가" 리스트

fork 커스텀 중 upstream에 역기여할 만한 유용 기능 (upstream AGENTS.md의 3-surface 규칙 준수: HTTP route + UI + `od` CLI 동시):
1. **react-project 파이프라인** — upstream이 못 하는 runnable Next/Vite 생성. 가장 유력한 기여 후보.
2. **mui-minimal 디자인시스템** — upstream `posicube-minimal` 스텁이 이미 있어 수렴 여지.
3. **a2ui-spec (Tier 1 hard-gated 렌더)** — genui 카탈로그 기반 일관 UI. robi 고유 가치라 기여보다 fork 유지 쪽일 수도.

## 7. 병행 follow-up (재정비와 별개)
- **Chart bar apexcharts 버전 pin** — vendored `src/components/chart` 래퍼의 apexcharts@5.15.0/react-apexcharts@1.9.0 비호환. drift 점검(1088669)에서 확인, genui 원인 아님.
- 합의 계획(Critic ITERATE)을 D7·D8로 갱신 — 셸/새탭/two-tier 반영.
- 디자인 규칙 린터(D5), Stage 0 생성기 일관성 실험.

## 8. 판정
재정비는 **지금이 적기**다. 커스텀이 60커밋·ADD 위주로 작고, ADD를 fresh fork에 복사 + MODIFY 6곳 재적용이면 된다. 커스텀이 커질수록(tier1·tier2·robiflow 연동) 비용이 불어나므로 미루지 않는 게 유리하다.
