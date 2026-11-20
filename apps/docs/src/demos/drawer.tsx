import type { CSSProperties } from "react";
import type { DemoEntry } from "./types";
import {
  Button,
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerTitle,
  DrawerTrigger,
  DeyloomIcons,
  IconButton,
} from "@deyloom/react";

const optionStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--dl-space-4)",
  padding: "var(--dl-space-4) var(--dl-space-5)",
  background: "var(--dl-color-surface-inset)",
  border: "1px solid var(--dl-color-border)",
  borderRadius: "var(--dl-radius-sm)",
  color: "var(--dl-color-ink)",
  fontSize: "var(--dl-text-sm)",
};

const stackStyle: CSSProperties = {
  display: "grid",
  gap: "var(--dl-space-3)",
};

function CloseRow() {
  return (
    <DrawerClose asChild>
      <IconButton label="关闭" size="sm" variant="ghost" className="dl-drawer__close">
        <DeyloomIcons.XIcon />
      </IconButton>
    </DrawerClose>
  );
}

function RightDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>筛选</Button>
      </DrawerTrigger>
      <DrawerContent>
        <CloseRow />
        <DrawerTitle>筛选任务</DrawerTitle>
        <DrawerDescription>选择要显示的任务范围，应用后立即生效。</DrawerDescription>
        <div style={stackStyle}>
          {["按优先级排序", "隐藏已完成", "只看我负责的"].map((label) => (
            <div key={label} style={optionStyle}>
              <span>{label}</span>
              <DeyloomIcons.ChevronRightIcon />
            </div>
          ))}
        </div>
        <div className="dl-drawer__actions">
          <DrawerClose asChild>
            <Button variant="ghost" tone="neutral">
              清除
            </Button>
          </DrawerClose>
          <DrawerClose asChild>
            <Button>应用筛选</Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

function LeftDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="soft">左侧导航</Button>
      </DrawerTrigger>
      <DrawerContent side="left">
        <CloseRow />
        <DrawerTitle>文档导航</DrawerTitle>
        <DrawerDescription>从左侧边缘滑入的目录抽屉。</DrawerDescription>
        <nav style={stackStyle} aria-label="示例导航">
          {(
            [
              ["#/components", "组件"],
              ["#/foundations", "设计变量"],
              ["#/motion", "动效实验室"],
            ] as const
          ).map(([href, label]) => (
            <Button
              key={href}
              asChild
              variant="ghost"
              tone="neutral"
              style={{ justifyContent: "flex-start" }}
            >
              <a href={href}>{label}</a>
            </Button>
          ))}
        </nav>
      </DrawerContent>
    </Drawer>
  );
}

function BottomDrawer() {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button variant="outline">底部动作面板</Button>
      </DrawerTrigger>
      <DrawerContent side="bottom">
        <CloseRow />
        <DrawerTitle>共享文档</DrawerTitle>
        <DrawerDescription>选择一种共享方式，操作面板从底部弹起。</DrawerDescription>
        <div style={stackStyle}>
          <Button variant="soft" style={{ width: "100%" }}>
            复制链接
          </Button>
          <Button variant="soft" style={{ width: "100%" }}>
            邀请协作者
          </Button>
          <DrawerClose asChild>
            <Button variant="ghost" tone="neutral" style={{ width: "100%" }}>
              取消
            </Button>
          </DrawerClose>
        </div>
      </DrawerContent>
    </Drawer>
  );
}

export const drawerDemo: DemoEntry = {
  slug: "drawer",
  title: "Drawer",
  group: "overlay",
  summary: "从屏幕边缘滑入的面板：springs.soft 进入、140ms tween 退出，焦点与 Esc 体验和 Dialog 一致。",
  examples: [
    { title: "右侧", layout: "row", render: () => <RightDrawer /> },
    { title: "左侧", layout: "row", render: () => <LeftDrawer /> },
    { title: "底部", layout: "row", render: () => <BottomDrawer /> },
  ],
  props: [
    { name: "side", type: '"right" | "left" | "bottom"', default: '"right"', description: "面板锚定的屏幕边缘。" },
    { name: "open / defaultOpen", type: "boolean", description: "受控或非受控的可见性。" },
    { name: "onOpenChange", type: "(open: boolean) => void", description: "Esc、遮罩点击、DrawerClose 都会经过它。" },
    { name: "modal", type: "boolean", default: "true", description: "打开时让背景 inert 并锁住焦点。" },
  ],
  notes: [
    "基于 Radix Dialog 实现，所以焦点陷阱、Esc、焦点归还与 Dialog 完全同源。",
    "进入用 springs.soft 的位移弹簧，退出换成 tweens.exit，避免关闭时回弹。",
    "没有做拖拽关闭：拖拽需要 Motion 的 domMax 特性包，而核心包保持 domAnimation 的轻量体积。",
  ],
};
