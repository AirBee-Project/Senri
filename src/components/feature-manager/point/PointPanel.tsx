import { IconPlus } from "@tabler/icons-react";
import { usePointStore } from "../../../stores/pointStores";
import type { Point } from "../../../types/geometry/point";
import sharedStyles from "../panel.module.scss";
import PointBox from "./PointBox";

/**
 * 点のボックス一覧を表示するパネル
 */
export default function PointPanel() {
  const pointsMap = usePointStore((state) => state.points);
  const addPoint = usePointStore((state) => state.addPoint);
  const editPoint = usePointStore((state) => state.editPoint);
  const removePoint = usePointStore((state) => state.removePoint);

  const pointsList = Array.from(pointsMap.values());

  const handleAdd = () => {
    //初期値
    addPoint({
      latitude: 35.681,
      longitude: 139.767,
      altitude: 0,
      color: { r: 15, g: 118, b: 110, a: 255 },
    });
  };

  const handleUpdate = (id: string, updates: Partial<Point>) => {
    editPoint(id, updates);
  };

  const handleDelete = (id: string) => {
    removePoint(id);
  };

  return (
    <div className={sharedStyles.panelContainer}>
      <div className={sharedStyles.scrollArea}>
        <div className={sharedStyles.itemList}>
          {pointsList.map((point) => (
            <PointBox
              key={point.id}
              point={point}
              onUpdate={handleUpdate}
              onDelete={handleDelete}
            />
          ))}
        </div>
      </div>

      <div className={sharedStyles.footer}>
        <button
          type="button"
          onClick={handleAdd}
          className={sharedStyles.addButton}
        >
          <IconPlus size={14} /> 点を追加
        </button>
      </div>
    </div>
  );
}
