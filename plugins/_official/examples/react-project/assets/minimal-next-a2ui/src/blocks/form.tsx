'use client';

import type { BlockProps } from 'src/genui/schema';

import { z } from 'zod';
import { useMemo, useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';
import FormControl from '@mui/material/FormControl';
import Typography from '@mui/material/Typography';
import FormLabel from '@mui/material/FormLabel';
import FormHelperText from '@mui/material/FormHelperText';
import FormControlLabel from '@mui/material/FormControlLabel';

import { mutationRegistry } from 'src/genui/mutation-registry';

/**
 * @od-component FormBlock
 * @mui components=Card,TextField,Select,Switch,Button,Alert
 * @notes Form vocabulary. Fields are declared in `props.fields` (like DataTable
 *   declares `columns`), so the LLM emits one node — not a tree of field nodes.
 *   A zod schema is built from the field rules; react-hook-form validates.
 *   Submit has two modes: with `props.mutation` the values go through the
 *   mutation registry (real useMutation → store change → query invalidation →
 *   every bound block refreshes); without it, a local success summary only.
 * @posicube-minimal version=0.2.0
 */
type FieldType =
  | 'text'
  | 'textarea'
  | 'email'
  | 'password'
  | 'number'
  | 'select'
  | 'switch'
  | 'date'
  | 'file';

type FieldDef = {
  name: string;
  label: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  options?: { value: string; label: string }[];
  /** Minimum character count for string-backed fields (비밀번호 등). */
  minLength?: number;
  /** Name of another field this one must equal (비밀번호 확인). */
  matchField?: string;
};

type FormValues = Record<string, unknown>;

function buildSchema(fields: FieldDef[]): z.ZodTypeAny {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    const type = field.type ?? 'text';

    if (type === 'switch') {
      // A required switch is a consent toggle (약관 동의) — `false` must fail,
      // so `.optional()` alone would silently let an unchecked box through.
      shape[field.name] = field.required
        // Consent labels are full sentences ("…에 동의합니다"), so the message
        // must NOT interpolate the label — it would read twice.
        ? z.boolean().refine((value) => value === true, { message: '동의가 필요합니다' })
        : z.boolean().optional();
      continue;
    }

    if (type === 'number') {
      // Inputs are string-backed, so a required number must reject '' BEFORE
      // coercion — Number('') is 0, which would silently satisfy "required".
      shape[field.name] = field.required
        ? z
            .string()
            .min(1, `${field.label}은(는) 필수입니다`)
            .pipe(z.coerce.number({ message: `${field.label}은(는) 숫자여야 합니다` }))
        : z.union([z.literal(''), z.coerce.number()]).optional();
      continue;
    }

    // text | email | password | select | date — all string-backed.
    if (field.required) {
      let rule = z.string().min(1, `${field.label}은(는) 필수입니다`);
      if (type === 'email') rule = rule.email('올바른 이메일 형식이 아닙니다');
      if (field.minLength) {
        rule = rule.min(field.minLength, `${field.label}은(는) ${field.minLength}자 이상이어야 합니다`);
      }
      shape[field.name] = rule;
    } else if (type === 'email') {
      shape[field.name] = z.union([z.literal(''), z.string().email('올바른 이메일 형식이 아닙니다')]);
    } else if (field.minLength) {
      shape[field.name] = z.union([
        z.literal(''),
        z.string().min(field.minLength, `${field.label}은(는) ${field.minLength}자 이상이어야 합니다`),
      ]);
    } else {
      shape[field.name] = z.string().optional();
    }
  }

  const object = z.object(shape);

  // Cross-field rules (비밀번호 확인) can't live in the per-field shape — they
  // need both values, so they run once on the whole object.
  const matchRules = fields.filter((field) => field.matchField);
  if (matchRules.length === 0) return object;

  return object.superRefine((values, ctx) => {
    for (const field of matchRules) {
      const value = (values as FormValues)[field.name];
      const other = (values as FormValues)[field.matchField as string];
      // Empty is the "required" rule's business — don't double-report it.
      if (value === '' || value === undefined) continue;
      if (value !== other) {
        ctx.addIssue({
          code: 'custom',
          path: [field.name],
          message: `${field.label}이(가) 일치하지 않습니다`,
        });
      }
    }
  });
}

function defaultValuesFor(fields: FieldDef[]): FormValues {
  const values: FormValues = {};
  for (const field of fields) {
    values[field.name] = (field.type ?? 'text') === 'switch' ? false : '';
  }
  return values;
}

export function FormBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    title?: string;
    submitLabel?: string;
    fields?: FieldDef[];
    mutation?: string;
  };
  const fields = props.fields ?? [];

  const schema = useMemo(() => buildSchema(fields), [fields]);
  const defaultValues = useMemo(() => defaultValuesFor(fields), [fields]);
  const [submitted, setSubmitted] = useState<FormValues | null>(null);

  // Resolve the bound mutation by name (stable per node) and call the hook
  // unconditionally — same uniform contract as the data hooks. Whether it
  // RUNS is decided at submit time by `props.mutation`.
  // NOTE: safe while specs are static per mount. If specs ever hot-swap in
  // place, the renderer must key blocks by node.id + mutation so a changed
  // mutation name remounts this component (hooks-order safety).
  const useSubmitMutation = mutationRegistry[props.mutation ?? 'createCustomer'] ?? mutationRegistry.createCustomer;
  const submitMutation = useSubmitMutation();

  const {
    control,
    reset,
    handleSubmit,
    formState: { errors },
    // Schema is built at runtime from field defs, so its static input type is
    // `unknown` and can't line up with RHF's FieldValues — cast the schema arg.
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } = useForm<FormValues>({ resolver: zodResolver(schema as any), defaultValues });

  const onSubmit = (values: FormValues) => {
    if (props.mutation) {
      submitMutation.mutate(values, {
        onSuccess: () => {
          setSubmitted(values);
          reset(defaultValues);
        },
      });
    } else {
      setSubmitted(values);
    }
  };

  return (
    <Card>
      {props.title && (
        <>
          <CardHeader title={props.title} />
          <Divider />
        </>
      )}
      {/* A failed attempt clears the previous success banner — otherwise a stale
          "제출됨" sits above fresh field errors and reads as a contradiction. */}
      <Box
        component="form"
        onSubmit={handleSubmit(onSubmit, () => setSubmitted(null))}
        sx={{ p: 3 }}
      >
        <Stack spacing={2.5} sx={{ maxWidth: 560 }}>
          {submitted && (
            <Alert severity="success" onClose={() => setSubmitted(null)}>
              {props.mutation ? '저장되었습니다: ' : '제출됨: '}
              {summarize(submitted, fields)}
            </Alert>
          )}
          {props.mutation && submitMutation.isError && (
            <Alert severity="error">저장에 실패했습니다. 잠시 후 다시 시도해 주세요.</Alert>
          )}

          {fields.map((field) => (
            <Controller
              key={field.name}
              name={field.name}
              control={control}
              render={({ field: rhf }) =>
                renderField(field, rhf, errors[field.name]?.message as string | undefined)
              }
            />
          ))}

          <Box>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={Boolean(props.mutation) && submitMutation.isPending}
            >
              {props.mutation && submitMutation.isPending ? '저장 중…' : (props.submitLabel ?? '저장')}
            </Button>
          </Box>
        </Stack>
      </Box>
    </Card>
  );
}

type ControllerField = {
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  name: string;
};

function renderField(field: FieldDef, rhf: ControllerField, error?: string) {
  const type = field.type ?? 'text';

  if (type === 'switch') {
    // A required switch can fail validation (약관 동의), so it needs the same
    // visible error affordance the text inputs get — otherwise submit does
    // nothing and the user has no idea why.
    return (
      <FormControl error={Boolean(error)}>
        <FormControlLabel
          control={
            <Switch checked={Boolean(rhf.value)} onChange={(e) => rhf.onChange(e.target.checked)} />
          }
          label={
            <Typography variant="body2" sx={{ color: error ? 'error.main' : 'text.primary' }}>
              {field.label}
            </Typography>
          }
        />
        {error && <FormHelperText sx={{ mx: 0 }}>{error}</FormHelperText>}
      </FormControl>
    );
  }

  if (type === 'select') {
    return (
      <TextField
        select
        fullWidth
        label={field.label}
        value={(rhf.value as string) ?? ''}
        onChange={(e) => rhf.onChange(e.target.value)}
        onBlur={rhf.onBlur}
        error={Boolean(error)}
        helperText={error}
      >
        {(field.options ?? []).map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </TextField>
    );
  }

  if (type === 'file') {
    // Client-side picker — stores the selected filename (string) so it fits the
    // string-backed schema. Actual upload/storage is a backend follow-up.
    const filename = (rhf.value as string) ?? '';
    return (
      <FormControl error={Boolean(error)}>
        <FormLabel sx={{ typography: 'body2', mb: 1 }}>{field.label}</FormLabel>
        <Box
          sx={{
            p: 3,
            borderRadius: 1.5,
            border: (t) => `1px dashed ${t.palette.divider}`,
            textAlign: 'center',
            cursor: 'pointer',
            '&:hover': { bgcolor: 'action.hover' },
          }}
          component="label"
        >
          <input
            type="file"
            hidden
            onChange={(e) => rhf.onChange(e.target.files?.[0]?.name ?? '')}
          />
          <Typography variant="body2" sx={{ color: filename ? 'text.primary' : 'text.disabled' }}>
            {filename || (field.placeholder ?? '파일을 선택하거나 드래그하세요')}
          </Typography>
        </Box>
        {error && <FormHelperText>{error}</FormHelperText>}
      </FormControl>
    );
  }

  const inputType =
    type === 'number' || type === 'email' || type === 'password' || type === 'date' ? type : 'text';

  return (
    <TextField
      fullWidth
      type={inputType}
      autoComplete={type === 'password' ? 'new-password' : undefined}
      multiline={type === 'textarea'}
      minRows={type === 'textarea' ? 3 : undefined}
      label={field.label}
      placeholder={field.placeholder}
      value={(rhf.value as string) ?? ''}
      onChange={(e) => rhf.onChange(e.target.value)}
      onBlur={rhf.onBlur}
      error={Boolean(error)}
      helperText={error}
      InputLabelProps={type === 'date' ? { shrink: true } : undefined}
    />
  );
}

function summarize(values: FormValues, fields: FieldDef[]): string {
  // Secrets must never land in a rendered summary — mask them by field type.
  const secret = new Set(fields.filter((f) => f.type === 'password').map((f) => f.name));

  return Object.entries(values)
    .filter(([, value]) => value !== '' && value !== false && value != null)
    .map(([key, value]) => `${key}=${secret.has(key) ? '••••••••' : String(value)}`)
    .join(', ');
}
