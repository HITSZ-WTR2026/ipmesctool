import { useAtom, useSetAtom } from "jotai";
import { motorConfigAtom, motorConfigUnsavedAtom } from "@/stores/motor.ts";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card.tsx";
import { ButtonGroup, ButtonGroupText } from "@/components/ui/button-group.tsx";
import { Label } from "@/components/ui/label.tsx";
import { Input } from "@/components/ui/input.tsx";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { RefreshCcw, Save } from "lucide-react";
import { setPartValue } from "@/lib/utils.ts";
import { toast } from "sonner";
import { invoke } from "@tauri-apps/api/core";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog.tsx";
import { InputLine } from "@/components/input-line.tsx";

export function IdInput({
  value,
  onChange,
  confirmOnSave = false,
  confirmMessage,
}: {
  value: number;
  onChange: (v: number) => void;

  confirmOnSave?: boolean; // 是否需要确认框
  confirmMessage?: string; // 警告内容
}) {
  const [internalValue, setInternalValue] = useState("");
  const [editing, setEditing] = useState(false);

  const [confirmOpen, setConfirmOpen] = useState(false);

  const formatHex = (v: number) =>
    "0x" + v.toString(16).toUpperCase().padStart(2, "0");

  const parseValue = (raw: string): number | null => {
    const s = raw.trim();
    if (!s) return null;
    if (s.toLowerCase().startsWith("0x")) {
      const hex = s.slice(2);
      if (/^[0-9a-fA-F]+$/.test(hex)) return parseInt(hex, 16);
      return null;
    }
    if (/^\d+$/.test(s)) return parseInt(s, 10);
    return null;
  };

  useEffect(() => {
    if (!editing) setInternalValue(formatHex(value));
  }, [value]);

  const doSave = () => {
    const parsed = parseValue(internalValue);
    if (parsed !== null) onChange(parsed);
    setInternalValue(parsed !== null ? formatHex(parsed) : formatHex(value));
    setEditing(false);
  };

  const handleSaveClick = () => {
    if (confirmOnSave) {
      setConfirmOpen(true);
    } else {
      doSave();
    }
  };

  const handleReset = () => {
    setInternalValue(formatHex(value));
    setEditing(false);
  };

  const handleBlur = () => {
    setEditing(false);
    const parsed = parseValue(internalValue);
    if (parsed !== null) {
      setInternalValue(formatHex(parsed > 0xff ? value : parsed));
    } else {
      setInternalValue(formatHex(value));
    }
  };

  return (
    <>
      <ButtonGroup className="w-full">
        <ButtonGroupText asChild>
          <Label className="w-28" htmlFor="ID">
            ID
          </Label>
        </ButtonGroupText>

        <Input
          id="ID"
          value={internalValue}
          onFocus={() => setEditing(true)}
          onChange={(e) => setInternalValue(e.target.value)}
          onBlur={handleBlur}
        />

        <Button variant="outline" size="icon" onClick={handleReset}>
          <RefreshCcw />
        </Button>

        <Button variant="outline" size="icon" onClick={handleSaveClick}>
          <Save />
        </Button>
      </ButtonGroup>

      {/* 保存确认对话框 */}
      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认保存？</AlertDialogTitle>
            <AlertDialogDescription>
              {confirmMessage ?? "确定要保存此配置吗？"}
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                doSave();
              }}
            >
              确认保存
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

export default function DeviceInfo() {
  const [config, setConfig] = useAtom(motorConfigAtom);
  const setUnsaved = useSetAtom(motorConfigUnsavedAtom);

  return config ? (
    <div className="w-full p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">设备信息</CardTitle>
          <CardAction></CardAction>
        </CardHeader>
        <CardContent className="text-sm flex flex-col gap-2">
          <IdInput
            value={config.id}
            onChange={async (v) => {
              try {
                await invoke("config_motor_id", { id: v });
                setUnsaved(true);
                setPartValue(setConfig, config, "id", v);
              } catch (e) {
                toast.error(`id 设置失败: ${e}`);
              }
            }}
          />
          <InputLine
            label="Udc"
            value={config.udc}
            confirmOnSave
            confirmMessage={(newValue) => (
              <p>
                确定要将 Udc 设置为{" "}
                <span className="text-red-500">{newValue}</span> V
                吗？该参数取决于你使用的分电板类型
              </p>
            )}
            onChange={async (v) => {
              try {
                await invoke("config_motor_udc", { udc: v });
                setUnsaved(true);
                setPartValue(setConfig, config, "udc", v);
              } catch (e) {
                toast.error(`Udc 设置失败: ${e}`);
              }
            }}
          />
          <InputLine
            label="Idq Filter"
            value={config.fc}
            confirmOnSave
            confirmMessage={(newValue) => (
              <p>
                确定要将 电流滤波器截止频率 设置为{" "}
                <span className="text-red-500">{newValue}</span> Hz
                吗？我也不知道这是干什么用的（）
              </p>
            )}
            onChange={async (v) => {
              try {
                await invoke("config_motor_idq_filter", { fc: v });
                setUnsaved(true);
                setPartValue(setConfig, config, "fc", v);
              } catch (e) {
                toast.error(`Idq Filter Fc 设置失败: ${e}`);
              }
            }}
          />
        </CardContent>
      </Card>
    </div>
  ) : (
    <div>设备未连接</div>
  );
}
