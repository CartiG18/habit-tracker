import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Roboto } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { ThemeProvider } from "@/lib/theme-context";
import { ThemeAwareToaster } from "@/components/layout/ThemeAwareToaster";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "700", "800"],
});

const roboto = Roboto({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
  weight: ["400", "500", "700"],
});

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

export const viewport: Viewport = {
  themeColor: "#BDB7AB",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${jetbrainsMono.variable} ${roboto.variable} font-theme bg-th-surface text-th-primary antialiased`}
      >
        <AuthProvider>
          <ThemeProvider>
            {children}
            <ThemeAwareToaster />
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
