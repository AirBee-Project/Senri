import { describe, expect, it } from "vitest";
import type { RGBAColor } from "../../types/geometry/color";
import type { SpatialIdGroup } from "../../types/geometry/spatioTemporalId/spatialIdGroup";
import type { SpatialVoxel } from "./parseSpatialIdToVoxels";
import {
  spatialIdGroupToGeometries,
  spatialVoxelToGeometry,
  voxelToIdString,
} from "./spatialIdToGeometry";

describe("spatialIdToGeometry", () => {
  const dummyColor: RGBAColor = { r: 15, g: 118, b: 110, a: 255 };

  describe("voxelToIdString", () => {
    it("範囲・時間表現を持たない標準的なボクセルの文字列化", () => {
      const voxel: SpatialVoxel = {
        z: 10,
        fMin: 5,
        fMax: 5,
        xMin: 100,
        xMax: 100,
        yMin: 200,
        yMax: 200,
      };
      expect(voxelToIdString(voxel)).toBe("10/5/100/200");
    });

    it("範囲表現を持つボクセルの文字列化", () => {
      const voxel: SpatialVoxel = {
        z: 10,
        fMin: 1,
        fMax: 3,
        xMin: 100,
        xMax: 105,
        yMin: 200,
        yMax: 202,
      };
      expect(voxelToIdString(voxel)).toBe("10/1:3/100:105/200:202");
    });

    it("時間表現と範囲表現を併せ持つボクセルの文字列化", () => {
      const voxel: SpatialVoxel = {
        z: 10,
        fMin: 5,
        fMax: 5,
        xMin: 100,
        xMax: 100,
        yMin: 200,
        yMax: 200,
        temporalId: {
          i: 60,
          tMin: 100,
          tMax: 101,
        },
      };
      expect(voxelToIdString(voxel)).toBe("10/5/100/200_60/100:101");
    });
  });

  describe("spatialVoxelToGeometry", () => {
    it("ズームレベル10の単一ボクセルの地理変換が正しいこと", () => {
      const voxel: SpatialVoxel = {
        z: 10,
        fMin: 5,
        fMax: 5,
        xMin: 100,
        xMax: 100,
        yMin: 200,
        yMax: 200,
        temporalId: {
          i: 60,
          tMin: 100,
          tMax: 100,
        },
      };

      const geometry = spatialVoxelToGeometry(voxel, dummyColor);

      expect(geometry.points[1][0]).toBeCloseTo(-144.84375, 5);
      expect(geometry.points[0][0]).toBeCloseTo(-144.4921875, 5);

      expect(geometry.altitude).toBe(163840);
      expect(geometry.elevation).toBe(32768);

      expect(geometry.startTime).toBe(6000);
      expect(geometry.endTime).toBe(6060);

      expect(geometry.voxelId).toBe("10/5/100/200_60/100");
      expect(geometry.color).toEqual(dummyColor);
    });

    it("範囲結合されたボクセルでも正しく全体の幾何境界が得られること", () => {
      const voxel: SpatialVoxel = {
        z: 10,
        fMin: 1,
        fMax: 2,
        xMin: 100,
        xMax: 101,
        yMin: 200,
        yMax: 201,
      };

      const geometry = spatialVoxelToGeometry(voxel, dummyColor);

      expect(geometry.points[1][0]).toBeCloseTo(-144.84375, 5);
      expect(geometry.points[0][0]).toBeCloseTo(-144.140625, 5);

      expect(geometry.altitude).toBe(32768);
      expect(geometry.elevation).toBe(65536);
    });
  });

  describe("spatialIdGroupToGeometries", () => {
    it("グループ内の複数の空間IDを正しくボクセル幾何に変換できること", () => {
      const group: SpatialIdGroup = {
        id: "group-1",
        color: dummyColor,
        spatialIds: [
          {
            z: 10,
            f: 5,
            x: 100,
            y: 200,
          },
          {
            z: 10,
            f: 6,
            x: 101,
            y: 201,
          },
        ],
      };

      const geometries = spatialIdGroupToGeometries(group, true);
      expect(geometries).toHaveLength(2);
      expect(geometries[0].voxelId).toBe("10/5/100/200");
      expect(geometries[1].voxelId).toBe("10/6/101/201");
      expect(geometries[0].color).toEqual(dummyColor);
      expect(geometries[1].color).toEqual(dummyColor);
    });

    it("同じ空間IDに対してキャッシュが働き、色変更が動的に適用されること", () => {
      const group1: SpatialIdGroup = {
        id: "group-1",
        color: dummyColor,
        spatialIds: [
          {
            z: 10,
            f: 5,
            x: 100,
            y: 200,
          },
        ],
      };

      const geometries1 = spatialIdGroupToGeometries(group1, true);
      expect(geometries1).toHaveLength(1);
      expect(geometries1[0].color).toEqual(dummyColor);

      // 色を変更した新しいグループを作成（空間IDは同じ）
      const newColor: RGBAColor = { r: 255, g: 0, b: 0, a: 128 };
      const group2: SpatialIdGroup = {
        id: "group-2",
        color: newColor,
        spatialIds: [
          {
            z: 10,
            f: 5,
            x: 100,
            y: 200,
          },
        ],
      };

      const geometries2 = spatialIdGroupToGeometries(group2, true);
      expect(geometries2).toHaveLength(1);
      // キャッシュが使われているが、色は新しく指定した色になっていることを検証
      expect(geometries2[0].color).toEqual(newColor);
      // 重い頂点座標の配列参照は同じ（またはクローンされているが同一のデータ）であることを検証
      expect(geometries2[0].points).toEqual(geometries1[0].points);
    });
  });
});
