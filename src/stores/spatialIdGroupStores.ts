import { enableMapSet } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { SpatialIdGroup } from "../types/geometry/spatioTemporalId/spatialIdGroup";
import {
  SpatialIdGroupPartialSchema,
  SpatialIdGroupWithoutIdSchema,
} from "../types/geometry/spatioTemporalId/spatialIdGroup";

enableMapSet();

interface SpatialIdGroupState {
  spatialIdGroups: Map<string, SpatialIdGroup>;
}

interface SpatialIdGroupAction {
  addSpatialIdGroup: (
    group: Omit<SpatialIdGroup, "id">,
  ) => ReturnType<typeof SpatialIdGroupWithoutIdSchema.safeParse>;
  removeSpatialIdGroup: (id: string) => void;
  editSpatialIdGroup: (
    id: string,
    updates: Partial<SpatialIdGroup>,
  ) => ReturnType<typeof SpatialIdGroupPartialSchema.safeParse>;
}

/**
 * 空間IDグループの状態管理フック
 */
export const useSpatialIdGroupStore = create<
  SpatialIdGroupState & SpatialIdGroupAction
>()(
  devtools(
    immer((set) => ({
      // 初期状態
      spatialIdGroups: new Map(),

      /**
       * 空間IDグループを追加する
       *
       * グループ内の空間ID (`spatialIds`) に1つでも不正なデータが含まれている場合、
       * Zodのバリデーションエラーとなり、グループ全体の追加が失敗します。
       */
      addSpatialIdGroup: (group) => {
        const result = SpatialIdGroupWithoutIdSchema.safeParse(group);
        if (result.success) {
          set(
            (state) => {
              const newId = crypto.randomUUID();
              state.spatialIdGroups.set(newId, { ...result.data, id: newId });
            },
            false,
            "addSpatialIdGroup",
          );
        }
        return result;
      },

      /**
       * 空間IDグループを削除する
       */
      removeSpatialIdGroup: (id) =>
        set(
          (state) => {
            state.spatialIdGroups.delete(id);
          },
          false,
          "removeSpatialIdGroup",
        ),

      /**
       * 空間IDグループを編集する
       *
       * 更新データ内の空間ID (`spatialIds`) に1つでも不正なデータが含まれている場合、
       * Zodのバリデーションエラーとなり、グループ全体の更新が失敗します。
       */
      editSpatialIdGroup: (id, updates) => {
        const result = SpatialIdGroupPartialSchema.safeParse(updates);
        if (result.success) {
          set(
            (state) => {
              const targetGroup = state.spatialIdGroups.get(id);
              if (targetGroup) {
                state.spatialIdGroups.set(id, {
                  ...targetGroup,
                  ...result.data,
                });
              }
            },
            false,
            "editSpatialIdGroup",
          );
        }
        return result;
      },
    })),
  ),
);
