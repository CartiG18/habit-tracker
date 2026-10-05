"use client";

import { Toaster } from "react-hot-toast";
import { useTheme } from "@/lib/theme-context";

export function ThemeAwareToaster() {
  const { def } = useTheme();

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: def.toast,
        ...(def.toastIcons && {
          success: { iconTheme: def.toastIcons.success },
          error: { iconTheme: def.toastIcons.error },
        }),
      }}
    />
  );
}
