import { ScatterplotLayer, SolidPolygonLayer } from "@deck.gl/layers";
import type { VoxelGeometry } from "../../types/geometry/spatioTemporalId/voxelGeometry";

/**
 * Kasaneタイルの描画層。
 * タイルデータ（VoxelGeometry[]）をdeck.glのサブレイヤーへ変換する。
 */

export const KASANE_COLOR = { r: 220, g: 120, b: 20, a: 160 };

/** テーブルごとの「値(文字列化) → 上書き色」のマップ */
export type ValueColorOverrides = Record<
  string,
  { r: number; g: number; b: number; a: number }
>;

/** 値ごとの上書き色があればそれを、なければ計算済みの色を返す */
function resolveFillColor(
  d: VoxelGeometry,
  overrides: ValueColorOverrides | undefined,
): [number, number, number, number] {
  const override =
    overrides && d.value !== undefined ? overrides[String(d.value)] : undefined;
  const c = override ?? d.color;
  return [c.r, c.g, c.b, c.a];
}

export function createScatterLayer(
  id: string,
  data: VoxelGeometry[],
  overrides: ValueColorOverrides | undefined,
  overridesTrigger: string,
) {
  return new ScatterplotLayer({
    id: `${id}-scatter`,
    data,
    getPosition: (d: VoxelGeometry) => [
      d.points[0][0],
      d.points[0][1],
      d.altitude,
    ],
    getFillColor: (d: VoxelGeometry) => resolveFillColor(d, overrides),
    radiusMinPixels: 2,
    radiusMaxPixels: 8,
    pickable: true,
    updateTriggers: {
      getFillColor: overridesTrigger,
    },
  });
}

export function createPolygonLayer(
  id: string,
  data: VoxelGeometry[],
  overrides: ValueColorOverrides | undefined,
  overridesTrigger: string,
) {
  return new SolidPolygonLayer({
    id: `${id}-polygon`,
    data,
    getPolygon: (d: VoxelGeometry) => d.points,
    getElevation: (d: VoxelGeometry) => d.elevation,
    getFillColor: (d: VoxelGeometry) => resolveFillColor(d, overrides),
    extruded: true,
    wireframe: false,
    elevationScale: 1,
    pickable: true,
    updateTriggers: {
      getFillColor: overridesTrigger,
    },
  });
}
