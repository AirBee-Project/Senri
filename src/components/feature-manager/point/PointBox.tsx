import { IconTarget, IconTrash } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import type { Point } from "../../../types/geometry/point";
import styles from "./PointBox.module.css";

type PointBoxProps = {
  point: Point;
  onUpdate: (id: string, updates: Partial<Point>) => void;
  onDelete: (id: string) => void;
};

/**
 * 緯度・経度・高度の入力欄と、削除・フォーカス・カラーの操作ボタンを持つボックス一つのセット
 */
export default function PointBox({ point, onUpdate, onDelete }: PointBoxProps) {
  const [latText, setLatText] = useState(point.latitude.toString());
  const [lngText, setLngText] = useState(point.longitude.toString());
  const [altText, setAltText] = useState(point.altitude.toString());

  useEffect(() => {
    setLatText(point.latitude.toString());
    setLngText(point.longitude.toString());
    setAltText(point.altitude.toString());
  }, [point.latitude, point.longitude, point.altitude]);

  return (
    <div className={styles.itemBox}>
      <div className={styles.inputBox}>
        <div className={styles.inputElement}>
          <span className={styles.inputLabel}>緯度</span>
          <input
            type="number"
            className={styles.inputField}
            value={latText}
            onChange={(e) => {
              const val = e.target.value;
              setLatText(val);
              const num = parseFloat(val);
              if (!Number.isNaN(num)) {
                onUpdate(point.id, { latitude: num });
              }
            }}
            onBlur={() => {
              const num = parseFloat(latText) || 0;
              setLatText(num.toString());
              onUpdate(point.id, { latitude: num });
            }}
          />
        </div>

        <div className={styles.inputElement}>
          <span className={styles.inputLabel}>経度</span>
          <input
            type="number"
            className={styles.inputField}
            value={lngText}
            onChange={(e) => {
              const val = e.target.value;
              setLngText(val);
              const num = parseFloat(val);
              if (!Number.isNaN(num)) {
                onUpdate(point.id, { longitude: num });
              }
            }}
            onBlur={() => {
              const num = parseFloat(lngText) || 0;
              setLngText(num.toString());
              onUpdate(point.id, { longitude: num });
            }}
          />
        </div>

        <div className={styles.inputElement}>
          <span className={styles.inputLabel}>高度</span>
          <input
            type="number"
            className={styles.inputField}
            value={altText}
            onChange={(e) => {
              const val = e.target.value;
              setAltText(val);
              const num = parseFloat(val);
              if (!Number.isNaN(num) && num >= 0) {
                onUpdate(point.id, { altitude: num });
              }
            }}
            onBlur={() => {
              const num = Math.max(0, parseFloat(altText) || 0);
              setAltText(num.toString());
              onUpdate(point.id, { altitude: num });
            }}
          />
        </div>
      </div>

      <div className={styles.actionGroup}>
        <button
          type="button"
          onClick={() => onDelete(point.id)}
          className={`${styles.iconButton} ${styles.deleteButton}`}
          aria-label="点を削除"
        >
          <IconTrash size={16} />
        </button>

        <button
          type="button"
          className={styles.iconButton}
          aria-label="点に移動"
        >
          <IconTarget size={16} />
        </button>

        <div
          className={styles.colorSwatch}
          style={{
            backgroundColor: `rgba(${point.color?.r}, ${point.color?.g}, ${point.color?.b}, ${(point.color?.a ?? 255) / 255})`,
          }}
        />
      </div>
    </div>
  );
}
