import { ScatterplotLayer } from "@deck.gl/layers";
import type { LayersList } from "deck.gl";
import type { Point } from "../types/geometry/point";

function generatePointLayer(points: Point[]): ScatterplotLayer<Point> {
  return new ScatterplotLayer<Point>({
    id: "scatterplot-layer",
    data: points,
    pickable: true,
    opacity: 0.8,
    stroked: false,
    filled: true,
    radiusScale: 1,
    radiusMinPixels: 6,
    radiusMaxPixels: 100,
    getPosition: (d) => [d.longitude, d.latitude, d.altitude],
    getRadius: 10,
    getFillColor: (d) => {
      const c = d.color ?? { r: 15, g: 118, b: 110, a: 255 };
      return [c.r, c.g, c.b, c.a ?? 255];
    },
    billboard: true,
  });
}

export function generateMapLayers(points: Point[]): LayersList {
  return [generatePointLayer(points)];
}
