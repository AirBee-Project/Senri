import { create } from "zustand";
import { devtools } from "zustand/middleware";
import { immer } from "zustand/middleware/immer";

interface TimeState {
  currentTime: number;
  isPlaying: boolean;
  playbackSpeed: number;
  minTime: number;
  maxTime: number;
}

interface TimeAction {
  setCurrentTime: (time: number | ((prev: number) => number)) => void;
  setIsPlaying: (isPlaying: boolean) => void;
  setPlaybackSpeed: (speed: number) => void;
  setTimeRange: (minTime: number, maxTime: number) => void;
}

/**
 * 表示時刻の状態管理フック
 */
export const useTimeStore = create<TimeState & TimeAction>()(
  devtools(
    immer((set) => ({
      currentTime: 1735689600,
      isPlaying: false,
      playbackSpeed: 1,
      minTime: 1735689600 - 86400 * 7,
      maxTime: 1735689600 + 86400 * 7,

      setCurrentTime: (time) =>
        set(
          (state) => {
            state.currentTime =
              typeof time === "function" ? time(state.currentTime) : time;
          },
          false,
          "setCurrentTime",
        ),

      setIsPlaying: (isPlaying) =>
        set(
          (state) => {
            state.isPlaying = isPlaying;
          },
          false,
          "setIsPlaying",
        ),

      setPlaybackSpeed: (playbackSpeed) =>
        set(
          (state) => {
            state.playbackSpeed = playbackSpeed;
          },
          false,
          "setPlaybackSpeed",
        ),

      setTimeRange: (minTime, maxTime) =>
        set(
          (state) => {
            state.minTime = minTime;
            state.maxTime = maxTime;
          },
          false,
          "setTimeRange",
        ),
    })),
  ),
);
