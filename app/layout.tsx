import type { Metadata, Viewport } from "next";
import { JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";
import { Toaster } from "react-hot-toast";

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
  weight: ["400", "500", "700", "800"],
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
        className={`${jetbrainsMono.variable} font-mono bg-putty text-amber antialiased`}
      >
        <AuthProvider>
          {children}
          <Toaster
            position="top-center"
            toastOptions={{
              style: {
                background: "#1A1B1E",
                color: "#FFB000",
                border: "2px solid #8A857A",
                borderRadius: "0px",
                fontFamily: "var(--font-mono), monospace",
                textShadow: "0 0 5px rgba(255, 176, 0, 0.6)",
              },
            }}
          />
        </AuthProvider>
      </body>
    </html>
  );
}
