import * as React from "react";
import { m } from "motion/react";
import { ArrowPathIcon, PlayIcon } from "@heroicons/react/24/outline";
import { Button, Card, springs, useDeyloomReducedMotion } from "@deyloom/react";

const SPRINGS = [
  { name: "press", descriptor: "按压", note: "按压反馈，最硬，几乎无位移" },
  { name: "snappy", descriptor: "换位", note: "小元素换位：开关滑块、页签指示" },
  { name: "soft", descriptor: "进场", note: "默认：卡片与浮层进场" },
  { name: "gentle", descriptor: "编排", note: "大面板与整页编排" },
] as const;

/** Gap between the track edge and the resting ball, in px (4px each side). */
const TRACK_PADDING = 8;

export interface SpringRaceProps {
  /** `hero` renders a titled card; `lab` is the bare comparison used in the lab. */
  variant?: "hero" | "lab";
  /** Fire once shortly after mount (hero only; ignored under reduced motion). */
  autoRun?: boolean;
  className?: string;
}

/**
 * The same displacement fired through all four spring presets at once.
 *
 * This is the one experiment that makes "one motion language" legible at a
 * glance: identical start, identical end, the only variable is the spring. The
 * hero uses it as proof; the motion lab reuses it as the family overview.
 */
export function SpringRace(props: SpringRaceProps) {
  const { variant = "hero", autoRun = false, className } = props;
  const reducedMotion = useDeyloomReducedMotion();

  const [runId, setRunId] = React.useState(0);
  const [travel, setTravel] = React.useState(0);
  const trackRef = React.useRef<HTMLDivElement | null>(null);
  const ballRef = React.useRef<HTMLDivElement | null>(null);
  const autoRan = React.useRef(false);

  React.useLayoutEffect(() => {
    const track = trackRef.current;
    const ball = ballRef.current;
    if (!track || !ball) return;

    const measure = () => {
      // Width can briefly be 0 before the stylesheet lands (dev / HMR); fall
      // back to the rendered box, then to the smallest known ball size.
      const ballWidth =
        ball.getBoundingClientRect().width ||
        Number.parseFloat(getComputedStyle(ball).inlineSize) ||
        24;
      setTravel(Math.max(0, track.clientWidth - ballWidth - TRACK_PADDING));
    };

    measure();
    const frame = window.requestAnimationFrame(measure);
    if (typeof ResizeObserver === "undefined") {
      return () => window.cancelAnimationFrame(frame);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(track);
    observer.observe(ball);
    return () => {
      window.cancelAnimationFrame(frame);
      observer.disconnect();
    };
  }, []);

  // Reduced motion: settle at the end state, there is nothing to animate.
  React.useEffect(() => {
    if (!reducedMotion) return;
    setRunId((current) => (current === 0 ? 1 : current));
  }, [reducedMotion]);

  React.useEffect(() => {
    if (!autoRun || reducedMotion || autoRan.current) return;
    const timer = window.setTimeout(() => {
      autoRan.current = true;
      setRunId((current) => current + 1);
    }, 550);
    return () => window.clearTimeout(timer);
  }, [autoRun, reducedMotion]);

  const run = () => setRunId((current) => current + 1);
  const played = runId > 0;

  const trigger = !reducedMotion ? (
    <Button
      size="sm"
      variant="outline"
      onClick={run}
      startIcon={
        played ? <ArrowPathIcon className="docs-icon" /> : <PlayIcon className="docs-icon" />
      }
    >
      {played ? "再跑一次" : "同时发射"}
    </Button>
  ) : null;

  const lanes = (
    <div className="spring-race__lanes" aria-hidden="true">
      {SPRINGS.map((spring, index) => (
        <div className="spring-race__lane" key={spring.name}>
          <span className="spring-race__label">
            <span className="spring-race__name">{spring.name}</span>
            {variant === "hero" ? (
              <span className="spring-race__descriptor">{spring.descriptor}</span>
            ) : null}
          </span>
          <div className="spring-race__track" ref={index === 0 ? trackRef : undefined}>
            <m.div
              key={runId}
              ref={index === 0 ? ballRef : undefined}
              className="spring-race__ball"
              initial={{ x: 0 }}
              animate={{ x: runId > 0 ? travel : 0 }}
              transition={reducedMotion ? { duration: 0 } : springs[spring.name]}
            />
          </div>
        </div>
      ))}
    </div>
  );

  if (variant === "lab") {
    return (
      <div className={["spring-race", "spring-race--lab", className].filter(Boolean).join(" ")}>
        {lanes}
        {trigger ? <div className="spring-race__actions">{trigger}</div> : null}
        <p className="inline-note">
          四条弹簧同时出发，落点相同、手感不同：
          {SPRINGS.map((spring) => `${spring.name}（${spring.note}）`).join("；")}。
        </p>
      </div>
    );
  }

  return (
    <Card
      elevation={1}
      className={["spring-race", "spring-race--hero", className].filter(Boolean).join(" ")}
      aria-label="弹簧对比：同一次位移，四个预设"
    >
      <div className="spring-race__head">
        <p className="spring-race__title">同一次位移，四个弹簧</p>
        {trigger}
      </div>
      {lanes}
      <p className="spring-race__caption">
        同一起点、同一终点，差别只在节奏。
        <a href="#/motion">去实验室调参 →</a>
        {reducedMotion ? (
          <span className="spring-race__hint">
            减弱动效下不播放位移；节奏由快到慢：press → snappy → soft → gentle。
          </span>
        ) : null}
      </p>
    </Card>
  );
}
