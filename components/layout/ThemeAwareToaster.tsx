"use client";

import { Toaster } from "react-hot-toast";
import { useTheme } from "@/lib/theme-context";

export function ThemeAwareToaster() {
  const { isRetro } = useTheme();

  return (
    <Toaster
      position="top-center"
      toastOptions={{
        style: isRetro
          ? {
              background: "#1A1B1E",
              color: "#FFB000",
              border: "2px solid #8A857A",
              borderRadius: "0px",
              fontFamily: "var(--font-mono), monospace",
              textShadow: "0 0 5px rgba(255, 176, 0, 0.6)",
            }
          : {
              background: "#FFFFFF",
              color: "#3A3A3A",
              border: "1px solid #D4CFC6",
              borderRadius: "16px",
              fontFamily: "var(--font-sans), sans-serif",
              boxShadow: "0 4px 6px rgba(174,168,157,0.3)",
            },
      }}
    />
  );
}
