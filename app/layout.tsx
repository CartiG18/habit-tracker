import type { Metadata, Viewport } from "next";
import { cookies } from "next/headers";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { ThemeAwareToaster } from "@/components/layout/ThemeAwareToaster";
import { ThemeOverlay } from "@/components/layout/ThemeOverlay";
import { WallpaperProvider } from "@/lib/wallpaper-context";
import { fontVariables } from "@/lib/themes/fonts";
import {
  DEFAULT_THEME_ID,
  THEMES,
  THEME_STORAGE_KEY,
  resolveThemeId,
  buildThemeInitScript,
  buildThemeStylesheet,
} from "@/lib/themes";

/** Theme id from the cookie written by ThemeProvider (falls back to the default). */
function themeFromCookie() {
  const stored = cookies().get(THEME_STORAGE_KEY)?.value;
  return resolveThemeId(stored) ?? DEFAULT_THEME_ID;
}

export const metadata: Metadata = {
  title: "SYNAPSE // Terminal",
  description: "System initialization.",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Synapse",
  },
  icons: {
    apple: "/icons/apple-touch-icon.png",
  },
};

export function generateViewport(): Viewport {
  return {
    themeColor: THEMES[themeFromCookie()].metaColor,
    width: "device-width",
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
    // Draw edge-to-edge on notched phones; layouts pad with env(safe-area-inset-*)
    viewportFit: "cover",
  };
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const theme = themeFromCookie();

  return (
    <html
      lang="en"
      data-theme={theme}
      data-wallpaper={THEMES[theme].wallpaper ? "theme" : undefined}
      className={`${fontVariables} theme-${THEMES[theme].base}`}
      suppressHydrationWarning
    >
      <head>
        {/* Tokens for every theme, generated from lib/themes/ */}
        <style dangerouslySetInnerHTML={{ __html: buildThemeStylesheet() }} />
        {/* Apply the stored theme before first paint */}
        <script dangerouslySetInnerHTML={{ __html: buildThemeInitScript() }} />
      </head>
      <body className="font-theme antialiased">
        <div className="wallpaper-layer" aria-hidden><div /></div>
        <AuthProvider>
          <ThemeProvider initialTheme={theme}>
            <WallpaperProvider>
              {children}
              <ThemeOverlay />
              <ThemeAwareToaster />
            </WallpaperProvider>
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
