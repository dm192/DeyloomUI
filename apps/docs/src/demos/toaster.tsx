import type { DemoEntry } from "./types";
import { Button, toast } from "@deyloom/react";

function VariantButtons() {
  return (
    <>
      <Button onClick={() => toast({ title: "已保存", description: "改动已同步到云端。" })}>
        默认通知
      </Button>
      <Button
        variant="soft"
        onClick={() =>
          toast({
            title: "发布成功",
            description: "v0.1.0 已经在生产环境生效。",
            variant: "success",
          })
        }
      >
        成功通知
      </Button>
      <Button
        variant="soft"
        tone="danger"
        onClick={() =>
          toast({
            title: "同步失败",
            description: "网络连接中断，请稍后重试。",
            variant: "danger",
          })
        }
      >
        错误通知
      </Button>
    </>
  );
}

function ActionToast() {
  return (
    <Button
      variant="outline"
      onClick={() =>
        toast({
          title: "已删除 3 个文件",
          description: "这次操作会保留 10 分钟的可撤销窗口。",
          duration: 6000,
          action: {
            label: "撤销",
            onClick: () => toast({ title: "已恢复 3 个文件", variant: "success" }),
          },
        })
      }
    >
      带操作的通知
    </Button>
  );
}

function StackToast() {
  return (
    <Button
      variant="soft"
      onClick={() => {
        for (let index = 1; index <= 6; index += 1) {
          toast({
            title: `后台任务 ${index} 完成`,
            description: "同时触发 6 条，超过堆叠上限时最旧的一条会先退场。",
            duration: 6000,
          });
        }
      }}
    >
      触发 6 条
    </Button>
  );
}

export const toasterDemo: DemoEntry = {
  slug: "toaster",
  title: "Toaster",
  group: "overlay",
  summary: "命令式通知：toast() 入队、toast.dismiss(id) 关闭，堆叠、暂停与 aria-live 交给 Radix Toast。",
  examples: [
    { title: "变体", layout: "row", render: () => <VariantButtons /> },
    { title: "带操作", layout: "row", render: () => <ActionToast /> },
    { title: "堆叠上限", layout: "row", render: () => <StackToast /> },
  ],
  props: [
    { name: "position", type: '"top-right" | "top-left" | "top-center" | "bottom-right" | "bottom-left" | "bottom-center"', default: '"bottom-right"', description: "Toast 堆叠的锚点。" },
    { name: "duration", type: "number", default: "4500", description: "每条通知的默认停留毫秒数。" },
    { name: "max", type: "number", default: "5", description: "同时可见的上限，超出的最旧一条先退场。" },
    { name: "closeButton", type: "boolean", default: "false", description: "为每条通知渲染带名称的关闭按钮。" },
    { name: "toast(options)", type: "(options: ToastOptions) => string", description: "title、description、variant、duration、action；返回 id。" },
    { name: "toast.dismiss(id)", type: "(id?: string) => void", description: "关闭指定通知；省略 id 时清空全部。" },
  ],
  notes: [
    "文档站已经在根节点挂载 <Toaster position=\"bottom-right\" closeButton />，所以示例只负责触发，通知出现在右下角。",
    "悬停、聚焦或窗口失焦时 Radix 会暂停关闭计时，底部剩余时间条同步暂停（animation-play-state）。",
    "reduced-motion 下不显示流动的时间条，只保留文字。",
  ],
};
