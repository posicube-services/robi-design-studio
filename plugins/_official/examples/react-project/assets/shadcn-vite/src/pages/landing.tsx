import { Link } from 'react-router-dom';

import { paths } from '../routes/paths';

/**
 * Landing route — deliberately thin.
 *
 * This is what the workspace preview loads, so it must not show a screen the
 * user did not ask for. REPLACE it with the brief's real entry screen; the
 * reference dashboard lives at `/demo` until you delete it.
 */
export function LandingPage() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-(--container-max) flex-col justify-center gap-5 px-6 py-16">
      <h1 className="m-0 font-display text-3xl leading-tight tracking-display text-fg">
        프로젝트 준비 완료
      </h1>
      <p className="m-0 max-w-prose text-base text-fg-2">
        Vite + React · shadcn + Tailwind v4. 색·타입·간격·radius는 활성 디자인 시스템의
        토큰에서 오고, 화면은 <code className="font-mono text-sm">src/ui</code>의 컴포넌트로
        조립합니다.
      </p>
      <Link
        to={paths.demo}
        className="inline-flex w-fit items-center rounded-md border border-border px-4 py-2 text-sm text-fg transition-colors duration-fast ease-standard hover:bg-surface-warm"
      >
        컴포넌트 참고 화면 보기 →
      </Link>
    </main>
  );
}
