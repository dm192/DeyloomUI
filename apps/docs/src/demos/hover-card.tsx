import type { CSSProperties } from "react";
import {
  Avatar,
  AvatarFallback,
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@deyloom/react";
import { defineDemos } from "./types";

const sentenceStyle: CSSProperties = {
  margin: 0,
  color: "var(--dl-color-ink-muted)",
};

const cardRowStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "var(--dl-space-3)",
};

const cardStackStyle: CSSProperties = {
  display: "grid",
  gap: "var(--dl-space-2)",
  minWidth: 0,
};

const nameStyle: CSSProperties = {
  color: "var(--dl-color-ink)",
  fontSize: "var(--dl-text-md)",
  fontWeight: "var(--dl-weight-semibold)",
  lineHeight: "var(--dl-leading-tight)",
};

const metaStyle: CSSProperties = {
  color: "var(--dl-color-ink-subtle)",
  fontSize: "var(--dl-text-xs)",
};

const bodyStyle: CSSProperties = {
  margin: 0,
  color: "var(--dl-color-ink-muted)",
};

function ProfileCard() {
  return (
    <p style={sentenceStyle}>
      把指针移到{" "}
      <HoverCard openDelay={180} closeDelay={120}>
        <HoverCardTrigger>Ada Lovelace</HoverCardTrigger>
        <HoverCardContent>
          <div style={cardRowStyle}>
            <Avatar size="lg">
              <AvatarFallback name="Ada Lovelace" />
            </Avatar>
            <div style={cardStackStyle}>
              <span style={nameStyle}>Ada Lovelace</span>
              <span style={metaStyle}>数学 · 分析机 · 1843</span>
              <p style={bodyStyle}>
                为分析机写下被公认的第一段算法，也是最早预见到计算机可以处理符号的人。
              </p>
            </div>
          </div>
        </HoverCardContent>
      </HoverCard>{" "}
      上查看名片；键盘用户 Tab 聚焦同样会打开。
    </p>
  );
}

function LinkCard() {
  return (
    <p style={sentenceStyle}>
      我们的默认立场是{" "}
      <HoverCard openDelay={160} closeDelay={120}>
        <HoverCardTrigger>渐进增强</HoverCardTrigger>
        <HoverCardContent>
          <span style={{ ...nameStyle, display: "block" }}>渐进增强</span>
          <p style={{ ...bodyStyle, marginBlockStart: "var(--dl-space-2)" }}>
            先保证没有 JavaScript 时内容仍然可读，再用浮层与动效提升体验。
          </p>
          <a
            href="#/foundations"
            style={{
              display: "inline-flex",
              marginBlockStart: "var(--dl-space-3)",
              color: "var(--dl-color-accent-soft-ink)",
              fontSize: "var(--dl-text-sm)",
            }}
          >
            查看设计变量 →
          </a>
        </HoverCardContent>
      </HoverCard>
      ，任何新组件都遵循这条底线。
    </p>
  );
}

export const hoverCardDemo = defineDemos([
  {
    slug: "hover-card",
    title: "Hover Card",
    group: "overlay",
    summary: "悬停或聚焦后延迟出现的富内容预览；移开即走，键盘焦点同样能打开。",
    examples: [
      { title: "用户名片", layout: "start", render: () => <ProfileCard /> },
      { title: "带链接的说明卡", layout: "start", render: () => <LinkCard /> },
    ],
    props: [
      {
        name: "openDelay / closeDelay",
        type: "number",
        default: "700 / 300",
        description: "悬停进入与离开的延迟毫秒数。",
      },
      {
        name: "open / defaultOpen",
        type: "boolean",
        description: "受控或非受控的可见性。",
      },
      {
        name: "onOpenChange",
        type: "(open: boolean) => void",
        description: "悬停、聚焦、Esc 引起的开关都会经过它。",
      },
      {
        name: "side / sideOffset",
        type: '"top" | "right" | "bottom" | "left" / number',
        default: '"bottom" / 8',
        description: "面板相对触发器出现的方向与间距，空间不足时自动翻转。",
      },
      {
        name: "arrow",
        type: "boolean",
        default: "false",
        description: "是否渲染指向触发器的小箭头。",
      },
      {
        name: "HoverCardTrigger asChild",
        type: "boolean",
        default: "false",
        description: "默认渲染文本按钮；asChild 可把行为挂到自己的可聚焦元素上。",
      },
    ],
    notes: [
      "进入/退出只在 opacity 与 transform 上做文章，transform-origin 取自 Radix 的 --radix-hover-card-content-transform-origin。",
      "触发器默认是真实的 <button type=\"button\">，因此悬停与键盘聚焦都能打开；面板内容不参与 Tab 顺序，不要只把关键操作放在卡里。",
      "延迟由 Radix 管理：移入 700ms 后出现，移出后 300ms 收起，快速掠过不会闪出面板。",
    ],
  },
]);
