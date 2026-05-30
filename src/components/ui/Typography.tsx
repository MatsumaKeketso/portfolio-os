import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '../../lib/utils';

export const typographyVariants = cva('', {
  variants: {
    variant: {
      display: 'os-type-display',
      title1: 'os-type-title-1',
      title2: 'os-type-title-2',
      title3: 'os-type-title-3',
      title4: 'os-type-title-4',
      body: 'os-type-body',
      bodyStrong: 'os-type-body-strong',
      secondary: 'os-type-secondary',
      caption: 'os-type-caption',
      label: 'os-type-label',
      menuTitle: 'os-type-menu-title',
      menuDescription: 'os-type-menu-description',
      windowTitle: 'os-type-window-title',
      value: 'os-type-value',
      code: 'os-type-code',
    },
    tone: {
      inherit: '',
      inverse: 'text-os-text-inverse',
      inverseMuted: 'text-os-text-inverse/55',
      inverseFaint: 'text-os-text-inverse/30',
      strong: 'text-os-text-strong',
      muted: 'text-os-text-muted',
      faint: 'text-os-text-faint',
      brand: 'text-fg-brand',
      success: 'text-fg-success',
      warning: 'text-fg-warning',
      error: 'text-fg-error',
      info: 'text-fg-info',
    },
    truncate: {
      true: 'truncate',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'body',
    tone: 'inherit',
    truncate: false,
  },
});

type TypographyElement = 'p' | 'span' | 'div' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6' | 'code';

export interface TypographyProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof typographyVariants> {
  as?: TypographyElement;
}

export const Typography = React.forwardRef<HTMLElement, TypographyProps>(
  ({ as: Component = 'p', className, variant, tone, truncate, ...props }, ref) => (
    React.createElement(Component, {
      ...props,
      ref,
      className: cn(typographyVariants({ variant, tone, truncate }), className),
    })
  )
);

Typography.displayName = 'Typography';
