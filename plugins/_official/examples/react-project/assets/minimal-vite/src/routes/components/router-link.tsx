import type { LinkProps } from 'react-router-dom';

import { forwardRef } from 'react';
import { Link } from 'react-router-dom';

// ----------------------------------------------------------------------

/**
 * react-router-dom Link adapter that accepts an `href` prop like next/link,
 * forwarding it to react-router's `to`.
 */
export type RouterLinkProps = Omit<LinkProps, 'to'> & {
  href: string;
};

export const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  ({ href, ...other }, ref) => <Link ref={ref} to={href} {...other} />
);

RouterLink.displayName = 'RouterLink';
