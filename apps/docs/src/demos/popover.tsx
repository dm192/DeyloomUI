import {
  Button,
  IconButton,
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@deyloom/react";
import { defineDemos } from "./types";

export const popoverDemo = defineDemos([
  {
    slug: "popover",
    title: "Popover",
    group: "navigation",
    summary: "点击后出现的富内容浮层。从触发器方向展开，关闭时有短促退场。",
    examples: [
      {
        title: "基础用法",
        layout: "row",
        render: () => (
          <Popover>
            <PopoverTrigger>筛选条件</PopoverTrigger>
            <PopoverContent>
              <PopoverHeader>
                <PopoverTitle>筛选条件</PopoverTitle>
                <PopoverClose />
              </PopoverHeader>
              当前仅显示最近 7 天内有更新的项目。
              <div
                style={{
                  display: "flex",
                  gap: "var(--dl-space-3)",
                  marginBlockStart: "var(--dl-space-4)",
                }}
              >
                <Button size="sm">应用筛选</Button>
                <PopoverClose label="关闭筛选面板" />
              </div>
            </PopoverContent>
          </Popover>
        ),
      },
      {
        title: "对齐与偏移",
        description: "align 控制水平对齐，sideOffset 控制与触发器的距离。",
        layout: "row",
        render: () => (
          <>
            <Popover>
              <PopoverTrigger>左对齐</PopoverTrigger>
              <PopoverContent align="start" sideOffset={12}>
                面板左边缘与触发器对齐。
              </PopoverContent>
            </Popover>
            <Popover>
              <PopoverTrigger>右对齐</PopoverTrigger>
              <PopoverContent align="end" sideOffset={12}>
                面板右边缘与触发器对齐。
              </PopoverContent>
            </Popover>
          </>
        ),
      },
      {
        title: "自定义触发器",
        layout: "row",
        render: () => (
          <Popover>
            <PopoverTrigger asChild>
              <IconButton label="更多操作" variant="outline">
                <svg viewBox="0 0 16 16" width={14} height={14} fill="none" aria-hidden="true">
                  <circle cx="3.5" cy="8" r="1.2" fill="currentColor" />
                  <circle cx="8" cy="8" r="1.2" fill="currentColor" />
                  <circle cx="12.5" cy="8" r="1.2" fill="currentColor" />
                </svg>
              </IconButton>
            </PopoverTrigger>
            <PopoverContent align="end">
              <PopoverHeader>
                <PopoverTitle>更多操作</PopoverTitle>
                <PopoverClose />
              </PopoverHeader>
              <p style={{ margin: 0 }}>把常用操作收进一个可关闭的浮层。</p>
            </PopoverContent>
          </Popover>
        ),
      },
    ],
    props: [
      { name: "align", type: '"start" | "center" | "end"', default: '"center"', description: "与触发器在水平方向的对齐方式。" },
      { name: "side", type: '"top" | "right" | "bottom" | "left"', default: '"bottom"', description: "期望的弹出方向。" },
      { name: "sideOffset", type: "number", default: "8", description: "与触发器之间的距离。" },
      { name: "PopoverHeader / PopoverTitle / PopoverClose", type: "组件", description: "可选的标题与关闭按钮组合。" },
    ],
    notes: [
      "面板使用共享的 popoverPanel 变量，transform-origin 取自 Radix 的 --radix-popover-content-transform-origin。",
      "点击外部或按 Escape 关闭；焦点回到触发器由 Radix 负责。",
    ],
  },
]);
