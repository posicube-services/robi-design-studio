'use client';

import type { BlockProps } from 'src/genui/schema';

import { useState } from 'react';

import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

import { useFilterBinding } from 'src/genui/filter-context';

/**
 * @od-component SelectFilterBlock
 * @mui components=TextField(select)
 * @mui-minimal component=TableToolbar path=vendor/next-ts/src/sections/product/product-table-toolbar.tsx
 * @notes Dropdown filter in Minimal's table-toolbar idiom (the Stock/Publish
 *   selects on minimals.cc product list). With `bind` + `field` the selection
 *   PUBLISHES a field filter to the spec's filter bus; DataTable with the same
 *   bind key filters. First option should be an "all"/전체 no-op.
 * @posicube-minimal version=0.1.0
 */
type SelectOption = { value: string; label: string };

export function SelectFilterBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    label?: string;
    options?: SelectOption[];
    bind?: string;
    field?: string;
  };
  const options = props.options ?? [];
  const [value, setValue] = useState<string>(options[0]?.value ?? 'all');
  const { setFilter } = useFilterBinding(props.bind);

  const handleChange = (next: string) => {
    setValue(next);
    if (props.field) setFilter(props.field, next);
  };

  return (
    <TextField
      select
      label={props.label}
      value={value}
      onChange={(event) => handleChange(event.target.value)}
      sx={{ minWidth: 160 }}
    >
      {options.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
    </TextField>
  );
}
