/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class', // <--- ADD THIS LINE
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
   extend: {
  colors: {
    bg: "#0f172a",
    surface: "#111827",
    border: "#1f2937",
    textMuted: "#9ca3af",

    primary: {
      DEFAULT: "#6366f1",
      hover: "#4f46e5",
      active: "#4338ca"
    },

    success: "#22c55e",
    danger: "#ef4444",
    warning: "#f59e0b"
  },

  borderRadius: {
    xl2: "14px",
    xl3: "18px"
  },

  boxShadow: {
    card: "0 10px 30px rgba(0,0,0,.25)",
    hover: "0 20px 50px rgba(0,0,0,.35)",
    glow: "0 0 0 2px rgba(99,102,241,.5)"
  },

  transitionTimingFunction: {
    smooth: "cubic-bezier(.22,1,.36,1)"
  },

  animation: {
    "fade-in": "fadeIn .35s ease forwards",
    "scale-in": "scaleIn .25s cubic-bezier(.22,1,.36,1)",
    "slide-up": "slideUp .35s cubic-bezier(.22,1,.36,1)"
  },

  keyframes: {
    fadeIn: {
      "0%": { opacity: "0" },
      "100%": { opacity: "1" }
    },
    scaleIn: {
      "0%": { transform: "scale(.96)", opacity: "0" },
      "100%": { transform: "scale(1)", opacity: "1" }
    },
    slideUp: {
      "0%": { transform: "translateY(12px)", opacity: "0" },
      "100%": { transform: "translateY(0)", opacity: "1" }
    }
  }
}
  },
  plugins: [],
}
