import { TileLayer } from "@deck.gl/geo-layers";
import { SolidPolygonLayer } from "@deck.gl/layers";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { searchData } from "../../api/kasane/api";
import {
  type CachedTilePayload,
  getCachedTile,
  saveTileToCache,
} from "../../api/kasane/cache";
import type { RangeId } from "../../api/kasane/types";
import { useKasaneStore } from "../../stores/kasaneStore";
import {
  f_min,
  fxy_max,
} from "../../types/geometry/spatioTemporalId/spatialId";
import type { VoxelGeometry } from "../../types/geometry/spatioTemporalId/voxelGeometry";
import { createHeatmapColorScale } from "../../utils/color/heatmap";
import {
  type KasaneWorkerInput,
  type KasaneWorkerOutput,
  VOXEL_STRIDE,
} from "../../workers/kasaneWorkerProtocol";

const createWorker = () =>
  new Worker(new URL("../../workers/kasaneWorker.ts", import.meta.url), {
    type: "module",
  });

const KASANE_COLOR = { r: 220, g: 120, b: 20, a: 160 };

// Kasaneのheatmap用カラースケール (0〜100 の固定範囲)
const heatmapColorScale = createHeatmapColorScale([0, 100]);

/**
 * 1次元配列(Float64Array)から、VoxelGeometryの配列へ復元する。
 */
function unpackGeometries(
  buffer: Float64Array,
  voxelIds: string[],
  count: number,
): VoxelGeometry[] {
  const result: VoxelGeometry[] = new Array(count);
  for (let i = 0; i < count; i++) {
    const o = i * VOXEL_STRIDE;
    const st = buffer[o + 21];
    const et = buffer[o + 22];
    result[i] = {
      points: [
        [buffer[o], buffer[o + 1], buffer[o + 2]],
        [buffer[o + 3], buffer[o + 4], buffer[o + 5]],
        [buffer[o + 6], buffer[o + 7], buffer[o + 8]],
        [buffer[o + 9], buffer[o + 10], buffer[o + 11]],
        [buffer[o + 12], buffer[o + 13], buffer[o + 14]],
      ],
      altitude: buffer[o + 15],
      elevation: buffer[o + 16],
      color: {
        r: buffer[o + 17],
        g: buffer[o + 18],
        b: buffer[o + 19],
        a: buffer[o + 20],
      },
      voxelId: voxelIds[i],
      startTime: Number.isNaN(st) ? null : st,
      endTime: Number.isNaN(et) ? null : et,
    };
  }
  return result;
}

function createPolygonLayer(id: string, data: VoxelGeometry[]) {
  return new SolidPolygonLayer({
    id: `${id}-polygon`,
    data,
    getPolygon: (d: VoxelGeometry) => d.points,
    getElevation: (d: VoxelGeometry) => d.elevation,
    getFillColor: (d: VoxelGeometry) => [
      d.color.r,
      d.color.g,
      d.color.b,
      d.color.a,
    ],
    extruded: true,
    wireframe: false,
    elevationScale: 1,
    pickable: true,
  });
}

function mapDictionaryToColors(dictionary: unknown[], selectedDb: string) {
  const isHeatmap = selectedDb === "riskmap" || selectedDb === "heatmap";
  return dictionary.map((val) => {
    let cellColor: { r: number; g: number; b: number; a: number } | undefined;
    if (isHeatmap) {
      const numVal = typeof val === "number" ? val : Number(val);
      if (!Number.isNaN(numVal)) {
        cellColor = heatmapColorScale(numVal);
      }
    }
    return cellColor;
  });
}

async function processCellsWithWorker(
  response: import("../../api/kasane/types").GetDataResponse,
  selectedDb: string,
  maxZoom: number,
  workerPool: Worker[],
  signal?: AbortSignal,
): Promise<{ geometries: VoxelGeometry[]; payload: CachedTilePayload }> {
  return new Promise<{
    geometries: VoxelGeometry[];
    payload: CachedTilePayload;
  }>((resolve, reject) => {
    if (signal?.aborted) {
      reject(new DOMException("Aborted", "AbortError"));
      return;
    }

    const worker = workerPool[Math.floor(Math.random() * workerPool.length)];
    const jobId = crypto.randomUUID();

    const cleanup = () => {
      worker.removeEventListener("message", onMessage);
      if (signal) signal.removeEventListener("abort", onAbort);
    };

    const onMessage = (e: MessageEvent<KasaneWorkerOutput>) => {
      if (e.data.jobId !== jobId) return;
      cleanup();
      const payload = e.data.payload;
      resolve({
        geometries: unpackGeometries(
          payload.buffer,
          payload.voxelIds,
          payload.count,
        ),
        payload,
      });
    };

    const onAbort = () => {
      cleanup();
      reject(new DOMException("Aborted", "AbortError"));
    };

    worker.addEventListener("message", onMessage);
    if (signal) {
      signal.addEventListener("abort", onAbort);
    }

    const msg: KasaneWorkerInput = {
      type: "PARSE_VOXELS",
      jobId,
      payload: {
        data: response.data,
        colors: mapDictionaryToColors(response.dictionary, selectedDb),
        defaultColor: KASANE_COLOR,
        maxZoom,
      },
    };
    worker.postMessage(msg);
  });
}

function calculateRangeId(x: number, y: number, z: number): RangeId | null {
  const maxIdx = fxy_max[z];
  if (x < 0 || x > maxIdx || y < 0 || y > maxIdx) {
    return null;
  }

  const resolution = 33554432 / 2 ** z;
  const fMinPractical = Math.max(f_min[z], Math.floor(-2000 / resolution));
  const fMaxPractical = Math.min(fxy_max[z], Math.ceil(10000 / resolution));

  return {
    z,
    f: [fMinPractical, fMaxPractical],
    x: [x, x],
    y: [y, y],
    type: "rangeId",
  };
}

/**
 * タイルデータの取得から加工・キャッシュまでを一元管理する関数。
 * IndexedDBにArrayBufferのキャッシュがあれば、API通信とWorker計算をスキップして高速化する。
 */
async function fetchAndProcessTileData(
  cacheKey: string,
  selectedDb: string,
  selectedTable: string,
  maxZoom: number,
  rangeId: RangeId,
  workerPool: Worker[],
  signal?: AbortSignal,
): Promise<VoxelGeometry[]> {
  const cachedPayload = await getCachedTile(cacheKey);

  let geometries: VoxelGeometry[];

  if (cachedPayload) {
    // キャッシュヒット: API通信・Worker計算をスキップし、バイナリデータから即座に復元する
    geometries = unpackGeometries(
      cachedPayload.buffer,
      cachedPayload.voxelIds,
      cachedPayload.count,
    );
  } else {
    const response = await searchData(
      selectedDb,
      selectedTable,
      [rangeId],
      "Normalize",
      signal,
    );

    if (response.data.length === 0) {
      return [];
    }

    const result = await processCellsWithWorker(
      response,
      selectedDb,
      maxZoom,
      workerPool,
      signal,
    );
    geometries = result.geometries;

    await saveTileToCache(cacheKey, result.payload);
  }

  return geometries;
}

export function useKasaneTileLayer() {
  const selectedDb = useKasaneStore((s) => s.selectedDb);
  const selectedTable = useKasaneStore((s) => s.selectedTable);
  const setLoading = useKasaneStore((s) => s.setLoading);

  // 0 ⇔ 1 の境界でのみ Zustand に通知する。
  const loadingCount = useRef(0);

  const incrementLoading = useCallback(() => {
    loadingCount.current++;
    if (loadingCount.current === 1) setLoading(true);
  }, [setLoading]);
  const decrementLoading = useCallback(() => {
    loadingCount.current = Math.max(0, loadingCount.current - 1);
    if (loadingCount.current === 0) setLoading(false);
  }, [setLoading]);

  const workerPool = useRef<Worker[]>([]);

  useEffect(() => {
    workerPool.current = Array.from({ length: 4 }, createWorker);
    return () => {
      for (const w of workerPool.current) {
        w.terminate();
      }
      workerPool.current = [];
    };
  }, []);

  const layer = useMemo(() => {
    if (!selectedDb || !selectedTable) return null;

    return new TileLayer<VoxelGeometry[]>({
      id: `kasane-tile-layer-${selectedDb}-${selectedTable.name}`,
      data: null,
      minZoom: 0,
      maxZoom: selectedTable.max_zoom_level,
      tileSize: 256,
      maxCacheSize: 10, // GPUクラッシュを防ぐため、画面外のタイルを即座に破棄
      maxRequests: 4, // サーバーのパンク（ERR_CONNECTION_REFUSED）を防ぐための同時リクエスト数制限

      refinementStrategy: "best-available",

      // 新しいタイルが画面に入るたびに呼ばれ、Kasaneからデータを取得する。
      getTileData: async (tile) => {
        const { x, y, z } = tile.index;
        const { signal } = tile;

        const rangeId = calculateRangeId(x, y, z);
        if (!rangeId) {
          return [];
        }

        const cacheKey = `${selectedDb}-${selectedTable.name}-${z}-${x}-${y}`;

        incrementLoading();
        try {
          const geometries = await fetchAndProcessTileData(
            cacheKey,
            selectedDb,
            selectedTable.name,
            selectedTable.max_zoom_level,
            rangeId,
            workerPool.current,
            signal,
          );

          if (geometries.length === 0) {
            return [];
          }

          return geometries;
        } catch (e) {
          if ((e as Error).name === "AbortError") {
            throw e;
          }
          console.error("Kasane tile load error:", e);
          return [];
        } finally {
          decrementLoading();
        }
      },

      // データの揃ったタイルを地図に描画する。
      renderSubLayers: (props) => {
        const tileData = props.data as VoxelGeometry[] | null;
        if (!tileData || tileData.length === 0) return null;

        return createPolygonLayer(props.id, tileData);
      },

      updateTriggers: {
        getTileData: [selectedDb, selectedTable.name],
      },
    });
  }, [selectedDb, selectedTable, incrementLoading, decrementLoading]);

  return layer;
}
