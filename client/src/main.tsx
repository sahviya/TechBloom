import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";

// Get the root element
const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Root element not found");

// Create root only once
let root;
if (!(rootElement as any)._reactRoot) {
  root = createRoot(rootElement);
  (rootElement as any)._reactRoot = root;
} else {
  root = (rootElement as any)._reactRoot;
}

root.render(<App />);
