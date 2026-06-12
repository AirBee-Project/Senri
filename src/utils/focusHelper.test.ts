import { describe, expect, it } from "vitest";
import type { Line } from "../types/geometry/line";
import type { Point } from "../types/geometry/point";
import type { VoxelGeometry } from "../types/geometry/spatioTemporalId/voxelGeometry";
import {
  calculateLineFocus,
  calculatePointFocus,
  calculateVoxelFocus,
} from "./focusHelper";

describe("focusHelper", () => {
  describe("calculatePointFocus", () => {
    it("should return correct focus target for a point", () => {
      const point: Point = {
        id: "p1",
        longitude: 139.767,
        latitude: 35.681,
        altitude: 10,
        color: { r: 15, g: 118, b: 110, a: 255 },
      };

      const target = calculatePointFocus(point);
      expect(target.longitude).toBe(139.767);
      expect(target.latitude).toBeCloseTo(35.681 + 10 / 111320, 5);
      expect(target.zoom).toBe(15);
      expect(target.minStartTime).toBeNull();
    });

    it("should adjust zoom for high altitude points", () => {
      const point: Point = {
        id: "p1_high",
        longitude: 139.767,
        latitude: 35.681,
        altitude: 5000,
        color: { r: 15, g: 118, b: 110, a: 255 },
      };

      const target = calculatePointFocus(point);
      expect(target.longitude).toBe(139.767);
      expect(target.latitude).toBeCloseTo(35.681 + 5000 / 111320, 5);
      expect(target.zoom).toBeLessThan(15);
      expect(target.minStartTime).toBeNull();
    });
  });

  describe("calculateLineFocus", () => {
    it("should return midpoint and zoom 15 for very short line", () => {
      const line: Line = {
        id: "l1",
        start: { longitude: 139.7, latitude: 35.6, altitude: 0 },
        end: { longitude: 139.7001, latitude: 35.6001, altitude: 0 },
        width: 2,
      };

      const target = calculateLineFocus(line);
      expect(target.longitude).toBeCloseTo(139.70005, 5);
      expect(target.latitude).toBeCloseTo(35.60005, 5);
      expect(target.zoom).toBe(15);
      expect(target.minStartTime).toBeNull();
    });

    it("should calculate correct midpoint and dynamic zoom for longer line", () => {
      const line: Line = {
        id: "l2",
        start: { longitude: 139.0, latitude: 35.0, altitude: 0 },
        end: { longitude: 140.0, latitude: 36.0, altitude: 0 },
        width: 2,
      };

      const target = calculateLineFocus(line);
      expect(target.longitude).toBe(139.5);
      expect(target.latitude).toBeCloseTo(35.5, 5);
      expect(target.zoom).toBe(8);
      expect(target.minStartTime).toBeNull();
    });

    it("should adjust Y-offset and zoom for high altitude line", () => {
      const line: Line = {
        id: "l3",
        start: { longitude: 139.7, latitude: 35.6, altitude: 10000 },
        end: { longitude: 139.7001, latitude: 35.6001, altitude: 10000 },
        width: 2,
      };

      const target = calculateLineFocus(line);
      expect(target.longitude).toBeCloseTo(139.70005, 5);
      expect(target.latitude).toBeCloseTo(35.60005 + 10000 / 111320, 5);
      expect(target.zoom).toBeLessThan(15);
      expect(target.minStartTime).toBeNull();
    });
  });

  describe("calculateVoxelFocus", () => {
    it("should return default coordinates for empty geometry array", () => {
      const target = calculateVoxelFocus([]);
      expect(target.longitude).toBe(139.767);
      expect(target.latitude).toBe(35.681);
      expect(target.zoom).toBe(10);
      expect(target.minStartTime).toBeNull();
    });

    it("should calculate center, zoom, and minStartTime from multiple geometries", () => {
      const geometries: VoxelGeometry[] = [
        {
          points: [
            [139.7, 35.6, 10],
            [139.8, 35.6, 10],
            [139.8, 35.7, 10],
            [139.7, 35.7, 10],
            [139.7, 35.6, 10],
          ],
          altitude: 10,
          elevation: 5,
          voxelId: "v1",
          color: { r: 0, g: 0, b: 0, a: 255 },
          startTime: 6000,
          endTime: 6100,
        },
        {
          points: [
            [139.9, 35.8, 20],
            [140.0, 35.8, 20],
            [140.0, 35.9, 20],
            [139.9, 35.9, 20],
            [139.9, 35.8, 20],
          ],
          altitude: 20,
          elevation: 5,
          voxelId: "v2",
          color: { r: 0, g: 0, b: 0, a: 255 },
          startTime: 5000,
          endTime: 5100,
        },
      ];

      const target = calculateVoxelFocus(geometries);
      expect(target.longitude).toBeCloseTo(139.85, 5);
      expect(target.latitude).toBeCloseTo(35.75, 5);
      expect(target.zoom).toBe(10);
      expect(target.minStartTime).toBe(5000);
    });
  });
});
