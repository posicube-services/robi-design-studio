import type { BlockComponent } from './schema';

import { BoxBlock } from 'src/blocks/box';
import { GridBlock } from 'src/blocks/grid';
import { ListBlock } from 'src/blocks/list';
import { PageBlock } from 'src/blocks/page';
import { ChipBlock } from 'src/blocks/chip';
import { FormBlock } from 'src/blocks/form';
import { TabsBlock } from 'src/blocks/tabs';
import { AlertBlock } from 'src/blocks/alert';
import { ChartBlock } from 'src/blocks/chart';
import { BannerBlock } from 'src/blocks/banner';
import { RatingBlock } from 'src/blocks/rating';
import { InvoiceBlock } from 'src/blocks/invoice';
import { StepperBlock } from 'src/blocks/stepper';
import { TimelineBlock } from 'src/blocks/timeline';
import { AnalyticsWidgetBlock } from 'src/blocks/analytics-widget';
import { StackBlock } from 'src/blocks/stack';
import { AvatarBlock } from 'src/blocks/avatar';
import { ButtonBlock } from 'src/blocks/button';
import { DividerBlock } from 'src/blocks/divider';
import { KeyValueBlock } from 'src/blocks/key-value';
import { StatCardBlock } from 'src/blocks/stat-card';
import { AccordionBlock } from 'src/blocks/accordion';
import { DataTableBlock } from 'src/blocks/data-table';
import { PageHeaderBlock } from 'src/blocks/page-header';
import { TypographyBlock } from 'src/blocks/typography';
import { FilterChipsBlock } from 'src/blocks/filter-chips';
import { SearchFieldBlock } from 'src/blocks/search-field';
import { SelectFilterBlock } from 'src/blocks/select-filter';
import { StatCardRowBlock } from 'src/blocks/stat-card-row';
import { LinearProgressBlock } from 'src/blocks/progress';

/**
 * @od-component genui/registry
 * @notes The component vocabulary. Maps a spec node `type` → a curated
 *   MUI/Minimal block. THIS is the design-consistency boundary: the LLM may
 *   only compose these keys, and each block owns how it looks.
 *
 *   Two layers mirror the catalog: pattern blocks (composed screens) and
 *   primitive blocks (free composition inside Minimal's prop domains).
 * @posicube-minimal version=0.2.0
 */
export const registry: Record<string, BlockComponent> = {
  // pattern layer
  Page: PageBlock,
  PageHeader: PageHeaderBlock,
  SearchField: SearchFieldBlock,
  FilterChips: FilterChipsBlock,
  StatCardRow: StatCardRowBlock,
  StatCard: StatCardBlock,
  DataTable: DataTableBlock,
  Form: FormBlock,
  KeyValue: KeyValueBlock,
  Chart: ChartBlock,
  SelectFilter: SelectFilterBlock,
  AnalyticsWidget: AnalyticsWidgetBlock,
  Timeline: TimelineBlock,
  Stepper: StepperBlock,
  Invoice: InvoiceBlock,
  Rating: RatingBlock,
  Banner: BannerBlock,

  // primitive layer
  Stack: StackBlock,
  Grid: GridBlock,
  Box: BoxBlock,
  Typography: TypographyBlock,
  Button: ButtonBlock,
  Chip: ChipBlock,
  Alert: AlertBlock,
  Avatar: AvatarBlock,
  Divider: DividerBlock,
  LinearProgress: LinearProgressBlock,
  Tabs: TabsBlock,
  Accordion: AccordionBlock,
  List: ListBlock,
};
