import * as React from "react";
import { createRoot } from "react-dom/client";
import { DeyloomProvider, TooltipProvider } from "@deyloom/react";
import "@fontsource-variable/inter";
import "@deyloom/react/styles.css";
import "./styles/docs.css";
import { App } from "./App";

const container = document.getElementById("root");
if (!container) throw new Error("Missing #root container");

createRoot(container).render(
  <React.StrictMode>
    <DeyloomProvider storageKey="deyloom-theme">
      <TooltipProvider delayDuration={300}>
        <App />
      </TooltipProvider>
    </DeyloomProvider>
  </React.StrictMode>,
);
