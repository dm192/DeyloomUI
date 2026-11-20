import { Button, DeyloomIcons, IconButton } from "@deyloom/react";
import { defineDemos } from "../types";

export const foundationDemos: ReturnType<typeof defineDemos> = defineDemos([
  {
    slug: "button",
    title: "Button",
    group: "foundation",
    summary: "Triggers an action. One press spring, one focus ring, five visual weights.",
    examples: [
      {
        title: "变体",
        layout: "row",
        render: () => (
          <>
            <Button>主要操作</Button>
            <Button variant="soft">次要操作</Button>
            <Button variant="outline">描边</Button>
            <Button variant="ghost">幽灵</Button>
            <Button variant="link">链接</Button>
          </>
        ),
      },
      {
        title: "语气",
        description: "danger 只用于不可撤销的操作。",
        layout: "row",
        render: () => (
          <>
            <Button tone="accent">保存</Button>
            <Button tone="neutral" variant="soft">
              取消
            </Button>
            <Button tone="danger" variant="soft">
              删除
            </Button>
          </>
        ),
      },
      {
        title: "尺寸与图标",
        layout: "row",
        render: () => (
          <>
            <Button size="sm" variant="outline">
              小
            </Button>
            <Button variant="outline" startIcon={<DeyloomIcons.PlusIcon />}>
              新建
            </Button>
            <Button size="lg" endIcon={<DeyloomIcons.ArrowRightIcon />}>
              继续
            </Button>
          </>
        ),
      },
      {
        title: "加载与禁用",
        description: "加载时按钮尺寸不变，只有内容被替换，避免布局跳动。",
        layout: "row",
        render: () => (
          <>
            <Button loading>保存中</Button>
            <Button variant="outline" loading>
              同步
            </Button>
            <Button disabled>不可用</Button>
          </>
        ),
      },
    ],
    props: [
      { name: "variant", type: '"solid" | "soft" | "outline" | "ghost" | "link"', default: '"solid"', description: "视觉权重。" },
      { name: "tone", type: '"accent" | "neutral" | "danger"', default: '"accent"', description: "语义色调。" },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "控件高度 30 / 36 / 44px。" },
      { name: "loading", type: "boolean", default: "false", description: "显示加载态并阻止点击。" },
      { name: "asChild", type: "boolean", default: "false", description: "把样式交给子元素（例如链接）。" },
    ],
  },
  {
    slug: "icon-button",
    title: "IconButton",
    group: "foundation",
    summary: "方形图标按钮。必须提供可访问名称。",
    examples: [
      {
        title: "尺寸与语气",
        layout: "row",
        render: () => (
          <>
            <IconButton label="新建" size="sm" variant="outline">
              <DeyloomIcons.PlusIcon />
            </IconButton>
            <IconButton label="搜索" size="md" variant="outline">
              <DeyloomIcons.SearchIcon />
            </IconButton>
            <IconButton label="关闭" size="lg">
              <DeyloomIcons.XIcon />
            </IconButton>
            <IconButton label="删除" tone="danger">
              <DeyloomIcons.WarningIcon />
            </IconButton>
          </>
        ),
      },
    ],
    props: [
      { name: "label", type: "string", description: "必填：作为 aria-label。" },
      { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "方形边长。" },
    ],
    notes: ["图标本身不构成名称，未提供 label 时无障碍树里会是一个无名按钮。"],
  },
]);
