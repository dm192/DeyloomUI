import type { CSSProperties } from "react";
import { defineDemos } from "./types";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
  Button,
  toast,
} from "@deyloom/react";

const listStyle: CSSProperties = {
  display: "grid",
  gap: "var(--dl-space-2)",
  margin: 0,
  paddingInlineStart: "var(--dl-space-6)",
  color: "var(--dl-color-ink-muted)",
  fontSize: "var(--dl-text-sm)",
};

const EXPORT_ITEMS = [
  "项目、页面与页面版本",
  "组件与样式变量",
  "图标与静态资源",
  "评论与批注",
  "成员权限设置",
  "操作日志（最近 90 天）",
  "表单提交记录",
  "A/B 实验配置",
  "内容模型与字段",
  "本地化词条",
  "自定义域名配置",
  "Webhook 与集成",
];

function DeleteConfirmation() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" tone="danger">
          删除项目
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>删除「营销落地页」？</AlertDialogTitle>
        <AlertDialogDescription>
          项目及其 24 个页面会被永久删除，协作者会立即失去访问权限。此操作无法撤销。
        </AlertDialogDescription>
        <div className="dl-alert-dialog__actions">
          <AlertDialogCancel>保留项目</AlertDialogCancel>
          <AlertDialogAction
            onClick={() =>
              toast({
                title: "项目已删除",
                description: "「营销落地页」已从工作区移除。",
                variant: "success",
              })
            }
          >
            删除
          </AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function OverwriteConfirmation() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="soft">覆盖版本</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>覆盖已发布的 0.1.8？</AlertDialogTitle>
        <AlertDialogDescription>
          当前草稿会替换线上版本，旧版本仍可从版本历史中恢复。确认继续？
        </AlertDialogDescription>
        <div className="dl-alert-dialog__actions">
          <AlertDialogCancel>取消</AlertDialogCancel>
          <AlertDialogAction tone="accent">覆盖发布</AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

function ScrollableContent() {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline">导出工作区</Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>导出整个工作区？</AlertDialogTitle>
        <AlertDialogDescription>
          以下内容会打包成一个 ZIP 文件。内容较多时面板自身滚动，页面不会跳动。
        </AlertDialogDescription>
        <ul style={listStyle}>
          {EXPORT_ITEMS.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
        <AlertDialogDescription>
          导出在后台进行，完成后会通过邮件发送下载链接，可能需要几分钟。
        </AlertDialogDescription>
        <div className="dl-alert-dialog__actions">
          <AlertDialogCancel>稍后再说</AlertDialogCancel>
          <AlertDialogAction tone="accent">开始导出</AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

export const alertDialogDemo = defineDemos([
  {
    slug: "alert-dialog",
    title: "Alert Dialog",
    group: "overlay",
    summary:
      "危险操作确认：没有关闭按钮，遮罩点击不关闭，只能明确选择取消或确认。",
    examples: [
      { title: "删除确认", layout: "row", render: () => <DeleteConfirmation /> },
      { title: "覆盖确认", layout: "row", render: () => <OverwriteConfirmation /> },
      {
        title: "长内容",
        description: "内容超过可用高度时面板内部滚动，操作按钮始终在文档流末尾。",
        layout: "row",
        render: () => <ScrollableContent />,
      },
    ],
    props: [
      {
        name: "AlertDialogAction tone",
        type: '"danger" | "accent"',
        default: '"danger"',
        description: "确认按钮的视觉倾向：危险操作或强调确认。",
      },
      {
        name: "open / defaultOpen",
        type: "boolean",
        description: "受控或非受控的可见性。",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "Esc、Cancel、Action 都会经过它。",
      },
      {
        name: "AlertDialogTitle",
        type: "组件",
        description: "必填的可访问名称来源；没有标题时开发环境会警告。",
      },
    ],
    notes: [
      "基于 Radix AlertDialog：焦点陷阱、Esc 关闭、焦点归还与背景 inert 全部由它负责，点击遮罩不会关闭。",
      "退场同样是 forceMount + AnimatePresence 的 140ms tween，面板与弹窗同一套 overlayPanel 编排。",
      "层级比 Dialog 高一级（52/53），嵌套时确认层永远压在普通对话框之上。",
    ],
  },
]);
