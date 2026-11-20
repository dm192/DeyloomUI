import * as React from "react";
import { Button, DeyloomIcons, StaggerList } from "@deyloom/react";
import type { DemoEntry } from "./types";

interface Task {
  id: number;
  label: string;
}

const SEED: Task[] = [
  { id: 1, label: "收集现有页面的交互截图" },
  { id: 2, label: "确认动效常量与弹簧参数" },
  { id: 3, label: "补齐键盘焦点路径" },
  { id: 4, label: "检查暗色主题下的对比度" },
];

const QUEUE = [
  "补一条 reduced-motion 验收用例",
  "把列表入场延迟写进文档",
  "复核触屏下的拖拽边界",
  "补测 24 项以上的长列表",
  "更新组件的 props 表",
];

const itemStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  gap: "var(--dl-space-4)",
  padding: "var(--dl-space-4) var(--dl-space-5)",
  fontSize: "var(--dl-text-sm)",
};

function AddRemoveDemo() {
  const [tasks, setTasks] = React.useState<Task[]>(SEED);
  const nextId = React.useRef(SEED.length + 1);

  const addTask = () => {
    const label = QUEUE[(nextId.current - SEED.length - 1) % QUEUE.length] ?? "新任务";
    setTasks((previous) => [...previous, { id: nextId.current++, label }]);
  };

  return (
    <div style={{ display: "grid", gap: "var(--dl-space-4)", inlineSize: "100%" }}>
      <StaggerList
        items={tasks}
        getKey={(task) => task.id}
        renderItem={(task) => (
          <div className="dl-surface" style={itemStyle}>
            <span>{task.label}</span>
            <span style={{ color: "var(--dl-color-ink-subtle)", fontVariantNumeric: "tabular-nums" }}>
              #{task.id}
            </span>
          </div>
        )}
      />
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--dl-space-3)" }}>
        <Button size="sm" onClick={addTask} startIcon={<DeyloomIcons.PlusIcon />}>
          添加一项
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setTasks((previous) => previous.slice(0, -1))}
          disabled={tasks.length === 0}
        >
          移除最后一项
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setTasks(SEED)}>
          重置
        </Button>
      </div>
    </div>
  );
}

const DENSITIES = ["tight", "base", "loose"] as const;

function DensityDemo() {
  const [run, setRun] = React.useState(0);
  const rows = ["弹簧曲线", "材质层次", "性能预算", "键盘路径"];

  return (
    <div style={{ display: "grid", gap: "var(--dl-space-4)", inlineSize: "100%" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
          gap: "var(--dl-space-4)",
        }}
      >
        {DENSITIES.map((density) => (
          <div key={density} style={{ display: "grid", gap: "var(--dl-space-2)", alignItems: "start" }}>
            <span
              style={{
                fontSize: "var(--dl-text-xs)",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                color: "var(--dl-color-ink-subtle)",
              }}
            >
              {density}
            </span>
            <StaggerList
              key={`${density}-${run}`}
              stagger={density}
              items={rows}
              getKey={(row) => row}
              renderItem={(row) => (
                <div className="dl-surface" style={{ padding: "var(--dl-space-3) var(--dl-space-4)", fontSize: "var(--dl-text-sm)" }}>
                  {row}
                </div>
              )}
            />
          </div>
        ))}
      </div>
      <Button size="sm" variant="outline" onClick={() => setRun((value) => value + 1)}>
        重播交错
      </Button>
    </div>
  );
}

const REVIEW_ITEMS = [
  "焦点环是否在深色背景上可见",
  "长列表滚动时是否只动 transform",
  "图标按钮是否都有可访问名称",
  "暗色主题的描边是否足够区分",
  "循环动画是否都带 dl-anim-loop",
  "触屏下是否跳过指针光斑",
];

function LongListDemo() {
  const [count, setCount] = React.useState(26);
  const items = React.useMemo(
    () =>
      Array.from({ length: count }, (_, index) => ({
        id: index,
        label: `${REVIEW_ITEMS[index % REVIEW_ITEMS.length]} · 第 ${index + 1} 项`,
      })),
    [count],
  );

  return (
    <div style={{ display: "grid", gap: "var(--dl-space-4)", inlineSize: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", gap: "var(--dl-space-3)", fontSize: "var(--dl-text-sm)" }}>
        <span style={{ color: "var(--dl-color-ink-muted)" }}>当前 {count} 项</span>
        <Button size="sm" variant="outline" onClick={() => setCount((value) => Math.min(value + 1, 40))}>
          加一项
        </Button>
        <Button size="sm" variant="ghost" onClick={() => setCount((value) => Math.max(value - 1, 1))}>
          减一项
        </Button>
      </div>
      <StaggerList
        items={items}
        getKey={(item) => item.id}
        renderItem={(item) => (
          <div className="dl-surface" style={{ padding: "var(--dl-space-3) var(--dl-space-4)", fontSize: "var(--dl-text-sm)" }}>
            {item.label}
          </div>
        )}
      />
    </div>
  );
}

export const staggerListDemo: DemoEntry = {
  slug: "stagger-list",
  title: "StaggerList",
  group: "showcase",
  summary: "通用交错列表：进入时逐项落位，退出时统一收起，长列表自动关闭交错延迟。",
  examples: [
    {
      title: "增删与交错",
      description: "进入使用 listItem 弹簧，退出使用统一短 tween；两项动作都不会改变布局。",
      layout: "stretch",
      render: () => <AddRemoveDemo />,
    },
    {
      title: "交错密度",
      description: "tight / base / loose 三档只改变每项之间的延迟，入场曲线保持一致。",
      layout: "stretch",
      render: () => <DensityDemo />,
    },
    {
      title: "长列表降级",
      description: "超过 24 项时自动取消逐项延迟；把项数加到 26 以上可在 dev 控制台看到一次提示。",
      layout: "stretch",
      render: () => <LongListDemo />,
    },
  ],
  props: [
    { name: "items", type: "readonly T[]", description: "任意数据数组，列表只负责编排。" },
    { name: "getKey", type: "(item: T) => React.Key", description: "稳定 key，驱动增删动画。" },
    { name: "renderItem", type: "(item: T, index: number) => ReactNode", description: "渲染每一项内容。" },
    { name: "stagger", type: '"tight" | "base" | "loose"', default: '"base"', description: "逐项延迟密度。" },
    { name: "as", type: '"ul" | "div"', default: '"ul"', description: "语义元素；div 模式仍保留 list/listitem 角色。" },
  ],
  notes: ["延迟上限来自 stagger.max，超过 24 项会整段关闭交错，避免用户等待。"],
};
