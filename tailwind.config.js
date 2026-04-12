/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#185FA5",
          "primary-bg": "#E6F1FB",
          "primary-text": "#0C447C",
          success: "#0F6E56",
          "success-bg": "#E1F5EE",
          "success-bg-alt": "#EAF3DE",
          "success-text": "#085041",
          "success-text-alt": "#27500A",
          "success-border": "#3B6D11",
          danger: "#A32D2D",
          "danger-bg": "#FCEBEB",
          "danger-text": "#791F1F",
          "neutral-bg": "#F8F8F6",
          "neutral-bg-alt": "#F1EFE8",
          "neutral-border": "#D3D1C7",
          "neutral-border-alt": "#B4B2A9",
          "neutral-text": "#5F5E5A",
          "neutral-text-alt": "#888780",
          ink: "#1A1A1A",
          "accent-bg": "#EEEDFE",
          "accent-border": "#534AB7",
          "accent-text": "#3C3489",
        },
        nav: {
          bg: "#111111",
          divider: "#222222",
          active: "#00E5FF",
          inactive: "#666666",
        },
      },
      fontFamily: {
        sans: [
          "system-ui",
          "-apple-system",
          "Hiragino Sans",
          "Hiragino Kaku Gothic ProN",
          "Noto Sans JP",
          "Meiryo",
          "sans-serif",
        ],
      },
    },
  },
  plugins: [],
};
