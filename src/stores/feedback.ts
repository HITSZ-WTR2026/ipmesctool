import { atom, useAtom } from "jotai";
import { listen } from "@tauri-apps/api/event";

export interface Timestamped<T> {
  timestamp: number;
  value: T;
}

const MAX_HISTORY = 100000;

// 支持的反馈类型及对应值类型
export type MotorFeedbackValueMap = {
  speed: number;
  position: number;
  iabc: [number, number, number];
  udc: number;
};

export interface MotorFeedbackEvent {
  type: MotorFeedbackType;
  value: number | [number, number, number];
  timestamp: number;
}

export type MotorFeedbackType = keyof MotorFeedbackValueMap;

export type MotorFeedbackState =
  | "None"
  | "Speed"
  | "Position"
  | "Current"
  | "Udc";

// 统一的 feedback atom
export const feedbackAtom = atom<{
  [K in MotorFeedbackType]: Timestamped<MotorFeedbackValueMap[K]>[];
}>({
  speed: [],
  position: [],
  iabc: [],
  udc: [],
});

export function useMotorFeedbackListener() {
  const [, setFeedback] = useAtom(feedbackAtom);

  const setterMap = {
    speed: (entry: Timestamped<number>) =>
      setFeedback((prev) => ({
        ...prev,
        speed: [...prev.speed, entry].slice(-MAX_HISTORY),
      })),
    position: (entry: Timestamped<number>) =>
      setFeedback((prev) => ({
        ...prev,
        position: [...prev.position, entry].slice(-MAX_HISTORY),
      })),
    iabc: (entry: Timestamped<[number, number, number]>) =>
      setFeedback((prev) => ({
        ...prev,
        iabc: [...prev.iabc, entry].slice(-MAX_HISTORY),
      })),
    udc: (entry: Timestamped<number>) =>
      setFeedback((prev) => ({
        ...prev,
        udc: [...prev.udc, entry].slice(-MAX_HISTORY),
      })),
  };

  return () =>
    listen<MotorFeedbackEvent>("motor_feedback_update", (event) => {
      const { type, timestamp, value } = event.payload;
      switch (type) {
        case "speed":
          setterMap.speed({ timestamp, value: value as number });
          break;
        case "position":
          setterMap.position({ timestamp, value: value as number });
          break;
        case "iabc":
          setterMap.iabc({
            timestamp,
            value: value as [number, number, number],
          });
          break;
        case "udc":
          setterMap.udc({ timestamp, value: value as number });
          break;
      }
    });
}
