import * as React from "react";
import { m } from "motion/react";
import { Button, springs, stagger, useDeyloomReducedMotion } from "@deyloom/react";
import { PageHeader, Section } from "../ui/blocks";

const SPRING_ORDER = ["press", "snappy", "soft", "gentle"] as const;

const SPRING_NOTES: Record<(typeof SPRING_ORDER)[number], string> = {
  press: "按压反馈，最硬，几乎无位移",
  snappy: "小元素换位：开关滑块、页签指示",
  soft: "默认：卡片与浮层进场",
  gentle: "大面板与整页编排",
};

/** Travel distance in px. Fixed so the demo diff is about the spring, not the layout. */
const TRAVEL = 196;

function SpringTuner() {
  const [stiffness, setStiffness] = React.useState(320);
  const [damping, setDamping] = React.useState(30);
  const [fired, setFired] = React.useState(false);
  const reduced = useDeyloomReducedMotion();

  return (
    <div className="spring-lab">
      <div>
        <div className="spring-lab__stage">
          <m.div
            className="spring-lab__ball"
            animate={{ x: fired ? TRAVEL : 0 }}
            transition={reduced ? { duration: 0 } : { type: "spring", stiffness, damping, mass: 1 }}
          />
        </div>
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <Button variant="outline" onClick={() => setFired((value) => !value)}>
            {fired ? "复位" : "发射"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setStiffness(320);
              setDamping(30);
            }}
          >
            恢复默认
          </Button>
        </div>
      </div>

      <div className="spring-lab__controls">
        <label className="slider-field">
          <span className="slider-field__head">
            刚度 stiffness
            <output>{stiffness}</output>
          </span>
          <input
            type="range"
            min={80}
            max={900}
            step={10}
            value={stiffness}
            onChange={(event) => setStiffness(Number(event.currentTarget.value))}
          />
        </label>
        <label className="slider-field">
          <span className="slider-field__head">
            阻尼 damping
            <output>{damping}</output>
          </span>
          <input
            type="range"
            min={5}
            max={80}
            step={1}
            value={damping}
            onChange={(event) => setDamping(Number(event.currentTarget.value))}
          />
        </label>
        <p style={{ fontSize: 12, color: "var(--dl-color-ink-subtle)", margin: 0 }}>
          阻尼低于临界值时会出现回弹；库内所有退场动画改用 tween，避免"弹回去"看起来像出错。
        </p>
      </div>
    </div>
  );
}

function SpringFamily() {
  const [fired, setFired] = React.useState(false);
  const reduced = useDeyloomReducedMotion();

  return (
    <div>
      <div className="ball-row">
        {SPRING_ORDER.map((name) => (
          <div className="ball-row__item" key={name}>
            <span className="ball-row__label">{name}</span>
            <div className="ball-row__track">
              <m.div
                className="ball-row__ball"
                animate={{ x: fired ? TRAVEL + 40 : 0 }}
                transition={reduced ? { duration: 0 } : springs[name]}
              />
            </div>
          </div>
        ))}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
        <Button size="sm" variant="outline" onClick={() => setFired((value) => !value)}>
          {fired ? "全部复位" : "同时发射"}
        </Button>
      </div>
      <p className="inline-note">
        四条弹簧同时出发，落点相同、手感不同：
        {SPRING_ORDER.map((name) => `${name}（${SPRING_NOTES[name]}）`).join("；")}。
      </p>
    </div>
  );
}

function StaggerSpecimen() {
  const [items, setItems] = React.useState(() => Array.from({ length: 6 }, (_, index) => index + 1));
  const [run, setRun] = React.useState(0);
  const reduced = useDeyloomReducedMotion();

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setItems(Array.from({ length: 6 }, (_, index) => index + 1));
            setRun((value) => value + 1);
          }}
        >
          重播交错
        </Button>
        <span className="inline-note" style={{ marginTop: 0, alignSelf: "center" }}>
          每项延迟 {stagger.base * 1000}ms，最多 {stagger.max} 项后不再累加
        </span>
      </div>
      <div key={run} className="stagger-specimen">
        {items.map((item, index) => (
          <div
            className="stagger-specimen__item"
            key={item}
            style={
              {
                "--delay": `${Math.min(index, stagger.max) * stagger.base}s`,
                animationDelay: reduced ? "0s" : "var(--delay)",
              } as React.CSSProperties
            }
          >
            条目 {item}
          </div>
        ))}
      </div>
    </div>
  );
}

export function MotionPage() {
  return (
    <>
      <PageHeader
        kicker="Motion"
        title="动效实验室"
        summary="所有组件共用的弹簧、交错与曲线。调参后可以直接在同一页对比手感。"
      />

      <Section title="弹簧调参" hint="拖动参数改变上方的真实弹簧动画；这不是预设预览，而是同一个 spring 配置。">
        <SpringTuner />
      </Section>

      <Section title="弹簧家族" hint="四个预设的差异只在刚度与阻尼。">
        <SpringFamily />
      </Section>

      <Section title="交错入场" hint="交错是延迟，不是更多的动画；超过上限后延迟归零，避免可见的等待。">
        <StaggerSpecimen />
      </Section>

      <Section title="两条硬性规则">
        <div className="contract">
          <div className="contract__item">
            <h3 className="contract__title">退场不回弹</h3>
            <p className="contract__body">
              进场用弹簧，退场用 140ms tween。回弹属于"到达"，不属于"离开"。
            </p>
          </div>
          <div className="contract__item">
            <h3 className="contract__title">长列表按需降级</h3>
            <p className="contract__body">
              超过 24 项时关闭交错；更大的列表请交给虚拟化，而不是让每一行都跑弹簧。
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
