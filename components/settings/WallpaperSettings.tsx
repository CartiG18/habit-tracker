"use client";

import { useRef, useState } from "react";
import { useIcons } from "@/lib/theme-context";
import toast from "react-hot-toast";
import { cn } from "@/lib/utils";
import { useCopy } from "@/lib/copy";
import { useWallpaper, WallpaperSource } from "@/lib/wallpaper-context";
import type { WallpaperFit } from "@/lib/themes/wallpaper";

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

// ─── Slider ───────────────────────────────────────────────────────────────────

interface SliderProps {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  display: string;
  onChange: (v: number) => void;
}

function Slider({ label, value, min, max, step, display, onChange }: SliderProps) {
  return (
    <label className="block">
      <span className="flex justify-between font-theme text-sm text-th-text-secondary mb-1">
        <span>{label}</span>
        <span className="tabular-nums">{display}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-7 accent-th-primary cursor-pointer"
      />
    </label>
  );
}

// ─── Wallpaper Settings ───────────────────────────────────────────────────────

/** Upload / choose / adjust the app wallpaper. Soft-base themes only (retro keeps its CRT). */
export default function WallpaperSettings() {
  const copy = useCopy();
  const Icons = useIcons();
  const { source, customImage, activeImage, adjust, hasThemeWallpaper, setSource, setAdjust, resetAdjust, uploadImage } = useWallpaper();
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const drag = useRef<{ startX: number; startY: number; x: number; y: number; w: number; h: number } | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = ""; // allow re-picking the same photo
    if (!file) return;
    setUploading(true);
    const ok = await uploadImage(file);
    setUploading(false);
    if (ok) toast.success(copy.toastWallpaperSaved);
    else toast.error(copy.toastWallpaperFailed);
  }

  // Drag the preview to move the focus point (finger right → reveal more of the left)
  function onPointerDown(e: React.PointerEvent<HTMLDivElement>) {
    if (!activeImage) return;
    e.currentTarget.setPointerCapture(e.pointerId);
    const r = e.currentTarget.getBoundingClientRect();
    drag.current = { startX: e.clientX, startY: e.clientY, x: adjust.x, y: adjust.y, w: r.width, h: r.height };
  }
  function onPointerMove(e: React.PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    setAdjust({
      x: Math.round(clamp(d.x - ((e.clientX - d.startX) / d.w) * 100, 0, 100)),
      y: Math.round(clamp(d.y - ((e.clientY - d.startY) / d.h) * 100, 0, 100)),
    });
  }
  function onPointerUp() {
    drag.current = null;
  }

  const sources: { value: WallpaperSource; label: string; show: boolean }[] = [
    { value: "theme", label: copy.wallpaperSourceTheme, show: hasThemeWallpaper },
    { value: "custom", label: copy.wallpaperSourceCustom, show: !!customImage },
    { value: "none", label: copy.wallpaperSourceNone, show: true },
  ];
  const fits: { value: WallpaperFit; label: string }[] = [
    { value: "cover", label: copy.wallpaperFitCover },
    { value: "contain", label: copy.wallpaperFitContain },
    { value: "tile", label: copy.wallpaperFitTile },
  ];
  const position = `${adjust.x}% ${adjust.y}%`;

  return (
    <div className="px-5 pb-5 relative z-10 space-y-4">
      <p className="font-theme text-sm font-500 text-th-text-secondary">{copy.wallpaperLabel}</p>

      <div className="flex gap-4 items-start">
        {/* Live preview — phone-shaped, draggable */}
        <div
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={cn(
            "relative w-24 flex-shrink-0 aspect-[9/19.5] rounded-xl overflow-hidden bg-th-screen border border-th-surface-dark/40 shadow-neu-in touch-none select-none",
            activeImage && "cursor-grab active:cursor-grabbing"
          )}
        >
          {activeImage && (
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `url("${activeImage}")`,
                backgroundSize: adjust.fit === "tile" ? "45%" : adjust.fit,
                backgroundRepeat: adjust.fit === "tile" ? "repeat" : "no-repeat",
                backgroundPosition: position,
                transform: `scale(${adjust.zoom})`,
                transformOrigin: position,
              }}
            />
          )}
          {/* Veil + mock cards, so "Soften" previews what the app will look like */}
          <div className="absolute inset-0" style={{ backgroundColor: `rgb(var(--th-screen) / ${activeImage ? adjust.dim : 1})` }} />
          <div className="absolute inset-x-2 top-6 space-y-1.5">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-4 rounded bg-th-surface shadow-neu-out" />
            ))}
          </div>
        </div>

        <div className="flex-1 min-w-0 space-y-3">
          <div className="flex flex-wrap gap-2">
            {sources.filter((s) => s.show).map((s) => (
              <button
                key={s.value}
                onClick={() => setSource(s.value)}
                className={cn(
                  "px-3 py-1.5 rounded-lg font-theme text-sm transition-all",
                  source === s.value ? "bg-th-primary text-th-btn-text shadow-th-raised" : "bg-th-surface text-th-text shadow-neu-out"
                )}
              >
                {s.label}
              </button>
            ))}
          </div>

          <button
            onClick={() => fileRef.current?.click()}
            disabled={uploading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl font-theme text-sm bg-th-surface text-th-primary shadow-neu-out active:shadow-neu-in disabled:opacity-50"
          >
            <Icons.upload className="w-4 h-4" />
            {uploading ? copy.savingText : copy.wallpaperUpload}
          </button>
          <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleFile} />

          {activeImage && <p className="font-theme text-xs text-th-text-secondary">{copy.wallpaperDragHint}</p>}
        </div>
      </div>

      {activeImage && (
        <>
          <div className="grid grid-cols-3 gap-2 p-1 rounded-xl bg-th-surface shadow-neu-in">
            {fits.map((f) => (
              <button
                key={f.value}
                onClick={() => setAdjust({ fit: f.value })}
                className={cn(
                  "py-2 rounded-lg font-theme text-sm transition-all",
                  adjust.fit === f.value ? "bg-th-screen text-th-text shadow-neu-out" : "text-th-text-secondary"
                )}
              >
                {f.label}
              </button>
            ))}
          </div>

          <Slider label={copy.wallpaperZoom} value={adjust.zoom} min={1} max={3} step={0.05} display={`${Math.round(adjust.zoom * 100)}%`} onChange={(zoom) => setAdjust({ zoom })} />
          <Slider label={copy.wallpaperPosX} value={adjust.x} min={0} max={100} step={1} display={`${adjust.x}%`} onChange={(x) => setAdjust({ x })} />
          <Slider label={copy.wallpaperPosY} value={adjust.y} min={0} max={100} step={1} display={`${adjust.y}%`} onChange={(y) => setAdjust({ y })} />
          <Slider label={copy.wallpaperDim} value={adjust.dim} min={0} max={0.9} step={0.05} display={`${Math.round(adjust.dim * 100)}%`} onChange={(dim) => setAdjust({ dim })} />

          <button onClick={resetAdjust} className="flex items-center gap-1.5 font-theme text-sm text-th-text-secondary active:text-th-text">
            <Icons.reset className="w-3.5 h-3.5" />
            {copy.wallpaperReset}
          </button>
        </>
      )}
    </div>
  );
}
