/**
 * Barrel for the seed's component set.
 *
 * shadcn ships components as copy-in source rather than a package, so these are
 * ours to edit — that is the model, not a workaround. Every visual value
 * resolves to a design-system token through a Tailwind utility; there is no
 * local palette, which is what lets a brand switch change the whole app.
 */
export { Button, IconButton } from './button';
export type { ButtonProps, ButtonSize, ButtonVariant } from './button';
export { Card, CardBody, CardFooter, CardHeader } from './card';
export { Badge } from './badge';
export type { Tone } from './badge';
export { Avatar } from './avatar';
export { Checkbox, Field, FieldError, Input, Label, Radio, Select, Switch, Textarea } from './field';
export { Alert, EmptyState, Progress, Skeleton } from './feedback';
export { Table, TBody, TD, TH, THead, TR } from './table';
export { Tabs } from './tabs';
export type { TabItem } from './tabs';
export { Dialog } from './dialog';
export { StatCard } from './stat-card';
export { Breadcrumbs, PageHeader, Pagination } from './nav';
