import * as React from "react";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
  IconButton,
} from "@deyloom/react";
import { defineDemos } from "./types";

function ViewOptionsMenu() {
  const [grid, setGrid] = React.useState(true);
  const [compact, setCompact] = React.useState(false);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>视图选项</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>显示</DropdownMenuLabel>
        <DropdownMenuCheckboxItem checked={grid} onCheckedChange={setGrid}>
          显示网格
        </DropdownMenuCheckboxItem>
        <DropdownMenuCheckboxItem checked={compact} onCheckedChange={setCompact}>
          紧凑模式
        </DropdownMenuCheckboxItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem disabled>重置布局</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const dropdownMenuDemo = defineDemos([
  {
    slug: "dropdown-menu",
    title: "DropdownMenu",
    group: "navigation",
    summary: "触发式动作菜单。键盘导航、焦点管理与类型筛选全部交给 Radix。",
    examples: [
      {
        title: "基础菜单",
        description: "方向键移动高亮，Enter 执行，Escape 关闭并归还焦点。",
        layout: "row",
        render: () => (
          <DropdownMenu>
            <DropdownMenuTrigger>文件操作</DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuLabel>文件</DropdownMenuLabel>
              <DropdownMenuItem>
                重命名
                <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuItem>
                复制链接
                <DropdownMenuShortcut>⌘L</DropdownMenuShortcut>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem inset>下载</DropdownMenuItem>
              <DropdownMenuItem inset disabled>
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
      {
        title: "复选菜单",
        description: "复选项是受控的：checked 与 onCheckedChange 一起使用，选择后菜单保持打开。",
        layout: "row",
        render: () => <ViewOptionsMenu />,
      },
      {
        title: "自定义触发器",
        layout: "row",
        render: () => (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <IconButton label="更多操作" variant="outline">
                <svg viewBox="0 0 16 16" width={14} height={14} fill="none" aria-hidden="true">
                  <circle cx="3.5" cy="8" r="1.2" fill="currentColor" />
                  <circle cx="8" cy="8" r="1.2" fill="currentColor" />
                  <circle cx="12.5" cy="8" r="1.2" fill="currentColor" />
                </svg>
              </IconButton>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>重命名</DropdownMenuItem>
              <DropdownMenuItem>移动</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem inset disabled>
                归档
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ),
      },
    ],
    props: [
      { name: "align", type: '"start" | "center" | "end"', default: '"center"', description: "菜单与触发器的水平对齐。" },
      { name: "sideOffset", type: "number", default: "6", description: "与触发器之间的距离。" },
      { name: "inset", type: "boolean", description: "菜单项左侧留出图标/勾选位对齐。" },
      { name: "disabled", type: "boolean", description: "Radix 提供的禁用态，键盘会跳过该项。" },
      { name: "DropdownMenuCheckboxItem", type: "组件", description: "受控复选项：checked + onCheckedChange。" },
    ],
    notes: [
      "菜单项高亮使用 Radix 的 data-highlighted，不写 :hover，键盘与指针共享同一状态。",
      "菜单面板复用 popoverPanel 变量，进出场与 Popover 完全一致。",
    ],
  },
]);
