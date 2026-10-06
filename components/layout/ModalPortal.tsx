"use client";

import { ReactNode, useEffect, useState } from "react";
import { createPortal } from "react-dom";

/**
 * Renders modals directly under <body> so they always cover the full screen —
 * never clipped or offset by a scroll container or an animated (transformed) ancestor.
 * Mounts after hydration so a modal that's open on first render can't mismatch the server HTML.
 */
export default function ModalPortal({ children }: { children: ReactNode }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  return createPortal(children, document.body);
}
