import madoriLogo from "/Madori_logo.png";
import { DrawModeToolbar } from "./components/draw-mode-manager";
import { FeatureManager } from "./components/feature-manager";
import MapContainer from "./components/map/MapContainer";
import { TimePanel } from "./components/time-manager";

import { useMapStore } from "./stores/mapStore";

// URLに ?debug をつけると開発者モード（従来の画面）に切り替わる
const isDebugMode = new URLSearchParams(window.location.search).has("debug");

function ZoomIndicator() {
  const zoom = useMapStore((state) => state.viewState.zoom);
  if (zoom === undefined) return null;
  return (
    <div
      style={{
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        color: "white",
        padding: "2px 6px",
        borderRadius: "4px",
        fontSize: "12px",
        fontFamily: "monospace",
        pointerEvents: "auto",
      }}
    >
      Zoom: {zoom.toFixed(1)}
    </div>
  );
}

export default function App() {
  return (
    <div>
      {/* featuremanager: 原則非表示（?debug付きの開発者モードでのみ表示） */}
      {isDebugMode && (
        <div style={{ position: "absolute", zIndex: 50 }}>
          <FeatureManager />
        </div>
      )}

      {/* logo & zoom info */}
      <div
        style={{
          position: "absolute",
          top: "1rem",
          right: "1rem",
          zIndex: 50,
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-end",
          pointerEvents: "none",
        }}
      >
        <img
          src={madoriLogo}
          alt="Senri Logo"
          style={{
            height: "40px", // adjust height as needed
            marginBottom: "4px",
          }}
        />
        <ZoomIndicator />
      </div>

      {/* timebar */}
      <TimePanel />

      {/* drawmodemanager: ビューワーモードでは歯車に収納する */}
      <div
        style={{
          position: "absolute",
          zIndex: 50,
          bottom: "6rem",
          right: "1rem",
        }}
      >
        <DrawModeToolbar collapsible={!isDebugMode} />
      </div>

      {/* map */}
      <MapContainer />
    </div>
  );
}
