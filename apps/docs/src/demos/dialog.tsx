import * as React from "react";
import type { DemoEntry } from "./types";
import {
  Button,
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
} from "@deyloom/react";

function BasicDialog() {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>打开对话框</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>发布版本</DialogTitle>
        <DialogDescription>
          发布后所有协作者都会收到通知，你可以随时回滚到上一个版本。
        </DialogDescription>
        <div className="dl-dialog__actions">
          <DialogClose asChild>
            <Button variant="ghost" tone="neutral">
              取消
            </Button>
          </DialogClose>
          <DialogClose asChild>
            <Button>发布</Button>
          </DialogClose>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function SizeDialogs() {
  return (
    <>
      {(
        [
          ["sm", "小"],
          ["md", "中"],
          ["lg", "大"],
        ] as const
      ).map(([size, label]) => (
        <Dialog key={size}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              {label}号
            </Button>
          </DialogTrigger>
          <DialogContent size={size}>
            <DialogTitle>{label}号面板</DialogTitle>
            <DialogDescription>
              面板宽度随 size 变化，内容区始终可滚动，页面本身不会跳动。
            </DialogDescription>
            <div className="dl-dialog__actions">
              <DialogClose asChild>
                <Button variant="soft">好的</Button>
              </DialogClose>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </>
  );
}

function HiddenTitleDialog() {
  return (
    <>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="ghost" tone="danger">
            仅 aria-label
          </Button>
        </DialogTrigger>
        <DialogContent size="sm" aria-label="退出登录">
          <DialogDescription>
            当前设备上的会话会立即失效，需要重新输入密码才能继续。
          </DialogDescription>
          <div className="dl-dialog__actions">
            <DialogClose asChild>
              <Button tone="danger">确认退出</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline">隐藏标题</Button>
        </DialogTrigger>
        <DialogContent size="sm">
          <DialogTitle visuallyHidden>退出登录</DialogTitle>
          <DialogDescription>
            标题只存在于无障碍树里，视觉上只看到说明文字和操作按钮。
          </DialogDescription>
          <div className="dl-dialog__actions">
            <DialogClose asChild>
              <Button variant="soft">好的</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

function ControlledDialog() {
  const [open, setOpen] = React.useState(false);

  return (
    <>
      <Button variant="soft" onClick={() => setOpen(true)}>
        从外部打开
      </Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent showCloseButton={false}>
          <DialogTitle>受控对话框</DialogTitle>
          <DialogDescription>
            open 与 onOpenChange 完全由外部状态驱动，关闭动画结束后才会卸载。
          </DialogDescription>
          <div className="dl-dialog__actions">
            <Button onClick={() => setOpen(false)}>明白了</Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}

export const dialogDemo: DemoEntry = {
  slug: "dialog",
  title: "Dialog",
  group: "overlay",
  summary: "模态对话框：焦点陷阱、Esc 关闭、关闭后焦点归还，退出是 140ms 的无回弹 tween。",
  examples: [
    { title: "基础用法", layout: "row", render: () => <BasicDialog /> },
    { title: "尺寸", layout: "row", render: () => <SizeDialogs /> },
    {
      title: "没有可见标题",
      description: "标题只给读屏用户：DialogTitle 加 visuallyHidden，或直接给 DialogContent 一个 aria-label。",
      layout: "row",
      render: () => <HiddenTitleDialog />,
    },
    { title: "受控", layout: "row", render: () => <ControlledDialog /> },
  ],
  props: [
    { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "面板宽度 360 / 480 / 640px。" },
    { name: "showCloseButton", type: "boolean", default: "true", description: "右上角关闭按钮。" },
    { name: "closeLabel", type: "string", default: '"Close"', description: "关闭按钮的可访问名称。" },
    { name: "open / defaultOpen", type: "boolean", description: "受控或非受控的可见性。" },
    { name: "onOpenChange", type: "(open: boolean) => void", description: "Esc、遮罩点击、关闭按钮都会经过它。" },
    { name: "visuallyHidden", type: "boolean", default: "false", description: "DialogTitle 专有：标题只出现在无障碍树里。" },
  ],
  notes: [
    "焦点陷阱、Esc、遮罩与焦点归还全部交给 Radix Dialog，DialogContent 只负责材质与动效。",
    "退出动画依赖 forceMount + AnimatePresence：Radix 不再立即卸载 DOM，140ms tween 播完才移除节点。",
    "遮罩只淡出淡入，模糊是静止值，不参与动画。",
  ],
};
