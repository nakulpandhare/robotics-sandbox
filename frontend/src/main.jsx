import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import { ThemeProvider } from "./theme/ThemeContext.jsx";
import { supabase } from "./supabaseClient.js";
import "./theme/theme.css";
import "./index.css";

// Process OAuth hash before anything renders
// This handles the #access_token=... fragment Google sends back
async function init() {
  // If URL has access_token in hash, let Supabase process it first
  if (window.location.hash.includes("access_token")) {
    await supabase.auth.getSession();
  }

  createRoot(document.getElementById("root")).render(
    <StrictMode>
      <ThemeProvider>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <App />
        </BrowserRouter>
      </ThemeProvider>
    </StrictMode>
  );
}

init();