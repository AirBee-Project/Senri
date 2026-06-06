import { beforeEach, describe, expect, it } from "vitest";
import { useTimeStore } from "./timeStore";

describe("useTimeStore", () => {
  beforeEach(() => {
    useTimeStore.setState({
      currentTime: 1735689600,
      isPlaying: false,
      playbackSpeed: 1,
      minTime: 1735689600 - 86400 * 7,
      maxTime: 1735689600 + 86400 * 7,
    });
  });

  it("初期状態が正しく設定されていること", () => {
    const state = useTimeStore.getState();
    expect(state.currentTime).toBe(1735689600);
    expect(state.isPlaying).toBe(false);
    expect(state.playbackSpeed).toBe(1);
    expect(state.minTime).toBe(1735689600 - 86400 * 7);
    expect(state.maxTime).toBe(1735689600 + 86400 * 7);
  });

  describe("setCurrentTime", () => {
    it("現在時間を数値で直接更新できること", () => {
      const { setCurrentTime } = useTimeStore.getState();
      setCurrentTime(1735776000); // 1日進める
      expect(useTimeStore.getState().currentTime).toBe(1735776000);
    });

    it("現在時間を更新関数経由で更新できること", () => {
      const { setCurrentTime } = useTimeStore.getState();
      setCurrentTime((prev) => prev + 3600); // 1時間進める
      expect(useTimeStore.getState().currentTime).toBe(1735689600 + 3600);
    });
  });

  describe("setIsPlaying", () => {
    it("再生状態を切り替えられること", () => {
      const { setIsPlaying } = useTimeStore.getState();
      setIsPlaying(true);
      expect(useTimeStore.getState().isPlaying).toBe(true);

      setIsPlaying(false);
      expect(useTimeStore.getState().isPlaying).toBe(false);
    });
  });

  describe("setPlaybackSpeed", () => {
    it("再生速度の倍率を変更できること", () => {
      const { setPlaybackSpeed } = useTimeStore.getState();
      setPlaybackSpeed(60);
      expect(useTimeStore.getState().playbackSpeed).toBe(60);
    });
  });

  describe("setTimeRange", () => {
    it("タイムラインの表示可能範囲を変更できること", () => {
      const { setTimeRange } = useTimeStore.getState();
      const min = 1700000000;
      const max = 1800000000;
      setTimeRange(min, max);
      expect(useTimeStore.getState().minTime).toBe(min);
      expect(useTimeStore.getState().maxTime).toBe(max);
    });
  });
});
