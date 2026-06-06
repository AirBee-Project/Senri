import {
  IconChevronDown,
  IconPlayerPauseFilled,
  IconPlayerPlayFilled,
} from "@tabler/icons-react";
import { useTimeStore } from "../../stores/timeStore";
import styles from "./TimeBar.module.scss";

const SPEEDS = [
  { label: "x1", value: 1 },
  { label: "x10", value: 10 },
  { label: "1min/s", value: 60 },
  { label: "1hr/s", value: 3600 },
  { label: "1day/s", value: 86400 },
];

/**
 * タイムコントロールパネル
 */
export default function TimeControls() {
  const isPlaying = useTimeStore((state) => state.isPlaying);
  const setIsPlaying = useTimeStore((state) => state.setIsPlaying);
  const playbackSpeed = useTimeStore((state) => state.playbackSpeed);
  const setPlaybackSpeed = useTimeStore((state) => state.setPlaybackSpeed);

  return (
    <div className={styles.controlsContainer}>
      <button
        type="button"
        onClick={() => setIsPlaying(!isPlaying)}
        className={styles.playButton}
        aria-label={isPlaying ? "一時停止" : "再生"}
        title={isPlaying ? "Pause" : "Play"}
      >
        {isPlaying ? (
          <IconPlayerPauseFilled size={20} className={styles.playIcon} />
        ) : (
          <IconPlayerPlayFilled size={20} className={styles.playIcon} />
        )}
      </button>

      <div className={styles.speedWrapper}>
        <select
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
          className={styles.speedSelect}
          aria-label="再生速度を選択"
        >
          {SPEEDS.map((s) => (
            <option key={s.value} value={s.value}>
              {s.label}
            </option>
          ))}
        </select>
        <div className={styles.chevronIcon}>
          <IconChevronDown size={12} stroke={3} />
        </div>
      </div>
    </div>
  );
}
