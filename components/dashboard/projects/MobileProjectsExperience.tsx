"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

// import { ThreeDScene } from "@/components/dashboard/projects/ThreeDScene";
import { mobileProjects } from "@/lib/dashboard/projects";

interface DevicePreset {
  id: string;
  label: string;
  width: number;
  height: number;
}

const devicePresets: DevicePreset[] = [
  { id: "pixel-8", label: "PIXEL_8", width: 412, height: 915 },
  { id: "iphone-14", label: "IPHONE_14_PRO", width: 393, height: 852 },
  { id: "galaxy-s23", label: "GALAXY_S23", width: 360, height: 780 },
];

const bootLines = [
  "> SUBSYS: SCANNING_LIDAR_MESH...",
  "> DATA: VOXEL_DATA_STREAM_88.2kHz",
  "STATUS: GEOMETRY_ANALYSIS_COMPLETE",
  "ANALYSIS: High-density brutalist structure detected. Reinforcement patterns suggest mid-20th century seismic-resistant engineering. Volumetric mass exceeds 14,000 m3.",
  '"Ready for architectural interrogation. Awaiting your command parameter. What are you looking for?"',
];

function MobileHudScene({ sceneId }: { sceneId?: string }) {
  const [visibleBootLines, setVisibleBootLines] = useState(0);

  useEffect(() => {
    let active = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const revealLine = (index: number) => {
      if (!active || index >= bootLines.length) {
        return;
      }

      setVisibleBootLines(index + 1);
      timeoutId = setTimeout(() => revealLine(index + 1), 260 + index * 90);
    };

    timeoutId = setTimeout(() => revealLine(0), 200);

    return () => {
      active = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  const isSpeaking = visibleBootLines < bootLines.length;

  return (
    <section id={sceneId} className="relative h-full w-full overflow-hidden border border-[rgba(255,69,0,0.2)] bg-[color:rgb(5_5_5_/_0.98)]">
      <header className="relative z-20 flex items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-bg-primary)] px-6 py-4">
        <p className="font-mono text-[13px] font-bold uppercase tracking-[0.18em] text-[var(--color-accent)]">
          ARCHITECT&apos;S_ARCHIVE
        </p>
      </header>

      <div className="absolute inset-0 top-[58px] z-0 bg-[radial-gradient(circle_at_80%_18%,rgba(0,255,65,0.08),transparent_48%),radial-gradient(circle_at_35%_74%,rgba(255,69,0,0.12),transparent_54%),linear-gradient(160deg,#132f3a,#131d25_45%,#121419)]" />

      <div className="absolute left-6 top-24 z-10 space-y-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[color:rgb(0_255_65_/_0.62)]">
        <p>LAT: 40.7128 N</p>
        <p>LNG: 74.0060 W</p>
        <p>ALT: 432.0M</p>
      </div>

      <div className="absolute left-1/2 top-[34%] z-10 -translate-x-1/2 -translate-y-1/2">
        <div className="flex h-24 w-24 items-center justify-center rounded-full border border-[var(--color-accent)] bg-[rgba(255,69,0,0.14)] shadow-[0_0_34px_rgba(255,69,0,0.34)]">
          <div
            className={
              isSpeaking
                ? "h-12 w-12 rounded-full bg-[var(--color-accent)] animate-ai-orb-speaking"
                : "h-12 w-12 rounded-full bg-[var(--color-accent)] animate-ai-orb-idle"
            }
          />
        </div>
      </div>

      <div id="ai-diagnostics" className="absolute inset-x-0 bottom-20 z-20 h-[56%] border-t border-[rgba(255,69,0,0.34)] bg-[color:rgb(5_5_5_/_0.94)] px-6 pb-4 pt-4 backdrop-blur-xl">
        <div className="absolute inset-0 z-0 bg-[repeating-linear-gradient(to_bottom,transparent,transparent_3px,rgba(0,255,65,0.045)_3px,rgba(0,255,65,0.045)_4px)]" />

        <div className="relative z-10 flex h-full flex-col">
          <div className="mb-4 flex items-center justify-between">
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[var(--color-text-secondary)]">
              AI_GUIDE // CORE_DIAGNOSTICS_v4.2.0
            </p>
          </div>

          <div className="flex-1 space-y-2 overflow-y-auto font-mono text-[11px]">
            <p className="text-[color:rgb(229_226_225_/_0.46)]">{bootLines[0]}</p>
            <p className="text-[color:rgb(229_226_225_/_0.46)]">{bootLines[1]}</p>

            <p
              className="flex items-center gap-2 font-semibold uppercase text-[var(--color-signal)]"
              style={{
                opacity: visibleBootLines >= 3 ? 1 : 0,
                transform: visibleBootLines >= 3 ? "translateX(0)" : "translateX(-6px)",
                transition: "opacity 180ms ease-out, transform 180ms ease-out",
              }}
            >
              <span className="h-3 w-1 animate-pulse bg-[var(--color-signal)]" />
              {bootLines[2]}
            </p>

            <p
              className="border-l-2 border-[var(--color-accent)] bg-[rgba(229,226,225,0.08)] p-2 text-[color:rgb(229_226_225_/_0.9)]"
              style={{
                opacity: visibleBootLines >= 4 ? 1 : 0,
                transform: visibleBootLines >= 4 ? "translateX(0)" : "translateX(-6px)",
                transition: "opacity 180ms ease-out, transform 180ms ease-out",
              }}
            >
              <span className="mr-1 text-[var(--color-accent)]">ANALYSIS:</span>
              High-density brutalist structure detected. Reinforcement patterns suggest mid-20th century seismic-resistant engineering. Volumetric mass exceeds 14,000 m3.
            </p>

            <p
              className="italic text-[color:rgb(229_226_225_/_0.64)]"
              style={{
                opacity: visibleBootLines >= 5 ? 1 : 0,
                transform: visibleBootLines >= 5 ? "translateX(0)" : "translateX(-6px)",
                transition: "opacity 180ms ease-out, transform 180ms ease-out",
              }}
            >
              {bootLines[4]}
            </p>

            <div
              className="flex items-center gap-1"
              style={{
                opacity: visibleBootLines >= 5 ? 1 : 0,
                transition: "opacity 150ms ease-out",
              }}
            >
              <span className="text-[var(--color-signal)]">&gt;</span>
              <span className="h-4 w-2 animate-pulse bg-[var(--color-signal)]" />
            </div>
          </div>

          <div id="intent-protocol" className="mt-4 space-y-2">
            <p className="font-mono text-[8px] uppercase tracking-[0.16em] text-[var(--color-text-muted)]">
              SELECT_INTENT_PROTOCOL:
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button className="border border-[var(--color-border)] bg-[rgba(229,226,225,0.05)] px-3 py-3 text-left transition-colors duration-100 hover:border-[var(--color-accent)]">
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--color-accent)]">REQ: STRUCTURAL</p>
                <p className="mt-1 font-headline text-sm">Load blue-prints</p>
              </button>
              <button className="border border-[var(--color-border)] bg-[rgba(229,226,225,0.05)] px-3 py-3 text-left transition-colors duration-100 hover:border-[var(--color-accent)]">
                <p className="font-mono text-[9px] uppercase tracking-[0.12em] text-[var(--color-accent)]">REQ: THERMAL</p>
                <p className="mt-1 font-headline text-sm">Heat signature</p>
              </button>
            </div>
            <button className="flex w-full items-center justify-between border border-[rgba(255,69,0,0.28)] bg-[rgba(255,69,0,0.12)] px-4 py-3 text-left transition-colors duration-100 hover:bg-[rgba(255,69,0,0.2)]">
              <span className="font-headline text-sm font-semibold tracking-tight text-[var(--color-accent)]">
                INITIALIZE_FULL_VOICE_GUIDE
              </span>
              <span className="font-mono text-[12px] text-[var(--color-accent)]">||</span>
            </button>
          </div>
        </div>
      </div>

      <nav className="absolute inset-x-0 bottom-0 z-30 grid h-20 grid-cols-4 border-t border-[rgba(255,69,0,0.2)] bg-[var(--color-bg-primary)] px-2">
        <Link href="/dashboard/stats" className="flex flex-col items-center justify-center text-[color:rgb(229_226_225_/_0.44)] transition-colors duration-100 hover:text-[var(--color-text-primary)]">
          <span className="font-mono text-xs">■</span>
          <span className="mt-1 font-mono text-[10px] uppercase">Gallery</span>
        </Link>
        <Link href="/dashboard/stats" className="flex flex-col items-center justify-center text-[color:rgb(229_226_225_/_0.44)] transition-colors duration-100 hover:text-[var(--color-text-primary)]">
          <span className="font-mono text-xs">▦</span>
          <span className="mt-1 font-mono text-[10px] uppercase">Stats</span>
        </Link>
        <Link href="/dashboard/web" className="flex flex-col items-center justify-center text-[color:rgb(229_226_225_/_0.44)] transition-colors duration-100 hover:text-[var(--color-text-primary)]">
          <span className="font-mono text-xs">◎</span>
          <span className="mt-1 font-mono text-[10px] uppercase">Web</span>
        </Link>
        <Link href="/dashboard/mobile" aria-current="page" className="flex flex-col items-center justify-center text-[var(--color-signal)]">
          <span className="font-mono text-xs">▮</span>
          <span className="mt-1 font-mono text-[10px] uppercase">Mobile</span>
        </Link>
      </nav>
    </section>
  );
}

function DesktopHud() {
  const [presetId, setPresetId] = useState(devicePresets[0].id);
  const frameHostRef = useRef<HTMLDivElement>(null);
  const [frameHostSize, setFrameHostSize] = useState({ width: 620, height: 1260 });

  const activePreset = useMemo(
    () => devicePresets.find((preset) => preset.id === presetId) ?? devicePresets[0],
    [presetId],
  );

  useEffect(() => {
    if (!frameHostRef.current) {
      return;
    }

    const host = frameHostRef.current;
    const observer = new ResizeObserver((entries) => {
      const entry = entries[0]?.contentRect;
      if (!entry) {
        return;
      }

      setFrameHostSize((current) => {
        const widthChanged = Math.abs(current.width - entry.width) > 1;
        const heightChanged = Math.abs(current.height - entry.height) > 1;

        return widthChanged || heightChanged
          ? { width: entry.width, height: entry.height }
          : current;
      });
    });

    observer.observe(host);

    return () => observer.disconnect();
  }, []);

  const viewportScale = useMemo(() => {
    const availableWidth = Math.max(frameHostSize.width - 34, 280);
    const availableHeight = Math.max(frameHostSize.height - 92, 720);
    const widthScale = availableWidth / activePreset.width;
    const heightScale = availableHeight / activePreset.height;
    const fitScale = Math.min(widthScale, heightScale);
    return Math.min(1.4, fitScale * 1.4);
  }, [activePreset.height, activePreset.width, frameHostSize.height, frameHostSize.width]);

  const scaledFrameHeight = activePreset.height * viewportScale;

  return (
    <section className="relative z-10" id="android-frame">
      <div ref={frameHostRef} className="w-full border border-[var(--color-border)] bg-[var(--color-bg-primary)] p-4 shadow-[12px_12px_0_rgba(0,0,0,0.8)] min-h-[1350px]">
        <div className="mb-3 flex items-center justify-between gap-2 border-b border-[var(--color-border)] pb-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--color-signal)]">
            DEVICE_SIMULATOR
          </p>
          <label className="sr-only" htmlFor="mobile-device-preset">
            Device preset
          </label>
          <select
            id="mobile-device-preset"
            value={presetId}
            onChange={(event) => setPresetId(event.target.value)}
            className="border border-[var(--color-border)] bg-[var(--color-bg-secondary)] px-2 py-1 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-secondary)]"
          >
            {devicePresets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.label}
              </option>
            ))}
          </select>
        </div>

        <div className="relative mx-auto w-full" style={{ height: `${Math.max(scaledFrameHeight + 52, 920)}px` }}>
          <div className="absolute inset-x-0 top-0 flex justify-center">
            <div
              className="origin-top"
              style={{
                width: `${activePreset.width}px`,
                height: `${activePreset.height}px`,
                transform: `scale(${viewportScale})`,
              }}
            >
              <div className="h-full w-full rounded-[34px] border border-[var(--color-border)] bg-[color:rgb(0_0_0_/_0.92)] p-2">
                <div className="h-full overflow-hidden rounded-[28px] border border-[var(--color-border)] bg-[var(--color-bg-secondary)]">
                  <MobileHudScene sceneId="mobile-scene" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-text-muted)]">
          VIEWPORT: {activePreset.width}x{activePreset.height} CSS PX
        </p>
      </div>
    </section>
  );
}

export function MobileProjectsExperience() {
  return (
    <section className="relative space-y-6 overflow-hidden">
      {/* <ThreeDScene projects={mobileProjects} sceneLabel="MOBILE_GALLERY" /> */}

      <section className="scroll-mt-28">
        <div className="lg:hidden">
          <div className="h-[calc(100dvh-11rem)] min-h-[760px]">
            <MobileHudScene />
          </div>
        </div>

        <div className="hidden lg:block">
          <DesktopHud />
        </div>
      </section>
    </section>
  );
}
