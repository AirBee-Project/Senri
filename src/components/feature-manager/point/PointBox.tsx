import { IconTarget, IconTrash } from "@tabler/icons-react";
import type { Point } from "../../../types/geometry/point";
import styles from "./PointPanel.module.css";

type PointBoxProps = {
  point: Point;
  onUpdate: (id: string, updates: Partial<Point>) => void;
  onDelete: (id: string) => void;
};

/**
 * 緯度・経度・高度の入力欄と、削除・フォーカス・カラーの操作ボタンを持つボックス一つのセット
 */
export default function PointBox({ point, onUpdate, onDelete }: PointBoxProps) {
  return (
    <div className={styles.itemBox}>
      <div className={styles.inputBox}>
        <div className={styles.inputElement}>
          <span className={styles.inputLabel}>緯度</span>
          <input
            type="number"
            className={styles.inputField}
            value={point.latitude}
            onChange={(e) => {
              onUpdate(point.id, {
                latitude: parseFloat(e.target.value) || 0,
              });
            }}
          />
        </div>

        <div className={styles.inputElement}>
          <span className={styles.inputLabel}>経度</span>
          <input
            type="number"
            className={styles.inputField}
            value={point.longitude}
            onChange={(e) => {
              onUpdate(point.id, {
                longitude: parseFloat(e.target.value) || 0,
              });
            }}
          />
        </div>

        <div className={styles.inputElement}>
          <span className={styles.inputLabel}>高度</span>
          <input
            type="number"
            className={styles.inputField}
            value={point.altitude}
            onChange={(e) => {
              onUpdate(point.id, {
                altitude: parseFloat(e.target.value) || 0,
              });
            }}
          />
        </div>
      </div>

      <div className={styles.actionGroup}>
        <button
          type="button"
          onClick={() => onDelete(point.id)}
          className={`${styles.iconButton} ${styles.deleteButton}`}
        >
          <IconTrash size={16} />
        </button>

        <button type="button" className={styles.iconButton}>
          <IconTarget size={16} />
        </button>

        <div
          className={styles.colorSwatch}
          style={{
            backgroundColor: `rgba(${point.color?.r}, ${point.color?.g}, ${point.color?.b}, ${point.color?.a ? point.color.a / 255 : 1})`,
          }}
        />
      </div>
    </div>
  );
}
