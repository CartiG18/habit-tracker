"use client";

import { ReactNode } from "react";
import { createPortal } from "react-dom";

/**
 * Renders modals directly under <body> so they always cover the full screen —
 * never clipped or offset by a scroll container or an animated (transformed) ancestor.
 */
export default function ModalPortal({ children }: { children: ReactNode }) {
  if (typeof document === "undefined") return null;
  return createPortal(children, document.body);
}
