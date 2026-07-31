import { useState } from "react";
import type { TableInfo } from "../../api/kasane/types";
import { useKasaneStore } from "../../stores/kasaneStore";
import styles from "./ValueColorPanel.module.scss";

type BufferConfigPanelProps = {
  table: TableInfo;
};

export default function BufferConfigPanel({ table }: BufferConfigPanelProps) {
  const rawQueryConfig = useKasaneStore((s) => s.queryConfigs[table.name]);
  const queryConfig = {
    radiusX: rawQueryConfig?.radiusX ?? 0,
    radiusY: rawQueryConfig?.radiusY ?? 0,
    zoomOutLevel: rawQueryConfig?.zoomOutLevel ?? table.max_zoom_level,
  };
  const setQueryConfig = useKasaneStore((s) => s.setQueryConfig);

  const [localRadiusX, setLocalRadiusX] = useState<number | string>(
    queryConfig.radiusX,
  );
  const [localRadiusY, setLocalRadiusY] = useState<number | string>(
    queryConfig.radiusY,
  );
  const [localZoomOut, setLocalZoomOut] = useState<number | string>(
    queryConfig.zoomOutLevel,
  );

  const applyConfig = () => {
    let rx = localRadiusX === "" ? 0 : Number(localRadiusX);
    let ry = localRadiusY === "" ? 0 : Number(localRadiusY);
    let z = localZoomOut === "" ? table.max_zoom_level : Number(localZoomOut);

    if (Number.isNaN(rx)) rx = 0;
    if (Number.isNaN(ry)) ry = 0;
    if (Number.isNaN(z)) z = table.max_zoom_level;

    setQueryConfig(table.name, rx, ry, z);
  };

  return (
    <div className={styles.panel}>
      <div className={styles.inputGroup}>
        <label htmlFor="radius-x-input" className={styles.inputLabel}>
          バッファ半径 (X)
        </label>
        <input
          id="radius-x-input"
          type="number"
          className={styles.numberInput}
          min="0"
          max="10"
          step="1"
          value={localRadiusX}
          onChange={(e) =>
            setLocalRadiusX(e.target.value === "" ? "" : Number(e.target.value))
          }
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="radius-y-input" className={styles.inputLabel}>
          バッファ半径 (Y)
        </label>
        <input
          id="radius-y-input"
          type="number"
          className={styles.numberInput}
          min="0"
          max="10"
          step="1"
          value={localRadiusY}
          onChange={(e) =>
            setLocalRadiusY(e.target.value === "" ? "" : Number(e.target.value))
          }
        />
      </div>

      <div className={styles.inputGroup}>
        <label htmlFor="zoom-input" className={styles.inputLabel}>
          ベースズームアウト
        </label>
        <input
          id="zoom-input"
          type="number"
          className={styles.numberInput}
          min="20"
          max="25"
          step="1"
          value={localZoomOut}
          onChange={(e) =>
            setLocalZoomOut(e.target.value === "" ? "" : Number(e.target.value))
          }
        />
      </div>

      <button
        type="button"
        onClick={applyConfig}
        style={{
          width: "100%",
          padding: "0.25rem",
          backgroundColor: "#0f766e",
          color: "white",
          border: "none",
          borderRadius: "0.25rem",
          cursor: "pointer",
          fontWeight: "600",
          fontSize: "0.75rem",
        }}
      >
        決定
      </button>
    </div>
  );
}
