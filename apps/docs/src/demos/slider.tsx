import * as React from "react";
import type { DemoEntry } from "./types";
import { Field, Slider } from "@deyloom/react";

function ControlledSliderDemo() {
  const [values, setValues] = React.useState<number[]>([42]);

  return (
    <div style={{ display: "grid", gap: 8, width: "100%" }}>
      <Slider
        aria-label="强度"
        value={values}
        onValueChange={setValues}
        showValue
        formatValue={(next) => `${next[0] ?? 0}%`}
      />
      <span style={{ color: "var(--dl-color-ink-muted)", fontSize: "var(--dl-text-sm)" }}>
        当前强度：{values[0] ?? 0}%
      </span>
    </div>
  );
}

export const sliderDemo: DemoEntry = {
  slug: "slider",
  title: "Slider",
  group: "form",
  summary: "单值或区间滑块。填充条用 scaleX 而不是宽度，拖拽时滑块放大到 1.12。",
  examples: [
    {
      title: "单值",
      layout: "stretch",
      render: () => (
        <div style={{ display: "grid", gap: 16 }}>
          <Slider aria-label="音量" defaultValue={[42]} showValue />
          <Slider aria-label="字号" defaultValue={[16]} min={12} max={24} step={1} showValue />
        </div>
      ),
    },
    {
      title: "区间",
      layout: "stretch",
      render: () => (
        <Slider aria-label="预算区间" defaultValue={[1200, 4800]} min={0} max={6000} step={100} showValue />
      ),
    },
    {
      title: "受控",
      description: "showValue 可搭配 formatValue 输出自定义读数。",
      layout: "stretch",
      render: () => <ControlledSliderDemo />,
    },
    {
      title: "禁用与错误态",
      layout: "stretch",
      render: () => (
        <div style={{ display: "grid", gap: 16 }}>
          <Slider aria-label="禁用滑块" defaultValue={[30]} disabled showValue />
          <Field label="并发数" error="并发数不能超过 8。">
            <Slider defaultValue={[12]} max={16} showValue />
          </Field>
        </div>
      ),
    },
  ],
  props: [
    { name: "value / defaultValue", type: "number[]", description: "一个值代表单滑块，两个值代表区间。" },
    { name: "onValueChange", type: "(value: number[]) => void", description: "拖动或键盘改变时触发。" },
    { name: "showValue", type: "boolean", default: "false", description: "右侧显示等宽数字读数。" },
    { name: "formatValue", type: "(value: number[]) => ReactNode", description: "自定义读数格式。" },
    { name: "size", type: '"sm" | "md"', default: '"md"', description: "轨道与滑块尺寸。" },
  ],
  notes: ["aria-label 会应用到每个滑块；区间滑块会自动追加序号（如「预算区间 1 / 2」）。"],
};
