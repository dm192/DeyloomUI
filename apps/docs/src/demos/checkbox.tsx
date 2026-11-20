import * as React from "react";
import type { DemoEntry } from "./types";
import { Checkbox } from "@deyloom/react";

function ControlledCheckboxDemo() {
  const [selected, setSelected] = React.useState<boolean | "indeterminate">("indeterminate");
  const all = selected === true;

  return (
    <div style={{ display: "grid", gap: 10 }}>
      <Checkbox
        label="全选"
        checked={selected}
        onCheckedChange={(next) => setSelected(next === true)}
      />
      <Checkbox
        label="构建通知"
        checked={all}
        onCheckedChange={(next) => setSelected(next === true)}
      />
      <Checkbox
        label="发布提醒"
        checked={all}
        onCheckedChange={(next) => setSelected(next === true)}
      />
    </div>
  );
}

export const checkboxDemo: DemoEntry = {
  slug: "checkbox",
  title: "Checkbox",
  group: "form",
  summary: "三态复选框。勾选时对勾用 stroke-dashoffset 画出来，盒子轻微放大。",
  examples: [
    {
      title: "基础与不确定态",
      layout: "row",
      render: () => (
        <div style={{ display: "grid", gap: 10 }}>
          <Checkbox label="接收更新" defaultChecked />
          <Checkbox label="已归档" indeterminate />
          <Checkbox label="不可变更" disabled defaultChecked />
        </div>
      ),
    },
    {
      title: "受控的父子联动",
      description: "父项处于 mixed 时点击会变为全选。",
      layout: "stretch",
      render: () => <ControlledCheckboxDemo />,
    },
    {
      title: "尺寸与错误态",
      layout: "row",
      render: () => (
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <Checkbox size="sm" label="小" defaultChecked />
          <Checkbox label="中" defaultChecked />
          <Checkbox size="lg" label="大" defaultChecked />
          <Checkbox label="需要修正" invalid defaultChecked />
        </div>
      ),
    },
  ],
  props: [
    { name: "checked / defaultChecked", type: 'boolean | "indeterminate"', description: "受控或非受控的选中状态。" },
    { name: "onCheckedChange", type: '(checked) => void', description: "状态变化回调。" },
    { name: "indeterminate", type: "boolean", default: "false", description: "强制混合态，渲染短横。" },
    { name: "label", type: "ReactNode", description: "可点击文字，同时作为可访问名称。" },
    { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "盒子与文字尺寸。" },
  ],
  notes: ["使用 Radix Checkbox 基元：空格切换、表单提交与 aria-checked=\"mixed\" 都由它提供。"],
};
