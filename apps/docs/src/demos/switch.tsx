import * as React from "react";
import type { DemoEntry } from "./types";
import { Field, Switch } from "@deyloom/react";

function ControlledSwitchDemo() {
  const [enabled, setEnabled] = React.useState(true);

  return (
    <div style={{ display: "grid", gap: 12 }}>
      <label style={{ display: "inline-flex", alignItems: "center", gap: 10 }}>
        <Switch checked={enabled} onCheckedChange={setEnabled} aria-label="自动同步" />
        <span>{enabled ? "自动同步已开启" : "自动同步已关闭"}</span>
      </label>
    </div>
  );
}

export const switchDemo: DemoEntry = {
  slug: "switch",
  title: "Switch",
  group: "form",
  summary: "二元开关。滑块用 snappy 弹簧位移，轨道只过渡颜色。",
  examples: [
    {
      title: "尺寸",
      layout: "row",
      render: () => (
        <>
          <Switch size="sm" aria-label="小号开关" defaultChecked />
          <Switch aria-label="中号开关" defaultChecked />
          <Switch size="sm" aria-label="关闭的开关" />
        </>
      ),
    },
    {
      title: "受控状态",
      description: "状态文字与滑块由同一个 state 驱动。",
      layout: "stretch",
      render: () => <ControlledSwitchDemo />,
    },
    {
      title: "放进 Field",
      description: "按钮没有内建文字时，Field 的标签会成为可访问名称。",
      layout: "stretch",
      render: () => (
        <div style={{ display: "grid", gap: 16 }}>
          <Field label="自动同步" hint="开启后每次保存都会推送到远端。">
            <Switch defaultChecked />
          </Field>
          <Field label="维护模式" disabled>
            <Switch />
          </Field>
        </div>
      ),
    },
  ],
  props: [
    { name: "checked / defaultChecked", type: "boolean", description: "受控或非受控的开关状态。" },
    { name: "onCheckedChange", type: "(checked: boolean) => void", description: "切换回调。" },
    { name: "size", type: '"sm" | "md"', default: '"md"', description: "40×24 或 32×20 的轨道。" },
    { name: "invalid", type: "boolean", description: "错误态；Field 内自动继承。" },
  ],
  notes: ["Switch 没有内建文字，必须通过 Field 标签或 aria-label 提供名称。"],
};
