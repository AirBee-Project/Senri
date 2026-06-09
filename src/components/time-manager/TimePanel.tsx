import { useEffect } from "react";
import { useTimeStore } from "../../stores/timeStore";
import TimeBar from "./TimeBar";
import TimeControls from "./TimeControls";
import styles from "./TimePanel.module.scss";

/**
 * タイムライン表示全体を管理するパネルコンポーネント
 */
export default function TimePanel() {
  const currentTime = useTimeStore((state) => state.currentTime);
  const setCurrentTime = useTimeStore((state) => state.setCurrentTime);
  const isPlaying = useTimeStore((state) => state.isPlaying);
  const playbackSpeed = useTimeStore((state) => state.playbackSpeed);

  useEffect(() => {
    let animationFrameId: number;
    let lastTimestamp = 0;

    const animate = (timestamp: number) => {
      if (!lastTimestamp) lastTimestamp = timestamp;

      const deltaTime = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;

      if (isPlaying) {
        setCurrentTime((prev) => prev + deltaTime * playbackSpeed);
      }

      animationFrameId = requestAnimationFrame(animate);
    };

    if (isPlaying) {
      animationFrameId = requestAnimationFrame(animate);
    }

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [isPlaying, playbackSpeed, setCurrentTime]);

  const formattedTime = new Date(currentTime * 1000).toLocaleString("ja-JP", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  return (
    <div className={styles.footerContainer}>
      <div className={styles.topRow}>
        <div className={styles.timestamp}>{formattedTime}</div>
        <div className={styles.controlsCenter}>
          <TimeControls />
        </div>
      </div>
      <div className={styles.timelineBar}>
        <TimeBar />
      </div>
    </div>
  );
}
