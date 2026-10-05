import { JetBrains_Mono, Roboto, Quicksand, Princess_Sofia } from "next/font/google";

// ─── Font Registry ────────────────────────────────────────────────────────────
//
// Every font a theme can use is loaded here once. To add one:
//   1. Import it from "next/font/google" (or use "next/font/local" for files).
//   2. Add an entry below. `variable` MUST be `--font-<key>` (next/font needs
//      a literal string). Use `preload: false` for fonts not used by the
//      default theme so they only download when a theme selects them.
//   3. Reference the key from a theme's `fonts` block.
//
// Fonts that aren't on Google Fonts go in FONT_FILES instead (see below).

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

const quicksand = Quicksand({
  subsets: ["latin"],
  variable: "--font-quicksand",
  display: "swap",
  weight: ["400", "500", "600", "700"],
  preload: false,
});

const princessSofia = Princess_Sofia({
  subsets: ["latin"],
  variable: "--font-princess-sofia",
  display: "swap",
  weight: "400",
  preload: false,
});

export const FONTS = {
  mono: jetbrainsMono,
  sans: roboto,
  quicksand,
  "princess-sofia": princessSofia,
};

// ─── Font Files ───────────────────────────────────────────────────────────────
//
// Fonts served from public/fonts/ via a generated @font-face rule. If the file
// is missing (or the user has the font installed locally) it degrades to
// `local()` and then `fallback`, so the build never breaks.

export interface FontFile {
  family: string;
  src: string;
  /** CSS font stack used when the file can't load */
  fallback: string;
}

export const FONT_FILES = {
  "kiss-me-slowly": {
    family: "KG Kiss Me Slowly",
    src: "/fonts/KGKissMeSlowly.ttf",
    fallback: "var(--font-quicksand, sans-serif), cursive",
  },
} satisfies Record<string, FontFile>;

export type FontKey = keyof typeof FONTS | keyof typeof FONT_FILES;

/** All font CSS variables, applied once on <html> so theme tokens can reference them. */
export const fontVariables = Object.values(FONTS)
  .map((f) => f.variable)
  .join(" ");
