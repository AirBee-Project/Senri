import type { Line } from "../types/geometry/line";
import type { Point } from "../types/geometry/point";
import type { VoxelGeometry } from "../types/geometry/spatioTemporalId/voxelGeometry";

export interface FocusTarget {
  longitude: number;
  latitude: number;
  zoom: number;
  minStartTime: number | null;
}

interface Extents {
  minLon: number;
  maxLon: number;
  minLat: number;
  maxLat: number;
}

function getVoxelExtents(geometries: VoxelGeometry[]): Extents {
  let minLon = Number.MAX_VALUE;
  let maxLon = -Number.MAX_VALUE;
  let minLat = Number.MAX_VALUE;
  let maxLat = -Number.MAX_VALUE;

  for (const geom of geometries) {
    for (const pt of geom.points) {
      minLon = Math.min(minLon, pt[0]);
      maxLon = Math.max(maxLon, pt[0]);
      minLat = Math.min(minLat, pt[1]);
      maxLat = Math.max(maxLat, pt[1]);
    }
  }

  return { minLon, maxLon, minLat, maxLat };
}
/**
 * 点自身の座標
 */
export function calculatePointFocus(point: Point): FocusTarget {
  return {
    longitude: point.longitude,
    latitude: point.latitude,
    zoom: 15,
    minStartTime: null,
  };
}
/**
 * 直線の中心座標
 */
export function calculateLineFocus(line: Line): FocusTarget {
  const longitude = (line.start.longitude + line.end.longitude) / 2;
  const latitude = (line.start.latitude + line.end.latitude) / 2;

  const deltaLon = Math.abs(line.start.longitude - line.end.longitude);
  const deltaLat = Math.abs(line.start.latitude - line.end.latitude);
  const maxDelta = Math.max(deltaLon, deltaLat);

  let zoom = 15;
  if (maxDelta > 0.0005) {
    zoom = Math.floor(Math.log2(360 / maxDelta));
    zoom = Math.max(0, Math.min(zoom, 18));
  }

  return {
    longitude,
    latitude,
    zoom,
    minStartTime: null,
  };
}
/**
 * ボクセル群全体の中心座標
 */
export function calculateVoxelFocus(geometries: VoxelGeometry[]): FocusTarget {
  if (geometries.length === 0) {
    return {
      longitude: 139.767,
      latitude: 35.681,
      zoom: 10,
      minStartTime: null,
    };
  }

  const { minLon, maxLon, minLat, maxLat } = getVoxelExtents(geometries);

  const longitude = (minLon + maxLon) / 2;
  const latitude = (minLat + maxLat) / 2;

  const deltaLon = Math.abs(maxLon - minLon);
  const deltaLat = Math.abs(maxLat - minLat);
  const maxDelta = Math.max(deltaLon, deltaLat);

  let zoom = 15;
  if (maxDelta > 0.0005) {
    zoom = Math.floor(Math.log2(360 / maxDelta));
    zoom = Math.max(0, Math.min(zoom, 18));
  }

  let minStartTime = Number.MAX_VALUE;
  let hasTime = false;

  for (const geom of geometries) {
    if (geom.startTime !== null) {
      minStartTime = Math.min(minStartTime, geom.startTime);
      hasTime = true;
    }
  }

  return {
    longitude,
    latitude,
    zoom,
    minStartTime: hasTime ? minStartTime : null,
  };
}
