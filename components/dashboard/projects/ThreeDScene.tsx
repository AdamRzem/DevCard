export function ThreeDScene() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(0,255,65,0.10),transparent_55%),radial-gradient(circle_at_72%_60%,rgba(255,69,0,0.12),transparent_58%)]" />
      <div className="absolute left-1/2 top-[28%] h-44 w-44 -translate-x-1/2 border border-[var(--color-accent)] bg-[rgba(255,69,0,0.08)] shadow-[0_0_40px_rgba(255,69,0,0.24)]">
        <div className="absolute inset-10 bg-[var(--color-accent)] shadow-[0_0_26px_rgba(255,69,0,0.5)]" />
      </div>
      <div className="absolute inset-x-0 bottom-[18%] h-px bg-[linear-gradient(90deg,transparent,rgba(255,69,0,0.45),transparent)]" />
    </div>
  );
}
