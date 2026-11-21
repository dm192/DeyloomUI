import * as React from "react";
import { Toggle, ToggleGroup } from "@deyloom/react";
import { defineDemos } from "./types";

const sampleStyle = {
  margin: 0,
  inlineSize: "100%",
  maxInlineSize: 420,
  padding: "var(--dl-space-4) var(--dl-space-5)",
  border: "1px solid var(--dl-color-border)",
  borderRadius: "var(--dl-radius-sm)",
  background: "var(--dl-color-surface)",
  color: "var(--dl-color-ink)",
  fontSize: "var(--dl-text-md)",
  lineHeight: "var(--dl-leading-base)",
} as const;

function AlignmentDemo() {
  const [align, setAlign] = React.useState("left");

  return (
    <div style={{ display: "grid", gap: "var(--dl-space-4)", justifyItems: "start" }}>
      <ToggleGroup
        type="single"
        value={align}
        onValueChange={setAlign}
        aria-label="文本对齐"
      >
        <Toggle value="left">左对齐</Toggle>
        <Toggle value="center">居中</Toggle>
        <Toggle value="right">右对齐</Toggle>
      </ToggleGroup>
      <p style={{ ...sampleStyle, textAlign: align as React.CSSProperties["textAlign"] }}>
        柔和触感 · 弹簧物理 · 材质层次
      </p>
    </div>
  );
}

function FormatDemo() {
  const [formats, setFormats] = React.useState<string[]>(["bold"]);

  return (
    <div style={{ display: "grid", gap: "var(--dl-space-4)", justifyItems: "start" }}>
      <ToggleGroup
        type="multiple"
        value={formats}
        onValueChange={setFormats}
        aria-label="文本样式"
      >
        <Toggle value="bold">
          <strong>加粗</strong>
        </Toggle>
        <Toggle value="italic">
          <em>斜体</em>
        </Toggle>
        <Toggle value="underline">
          <span style={{ textDecoration: "underline" }}>下划线</span>
        </Toggle>
      </ToggleGroup>
      <p
        style={{
          ...sampleStyle,
          fontWeight: formats.includes("bold")
            ? "var(--dl-weight-semibold)"
            : "var(--dl-weight-normal)",
          fontStyle: formats.includes("italic") ? "italic" : "normal",
          textDecoration: formats.includes("underline") ? "underline" : "none",
        }}
      >
        柔和触感 · 弹簧物理 · 材质层次
      </p>
    </div>
  );
}

function DisabledDemo() {
  return (
    <div style={{ display: "grid", gap: "var(--dl-space-4)", justifyItems: "start" }}>
      <ToggleGroup type="single" defaultValue="md" aria-label="控件尺寸">
        <Toggle value="sm">小</Toggle>
        <Toggle value="md">中</Toggle>
        <Toggle value="lg" disabled>
          大
        </Toggle>
      </ToggleGroup>
      <ToggleGroup type="multiple" aria-label="不可用的格式组" disabled>
        <Toggle value="bold">加粗</Toggle>
        <Toggle value="italic">斜体</Toggle>
      </ToggleGroup>
    </div>
  );
}

export const toggleGroupDemo = defineDemos([
  {
    slug: "toggle-group",
    title: "ToggleGroup",
    group: "form",
    summary: "把相关开关收进一条 sunken 底槽：单选或多选，选中态用 accent-soft 高亮。",
    examples: [
      {
        title: "单选",
        description: "single 组是 radiogroup，同一时刻只有一个按钮处于按下态。",
        layout: "stretch",
        render: () => <AlignmentDemo />,
      },
      {
        title: "多选",
        description: "multiple 组是 toolbar，可以同时按下多个开关，值为字符串数组。",
        layout: "stretch",
        render: () => <FormatDemo />,
      },
      {
        title: "禁用",
        description: "单个按钮禁用只影响自己；disabled 设在组上会禁用整组。",
        layout: "stretch",
        render: () => <DisabledDemo />,
      },
    ],
    props: [
      {
        name: "type",
        type: '"single" | "multiple"',
        description: "单选或多选，决定 value 的类型与 ARIA 模型。",
      },
      {
        name: "value / defaultValue",
        type: "string | string[]",
        description: "当前按下的值；受控时传 value，非受控时传 defaultValue。",
      },
      {
        name: "onValueChange",
        type: "(value: string | string[]) => void",
        description: "按下状态变化时触发。",
      },
      {
        name: "variant",
        type: '"outline" | "ghost"',
        default: '"outline"',
        description: "组内按钮的视觉权重。",
      },
      {
        name: "size",
        type: '"sm" | "md"',
        default: '"md"',
        description: "组内按钮高度与字号。",
      },
      {
        name: "orientation",
        type: '"horizontal" | "vertical"',
        default: '"horizontal"',
        description: "布局轴，也是方向键移动的轴。",
      },
      {
        name: "disabled",
        type: "boolean",
        default: "false",
        description: "禁用组内全部按钮。",
      },
      {
        name: "Toggle",
        type: "组件",
        description: "组内必须提供唯一 value；单独使用时自带 pressed/defaultPressed。",
      },
    ],
    notes: [
      "键盘与 roving 焦点完全交给 Radix：Tab 进入组，方向键移动，空格切换。",
      "组内按钮去掉边框，选中态与单独 Toggle 共用 accent-soft 高亮；按压沿用统一弹簧。",
    ],
  },
]);
