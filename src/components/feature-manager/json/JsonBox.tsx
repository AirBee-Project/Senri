import { IconTarget, IconTrash } from "@tabler/icons-react";
import type React from "react";
import { useCallback, useRef, useState } from "react";
import type { JsonLayerData } from "../../../stores/jsonLayerStore";
import { useMapStore } from "../../../stores/mapStore";
import { useTimeStore } from "../../../stores/timeStore";
import { calculateVoxelFocus } from "../../../utils/focusHelper";
import { jsonToGeometry } from "../../../utils/parser/jsonToGeometry";
import ColorButton from "../common-ui/ColorButton";
import ColorPanel from "../common-ui/ColorPanel";
import FeatureItemBox from "../common-ui/FeatureItemBox";
import IconButton from "../common-ui/IconButton";
import styles from "./JsonBox.module.scss";

type JsonBoxProps = {
  data: JsonLayerData;
  opacity: number;
  onOpacityChange: (opacity: number) => void;
  onDelete: () => void;
};

export default function JsonBox({
  data,
  opacity,
  onOpacityChange,
  onDelete,
}: JsonBoxProps) {
  const colorButtonRef = useRef<HTMLButtonElement>(null);
  const [triggerRect, setTriggerRect] = useState<DOMRect | null>(null);

  const flyTo = useMapStore((state) => state.flyTo);
  const setCurrentTime = useTimeStore((state) => state.setCurrentTime);

  const handleFocusClick = () => {
    const geometries = jsonToGeometry(data, true);
    if (geometries.length === 0) return;
    const target = calculateVoxelFocus(geometries);
    flyTo(target.longitude, target.latitude, target.zoom);
    if (target.minStartTime !== null) {
      setCurrentTime(target.minStartTime);
    }
  };

  const handleColorClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (triggerRect) {
      setTriggerRect(null);
    } else {
      setTriggerRect(e.currentTarget.getBoundingClientRect());
    }
  };

  const handleColorChange = useCallback(
    (newColor: { r: number; g: number; b: number; a: number }) => {
      onOpacityChange(newColor.a);
    },
    [onOpacityChange],
  );

  const handleClosePanel = useCallback(() => {
    setTriggerRect(null);
  }, []);

  return (
    <>
      <FeatureItemBox
        horizontal={true}
        actions={
          <>
            <IconButton
              onClick={onDelete}
              ariaLabel="JSONデータを削除"
              variant="danger"
            >
              <IconTrash />
            </IconButton>
            <IconButton onClick={handleFocusClick} ariaLabel="JSONデータに移動">
              <IconTarget />
            </IconButton>
            <ColorButton
              ref={colorButtonRef}
              color={{ r: 100, g: 100, b: 100, a: opacity }}
              ariaLabel="透明度を変更"
              onClick={handleColorClick}
            />
          </>
        }
      >
        <div className={styles.dataSection}>
          <div className={styles.metaRow}>
            <span className={styles.metaValue}>{data.name}</span>
          </div>
        </div>
      </FeatureItemBox>

      {triggerRect && (
        <ColorPanel
          color={{ r: 100, g: 100, b: 100, a: opacity }}
          onChange={handleColorChange}
          onClose={handleClosePanel}
          triggerRect={triggerRect}
          ignoreRef={colorButtonRef}
          opacityOnly={true}
        />
      )}
    </>
  );
}
