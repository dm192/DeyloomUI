import * as React from "react";
import type { CSSProperties } from "react";
import type { DemoEntry } from "./types";
import { Button, Progress } from "@deyloom/react";

const stackStyle: CSSProperties = {
  display: "grid",
  gap: "var(--dl-space-6)",
  width: "100%",
  maxWidth: "460px",
};

const rowStyle: CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "var(--dl-space-4)",
};

function ValueExample() {
  return (
    <div style={stackStyle}>
      <Progress value={18} label="准备发布" showValue />
      <Progress value={64} label="上传产物" showValue />
      <Progress value={100} label="部署完成" showValue tone="success" />
    </div>
  );
}

function IndeterminateExample() {
  return (
    <div style={stackStyle}>
      <Progress label="正在连接服务器…" />
      <Progress label="正在同步更改…" tone="neutral" />
    </div>
  );
}

function SizesExample() {
  return (
    <div style={stackStyle}>
      <Progress value={30} size="sm" tone="success" />
      <Progress value={60} size="md" />
      <Progress value={90} size="lg" tone="danger" />
    </div>
  );
}

function Playground() {
  const [value, setValue] = React.useState(36);

  return (
    <div style={stackStyle}>
      <Progress value={value} label="上传进度" showValue />
      <div style={rowStyle}>
        <Button size="sm" variant="outline" onClick={() => setValue((v) => Math.max(0, v - 16))}>
          回退 16%
        </Button>
        <Button size="sm" onClick={() => setValue((v) => Math.min(100, v + 16))}>
          前进 16%
        </Button>
        <Button size="sm" variant="ghost" tone="neutral" onClick={() => setValue(0)}>
          重置
        </Button>
      </div>
    </div>
  );
}

export const progressDemo: DemoEntry = {
  slug: "progress",
  title: "Progress",
  group: "overlay",
  summary: "线性进度条：确定态用 scaleX + springs.snappy 平滑过渡，不确定态是纯合成器循环动画。",
  examples: [
    { title: "确定态", layout: "stretch", render: () => <ValueExample /> },
    { title: "不确定态", layout: "stretch", render: () => <IndeterminateExample /> },
    { title: "尺寸与色调", layout: "stretch", render: () => <SizesExample /> },
    { title: "值变化", description: "拖动式步进：值变化只动 transform，轨道不重排。", layout: "stretch", render: () => <Playground /> },
  ],
  props: [
    { name: "value", type: "number", description: "0–100。省略时进入不确定态。" },
    { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "轨道高度 4 / 6 / 8px。" },
    { name: "tone", type: '"accent" | "success" | "danger" | "neutral"', default: '"accent"', description: "填充与不确定态的颜色。" },
    { name: "label", type: "ReactNode", description: "轨道上方的可见标签。" },
    { name: "showValue", type: "boolean", default: "false", description: "在标签右侧显示取整百分比。" },
    { name: "max", type: "number", default: "100", description: "大于 0 的最大值。" },
  ],
  notes: [
    "确定态填充是 transform: scaleX，值变化由 springs.snappy 驱动，不会触发布局。",
    "不确定态循环动画带 dl-anim-loop：reduced-motion 下停成静态条纹，仍然读得出“进行中”。",
    "aria-valuenow / aria-valuemin / aria-valuemax 由 Radix Progress 提供；不确定态自动省略 aria-valuenow。",
  ],
};
