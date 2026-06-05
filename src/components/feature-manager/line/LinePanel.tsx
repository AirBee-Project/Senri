import { useLineStore } from "../../../stores/lineStores";
import type { Line } from "../../../types/geometry/line";
import CommonPanel from "../common-ui/Panel";
import FooterAddButton from "../common-ui/FooterAddButton";
import LineBox from "./LineBox";

/**
 * 線のボックス一覧を表示するパネル
 */
export default function LinePanel() {
  const linesMap = useLineStore((state) => state.lines);
  const addLine = useLineStore((state) => state.addLine);
  const editLine = useLineStore((state) => state.editLine);
  const removeLine = useLineStore((state) => state.removeLine);

  const linesList = Array.from(linesMap.values());

  const handleAdd = () => {
    //初期値
    addLine({
      start: {
        latitude: 35.681,
        longitude: 139.767,
        altitude: 0,
      },
      end: {
        latitude: 35.691,
        longitude: 139.787,
        altitude: 0,
      },
      color: { r: 15, g: 118, b: 110, a: 255 },
      width: 2,
    });
  };

  const handleUpdate = (id: string, updates: Partial<Line>) => {
    editLine(id, updates);
  };

  const handleDelete = (id: string) => {
    removeLine(id);
  };

  return (
    <CommonPanel
      footerButton={
        <FooterAddButton onClick={handleAdd} ariaLabel="線を追加" />
      }
    >
      {linesList.map((line) => (
        <LineBox
          key={line.id}
          line={line}
          onUpdate={handleUpdate}
          onDelete={handleDelete}
        />
      ))}
    </CommonPanel>
  );
}
