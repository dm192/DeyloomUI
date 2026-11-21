import { ScrollArea } from "@deyloom/react";
import { defineDemos } from "./types";

const RELEASES = Array.from({ length: 18 }, (_, index) => ({
  id: index + 1,
  version: `0.1.${18 - index}`,
  note: index % 3 === 0 ? "动效常量与 Token 对齐" : index % 3 === 1 ? "组件交互回归" : "文档与示例更新",
}));

const COLUMNS = ["组件", "变更", "状态", "负责人", "更新时间", "提交", "备注"];

function LongList() {
  return (
    <ScrollArea
      label="发布记录"
      maxHeight={220}
      style={{
        border: "1px solid var(--dl-color-border)",
        borderRadius: "var(--dl-radius-md)",
        background: "var(--dl-color-surface)",
      }}
    >
      <div style={{ padding: "var(--dl-space-2) var(--dl-space-4)" }}>
        {RELEASES.map((release) => (
          <div
            key={release.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              padding: "8px 0",
              borderBottom: "1px solid var(--dl-color-border)",
              fontSize: "var(--dl-text-sm)",
            }}
          >
            <span style={{ color: "var(--dl-color-ink)", fontVariantNumeric: "tabular-nums" }}>
              v{release.version}
            </span>
            <span style={{ color: "var(--dl-color-ink-muted)" }}>{release.note}</span>
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}

function WideTable() {
  return (
    <ScrollArea
      label="宽表格"
      orientation="both"
      maxHeight={180}
      style={{
        border: "1px solid var(--dl-color-border)",
        borderRadius: "var(--dl-radius-md)",
        background: "var(--dl-color-surface)",
      }}
    >
      <table style={{ borderCollapse: "collapse", fontSize: "var(--dl-text-sm)", minWidth: 760 }}>
        <thead>
          <tr>
            {COLUMNS.map((column) => (
              <th
                key={column}
                style={{
                  textAlign: "start",
                  padding: "8px 12px",
                  whiteSpace: "nowrap",
                  color: "var(--dl-color-ink-subtle)",
                  borderBottom: "1px solid var(--dl-color-border)",
                  fontWeight: 600,
                }}
              >
                {column}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {RELEASES.slice(0, 8).map((release) => (
            <tr key={release.id}>
              <td style={{ padding: "8px 12px", color: "var(--dl-color-ink)" }}>Button</td>
              <td style={{ padding: "8px 12px", color: "var(--dl-color-ink-muted)" }}>
                {release.note}
              </td>
              <td style={{ padding: "8px 12px", color: "var(--dl-color-ink-muted)" }}>已合并</td>
              <td style={{ padding: "8px 12px", color: "var(--dl-color-ink-muted)" }}>设计系统组</td>
              <td style={{ padding: "8px 12px", color: "var(--dl-color-ink-muted)", whiteSpace: "nowrap" }}>
                2026-11-2{release.id % 9}
              </td>
              <td style={{ padding: "8px 12px", color: "var(--dl-color-ink-muted)" }}>
                #{1200 + release.id}
              </td>
              <td style={{ padding: "8px 12px", color: "var(--dl-color-ink-muted)" }}>—</td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  );
}

export const scrollAreaDemo = defineDemos([
  {
    slug: "scroll-area",
    title: "ScrollArea",
    group: "navigation",
    summary: "带主题滚动条的滚动容器，支持单轴/双轴、悬停显示与自定义最大高度。",
    examples: [
      {
        title: "纵向滚动",
        description: "滚动条只在需要时出现，颜色跟随明暗主题。",
        layout: "stretch",
        render: () => <LongList />,
      },
      {
        title: "双轴滚动",
        description: "两个方向同时溢出时自动出现横向条与转角。",
        layout: "stretch",
        render: () => <WideTable />,
      },
    ],
    props: [
      {
        name: "orientation",
        type: '"vertical" | "horizontal" | "both"',
        default: '"vertical"',
        description: "渲染哪些方向的滚动条。",
      },
      {
        name: "maxHeight",
        type: "number | string",
        description: "视口最大高度；数字按 px 处理。",
      },
      {
        name: "type",
        type: '"auto" | "always" | "scroll" | "hover"',
        default: '"hover"',
        description: "滚动条可见性策略。",
      },
      {
        name: "label",
        type: "string",
        description: "给可聚焦的视口一个可访问名称（role=region）。",
      },
    ],
    notes: [
      "视口可聚焦，键盘可以滚动没有交互子元素的区域。",
      "原生滚动条被隐藏并替换为 token 着色的 thumb，动画只做 opacity。",
    ],
  },
]);
