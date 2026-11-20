import { Button, IconButton, Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@deyloom/react";
import { defineDemos } from "./types";

export const tooltipDemo = defineDemos([
  {
    slug: "tooltip",
    title: "Tooltip",
    group: "navigation",
    summary: "悬停或聚焦时出现的短提示。内容永远简短，触发器永远可聚焦。",
    examples: [
      {
        title: "基础用法",
        description: "默认进入延时 300ms；移入同一区域的其他提示会跳过等待。",
        layout: "row",
        render: () => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>重置筛选</TooltipTrigger>
              <TooltipContent>清除所有筛选条件</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger>同步</TooltipTrigger>
              <TooltipContent>从服务器拉取最新数据</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        title: "方向",
        description: "side 决定弹出方向，Radix 会在空间不足时自动翻转。",
        layout: "row",
        render: () => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="soft" size="sm">
                  上方
                </Button>
              </TooltipTrigger>
              <TooltipContent side="top">出现在上方</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="soft" size="sm">
                  右侧
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">出现在右侧</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="soft" size="sm">
                  下方
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom">出现在下方</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="soft" size="sm">
                  左侧
                </Button>
              </TooltipTrigger>
              <TooltipContent side="left">出现在左侧</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
      {
        title: "图标按钮",
        description: "触发器必须是可聚焦元素；使用 asChild 把提示挂到自己的控件上。",
        layout: "row",
        render: () => (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <IconButton label="收藏">
                  <svg viewBox="0 0 16 16" width={14} height={14} fill="none" aria-hidden="true">
                    <path
                      d="M8 2.5l1.7 3.5 3.8.55-2.75 2.68.65 3.79L8 11.2l-3.4 1.82.65-3.79L2.5 6.55l3.8-.55L8 2.5Z"
                      stroke="currentColor"
                      strokeWidth="1.4"
                      strokeLinejoin="round"
                    />
                  </svg>
                </IconButton>
              </TooltipTrigger>
              <TooltipContent side="bottom">收藏到书签</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        ),
      },
    ],
    props: [
      { name: "TooltipProvider delayDuration", type: "number", default: "300", description: "悬停进入提示的等待时间（ms）。" },
      { name: "side", type: '"top" | "right" | "bottom" | "left"', default: '"top"', description: "期望的弹出方向。" },
      { name: "sideOffset", type: "number", default: "6", description: "与触发器之间的距离。" },
      { name: "open / onOpenChange", type: "受控属性", description: "需要驱动其他界面时使用。" },
    ],
    notes: ["Tooltip 不能承载交互内容，需要点击的请用 Popover。", "触摸设备上提示不会弹出；因此触发器自身的名称不能依赖提示文本。"],
  },
]);
