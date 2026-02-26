/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Primary Brand
        "primary": "#1a73e8",
        "primary-hover": "#1557b0",
        
        // Backgrounds
        "background-light": "#f8f9fa",
        "background-dark": "#111821",
        "surface-light": "#ffffff",
        "surface-dark": "#1e1e1e",
        "search-bg": "#f1f3f4",
        
        // Borders
        "border-light": "#dadce0",
        "border-subtle": "#eeeeee",
        "border-dark": "#2d2d2d",
        
        // Text
        "text-primary": "#202124",
        "text-secondary": "#5f6368",
        "text-muted": "#70757a",
        
        // States
        "sidebar-active": "#e8f0fe",
        "insights-bg": "#e8f0fe",
        
        // Status Colors
        "success": "#1e8e3e",
        "error": "#d93025",
        "warning": "#fbbc04",
        "purple": "#7030a0",
        "gray-bar": "#9aa0a6",
      },
      fontFamily: {
        "display": ["Inter", "sans-serif"]
      },
      borderRadius: {
        "DEFAULT": "0.5rem",
        "lg": "0.75rem",
        "xl": "1rem",
        "2xl": "1.25rem",
        "3xl": "1.5rem",
        "card": "20px",
        "button": "12px",
        "search": "24px",
        "pill-right": "0 24px 24px 0",
        "full": "9999px"
      },
      boxShadow: {
        'card': '0 1px 2px 0 rgba(60, 64, 67, 0.3), 0 1px 3px 1px rgba(60, 64, 67, 0.15)',
        'card-hover': '0 1px 3px 0 rgba(60, 64, 67, 0.3), 0 4px 8px 3px rgba(60, 64, 67, 0.15)',
      },
    },
  },
  plugins: [],
}
