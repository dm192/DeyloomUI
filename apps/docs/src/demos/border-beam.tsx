import * as React from "react";
import { BorderBeam, Button } from "@deyloom/react";
import type { DemoEntry } from "./types";

const beamTitle: React.CSSProperties = {
  margin: 0,
  fontSize: "var(--dl-text-xl)",
  fontWeight: "var(--dl-weight-semibold)",
  letterSpacing: "-0.01em",
};

const beamBody: React.CSSProperties = {
  margin: "var(--dl-space-3) 0 0",
  color: "var(--dl-color-ink-muted)",
  fontSize: "var(--dl-text-sm)",
  lineHeight: "var(--dl-leading-base)",
};

function BasicBeamDemo() {
  return (
    <BorderBeam style={{ inlineSize: "100%", maxInlineSize: 520 }}>
      <h3 style={beamTitle}>正在运行的构建</h3>
      <p style={beamBody}>
        1px 的描边由一组被 mask 裁剪到边框区域的 conic-gradient 旋转产生；卡片内部没有任何绘制开销。
      </p>
      <div style={{ marginBlockStart: "var(--dl-space-5)", display: "flex", gap: "var(--dl-space-3)" }}>
        <Button size="sm">查看日志</Button>
        <Button size="sm" variant="outline">
          重新运行
        </Button>
      </div>
    </BorderBeam>
  );
}

const DURATIONS = [3, 6, 10] as const;
const SIZES = [20, 40, 70] as const;
const COLORS = [
  { id: "accent", label: "accent", value: "var(--dl-color-accent)" },
  { id: "success", label: "success", value: "var(--dl-color-success)" },
  { id: "danger", label: "danger", value: "var(--dl-color-danger)" },
] as const;

function TunedBeamDemo() {
  const [duration, setDuration] = React.useState<number>(6);
  const [size, setSize] = React.useState<number>(40);
  const [color, setColor] = React.useState<string>(COLORS[0].value);

  return (
    <div style={{ display: "grid", gap: "var(--dl-space-4)", inlineSize: "100%" }}>
      <BorderBeam duration={duration} size={size} color={color} style={{ inlineSize: "100%" }}>
        <div style={{ display: "grid", gap: "var(--dl-space-2)" }}>
          <span style={{ fontSize: "var(--dl-text-sm)", fontWeight: "var(--dl-weight-medium)" }}>
            旋转 {duration}s / 光斑 {size}%
          </span>
          <span style={{ fontSize: "var(--dl-text-sm)", color: "var(--dl-color-ink-muted)" }}>
            持续时间只是速度参数；尺寸与颜色都通过 CSS 变量传给光斑。
          </span>
        </div>
      </BorderBeam>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--dl-space-2)", alignItems: "center" }}>
        {DURATIONS.map((value) => (
          <Button key={value} size="sm" variant={value === duration ? "solid" : "outline"} onClick={() => setDuration(value)}>
            {value}s
          </Button>
        ))}
        {SIZES.map((value) => (
          <Button key={value} size="sm" variant={value === size ? "solid" : "outline"} onClick={() => setSize(value)}>
            {value}%
          </Button>
        ))}
        {COLORS.map((item) => (
          <Button
            key={item.id}
            size="sm"
            variant={item.value === color ? "solid" : "outline"}
            onClick={() => setColor(item.value)}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export const borderBeamDemo: DemoEntry = {
  slug: "border-beam",
  title: "BorderBeam",
  group: "showcase",
  summary: "1px 描边上的旋转光束；mask 把 conic-gradient 的绘制范围限制在边框环上。",
  examples: [
    {
      title: "默认光束",
      description: "一圈 6s 的匀速旋转，光斑长度为边框周长的 40%。",
      layout: "center",
      render: () => <BasicBeamDemo />,
    },
    {
      title: "速度、长度与颜色",
      description: "duration 是秒数，size 是占整个环的百分比，color 接受任意 CSS 颜色。",
      layout: "stretch",
      render: () => <TunedBeamDemo />,
    },
  ],
  props: [
    { name: "children", type: "ReactNode", description: "边框内的内容。" },
    { name: "duration", type: "number", default: "6", description: "光束转一圈的秒数。" },
    { name: "size", type: "number", default: "40", description: "光斑长度占整圈边框的百分比（1–100）。" },
    { name: "color", type: "string", description: "任意 CSS 颜色；默认使用 --dl-color-accent。" },
  ],
  notes: [
    "旋转动画使用 base.css 中的 dl-beam keyframes，元素标记为 dl-anim-loop。",
    "reduced-motion 下旋转停止，保留一条静态的 accent 描边。",
  ],
};
