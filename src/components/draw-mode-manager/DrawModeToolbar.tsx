import { IconMap, IconRefresh, IconTableMinus } from "@tabler/icons-react";
import { useSpatialIdGroupStore } from "../../stores/spatialIdGroupStores";
import DrawModeButton from "./DrawModeButton";
import styles from "./DrawModeToolbar.module.scss";

/**
 * @description 範囲表記と個別表記のモード切り替えや、地図の切り替え、タイムゾーンを変更するためのUI。画面右下に表示される。
 */
export default function DrawModeToolbar() {
  const toggleRangeMode = useSpatialIdGroupStore(
    (state) => state.toggleRangeMode,
  );

  return (
    <div className={styles.rightControls}>
      <DrawModeButton
        icon={IconRefresh}
        isActive={false}
        onClick={toggleRangeMode}
      />
      <DrawModeButton icon={IconMap} isActive={false} />
      <DrawModeButton icon={IconTableMinus} isActive={false} />
    </div>
  );
}
