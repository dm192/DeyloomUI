import * as React from "react";
import { Button, Marquee } from "@deyloom/react";
import type { DemoEntry } from "./types";

const chipStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  gap: "var(--dl-space-2)",
  padding: "var(--dl-space-3) var(--dl-space-5)",
  borderRadius: "var(--dl-radius-full)",
  fontSize: "var(--dl-text-sm)",
  color: "var(--dl-color-ink)",
  whiteSpace: "nowrap",
};

const TAGS = ["React 19", "TypeScript 7", "Motion", "Radix UI", "Vite", "Vitest", "Lightning CSS", "Intl"];

function ChipsDemo() {
  const [direction, setDirection] = React.useState<"left" | "right">("left");
  const [speed, setSpeed] = React.useState(60);

  return (
    <div style={{ display: "grid", gap: "var(--dl-space-4)", inlineSize: "100%" }}>
      <Marquee direction={direction} speed={speed} gap={12} fade>
        {TAGS.map((tag) => (
          <span key={tag} className="dl-surface" style={chipStyle}>
            {tag}
          </span>
        ))}
      </Marquee>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--dl-space-2)" }}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setDirection((value) => (value === "left" ? "right" : "left"))}
        >
          方向：{direction === "left" ? "向左" : "向右"}
        </Button>
        {[30, 60, 120].map((value) => (
          <Button key={value} size="sm" variant={value === speed ? "solid" : "outline"} onClick={() => setSpeed(value)}>
            {value}px/s
          </Button>
        ))}
      </div>
    </div>
  );
}

const NOTES = [
  "LongList 在超过 24 项时关闭逐项交错",
  "NumberFlow 用等宽数字避免宽度抖动",
  "SpotlightCard 在触屏下不注册指针监听",
  "BorderBeam 的绘制面积被 mask 限制在 1px 环上",
  "Marquee 的复制轨带 aria-hidden",
  "所有循环动画都带 dl-anim-loop",
];

function PauseDemo() {
  return (
    <div style={{ display: "grid", gap: "var(--dl-space-4)", inlineSize: "100%" }}>
      <Marquee speed={48} gap={20} pauseOnHover>
        {NOTES.map((note) => (
          <span
            key={note}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "var(--dl-space-3)",
              fontSize: "var(--dl-text-sm)",
              color: "var(--dl-color-ink-muted)",
              whiteSpace: "nowrap",
            }}
          >
            <span
              aria-hidden="true"
              style={{
                inlineSize: 6,
                blockSize: 6,
                borderRadius: "var(--dl-radius-full)",
                background: "var(--dl-color-accent)",
              }}
            />
            {note}
          </span>
        ))}
      </Marquee>
      <span style={{ fontSize: "var(--dl-text-xs)", color: "var(--dl-color-ink-subtle)" }}>
        悬停或让内部元素获得焦点时，轨道会暂停；移开后从暂停位置继续。
      </span>
    </div>
  );
}

export const marqueeDemo: DemoEntry = {
  slug: "marquee",
  title: "Marquee",
  group: "showcase",
  summary: "无缝横向跑马灯：内容复制两份并平移 -50%，速度以 px/s 给定。",
  examples: [
    {
      title: "方向与速度",
      description: "速度是每秒移动的像素数；duration 由实测的内容宽度除以速度得到。",
      layout: "stretch",
      render: () => <ChipsDemo />,
    },
    {
      title: "悬停暂停",
      description: "pauseOnHover 默认开启，指针悬停或用键盘聚焦到轨道内部时都会暂停。",
      layout: "stretch",
      render: () => <PauseDemo />,
    },
  ],
  props: [
    { name: "children", type: "ReactNode", description: "轨道内容；组件会自动复制一份并设为 aria-hidden。" },
    { name: "speed", type: "number", default: "60", description: "滚动速度，像素/秒。" },
    { name: "direction", type: '"left" | "right"', default: '"left"', description: "滚动方向。" },
    { name: "pauseOnHover", type: "boolean", default: "true", description: "悬停或聚焦时暂停。" },
    { name: "fade", type: "boolean", default: "false", description: "两侧渐隐遮罩。" },
    { name: "gap", type: "number | string", description: "项目间距，数字按 px 处理。" },
  ],
  notes: [
    "reduced-motion 下轨道停止并切换为可横向滚动的静态容器，复制轨被移除。",
    "复制轨在 DOM 中存在，因此内部组件不要依赖唯一实例的副作用。",
  ],
};
