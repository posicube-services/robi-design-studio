import Link from 'next/link';

/**
 * Landing page. Deliberately thin: this seed's deliverable is the `/a2ui` route,
 * which renders `a2ui-spec.json`. The MUI seed shipped a full demo dashboard
 * here, which mostly served to exercise components the agent must not write by
 * hand anyway.
 */
export default function Page() {
  return (
    <main className="mx-auto flex max-w-(--container-max) flex-col gap-6 px-6 py-12">
      <h1 className="m-0 font-display text-3xl leading-tight tracking-display text-fg">
        A2UI 프로젝트
      </h1>
      <p className="m-0 max-w-prose text-base text-fg-2">
        화면은 <code className="font-mono text-sm">a2ui-spec.json</code>에 스펙으로 기술되고,
        고정 카탈로그의 블록으로 렌더됩니다. 색·타입·간격·radius는 활성 디자인 시스템의
        토큰에서 옵니다.
      </p>
      <Link
        href="/a2ui"
        className="inline-flex w-fit items-center rounded-md bg-accent px-4 py-2 text-sm text-accent-on transition-colors duration-fast ease-standard hover:bg-accent-hover"
      >
        /a2ui 화면 보기
      </Link>
    </main>
  );
}
