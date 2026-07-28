import type { BlockProps } from 'src/genui/schema';

import Timeline from '@mui/lab/Timeline';
import TimelineDot from '@mui/lab/TimelineDot';
import Card from '@mui/material/Card';
import Divider from '@mui/material/Divider';
import TimelineItem from '@mui/lab/TimelineItem';
import Typography from '@mui/material/Typography';
import { timelineItemClasses } from '@mui/lab/TimelineItem';
import CardHeader from '@mui/material/CardHeader';
import TimelineContent from '@mui/lab/TimelineContent';
import TimelineConnector from '@mui/lab/TimelineConnector';
import TimelineSeparator from '@mui/lab/TimelineSeparator';

/**
 * @od-component TimelineBlock
 * @mui components=Timeline,TimelineItem,TimelineDot,TimelineContent
 * @notes Activity/history feed (주문 진행, 감사 로그, 변경 이력). Items are
 *   literal — each { title, time?, color? }. Left-aligned (Minimal admin
 *   convention) via timelineItemClasses.
 * @posicube-minimal version=0.1.0
 */
type DotColor = 'primary' | 'secondary' | 'info' | 'success' | 'warning' | 'error' | 'grey';
type TimelineEntry = { title?: string; time?: string; color?: DotColor };

export function TimelineBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as { title?: string; items?: TimelineEntry[] };
  const items = Array.isArray(props.items) ? props.items : [];

  return (
    <Card>
      {props.title && (
        <>
          <CardHeader title={props.title} sx={{ pb: 2.5 }} />
          <Divider />
        </>
      )}
      <Timeline
        sx={{
          m: 0,
          p: 3,
          [`& .${timelineItemClasses.root}:before`]: { flex: 0, padding: 0 },
        }}
      >
        {items.map((item, index) => (
          <TimelineItem key={index}>
            <TimelineSeparator>
              <TimelineDot color={item.color ?? 'primary'} />
              {index < items.length - 1 && <TimelineConnector />}
            </TimelineSeparator>
            <TimelineContent>
              <Typography variant="subtitle2">{item.title}</Typography>
              {item.time && (
                <Typography variant="caption" sx={{ color: 'text.disabled' }}>
                  {item.time}
                </Typography>
              )}
            </TimelineContent>
          </TimelineItem>
        ))}
      </Timeline>
    </Card>
  );
}
