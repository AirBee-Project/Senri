import { enableMapSet } from "immer";
import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";
import type { Line } from "../types/line";
import { LinePartialSchema, LineWithoutIdSchema } from "../types/line";

enableMapSet();

interface LineState {
  lines: Map<string, Line>;
}

interface LineAction {
  addLine: (
    line: Omit<Line, "id">,
  ) => ReturnType<typeof LineWithoutIdSchema.safeParse>;
  removeLine: (id: string) => void;
  editLine: (
    id: string,
    updates: Partial<Line>,
  ) => ReturnType<typeof LinePartialSchema.safeParse>;
}

export const useLineStore = create<LineState & LineAction>()(
  devtools(
    immer((set) => ({
      lines: new Map(),
      /**
       * 線を追加する
       */
      addLine: (line) => {
        const result = LineWithoutIdSchema.safeParse(line);
        if (result.success) {
          set(
            (state) => {
              const newId = crypto.randomUUID();
              state.lines.set(newId, { ...result.data, id: newId });
            },
            false,
            "addLine",
          );
        }
        return result;
      },
      /**
       * 線を削除する
       */
      removeLine: (id) =>
        set(
          (state) => {
            state.lines.delete(id);
          },
          false,
          "removeLine",
        ),
      /**
       * 線を編集する
       */
      editLine: (id, updates) => {
        const result = LinePartialSchema.safeParse(updates);
        if (result.success) {
          set(
            (state) => {
              const targetLine = state.lines.get(id);
              if (targetLine) {
                state.lines.set(id, { ...targetLine, ...result.data });
              }
            },
            false,
            "editLine",
          );
        }
        return result;
      },
    })),
  ),
);
