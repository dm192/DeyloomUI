import * as React from "react";
import { m } from "motion/react";
import { ArrowPathIcon, PlayIcon } from "@heroicons/react/24/outline";
import {
  Button,
  Field,
  Slider,
  stagger,
  useDeyloomReducedMotion,
} from "@deyloom/react";
import { PageHeader, Section } from "../ui/blocks";
import { SpringRace } from "../ui/SpringRace";

/** Travel distance in px for the tuner. Fixed so the diff is about the spring, not the layout. */
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
          <Button
            variant="outline"
            onClick={() => setFired((value) => !value)}
            startIcon={<PlayIcon className="docs-icon" />}
          >
            {fired ? "复位" : "发射"}
          </Button>
          <Button
            variant="ghost"
            onClick={() => {
              setStiffness(320);
              setDamping(30);
            }}
            startIcon={<ArrowPathIcon className="docs-icon" />}
          >
            恢复默认
          </Button>
        </div>
      </div>

      <div className="spring-lab__controls">
        <Field label="刚度 stiffness">
          <Slider
            min={80}
            max={900}
            step={10}
            value={[stiffness]}
            onValueChange={(next) => setStiffness(next[0] ?? stiffness)}
            showValue
          />
        </Field>
        <Field label="阻尼 damping">
          <Slider
            min={5}
            max={80}
            step={1}
            value={[damping]}
            onValueChange={(next) => setDamping(next[0] ?? damping)}
            showValue
          />
        </Field>
        <p style={{ fontSize: 12, color: "var(--dl-color-ink-subtle)", margin: 0 }}>
          阻尼低于临界值时会出现回弹；库内所有退场动画改用 tween，避免"弹回去"看起来像出错。
        </p>
      </div>
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
          startIcon={<ArrowPathIcon className="docs-icon" />}
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
        <SpringRace variant="lab" />
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
