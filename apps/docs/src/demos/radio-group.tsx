import type { DemoEntry } from "./types";
import { Field, RadioGroup, RadioGroupItem } from "@deyloom/react";

export const radioGroupDemo: DemoEntry = {
  slug: "radio-group",
  title: "RadioGroup",
  group: "form",
  summary: "单选组。选中圆点从 0.4 缩放淡入，圆环只过渡 border-color。",
  examples: [
    {
      title: "垂直选项",
      layout: "stretch",
      render: () => (
        <Field label="构建模式" hint="随时可以修改，下一次构建生效。">
          <RadioGroup defaultValue="incremental">
            <RadioGroupItem value="incremental" label="增量构建" />
            <RadioGroupItem value="clean" label="清理后构建" />
            <RadioGroupItem value="cache" label="复用缓存" />
          </RadioGroup>
        </Field>
      ),
    },
    {
      title: "横向排列",
      description: "方向键在选项之间移动焦点，空格完成选择。",
      layout: "row",
      render: () => (
        <RadioGroup defaultValue="md" orientation="horizontal" aria-label="圆角尺寸">
          <RadioGroupItem value="sm" label="小" />
          <RadioGroupItem value="md" label="中" />
          <RadioGroupItem value="lg" label="大" />
        </RadioGroup>
      ),
    },
    {
      title: "禁用与错误态",
      layout: "stretch",
      render: () => (
        <div style={{ display: "grid", gap: 16 }}>
          <RadioGroup defaultValue="auto" aria-label="发布策略">
            <RadioGroupItem value="auto" label="自动发布" />
            <RadioGroupItem value="manual" label="手动发布" disabled />
          </RadioGroup>
          <Field label="结算方式" error="请选择一种结算方式。">
            <RadioGroup>
              <RadioGroupItem value="card" label="银行卡" />
              <RadioGroupItem value="invoice" label="对公转账" />
            </RadioGroup>
          </Field>
        </div>
      ),
    },
  ],
  props: [
    { name: "value / defaultValue", type: "string", description: "受控或非受控的选中值。" },
    { name: "onValueChange", type: "(value: string) => void", description: "选中值变化回调。" },
    { name: "orientation", type: '"horizontal" | "vertical"', default: '"vertical"', description: "排列方向，决定方向键。" },
    { name: "invalid", type: "boolean", description: "错误态；Field 内自动继承。" },
    { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "圆点与文字尺寸。" },
  ],
};
