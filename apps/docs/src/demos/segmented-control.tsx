import * as React from "react";
import type { DemoEntry } from "./types";
import { SegmentedControl } from "@deyloom/react";

const ITEMS = [
  { value: "overview", label: "概览" },
  { value: "activity", label: "活动" },
  { value: "settings", label: "设置" },
];

function GridIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden="true"
    >
      <rect x="2.5" y="2.5" width="4.5" height="4.5" rx="1" />
      <rect x="9" y="2.5" width="4.5" height="4.5" rx="1" />
      <rect x="2.5" y="9" width="4.5" height="4.5" rx="1" />
      <rect x="9" y="9" width="4.5" height="4.5" rx="1" />
    </svg>
  );
}

function ListIcon() {
  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M5.5 4h8M5.5 8h8M5.5 12h8" />
      <circle cx="2.5" cy="4" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="2.5" cy="8" r="0.75" fill="currentColor" stroke="none" />
      <circle cx="2.5" cy="12" r="0.75" fill="currentColor" stroke="none" />
    </svg>
  );
}

function ControlledSegmentDemo() {
  const [view, setView] = React.useState("overview");

  return (
    <div style={{ display: "grid", gap: 10, justifyItems: "start" }}>
      <SegmentedControl
        aria-label="视图"
        items={ITEMS}
        value={view}
        onValueChange={setView}
      />
      <span style={{ color: "var(--dl-color-ink-muted)", fontSize: "var(--dl-text-sm)" }}>
        当前视图：{ITEMS.find((item) => item.value === view)?.label}
      </span>
    </div>
  );
}

export const segmentedControlDemo: DemoEntry = {
  slug: "segmented-control",
  title: "SegmentedControl",
  group: "form",
  summary:
    "分段单选控件。用 role=\"radiogroup\" 语义，滑动指示块由 ResizeObserver 测量后用 snappy 弹簧移动。",
  examples: [
    {
      title: "基础用法",
      description: "方向键切换，Home / End 跳到首尾；点击任意段直接选中。",
      layout: "stretch",
      render: () => <ControlledSegmentDemo />,
    },
    {
      title: "尺寸",
      layout: "row",
      render: () => (
        <>
          <SegmentedControl aria-label="小号分段" size="sm" items={ITEMS} defaultValue="overview" />
          <SegmentedControl aria-label="中号分段" items={ITEMS} defaultValue="activity" />
        </>
      ),
    },
    {
      title: "图标与禁用项",
      layout: "row",
      render: () => (
        <SegmentedControl
          aria-label="布局"
          defaultValue="grid"
          items={[
            { value: "grid", label: "网格", icon: <GridIcon /> },
            { value: "list", label: "列表", icon: <ListIcon /> },
            { value: "table", label: "表格", icon: <ListIcon />, disabled: true },
          ]}
        />
      ),
    },
    {
      title: "整组禁用",
      layout: "row",
      render: () => (
        <SegmentedControl aria-label="禁用的分段" items={ITEMS} defaultValue="overview" disabled />
      ),
    },
  ],
  props: [
    { name: "items", type: "{ value, label, icon?, disabled? }[]", description: "分段选项。" },
    { name: "value / defaultValue", type: "string", description: "受控或非受控的选中值。" },
    { name: "onValueChange", type: "(value: string) => void", description: "选中值变化回调。" },
    { name: "size", type: '"sm" | "md"', default: '"md"', description: "段高度 30 / 36px。" },
    { name: "disabled", type: "boolean", description: "禁用整组；单个 item 也可禁用。" },
  ],
  notes: [
    "语义选择：这是「多项中选择一项」，所以用 role=\"radiogroup\" 而不是 tablist；Tab 键进入组，方向键在组内移动。",
    "指示块在测量不可用（服务端渲染、隐藏容器、jsdom）时退化为没有指示块，控件依然可用。",
  ],
};
