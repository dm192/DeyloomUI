import type { CSSProperties } from "react";
import type { DemoEntry } from "./types";
import { Skeleton } from "@deyloom/react";

const stackStyle: CSSProperties = {
  display: "grid",
  gap: "var(--dl-space-5)",
  width: "100%",
  maxWidth: "440px",
};

const cardStyle: CSSProperties = {
  display: "flex",
  alignItems: "flex-start",
  gap: "var(--dl-space-5)",
  width: "100%",
  maxWidth: "360px",
  padding: "var(--dl-space-6)",
  background: "var(--dl-color-surface)",
  border: "1px solid var(--dl-color-border)",
  borderRadius: "var(--dl-radius-md)",
};

const columnStyle: CSSProperties = {
  display: "flex",
  flex: "1 1 auto",
  flexDirection: "column",
  gap: "var(--dl-space-3)",
};

function TextExample() {
  return (
    <div style={stackStyle}>
      <Skeleton lines={2} height={12} />
      <Skeleton lines={4} height={12} width="72%" />
    </div>
  );
}

function CardExample() {
  return (
    <div style={cardStyle} aria-busy="true" role="status" aria-label="正在加载成员信息">
      <Skeleton variant="circle" width={44} height={44} />
      <div style={columnStyle}>
        <Skeleton width="58%" height={14} />
        <Skeleton width="86%" height={12} />
        <Skeleton width="64%" height={12} />
      </div>
    </div>
  );
}

function ShapeExample() {
  return (
    <>
      <Skeleton variant="rect" width={160} height={96} />
      <Skeleton variant="circle" width={56} height={56} />
      <div style={{ width: "220px" }}>
        <Skeleton variant="text" />
      </div>
    </>
  );
}

export const skeletonDemo: DemoEntry = {
  slug: "skeleton",
  title: "Skeleton",
  group: "overlay",
  summary: "加载占位：扫光是伪元素的 translateX 循环，占位本身自动 aria-hidden。",
  examples: [
    { title: "文本段落", layout: "stretch", render: () => <TextExample /> },
    {
      title: "卡片占位",
      description: "把 aria-busy 放在卡片容器上，骨架本身永远对读屏隐藏。",
      layout: "row",
      render: () => <CardExample />,
    },
    { title: "形状", layout: "row", render: () => <ShapeExample /> },
  ],
  props: [
    { name: "variant", type: '"text" | "rect" | "circle"', default: '"text"', description: "占位形状。" },
    { name: "width / height", type: "number | string", description: "数字按 px 处理；circle 默认 40px。" },
    { name: "lines", type: "number", default: "1", description: "text 专有：行数，最后一行 60% 宽。" },
    { name: "className", type: "string", description: "透传到根元素。" },
  ],
  notes: [
    "Skeleton 自身总是 aria-hidden：外层容器负责 aria-busy，读屏用户听到的是“忙碌”，而不是一堆空盒子。",
    "扫光由 ::after 的 transform: translateX 驱动，并带 dl-anim-loop；reduced-motion 下停止动画，只留静态底色。",
    "多行文本共用同一套尺寸：给 height 就统一行高，不给则跟随当前字号。",
  ],
};
