import { IconMap, IconRefresh, IconTableMinus } from "@tabler/icons-react";
import DrowModeButton from "./DrowModeButton";
import styles from "./DrowModeToolbar.module.scss";

/**
 * @description 範囲表記と個別表記のモード切り替えや、地図の切り替え、タイムゾーンを変更するためのUI。画面右下に表示される。
 */
export default function DrowModeToolbar() {
  return (
    <div className={styles.rightControls}>
      <DrowModeButton icon={IconRefresh} isActive={false} />
      <DrowModeButton icon={IconMap} isActive={false} />
      <DrowModeButton icon={IconTableMinus} isActive={false} />
    </div>
  );
}
