import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App.jsx";
import "./index.css";
import { Toaster, ToastProvider } from "@/components/ui/toaster.jsx";
import { ConvexProvider, ConvexReactClient } from "convex/react";

const convex = new ConvexReactClient(import.meta.env.VITE_CONVEX_URL);

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConvexProvider client={convex}>
      <ToastProvider>
        <BrowserRouter>
          <App />
          <Toaster />
        </BrowserRouter>
      </ToastProvider>
    </ConvexProvider>
  </React.StrictMode>
);
