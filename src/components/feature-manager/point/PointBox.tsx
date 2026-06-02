import { IconTarget, IconTrash } from "@tabler/icons-react";
import type { Point } from "../../../types/geometry/point";
import styles from "./PointBox.module.scss";
import IconButton from "../common-ui/IconButton";
import ColorButton from "../common-ui/ColorButton";
import PositionInput from "../common-ui/PositionInput";

type PointBoxProps = {
  point: Point;
  onUpdate: (id: string, updates: Partial<Point>) => void;
  onDelete: (id: string) => void;
};

/**
 * 緯度・経度・高度の入力欄と、削除・フォーカス・カラーの操作ボタンを持つボックス一つのセット
 */
export default function PointBox({ point, onUpdate, onDelete }: PointBoxProps) {
  const color = point.color ?? { r: 15, g: 118, b: 110, a: 255 };

  return (
    <div className={styles.itemBox}>
      <PositionInput
        id={point.id}
        latitude={point.latitude}
        longitude={point.longitude}
        altitude={point.altitude}
        onChange={(updates) => onUpdate(point.id, updates)}
      />

      <div className={styles.actionGroup}>
        <IconButton
          onClick={() => onDelete(point.id)}
          ariaLabel="点を削除"
          variant="danger"
        >
          <IconTrash />
        </IconButton>

        <IconButton
          onClick={() => {
            // todo
          }}
          ariaLabel="点に移動"
        >
          <IconTarget />
        </IconButton>

        <ColorButton
          color={color}
          ariaLabel="色を変更"
          onClick={() => {
            // todo
          }}
        />
      </div>
    </div>
  );
}
