import * as React from "react";
import { SpotlightCard } from "@deyloom/react";
import type { DemoEntry } from "./types";

const cardTitle: React.CSSProperties = {
  margin: 0,
  fontSize: "var(--dl-text-xl)",
  fontWeight: "var(--dl-weight-semibold)",
  letterSpacing: "-0.01em",
};

const cardBody: React.CSSProperties = {
  margin: "var(--dl-space-3) 0 0",
  color: "var(--dl-color-ink-muted)",
  fontSize: "var(--dl-text-sm)",
  lineHeight: "var(--dl-leading-base)",
};

const tagStyle: React.CSSProperties = {
  padding: "var(--dl-space-2) var(--dl-space-3)",
  borderRadius: "var(--dl-radius-full)",
  background: "var(--dl-color-accent-soft)",
  color: "var(--dl-color-accent-soft-ink)",
  fontSize: "var(--dl-text-xs)",
};

function BasicSpotlightDemo() {
  return (
    <SpotlightCard style={{ inlineSize: "100%", maxInlineSize: 520 }}>
      <h3 style={cardTitle}>柔和触感</h3>
      <p style={cardBody}>
        指针在卡片上移动时，一层暖色光斑会跟着位置亮起；离开后淡出。位置写入 CSS 变量，指针移动不会触发 React
        重渲染。
      </p>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--dl-space-2)", marginBlockStart: "var(--dl-space-5)" }}>
        {["rAF 节流", "无重渲染", "opacity 过渡"].map((tag) => (
          <span key={tag} style={tagStyle}>
            {tag}
          </span>
        ))}
      </div>
    </SpotlightCard>
  );
}

function RadiusDemo() {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
        gap: "var(--dl-space-4)",
        inlineSize: "100%",
      }}
    >
      <SpotlightCard radius={180}>
        <h3 style={cardTitle}>半径 180</h3>
        <p style={cardBody}>光斑更小、更锐利，适合尺寸紧凑的卡片。</p>
      </SpotlightCard>
      <SpotlightCard radius={420}>
        <h3 style={cardTitle}>半径 420</h3>
        <p style={cardBody}>光斑更大、更柔和，适合阅读型的大卡片。</p>
      </SpotlightCard>
    </div>
  );
}

function MaterialDemo() {
  return (
    <SpotlightCard style={{ inlineSize: "100%", maxInlineSize: 460 }}>
      <h3 style={cardTitle}>材质层次</h3>
      <p style={cardBody}>
        卡片本身使用 dl-surface-raised 配方：一层低透明度阴影加顶部 1px 高光。光斑只是叠加的装饰层，不改变阴影与描边。
      </p>
      <ul
        style={{
          margin: "var(--dl-space-4) 0 0",
          paddingInlineStart: "var(--dl-space-6)",
          color: "var(--dl-color-ink-muted)",
          fontSize: "var(--dl-text-sm)",
          lineHeight: "var(--dl-leading-base)",
        }}
      >
        <li>触屏（pointer: coarse）不挂指针监听</li>
        <li>reduced-motion 下不挂指针监听</li>
        <li>光斑开销只有一层 opacity 过渡</li>
      </ul>
    </SpotlightCard>
  );
}

export const spotlightCardDemo: DemoEntry = {
  slug: "spotlight-card",
  title: "SpotlightCard",
  group: "showcase",
  summary: "跟随指针的径向光斑卡片；触屏与 reduced-motion 下自动关闭，退化为普通材质卡片。",
  examples: [
    {
      title: "跟随指针",
      description: "在桌面端把指针移进卡片，光斑会平滑地跟随；离开后淡出。",
      layout: "center",
      render: () => <BasicSpotlightDemo />,
    },
    {
      title: "光斑半径",
      description: "radius 控制光斑的 CSS 半径，默认 320px。",
      layout: "stretch",
      render: () => <RadiusDemo />,
    },
    {
      title: "材质叠加",
      description: "光斑是 ::before 装饰层，卡片的阴影、描边和内容都不参与动画。",
      layout: "center",
      render: () => <MaterialDemo />,
    },
  ],
  props: [
    { name: "children", type: "ReactNode", description: "卡片内容。" },
    { name: "radius", type: "number", default: "320", description: "光斑半径（px）。" },
    { name: "className", type: "string", description: "外部样式类名，会与 dl-surface-raised 合并。" },
  ],
  notes: ["触屏设备与 reduced-motion 下不注册 pointermove，光斑保持隐藏。"],
};
