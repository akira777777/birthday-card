import type { Config } from "tailwindcss"

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  prefix: "",
  theme: {
    extend: {
      keyframes: {
        "fade-in": {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        "slide-up": {
          from: { transform: "translateY(10px)", opacity: "0" },
          to: { transform: "translateY(0)", opacity: "1" },
        },
        "scale-in": {
          from: { transform: "scale(0.95)", opacity: "0" },
          to: { transform: "scale(1)", opacity: "1" },
        },
        "bounce-gnome": {
          "0%, 100%": { transform: "translateY(0) scale(1)" },
          "50%": { transform: "translateY(-30px) scale(1.2)" },
        },
        "sparkle": {
          "0%, 100%": {
            transform: "scale(0) rotate(0deg) translateY(0)",
            opacity: "0",
          },
          "50%": {
            transform: "scale(1.8) rotate(180deg) translateY(-10px)",
            opacity: "1",
          },
        },
        "text-reveal": {
          "0%": {
            opacity: "0",
            transform: "translateY(30px) scale(0.8)",
            filter: "blur(10px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)",
            filter: "blur(0)",
          },
        },
        "glow-pulse": {
          "0%, 100%": {
            boxShadow: "0 0 20px rgba(255, 215, 0, 0.5), 0 0 40px rgba(255, 215, 0, 0.3)",
          },
          "50%": {
            boxShadow: "0 0 40px rgba(255, 215, 0, 0.8), 0 0 80px rgba(255, 215, 0, 0.5)",
          },
        },
        "float": {
          "0%, 100%": {
            transform: "translateY(0px)",
          },
          "50%": {
            transform: "translateY(-20px)",
          },
        },
        "shimmer": {
          "0%": {
            backgroundPosition: "-200% 0",
          },
          "100%": {
            backgroundPosition: "200% 0",
          },
        },
        "letter-bounce": {
          "0%, 100%": {
            transform: "translateY(0) scale(1)",
          },
          "50%": {
            transform: "translateY(-15px) scale(1.1)",
          },
        },
        "card-entrance": {
          "0%": {
            opacity: "0",
            transform: "scale(0.5) rotateY(180deg)",
            filter: "blur(20px)",
          },
          "60%": {
            opacity: "1",
            transform: "scale(1.05) rotateY(-10deg)",
            filter: "blur(5px)",
          },
          "100%": {
            opacity: "1",
            transform: "scale(1) rotateY(0deg)",
            filter: "blur(0)",
          },
        },
        "confetti-fall": {
          "0%": {
            transform: "translateY(-100vh) rotate(0deg)",
            opacity: "1",
          },
          "100%": {
            transform: "translateY(100vh) rotate(720deg)",
            opacity: "0",
          },
        },
      },
      animation: {
        "fade-in": "fade-in 0.3s ease-out",
        "slide-up": "slide-up 0.3s ease-out",
        "scale-in": "scale-in 0.2s ease-out",
        "bounce-gnome": "bounce-gnome 0.6s ease-out",
        sparkle: "sparkle 2s ease-in-out infinite",
        "text-reveal": "text-reveal 0.8s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "glow-pulse": "glow-pulse 2s ease-in-out infinite",
        float: "float 3s ease-in-out infinite",
        shimmer: "shimmer 3s linear infinite",
        "letter-bounce": "letter-bounce 0.6s ease-out",
        "card-entrance": "card-entrance 1.2s cubic-bezier(0.34, 1.56, 0.64, 1) forwards",
        "confetti-fall": "confetti-fall 3s linear infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config

export default config