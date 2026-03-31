
import { createRoot } from "react-dom/client";
import App from "./app/App.tsx";
import { AppStateProvider, ServerCacheProvider } from "./app/state";
import { I18nProvider } from "./app/i18n";
import "./styles/index.css";
import "maplibre-gl/dist/maplibre-gl.css";

createRoot(document.getElementById("root")!).render(
  <ServerCacheProvider>
    <AppStateProvider>
      <I18nProvider>
        <App />
      </I18nProvider>
    </AppStateProvider>
  </ServerCacheProvider>,
);
  
