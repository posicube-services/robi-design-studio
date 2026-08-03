/** Single source of truth for route paths — link through these, not literals. */
export const paths = {
  home: '/',
  /** Reference screen shipped with the seed; delete it with its page. */
  demo: '/demo',
  customers: '/customers',
  products: '/products',
} as const;
