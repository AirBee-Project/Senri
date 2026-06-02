import { usePointStore } from "../../../stores/pointStores";
import type { Point } from "../../../types/geometry/point";
import CommonPanel from "../common-ui/Panel";
import FooterAddButton from "../common-ui/FooterAddButton";
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
    <CommonPanel
      footerButton={<FooterAddButton onClick={handleAdd} label="点を追加" />}
    >
      {pointsList.map((point) => (
        <PointBox
          key={point.id}
          point={point}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
    </CommonPanel>
  );
}
