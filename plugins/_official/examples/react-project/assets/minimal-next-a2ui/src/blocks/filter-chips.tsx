'use client';

import type { BlockProps } from 'src/genui/schema';

import { useState, useEffect } from 'react';

import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';

import { useFilterBinding } from 'src/genui/filter-context';

/**
 * @od-component FilterChipsBlock
 * @mui components=Stack,Chip
 * @notes Status filter chips. With `bind` + `field` the selection PUBLISHES a
 *   field filter to the spec's filter bus (value "all" clears it); without
 *   them it keeps purely local selection state. Filled selected / outlined
 *   idle (solid palette colors, no rgba fills — starter chip rule).
 * @posicube-minimal version=0.2.0
 */
type FilterOption = { value: string; label: string };

export function FilterChipsBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as { options?: FilterOption[]; bind?: string; field?: string };
  const options = props.options ?? [];
  const [selected, setSelected] = useState<string>(options[0]?.value ?? '');
  const { setFilter } = useFilterBinding(props.bind);
  const field = props.field;

  // Publish the INITIAL selection too — if a spec's first option isn't "all",
  // the visually-selected chip must actually filter the bound table from the
  // first paint, not only after a click.
  const initialValue = options[0]?.value;
  useEffect(() => {
    if (field && initialValue && initialValue !== 'all') {
      setFilter(field, initialValue);
    }
  }, [field, initialValue, setFilter]);

  const handleSelect = (value: string) => {
    setSelected(value);
    if (field) setFilter(field, value);
  };

  return (
    <Stack direction="row" spacing={1} useFlexGap sx={{ flexWrap: 'wrap', alignItems: 'center' }}>
      {options.map((option) => {
        const isSelected = option.value === selected;
        return (
          <Chip
            key={option.value}
            label={option.label}
            clickable
            color={isSelected ? 'primary' : 'default'}
            // Minimal idiom: selected = solid filled, idle = soft (light fill,
            // strong text) — outlined idle read as "form control", not filter.
            variant={isSelected ? 'filled' : 'soft'}
            onClick={() => handleSelect(option.value)}
          />
        );
      })}
    </Stack>
  );
}
