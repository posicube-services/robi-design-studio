'use client';

import type { BlockProps } from 'src/genui/schema';

import { useState, Children } from 'react';

import Box from '@mui/material/Box';
import Step from '@mui/material/Step';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Stepper from '@mui/material/Stepper';
import StepLabel from '@mui/material/StepLabel';

/**
 * @od-component StepperBlock
 * @mui components=Stepper,Step,StepLabel,Button
 * @notes Multi-step wizard. N labels + N children — the n-th child renders in
 *   the n-th step, with 이전/다음 navigation. Use for 온보딩, 다단계 등록 폼,
 *   설정 마법사. Local step state (like Tabs, but sequential).
 * @posicube-minimal version=0.1.0
 */
export function StepperBlock({ node, children }: BlockProps) {
  const props = (node.props ?? {}) as { labels?: string[]; finishLabel?: string };
  const panels = Children.toArray(children);
  const labels = panels.map((_, index) => props.labels?.[index] ?? `단계 ${index + 1}`);
  const [active, setActive] = useState(0);
  const lastStep = panels.length - 1;

  return (
    <Card sx={{ p: 3 }}>
      <Stepper activeStep={active} alternativeLabel sx={{ mb: 4 }}>
        {labels.map((label) => (
          <Step key={label}>
            <StepLabel>{label}</StepLabel>
          </Step>
        ))}
      </Stepper>

      <Box sx={{ minHeight: 120 }}>{panels[active]}</Box>

      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
        <Button
          color="inherit"
          variant="outlined"
          disabled={active === 0}
          onClick={() => setActive((prev) => Math.max(0, prev - 1))}
        >
          이전
        </Button>
        {active < lastStep ? (
          <Button variant="contained" onClick={() => setActive((prev) => Math.min(lastStep, prev + 1))}>
            다음
          </Button>
        ) : (
          <Button variant="contained" color="primary">
            {props.finishLabel ?? '완료'}
          </Button>
        )}
      </Box>
    </Card>
  );
}
