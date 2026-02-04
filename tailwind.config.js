/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#329629", // Globalink Green
          light: "#4ADE80",
          dark: "#14532D",
          container: "#DCFCE7", // Light green background
        },
        secondary: {
          DEFAULT: "#1E293B", // Slate-800
          light: "#94A3B8",   // Slate-400
          dark: "#0F172A",    // Slate-900
        },
        background: {
          DEFAULT: "#F8FAFC", // Slate-50 (Light Mode Default)
          dark: "#020617",    // Slate-950 (Dark Mode Default)
        },
        surface: {
          DEFAULT: "#FFFFFF",
          dark: "#0F172A",
        },
        accent: {
          DEFAULT: "#F59E0B", // Amber-500
          hover: "#D97706",
        },
        error: {
          DEFAULT: "#EF4444", // Red-500
          light: "#FEE2E2",
        },
        success: {
          DEFAULT: "#10B981", // Emerald-500
          light: "#D1FAE5",
        },
        text: {
          primary: "#0F172A",   // Slate-900
          secondary: "#64748B", // Slate-500
          disabled: "#CBD5E1",  // Slate-300
        },
      },
    },
  },
  plugins: [],
};
