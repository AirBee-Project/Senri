import { create } from "zustand";
import type { DatabaseInfo, TableInfo } from "../api/kasane/types";

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

  setDatabases: (databases: DatabaseInfo[]) => void;
  setTables: (tables: TableInfo[]) => void;
  selectDb: (db: string | null) => void;
  toggleTable: (table: TableInfo, isSelected: boolean) => void;
  setGroupId: (id: string | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setNotice: (notice: string | null) => void;
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
}));
