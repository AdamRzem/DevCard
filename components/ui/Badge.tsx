import type { ReactNode } from "react";

type BadgeTone = "accent" | "cyan" | "success" | "neutral" | "warning";

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const toneClasses: Record<BadgeTone, string> = {
  accent:
    "border-[hsla(153_100%_69%_/_0.42)] bg-[hsla(153_100%_69%_/_0.14)] text-[hsl(153_96%_82%)]",
  cyan: "border-[hsla(26_84%_56%_/_0.42)] bg-[hsla(26_84%_56%_/_0.14)] text-[hsl(28_94%_78%)]",
  success:
    "border-[hsla(148_66%_49%_/_0.4)] bg-[hsla(148_66%_49%_/_0.14)] text-[hsl(148_74%_76%)]",
  neutral:
    "border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]",
  warning:
    "border-[hsla(36_92%_60%_/_0.44)] bg-[hsla(36_92%_60%_/_0.15)] text-[hsl(38_96%_78%)]",
};

function cn(...parts: Array<string | undefined | false>) {
  return parts.filter(Boolean).join(" ");
}

export function Badge({ children, tone = "accent", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-wide",
        toneClasses[tone],
        className,
      )}
    >
      {children}
    </span>
  );
}