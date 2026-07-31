import { create } from "zustand";
import type { DatabaseInfo, TableInfo } from "../api/kasane/types";
import type { RGBAColor } from "../types/geometry/color";

/** 1テーブルあたりの観測値の保持上限（Text型で値が多すぎる場合の暴走防止） */
const MAX_OBSERVED_VALUES = 200;

/**
 * Kasane の選択状態と読み込み状態を管理するストア。
 * 接続先の情報を管理
 */
interface KasaneState {
  databases: DatabaseInfo[];
  tables: TableInfo[];
  selectedDb: string | null;
  selectedTables: TableInfo[];
  /** 共通ストアに描画中の空間IDグループのID */
  groupId: string | null;
  loading: boolean;
  error: string | null;
  /** ズームアウトしすぎ等の案内メッセージ */
  notice: string | null;
  /** テーブル名 → 表示ON/OFF（未設定は表示扱い） */
  layerVisibility: Record<string, boolean>;
  /** テーブル名 → 値(文字列化) → 上書き色 */
  valueColors: Record<string, Record<string, RGBAColor>>;
  /** テーブル名 → タイル読み込みで観測した値の一覧 */
  observedValues: Record<string, (string | number | boolean)[]>;
  /** テーブル名 → Queryモード時のバッファ設定 */
  queryConfigs: Record<
    string,
    { radiusX: number; radiusY: number; zoomOutLevel: number }
  >;

  /** キャッシュクリア時にインクリメントしてDeckGLに再フェッチさせる */
  cacheRevision: number;

  setDatabases: (databases: DatabaseInfo[]) => void;
  setTables: (tables: TableInfo[]) => void;
  selectDb: (db: string | null) => void;
  toggleTable: (table: TableInfo, isSelected: boolean) => void;
  setGroupId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setNotice: (notice: string | null) => void;
  toggleLayerVisibility: (tableName: string) => void;
  setValueColor: (
    tableName: string,
    valueKey: string,
    color: RGBAColor,
  ) => void;
  registerObservedValues: (tableName: string, values: unknown[]) => void;
  setQueryConfig: (
    tableName: string,
    radiusX: number,
    radiusY: number,
    zoomOutLevel: number,
  ) => void;
  incrementCacheRevision: () => void;
}

export const useKasaneStore = create<KasaneState>((set) => ({
  databases: [],
  tables: [],
  selectedDb: null,
  selectedTables: [],
  groupId: null,
  loading: false,
  error: null,
  notice: null,
  layerVisibility: {},
  valueColors: {},
  observedValues: {},
  queryConfigs: {},
  cacheRevision: 0,

  setDatabases: (databases) => set({ databases }),
  setTables: (tables) => set({ tables }),
  selectDb: (selectedDb) => set({ selectedDb, tables: [], selectedTables: [] }),
  toggleTable: (table, isSelected) =>
    set((state) => {
      if (isSelected) {
        // すでに選択されていれば何もしない
        if (state.selectedTables.some((t) => t.name === table.name))
          return state;
        return { selectedTables: [...state.selectedTables, table] };
      }
      return {
        selectedTables: state.selectedTables.filter(
          (t) => t.name !== table.name,
        ),
      };
    }),
  setGroupId: (groupId) => set({ groupId }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setNotice: (notice) => set({ notice }),
  toggleLayerVisibility: (tableName) =>
    set((state) => ({
      layerVisibility: {
        ...state.layerVisibility,
        [tableName]: !(state.layerVisibility[tableName] ?? true),
      },
    })),
  setValueColor: (tableName, valueKey, color) =>
    set((state) => ({
      valueColors: {
        ...state.valueColors,
        [tableName]: {
          ...state.valueColors[tableName],
          [valueKey]: color,
        },
      },
    })),
  registerObservedValues: (tableName, values) =>
    set((state) => {
      const current = state.observedValues[tableName] ?? [];
      const known = new Set(current.map((v) => String(v)));
      const added = values.filter(
        (v): v is string | number | boolean =>
          (typeof v === "string" ||
            typeof v === "number" ||
            typeof v === "boolean") &&
          !known.has(String(v)),
      );
      if (added.length === 0 || current.length >= MAX_OBSERVED_VALUES)
        return state;
      return {
        observedValues: {
          ...state.observedValues,
          [tableName]: [...current, ...added].slice(0, MAX_OBSERVED_VALUES),
        },
      };
    }),
  setQueryConfig: (tableName, radiusX, radiusY, zoomOutLevel) =>
    set((state) => ({
      queryConfigs: {
        ...state.queryConfigs,
        [tableName]: { radiusX, radiusY, zoomOutLevel },
      },
    })),
  incrementCacheRevision: () =>
    set((state) => ({ cacheRevision: state.cacheRevision + 1 })),
}));
