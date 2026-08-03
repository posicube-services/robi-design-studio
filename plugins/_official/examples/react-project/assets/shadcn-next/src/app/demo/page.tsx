'use client';

import { useState } from 'react';
import { Package, TrendingUp, Users } from 'lucide-react';
import { DashboardLayout } from 'src/layouts/dashboard';
import { useCustomers } from 'src/lib/react-query/hooks/use-customers';
import { statusTone, fmt } from 'src/lib/cn';
import {
  Badge,
  Button,
  Card,
  CardHeader,
  Dialog,
  EmptyState,
  PageHeader,
  Skeleton,
  StatCard,
  Table,
  TBody,
  TD,
  TH,
  THead,
  TR,
} from 'src/ui';
import type { Tone } from 'src/ui';

/**
 * Reference screen, parked at `/demo` rather than `/`.
 *
 * It sits off the landing route on purpose: `/` is what the workspace preview
 * loads, so a demo living there means a run asked for a signup screen shows a
 * dashboard until the agent replaces it. Here it stays readable as an example
 * without ever being mistaken for the deliverable.
 *
 * What it is worth copying for: every visual value comes from the active design
 * system's tokens through a Tailwind utility, and screens are composed from
 * `src/ui` rather than from raw markup. Delete it once the real screens exist.
 */
export default function DemoPage() {
  const { data: customers = [], isLoading } = useCustomers();
  const [inviting, setInviting] = useState(false);

  return (
    <DashboardLayout
      brand="Acme"
      activeHref="/demo"
      sections={[
        {
          items: [
            { label: '대시보드', href: '/demo', icon: <TrendingUp className="size-4" /> },
            { label: '고객', href: '/customers', icon: <Users className="size-4" /> },
            { label: '제품', href: '/products', icon: <Package className="size-4" /> },
          ],
        },
      ]}
      topBarRight={<Button size="sm" onClick={() => setInviting(true)}>고객 초대</Button>}
    >
      <PageHeader title="대시보드" subtitle="이번 달 핵심 지표" />

      <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <StatCard label="고객" value={fmt.number(customers.length)} delta={12.4} icon={<Users className="size-5" />} />
        <StatCard label="월 매출" value={fmt.currency(48200000)} delta={3.1} icon={<TrendingUp className="size-5" />} />
        <StatCard label="활성 제품" value="24" delta={-1.8} icon={<Package className="size-5" />} />
      </div>

      <Card>
        <CardHeader title="최근 고객" subtitle="가입 순" />
        {isLoading ? (
          <div className="space-y-2 px-6 pb-6">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : customers.length === 0 ? (
          <EmptyState title="아직 고객이 없습니다" description="첫 고객을 초대해 시작하세요." action={<Button onClick={() => setInviting(true)}>고객 초대</Button>} />
        ) : (
          <Table>
            <THead>
              <TR>
                <TH>이름</TH>
                <TH>회사</TH>
                <TH>상태</TH>
                <TH align="right">MRR</TH>
              </TR>
            </THead>
            <TBody>
              {customers.slice(0, 6).map((c) => (
                <TR key={c.id}>
                  <TD>{c.name}</TD>
                  <TD>{c.company}</TD>
                  <TD>
                    <Badge tone={statusTone(c.status) as Tone}>{c.status}</Badge>
                  </TD>
                  <TD align="right">{fmt.currency(c.mrr)}</TD>
                </TR>
              ))}
            </TBody>
          </Table>
        )}
      </Card>

      <Dialog
        open={inviting}
        onClose={() => setInviting(false)}
        title="고객 초대"
        footer={
          <>
            <Button variant="secondary" onClick={() => setInviting(false)}>취소</Button>
            <Button onClick={() => setInviting(false)}>보내기</Button>
          </>
        }
      >
        <p className="m-0 text-sm text-fg-2">
          초대 메일을 보낼 주소를 입력하세요. 이 다이얼로그는 네이티브 <code className="font-mono">&lt;dialog&gt;</code>라
          포커스 트랩과 Esc 닫기가 기본으로 동작합니다.
        </p>
      </Dialog>
    </DashboardLayout>
  );
}
