import DeckGL from "@deck.gl/react";
import { Map as MapGL } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { DrawModeToolbar } from "./components/draw-mode-manager";
import { FeatureManager } from "./components/feature-manager";
import { TimePanel } from "./components/time-manager";
import { useLineStore } from "./stores/lineStores";
import { usePointStore } from "./stores/pointStores";
import { useSpatialIdGroupStore } from "./stores/spatialIdGroupStores";
import { generateMapLayers, generateVoxelLayer } from "./utils/layerGenerator";
import { spatialIdGroupToGeometries } from "./utils/parser/voxelToGeometry";

export default function App() {
  const pointsMap = usePointStore((state) => state.points);
  const pointsList = Array.from(pointsMap.values());

  const linesMap = useLineStore((state) => state.lines);
  const linesList = Array.from(linesMap.values());

  const spatialIdGroupsMap = useSpatialIdGroupStore(
    (state) => state.spatialIdGroups,
  );
  const spatialIdGroupsList = Array.from(spatialIdGroupsMap.values());

  const baseLayers = generateMapLayers(pointsList, linesList);

  const voxelLayers = spatialIdGroupsList.map((group) => {
    const geometries = spatialIdGroupToGeometries(group, true);
    return generateVoxelLayer(group.id, geometries, group.color);
  });

  const layers = [...baseLayers, ...voxelLayers];

  return (
    <div>
      {/* featuremanager */}
      <div style={{ position: "absolute", zIndex: 50 }}>
        <FeatureManager />
      </div>

      {/* timebar */}
      <TimePanel />

      {/* drawmodemanager */}
      <div
        style={{
          position: "absolute",
          zIndex: 50,
          bottom: "6rem",
          right: "1rem",
        }}
      >
        <DrawModeToolbar />
      </div>
      {/* map */}
      <DeckGL
        initialViewState={{
          longitude: 139.767,
          latitude: 35.681,
          zoom: 10,
        }}
        controller={true}
        style={{ width: "100vw", height: "100vh" }}
        layers={layers}
      >
        <MapGL mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json" />
      </DeckGL>
    </div>
  );
}
