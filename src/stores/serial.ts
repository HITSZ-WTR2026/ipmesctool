import { listen } from "@tauri-apps/api/event";
import { atom } from "jotai";
import { useAtom } from "jotai/index";
import { useEffect } from "react";

export interface SerialData {
  type: "rx" | "tx";
  data: string;
  timestamp: number;
}
export const serialDataAtom = atom<SerialData[]>([]);

export function useSerialDebug() {
  const [, setSerialData] = useAtom(serialDataAtom);
  // 监听串口事件（只读）
  useEffect(() => {
    const lr = listen("serial-received", (event) => {
      setSerialData((prev) => [
        ...prev,
        { type: "rx", data: event.payload as string, timestamp: Date.now() },
      ]);
    });

    const lt = listen("serial-sent", (event) => {
      setSerialData((prev) => [
        ...prev,
        { type: "tx", data: event.payload as string, timestamp: Date.now() },
      ]);
    });

    return () => {
      lr.then((un) => un());
      lt.then((un) => un());
    };
  }, [setSerialData]);
}
