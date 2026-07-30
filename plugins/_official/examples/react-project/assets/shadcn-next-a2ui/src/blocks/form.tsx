'use client';

import type { BlockProps } from 'src/genui/schema';
import { useMemo, useState } from 'react';
import { z } from 'zod';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

import { useMutationHandlers } from 'src/genui/mutation-registry';
import { Button, Card, CardHeader } from 'src/ui/primitives';
import { paletteVar } from 'src/lib/tokens';

/**
 * @od-component FormBlock
 * @notes Fields are declared in `props.fields` (like DataTable declares
 *   `columns`), so the LLM emits ONE node rather than a tree of field nodes. A
 *   zod schema is compiled from the field rules and react-hook-form validates.
 *   With `props.mutation` the values go through the mutation registry; without
 *   one, submit is preview-only.
 */
type FieldType = 'text' | 'textarea' | 'email' | 'password' | 'number' | 'select' | 'switch' | 'date' | 'file';

type FieldDef = {
  name?: string;
  label?: string;
  type?: FieldType;
  required?: boolean;
  placeholder?: string;
  minLength?: number;
  matchField?: string;
  options?: { value?: string; label?: string }[];
};

type Values = Record<string, unknown>;

function buildSchema(fields: FieldDef[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    const name = field.name;
    if (!name) continue;
    const label = field.label ?? name;
    const type = field.type ?? 'text';

    if (type === 'switch') {
      // A required switch is a consent toggle (약관 동의) — `false` must fail, so
      // `.optional()` alone would silently let an unchecked box through.
      shape[name] = field.required
        ? z.boolean().refine((v) => v === true, { message: '동의가 필요합니다' })
        : z.boolean().optional();
      continue;
    }

    if (type === 'number') {
      shape[name] = field.required
        ? z
            .string()
            .min(1, `${label}은(는) 필수입니다`)
            .pipe(z.coerce.number({ message: `${label}은(는) 숫자여야 합니다` }))
        : z.union([z.literal(''), z.coerce.number()]);
      continue;
    }

    // text | textarea | email | password | select | date | file — string-backed.
    if (field.required) {
      let rule = z.string().min(1, `${label}은(는) 필수입니다`);
      if (type === 'email') rule = rule.email('올바른 이메일 형식이 아닙니다');
      if (field.minLength) {
        rule = rule.min(field.minLength, `${label}은(는) ${field.minLength}자 이상이어야 합니다`);
      }
      shape[name] = rule;
    } else if (type === 'email') {
      shape[name] = z.union([z.literal(''), z.string().email('올바른 이메일 형식이 아닙니다')]);
    } else if (field.minLength) {
      shape[name] = z.union([
        z.literal(''),
        z.string().min(field.minLength, `${label}은(는) ${field.minLength}자 이상이어야 합니다`),
      ]);
    } else {
      shape[name] = z.string().optional();
    }
  }

  const object = z.object(shape);

  // Cross-field rules (비밀번호 확인) need both values, so they run once on the
  // whole object rather than inside a per-field schema.
  const matchRules = fields.filter((f) => f.matchField && f.name);
  if (matchRules.length === 0) return object;

  return object.superRefine((values, ctx) => {
    for (const field of matchRules) {
      const value = (values as Values)[field.name!];
      const other = (values as Values)[field.matchField!];
      // Empty is the required rule's business — don't double-report it.
      if (value === '' || value === undefined) continue;
      if (value !== other) {
        ctx.addIssue({ code: 'custom', path: [field.name!], message: `${field.label ?? field.name}이(가) 일치하지 않습니다` });
      }
    }
  });
}

export function FormBlock({ node }: BlockProps) {
  const props = (node.props ?? {}) as {
    title?: string; submitLabel?: string; mutation?: string; fields?: FieldDef[];
  };
  const fields = Array.isArray(props.fields) ? props.fields : [];
  const mutations = useMutationHandlers();
  const [submitted, setSubmitted] = useState<Values | null>(null);

  const schema = useMemo(() => buildSchema(fields), [fields]);
  const {
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema as never), mode: 'onSubmit' });

  function onSubmit(values: Values) {
    setSubmitted(values);
    if (props.mutation) mutations[props.mutation]?.(values);
  }

  return (
    <Card>
      <CardHeader title={props.title} />
      {/* A failed attempt clears the previous success banner — otherwise a stale
          "제출됨" sits above fresh field errors and reads as a contradiction. */}
      <form onSubmit={handleSubmit(onSubmit, () => setSubmitted(null))} className="flex flex-col gap-5 px-6 pb-6">
        {submitted ? (
          <p
            className="m-0 rounded-md px-4 py-3 text-sm"
            style={{
              background: `color-mix(in oklab, ${paletteVar('success')} 12%, transparent)`,
              color: paletteVar('success'),
            }}
          >
            {props.mutation ? '저장되었습니다: ' : '제출됨: '}
            {summarize(submitted, fields)}
          </p>
        ) : null}

        {fields.map((field) => {
          const name = field.name;
          if (!name) return null;
          const error = errors[name]?.message as string | undefined;
          return (
            <Controller
              key={name}
              name={name}
              control={control}
              defaultValue={field.type === 'switch' ? false : ''}
              render={({ field: rhf }) => renderField(field, rhf, error)}
            />
          );
        })}

        <Button disabled={isSubmitting} className="w-fit">
          {isSubmitting ? '저장 중…' : (props.submitLabel ?? '저장')}
        </Button>
      </form>
    </Card>
  );
}

type ControllerField = {
  value: unknown;
  onChange: (value: unknown) => void;
  onBlur: () => void;
  name: string;
};

const INPUT =
  'w-full rounded-md border border-border bg-surface px-3 py-2 text-sm text-fg '
  + 'outline-none placeholder:text-meta focus-visible:shadow-focus-ring';

function renderField(field: FieldDef, rhf: ControllerField, error?: string) {
  const type = field.type ?? 'text';
  const label = field.label ?? field.name ?? '';
  const danger = paletteVar('error');

  if (type === 'switch') {
    return (
      <span className="flex flex-col gap-1">
        <label className="flex items-center gap-3 text-sm" style={error ? { color: danger } : undefined}>
          <input
            type="checkbox"
            checked={Boolean(rhf.value)}
            onChange={(e) => rhf.onChange(e.target.checked)}
            className="size-4 accent-accent"
          />
          <span>{label}</span>
        </label>
        {error ? <span className="text-xs" style={{ color: danger }}>{error}</span> : null}
      </span>
    );
  }

  const control =
    type === 'textarea' ? (
      <textarea
        value={String(rhf.value ?? '')}
        onChange={(e) => rhf.onChange(e.target.value)}
        onBlur={rhf.onBlur}
        placeholder={field.placeholder ?? ''}
        rows={4}
        className={INPUT}
      />
    ) : type === 'select' ? (
      <select
        value={String(rhf.value ?? '')}
        onChange={(e) => rhf.onChange(e.target.value)}
        onBlur={rhf.onBlur}
        className={INPUT}
      >
        <option value="">{field.placeholder ?? '선택'}</option>
        {(field.options ?? []).map((option, i) => (
          <option key={i} value={option.value ?? ''}>
            {option.label ?? option.value ?? ''}
          </option>
        ))}
      </select>
    ) : (
      <input
        type={type === 'number' || type === 'email' || type === 'password' || type === 'date' || type === 'file' ? type : 'text'}
        {...(type === 'password' ? { autoComplete: 'new-password' } : {})}
        value={type === 'file' ? undefined : String(rhf.value ?? '')}
        onChange={(e) => rhf.onChange(type === 'file' ? e.target.files?.[0]?.name ?? '' : e.target.value)}
        onBlur={rhf.onBlur}
        placeholder={field.placeholder ?? ''}
        className={INPUT}
      />
    );

  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-xs text-meta">
        {label}
        {field.required ? <span style={{ color: danger }}> *</span> : null}
      </span>
      {control}
      {error ? <span className="text-xs" style={{ color: danger }}>{error}</span> : null}
    </label>
  );
}

function summarize(values: Values, fields: FieldDef[]): string {
  // Secrets must never land in a rendered summary — mask them by field type.
  const secret = new Set(fields.filter((f) => f.type === 'password' && f.name).map((f) => f.name));
  return Object.entries(values)
    .filter(([, v]) => v !== '' && v !== undefined)
    .map(([k, v]) => `${k}=${secret.has(k) ? '••••••••' : String(v)}`)
    .join(', ');
}
