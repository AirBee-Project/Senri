import { IconCube, IconLine, IconPoint } from "@tabler/icons-react";
import FeatureButton from "./FeatureButton";
import styles from "./FeatureToolbar.module.scss";
import { useFeatureManagerStore } from "./featureManagerStores";

/**
 * @description 地図上に点、線、空間IDなどを追加するためのツールバー。画面左上に表示される。
 */
export default function FeatureToolbar() {
  const activeMode = useFeatureManagerStore((state) => state.activeMode);
  const toggleMode = useFeatureManagerStore((state) => state.toggleMode);

  return (
    <div className={styles.toolbar}>
      <FeatureButton
        name={"空間ID"}
        icon={IconCube}
        isActive={activeMode === "spatial"}
        onClick={() => toggleMode("spatial")}
      />
      <FeatureButton
        name={"点"}
        icon={IconPoint}
        isActive={activeMode === "point"}
        onClick={() => toggleMode("point")}
      />
      <FeatureButton
        name={"線"}
        icon={IconLine}
        isActive={activeMode === "line"}
        onClick={() => toggleMode("line")}
      />
    </div>
  );
}
