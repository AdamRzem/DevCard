"use client";

import { Html } from "@react-three/drei";

interface ExhibitLabelProps {
  exhibitNumber: string;
  codeName: string;
  title: string;
  accentColor: string;
  award?: string;
}

export function ExhibitLabel({
  exhibitNumber,
  codeName,
  title,
  accentColor,
  award,
}: ExhibitLabelProps) {
  return (
    <Html center distanceFactor={7.5} position={[0, 2.15, 0]} transform>
      <div
        className="pointer-events-none rounded-md border border-[var(--color-border)] bg-[rgba(5,5,5,0.74)] px-3 py-2 text-center"
        style={{ boxShadow: "0 12px 30px rgba(0, 0, 0, 0.35)" }}
      >
        <div className="mx-auto mb-2 h-[2px] w-10" style={{ backgroundColor: accentColor }} />
        <p
          className="font-mono text-[9px] uppercase tracking-[0.18em]"
          style={{ color: accentColor }}
        >
          {exhibitNumber}
        </p>
        <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
          {codeName}
        </p>
        <p className="mt-1 text-[11px] font-semibold tracking-tight text-[var(--color-text-primary)]">
          {title}
        </p>
        {award ? (
          <p className="mt-1 text-[9px] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]">
            {award}
          </p>
        ) : null}
      </div>
    </Html>
  );
}
