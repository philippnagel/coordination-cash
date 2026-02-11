import { createRoot } from "react-dom/client";
import { App } from "./App.tsx";

// biome-ignore lint/style/noNonNullAssertion: root element guaranteed to exist in index.html
const root = document.getElementById("root")!;
createRoot(root).render(<App />);
