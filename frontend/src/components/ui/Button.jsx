import { Link } from 'react-router-dom';
import { cn } from '../../lib/format';

const VARIANTS = {
  primary:
    'bg-ink text-canvas hover:bg-white disabled:bg-line-strong disabled:text-muted shadow-[0_1px_0_0_rgba(255,255,255,0.6)_inset]',
  accent:
    'bg-accent text-white hover:bg-accent-soft disabled:bg-line-strong disabled:text-muted shadow-glow',
  secondary: 'border border-line-strong bg-elevated text-ink hover:border-white/25 hover:bg-white/[0.06]',
  ghost: 'text-muted hover:text-ink hover:bg-white/[0.05]',
  danger: 'border border-bad/40 text-bad hover:bg-bad-dim',
};

const SIZES = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-12 px-6 text-[0.95rem] gap-2',
};

export function Button({
  as,
  to,
  href,
  variant = 'primary',
  size = 'md',
  className,
  children,
  ...props
}) {
  const classes = cn(
    'inline-flex select-none items-center justify-center rounded-xl font-medium transition-all duration-200 focus-ring active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100',
    VARIANTS[variant],
    SIZES[size],
    className,
  );

  if (to) {
    return (
      <Link to={to} className={classes} {...props}>
        {children}
      </Link>
    );
  }
  if (href) {
    return (
      <a href={href} className={classes} {...props}>
        {children}
      </a>
    );
  }
  const Component = as ?? 'button';
  return (
    <Component className={classes} {...props}>
      {children}
    </Component>
  );
}
