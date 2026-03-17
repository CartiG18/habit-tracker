/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        putty: {
          DEFAULT: "#BDB7AB",
          dark: "#8A857A",
          light: "#E2DDD3",
        },
        basalt: {
          DEFAULT: "#1A1B1E",
          dark: "#0F0F12",
          light: "#2A2B30",
        },
        amber: {
          DEFAULT: "#FFB000",
          dim: "rgba(255, 176, 0, 0.3)",
          glow: "rgba(255, 176, 0, 0.6)",
        },
        signal: {
          DEFAULT: "#32CD32",
          dim: "rgba(50, 205, 50, 0.3)",
        },
      },
      boxShadow: {
        "bezel-outer": "4px 4px 10px rgba(0,0,0,0.5), -2px -2px 5px rgba(255,255,255,0.4)",
        "bezel-inner": "inset 4px 4px 10px rgba(0,0,0,0.6), inset -2px -2px 5px rgba(255,255,255,0.1)",
        "crt-screen": "inset 0 0 40px rgba(0,0,0,0.8)",
        "mech-out": "2px 2px 0px rgba(0,0,0,0.3), inset 2px 2px 4px rgba(255,255,255,0.6), inset -2px -2px 4px rgba(0,0,0,0.4)",
        "mech-in": "inset 3px 3px 6px rgba(0,0,0,0.6), inset -1px -1px 3px rgba(255,255,255,0.2)",
      },
      backgroundImage: {
        "graph-paper": "linear-gradient(rgba(255, 176, 0, 0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255, 176, 0, 0.1) 1px, transparent 1px)",
      },
      animation: {
        "boot-scroll": "bootScroll 2s steps(40, end)",
        "flicker": "flicker 0.15s infinite",
        "scanline": "scanline 8s linear infinite",
      },
      keyframes: {
        bootScroll: {
          "0%": { height: "0%" },
          "100%": { height: "100%" },
        },
        flicker: {
          "0%": { opacity: "0.95" },
          "50%": { opacity: "1" },
          "100%": { opacity: "0.98" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100vh)" },
        },
      },
    },
  },
  plugins: [],
};
