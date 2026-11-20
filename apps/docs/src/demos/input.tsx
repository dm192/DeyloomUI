import type { DemoEntry } from "./types";
import { DeyloomIcons, Field, Input } from "@deyloom/react";

export const inputDemo: DemoEntry = {
  slug: "input",
  title: "Input",
  group: "form",
  summary: "单行文本控件。聚焦时用 box-shadow 外环过渡，三个尺寸共用一条材质配方。",
  examples: [
    {
      title: "尺寸",
      layout: "stretch",
      render: () => (
        <div style={{ display: "grid", gap: 12 }}>
          <Input size="sm" aria-label="小号输入" placeholder="小号 · 30px" />
          <Input size="md" aria-label="中号输入" placeholder="中号 · 36px" />
          <Input size="lg" aria-label="大号输入" placeholder="大号 · 44px" />
        </div>
      ),
    },
    {
      title: "前后图标",
      description: "图标只是装饰，名称必须来自标签或 aria-label。",
      layout: "stretch",
      render: () => (
        <div style={{ display: "grid", gap: 12 }}>
          <Input
            aria-label="搜索"
            placeholder="搜索组件"
            startIcon={<DeyloomIcons.SearchIcon />}
          />
          <Field label="金额" hint="输入后按回车提交。">
            <Input
              inputMode="decimal"
              placeholder="0.00"
              startIcon={<span style={{ fontVariantNumeric: "tabular-nums" }}>¥</span>}
              endIcon={<DeyloomIcons.CheckIcon />}
            />
          </Field>
        </div>
      ),
    },
    {
      title: "错误与禁用",
      layout: "stretch",
      render: () => (
        <div style={{ display: "grid", gap: 12 }}>
          <Field label="端口" error="端口必须在 1024 – 65535 之间。">
            <Input defaultValue="80" />
          </Field>
          <Field label="构建号" hint="由 CI 自动填写。">
            <Input defaultValue="#2418" readOnly />
          </Field>
          <Field label="只读" disabled>
            <Input defaultValue="不可编辑" />
          </Field>
        </div>
      ),
    },
  ],
  props: [
    { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "控件高度 30 / 36 / 44px。" },
    { name: "invalid", type: "boolean", description: "标记错误状态；Field 内会自动继承。" },
    { name: "startIcon / endIcon", type: "ReactNode", description: "装饰图标，自动 aria-hidden。" },
    { name: "containerClassName", type: "string", description: "设置包裹图标的容器类名。" },
  ],
  notes: ["className 作用于原生 input，containerClassName 作用于图标容器。"],
};
