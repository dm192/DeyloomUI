import { Separator } from "@deyloom/react";
import { defineDemos } from "./types";

const paragraphStyle = {
  margin: 0,
  color: "var(--dl-color-ink-muted)",
  fontSize: "var(--dl-text-sm)",
  lineHeight: "var(--dl-leading-base)",
} as const;

export const separatorDemo = defineDemos([
  {
    slug: "separator",
    title: "Separator",
    group: "navigation",
    summary: "1px 分隔线：水平线划分段落，垂直线由父容器高度撑开。",
    examples: [
      {
        title: "水平分隔",
        description: "默认 decorative，纯视觉分隔不进入无障碍树。",
        layout: "stretch",
        render: () => (
          <div style={{ display: "grid", gap: "var(--dl-space-5)", maxWidth: 460 }}>
            <div style={{ display: "grid", gap: "var(--dl-space-2)" }}>
              <h3
                style={{
                  margin: 0,
                  color: "var(--dl-color-ink)",
                  fontSize: "var(--dl-text-md)",
                  fontWeight: "var(--dl-weight-semibold)",
                }}
              >
                发布说明
              </h3>
              <p style={paragraphStyle}>
                ScrollArea 改为按需渲染滚动条，视口可以获得焦点。
              </p>
            </div>
            <Separator />
            <p style={paragraphStyle}>
              需要被朗读的结构分隔把 decorative 设为 false，Radix 会把它暴露为
              role=&quot;separator&quot;。
            </p>
          </div>
        ),
      },
      {
        title: "垂直分隔",
        description: "父容器高度决定线的长度：align-self: stretch，不写死尺寸。",
        layout: "center",
        render: () => (
          <div
            style={{
              display: "flex",
              alignItems: "stretch",
              gap: "var(--dl-space-4)",
              height: 20,
              color: "var(--dl-color-ink-muted)",
              fontSize: "var(--dl-text-sm)",
            }}
          >
            <span>Deyloom 0.1.0</span>
            <Separator orientation="vertical" />
            <span>MIT License</span>
            <Separator orientation="vertical" />
            <span>2026-11-20</span>
          </div>
        ),
      },
    ],
    props: [
      {
        name: "orientation",
        type: '"horizontal" | "vertical"',
        default: '"horizontal"',
        description: "分隔线方向。",
      },
      {
        name: "decorative",
        type: "boolean",
        default: "true",
        description: "纯视觉分隔；false 时以 role=separator 暴露给辅助技术。",
      },
    ],
    notes: [
      "垂直线不携带高度：父容器的 cross-size 决定长度，flex 行里 align-self: stretch 即生效。",
      "装饰性分隔同时使用 role=\"none\" 与 aria-hidden，屏幕阅读器不会读取。",
    ],
  },
]);
