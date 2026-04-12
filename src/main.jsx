import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";

if (typeof window !== "undefined") {
  window.addEventListener("error", (e) => {
    console.error("[window.error]", e.message, e.filename, e.lineno, e.colno, e.error);
  });
  window.addEventListener("unhandledrejection", (e) => {
    console.error("[unhandledrejection]", e.reason);
  });
}

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
