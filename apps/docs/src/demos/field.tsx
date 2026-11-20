import type { DemoEntry } from "./types";
import { Field, Input, Textarea } from "@deyloom/react";

export const fieldDemo: DemoEntry = {
  slug: "field",
  title: "Field",
  group: "form",
  summary: "表单字段的组合容器：标签、提示、错误展开与 ARIA 接线一次完成。",
  examples: [
    {
      title: "标签、提示与必填",
      description: "点击标签会聚焦到接线控件，必填标记对读屏软件隐藏。",
      layout: "stretch",
      render: () => (
        <Field label="邮箱" hint="用于接收构建通知。" required>
          <Input type="email" placeholder="you@example.com" />
        </Field>
      ),
    },
    {
      title: "错误状态",
      description:
        "错误行以 0fr → 1fr 展开并带 role=\"alert\"；控件自动获得 aria-invalid 与 aria-describedby。",
      layout: "stretch",
      render: () => (
        <Field label="用户名" error="只能包含小写字母与数字。">
          <Input defaultValue="Zhang Wei" />
        </Field>
      ),
    },
    {
      title: "禁用整个字段",
      layout: "stretch",
      render: () => (
        <Field label="项目标识" hint="创建后不可修改。" disabled>
          <Input defaultValue="deyloom-core" />
        </Field>
      ),
    },
    {
      title: "组合任意控件",
      description: "Field 只负责接线，控件自己管理语义。",
      layout: "stretch",
      render: () => (
        <Field label="部署区域" hint="只影响新构建。">
          <Textarea autoResize minRows={2} maxRows={4} placeholder="补充说明（可选）" />
        </Field>
      ),
    },
  ],
  props: [
    { name: "label", type: "ReactNode", description: "可见标签，真实关联到内部控件。" },
    { name: "hint", type: "ReactNode", description: "常驻说明，参与 aria-describedby。" },
    { name: "error", type: "ReactNode", description: "错误信息；出现时展开错误行并设置 aria-invalid。" },
    { name: "required", type: "boolean", default: "false", description: "显示必填标记并传递 required。" },
    { name: "disabled", type: "boolean", default: "false", description: "通过 context 禁用内部控件。" },
    { name: "htmlFor", type: "string", description: "覆盖自动生成的控件 id。" },
  ],
  notes: ["Field 通过导出的 useFieldContext 接线；自定义控件也能读取 id 与描述 id。"],
};
