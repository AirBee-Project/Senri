import { useRef, useState } from "react";
import type { TableInfo } from "../../api/kasane/types";
import { useKasaneStore } from "../../stores/kasaneStore";
import type { RGBAColor } from "../../types/geometry/color";
import ColorButton from "../feature-manager/common-ui/ColorButton";
import ColorPanel from "../feature-manager/common-ui/ColorPanel";
import { KASANE_COLOR } from "../map/kasaneSublayers";
import styles from "./ValueColorPanel.module.scss";

type ValueColorRowProps = {
  label: string;
  color: RGBAColor;
  onChange: (color: RGBAColor) => void;
};

/** 1つの値と、その色スウォッチ。クリックでカラーピッカーを開く */
function ValueColorRow({ label, color, onChange }: ValueColorRowProps) {
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  return (
    <div className={styles.row}>
      <span className={styles.label}>{label}</span>
      <ColorButton
        ref={buttonRef}
        color={color}
        ariaLabel={`${label}の色を変更`}
        onClick={(e) =>
          setTriggerRect(
            triggerRect ? null : e.currentTarget.getBoundingClientRect(),
          )
        }
      />
      {triggerRect && (
        <ColorPanel
          color={color}
          onChange={onChange}
          onClose={() => setTriggerRect(null)}
          triggerRect={triggerRect}
          ignoreRef={buttonRef}
          anchorToTrigger
        />
      )}
    </div>
  );
}

type ValueColorPanelProps = {
  table: TableInfo;
};

/**
 * boolean/string テーブルの値ごとに色・不透明度を設定するパネル。
 * テーブル一覧パネルの右横に表示される。値はタイル読み込みで観測されたものを一覧する。
 * 閉じる操作はテーブル一覧パネルの鉛筆ボタンの再クリックで行う。
 */
export default function ValueColorPanel({ table }: ValueColorPanelProps) {
  // セレクタ内で ?? [] すると毎回新しい参照になり無限再レンダリングするため、外でフォールバックする
  const observedValues =
    useKasaneStore((s) => s.observedValues[table.name]) ?? [];
  const valueColors = useKasaneStore((s) => s.valueColors[table.name]);
  const setValueColor = useKasaneStore((s) => s.setValueColor);

  return (
    <div className={styles.panel}>
      {observedValues.length === 0 ? (
        <div className={styles.message}>
          値がまだ読み込まれていません。地図にデータが表示されると値が現れます。
        </div>
      ) : (
        observedValues.map((value) => {
          const key = String(value);
          return (
            <ValueColorRow
              key={key}
              label={key}
              color={valueColors?.[key] ?? KASANE_COLOR}
              onChange={(color) => setValueColor(table.name, key, color)}
            />
          );
        })
      )}
    </div>
  );
}
