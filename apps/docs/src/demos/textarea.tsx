import type { DemoEntry } from "./types";
import { Field, Textarea } from "@deyloom/react";

export const textareaDemo: DemoEntry = {
  slug: "textarea",
  title: "Textarea",
  group: "form",
  summary: "多行文本控件。autoResize 同步测量 scrollHeight，不做高度动画。",
  examples: [
    {
      title: "基础用法",
      layout: "stretch",
      render: () => (
        <Field label="描述" hint="一句就够，最多两行。">
          <Textarea rows={3} placeholder="这次改动解决了什么问题？" />
        </Field>
      ),
    },
    {
      title: "自动高度",
      description: "内容变多时在 minRows 与 maxRows 之间增长，超过后开始滚动。",
      layout: "stretch",
      render: () => (
        <Textarea
          aria-label="发布说明"
          autoResize
          minRows={2}
          maxRows={6}
          placeholder="输入多行内容试试，控件会随内容增长。"
        />
      ),
    },
    {
      title: "错误与禁用",
      layout: "stretch",
      render: () => (
        <div style={{ display: "grid", gap: 12 }}>
          <Field label="变更说明" error="变更说明至少需要 20 个字。">
            <Textarea defaultValue="修复了一个问题。" rows={3} />
          </Field>
          <Field label="系统备注" disabled>
            <Textarea defaultValue="由系统生成，不可编辑。" rows={2} />
          </Field>
        </div>
      ),
    },
  ],
  props: [
    { name: "rows", type: "number", default: "1", description: "未开启自动高度时的可见行数。" },
    { name: "autoResize", type: "boolean", default: "false", description: "根据 scrollHeight 同步调整高度。" },
    { name: "minRows / maxRows", type: "number", description: "自动高度的下限与上限。" },
    { name: "invalid", type: "boolean", description: "标记错误状态；Field 内会自动继承。" },
  ],
};
