'use client';

import type { BlockProps } from 'src/genui/schema';

import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';
import { useFilterBinding } from 'src/genui/filter-context';

/**
 * @od-component SearchFieldBlock
 * @mui components=TextField,InputAdornment
 * @mui-minimal component=TableToolbar path=vendor/next-ts/src/sections/user/user-table-toolbar.tsx
 * @notes Search input in Minimal's table-toolbar idiom: full-size field with a
 *   leading eva:search-fill icon in text.disabled. With a `bind` key it
 *   PUBLISHES its term to the spec's filter bus — any DataTable subscribed to
 *   the same key filters live. Without `bind` it stays a visual affordance.
 * @posicube-minimal version=0.3.0
 */
export function SearchFieldBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as { placeholder?: string; bind?: string };
  const { search, setSearch } = useFilterBinding(props.bind);

  return (
    <TextField
      fullWidth
      placeholder={props.placeholder ?? '검색...'}
      value={search}
      onChange={(event) => setSearch(event.target.value)}
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              <Iconify icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          ),
        },
      }}
      sx={{ maxWidth: { sm: 420 } }}
    />
  );
}
