import { Badge } from "@deyloom/react";
import { defineDemos } from "./types";

export const badgeDemo = defineDemos([
  {
    slug: "badge",
    title: "Badge",
    group: "navigation",
    summary: "紧凑的状态标签。颜色是第二层线索，文字始终说明状态。",
    examples: [
      {
        title: "语气",
        layout: "row",
        render: () => (
          <>
            <Badge tone="accent" dot>
              进行中
            </Badge>
            <Badge tone="success" dot>
              已通过
            </Badge>
            <Badge tone="warning" dot>
              待确认
            </Badge>
            <Badge tone="danger" dot>
              失败
            </Badge>
            <Badge tone="neutral" dot>
              草稿
            </Badge>
          </>
        ),
      },
      {
        title: "变体",
        description: "solid 用于强调，soft 用于常规状态，outline 最轻。",
        layout: "row",
        render: () => (
          <>
            <Badge tone="accent" variant="solid">
              团队版
            </Badge>
            <Badge tone="accent" variant="soft">
              团队版
            </Badge>
            <Badge tone="accent" variant="outline">
              团队版
            </Badge>
            <Badge tone="danger" variant="solid">
              已停用
            </Badge>
            <Badge tone="danger" variant="outline">
              已停用
            </Badge>
          </>
        ),
      },
      {
        title: "尺寸",
        description: "sm 用于表格行内，md 用于标题旁。",
        layout: "row",
        render: () => (
          <>
            <Badge size="sm" tone="success" dot>
              sm
            </Badge>
            <Badge size="md" tone="success" dot>
              md
            </Badge>
            <Badge size="sm" tone="neutral" variant="outline">
              12 条未读
            </Badge>
          </>
        ),
      },
    ],
    props: [
      { name: "variant", type: '"solid" | "soft" | "outline"', default: '"soft"', description: "视觉权重。" },
      { name: "tone", type: '"accent" | "neutral" | "danger" | "success" | "warning"', default: '"neutral"', description: "语义色调。" },
      { name: "size", type: '"sm" | "md"', default: '"md"', description: "标签高度与字号。" },
      { name: "dot", type: "boolean", default: "false", description: "前置状态圆点，对屏幕阅读器隐藏。" },
    ],
    notes: ["Badge 不是交互元素：需要点击时请用 Button 或给可点击容器可访问名称。"],
  },
]);
