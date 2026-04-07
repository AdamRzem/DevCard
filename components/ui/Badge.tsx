import type { ReactNode } from "react";

type BadgeTone = "accent" | "cyan" | "success" | "neutral" | "warning";

interface BadgeProps {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
}

const toneClasses: Record<BadgeTone, string> = {
  accent:
    "border-[hsla(265_90%_65%_/_0.4)] bg-[hsla(265_90%_65%_/_0.15)] text-[hsl(265_95%_78%)]",
  cyan: "border-[hsla(200_90%_60%_/_0.4)] bg-[hsla(200_90%_60%_/_0.15)] text-[hsl(200_92%_76%)]",
  success:
    "border-[hsla(150_80%_55%_/_0.4)] bg-[hsla(150_80%_55%_/_0.14)] text-[hsl(150_84%_74%)]",
  neutral:
    "border-[var(--color-border)] bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]",
  warning:
    "border-[hsla(38_92%_60%_/_0.4)] bg-[hsla(38_92%_60%_/_0.13)] text-[hsl(38_96%_75%)]",
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