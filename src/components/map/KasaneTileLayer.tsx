import { TileLayer } from "@deck.gl/geo-layers";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { useKasaneStore } from "../../stores/kasaneStore";
import type { VoxelGeometry } from "../../types/geometry/spatioTemporalId/voxelGeometry";
import { createPolygonLayer, createScatterLayer } from "./kasaneSublayers";
import { createWorker, fetchTileDataForLayer } from "./kasaneTileData";

/**
 * kasaneStore で選択中のテーブルを deck.gl の TileLayer 群へ変換するフック。
 * データ取得は kasaneTileData、サブレイヤー生成は kasaneSublayers に分離している。
 */
export function useKasaneTileLayer() {
  const selectedDb = useKasaneStore((s) => s.selectedDb);
  const selectedTables = useKasaneStore((s) => s.selectedTables);
  const layerVisibility = useKasaneStore((s) => s.layerVisibility);
  const valueColors = useKasaneStore((s) => s.valueColors);
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

  const layers = useMemo(() => {
    if (!selectedDb || selectedTables.length === 0) return [];

    return selectedTables.map((selectedTable) => {
      const overrides = valueColors[selectedTable.name];
      const overridesTrigger = JSON.stringify(overrides ?? {});

      return new TileLayer<VoxelGeometry[]>({
        id: `kasane-tile-layer-${selectedDb}-${selectedTable.name}`,
        data: null,
        visible: layerVisibility[selectedTable.name] ?? true,
        minZoom: 0,
        maxZoom: selectedTable.max_zoom_level,
        tileSize: 256,
        maxCacheSize: 10, // GPUクラッシュを防ぐため、画面外のタイルを即座に破棄
        maxRequests: 4, // サーバーのパンク（ERR_CONNECTION_REFUSED）を防ぐための同時リクエスト数制限

        refinementStrategy: "best-available",

        // 新しいタイルが画面に入るたびに呼ばれ、Kasaneからデータを取得する。
        getTileData: (tile) =>
          fetchTileDataForLayer(
            tile,
            selectedDb,
            selectedTable,
            workerPool.current,
            incrementLoading,
            decrementLoading,
          ),

        // データの揃ったタイルを地図に描画する。
        renderSubLayers: (props) => {
          const tileData = props.data as VoxelGeometry[] | null;
          if (!tileData || tileData.length === 0) return null;

          // 17以上、またはこれ以上ズームできない(maxZoom)場合は面(Polygon)
          // 16以下の広域は点(Scatter)
          const isScatter =
            props.tile.index.z < 17 &&
            props.tile.index.z < selectedTable.max_zoom_level;

          return isScatter
            ? createScatterLayer(
                props.id,
                tileData,
                overrides,
                overridesTrigger,
              )
            : createPolygonLayer(
                props.id,
                tileData,
                overrides,
                overridesTrigger,
              );
        },

        updateTriggers: {
          getTileData: [selectedDb, selectedTable.name],
          // 色の上書きが変わったら、読み込み済みタイルのサブレイヤーを作り直して即反映する
          // （deck.glは関数プロップの参照変更を無視するため、トリガーで明示する必要がある）
          renderSubLayers: overridesTrigger,
        },
      });
    });
  }, [
    selectedDb,
    selectedTables,
    layerVisibility,
    valueColors,
    incrementLoading,
    decrementLoading,
  ]);

  return layers;
}
