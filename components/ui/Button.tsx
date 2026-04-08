"use client";

import Link from "next/link";
import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ReactNode,
} from "react";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "sm" | "md" | "lg";

type CommonProps = {
  children: ReactNode;
  variant?: ButtonVariant;
  size?: ButtonSize;
  className?: string;
};

type LinkButtonProps = CommonProps &
  Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "className"> & {
  href: string;
  disabled?: boolean;
};

type NativeButtonProps = CommonProps &
  Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "className"> & {
    href?: undefined;
  };

export type ButtonProps = LinkButtonProps | NativeButtonProps;

const variantClasses: Record<ButtonVariant, string> = {
  primary:
    "border-transparent bg-[var(--color-accent)] text-[hsl(222_20%_8%)] hover:-translate-y-px hover:bg-[var(--color-accent-hover)] hover:shadow-[var(--shadow-glow-sm)]",
  secondary:
    "border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-primary)] hover:-translate-y-px hover:border-[hsla(153_100%_69%_/_0.35)] hover:bg-[var(--color-bg-tertiary)]",
  ghost:
    "border-transparent bg-transparent text-[var(--color-text-secondary)] hover:bg-[var(--color-accent-soft)] hover:text-[var(--color-text-primary)]",
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-6 text-sm",
  lg: "h-12 px-8 text-base",
};

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

function buildClasses(variant: ButtonVariant, size: ButtonSize, className?: string) {
  return cn(
    "inline-flex items-center justify-center gap-2 rounded-full border font-semibold tracking-tight transition-[background-color,color,border-color,box-shadow,transform] duration-150 ease-[var(--ease-smooth)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-accent)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg-primary)] disabled:cursor-not-allowed disabled:opacity-60",
    variantClasses[variant],
    sizeClasses[size],
    className,
  );
}

function LinkButton({
  children,
  variant = "primary",
  size = "md",
  className,
  href,
  target,
  rel,
  disabled,
  onClick,
  tabIndex,
  ...linkProps
}: LinkButtonProps) {
  const classes = buildClasses(variant, size, className);
  const safeRel =
    target === "_blank"
      ? Array.from(
          new Set([...(rel?.split(" ").filter(Boolean) ?? []), "noopener", "noreferrer"]),
        ).join(" ")
      : rel;

  return (
    <Link
      href={href}
      target={target}
      rel={safeRel}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : tabIndex}
      className={cn(classes, disabled && "pointer-events-none opacity-60")}
      onClick={(event) => {
        if (disabled) {
          event.preventDefault();
          return;
        }
        onClick?.(event);
      }}
      {...linkProps}
    >
      {children}
    </Link>
  );
}

function NativeButton({
  children,
  variant = "primary",
  size = "md",
  className,
  type = "button",
  ...buttonProps
}: NativeButtonProps) {
  const classes = buildClasses(variant, size, className);

  return (
    <button type={type} className={classes} {...buttonProps}>
      {children}
    </button>
  );
}

export function Button(props: ButtonProps) {
  if ("href" in props && typeof props.href === "string") {
    return <LinkButton {...props} />;
  }

  const {
    variant = "primary",
    size = "md",
    className,
  } = props;

  return <NativeButton {...props} variant={variant} size={size} className={className} />;
}