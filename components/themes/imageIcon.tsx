import type { LucideProps } from "lucide-react";
import type { ThemeIcon } from "@/lib/themes/types";
import { cn } from "@/lib/utils";

// No "use client": theme files call imageIcon() at module load on the server too.

/**
 * Turn an image in public/ (e.g. a full-color SVG) into a nav/theme icon.
 * Images can't take `currentColor`, so the bottom nav marks the active tab via
 * `aria-current` instead — themes style `.theme-img-icon` for inactive tabs.
 */
export function imageIcon(src: string): ThemeIcon {
  function ImageIcon({ className }: LucideProps) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={src} alt="" aria-hidden draggable={false} className={cn("theme-img-icon object-contain select-none", className)} />;
  }
  ImageIcon.displayName = `ImageIcon(${src})`;
  return ImageIcon;
}
