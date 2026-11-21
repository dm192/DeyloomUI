import * as React from "react";
import { Button, StaggerList, toast } from "@deyloom/react";
import { PageHeader, Section } from "../ui/blocks";
import { formatMs, useFrameMeter } from "../ui/use-frame-meter";
import sizesRaw from "../generated/sizes.json";

interface SizeEntry {
  file: string;
  raw: number;
  gzip: number;
}

interface SizesReport {
  generatedAt: string;
  budgets: { jsGzip: number; cssGzip: number };
  totals: { jsGzip: number; cssGzip: number };
  entries: SizeEntry[];
}

const report = sizesRaw as unknown as SizesReport;
const hasReport = Array.isArray(report.entries) && report.entries.length > 0;
const budgets = report.budgets ?? { jsGzip: 60 * 1024, cssGzip: 10 * 1024 };
const totals = report.totals ?? { jsGzip: 0, cssGzip: 0 };

function kb(bytes: number): string {
  return `${(bytes / 1024).toFixed(1)} KB`;
}

function ratio(used: number, budget: number): number {
  if (budget <= 0) return 0;
  return Math.min(1, used / budget);
}

function Budget(props: { label: string; used: number; budget: number; note: string }) {
  const usedRatio = ratio(props.used, props.budget);
  const over = props.used > props.budget;
  return (
    <div className="budget__item">
      <div className="budget__label">{props.label}</div>
      <div className="budget__value">
        {props.used > 0 ? kb(props.used) : "—"} <small>/ {kb(props.budget)}</small>
      </div>
      <div className="meter__bar" style={{ marginTop: 10 }}>
        <span
          className="meter__fill"
          style={{
            transform: `scaleX(${usedRatio})`,
            background: over ? "var(--dl-color-danger)" : "var(--dl-color-accent)",
          }}
        />
      </div>
      <div className="budget__label" style={{ marginTop: 8 }}>
        {props.note}
      </div>
    </div>
  );
}

const STRESS_ROWS = Array.from({ length: 500 }, (_, index) => ({
  id: index + 1,
  label: `记录 ${index + 1}`,
}));

export function PerformancePage() {
  const meter = useFrameMeter();
  const [listVisible, setListVisible] = React.useState(false);

  const runToastStorm = () => {
    meter.measure(1500, () => {
      for (let index = 0; index < 12; index += 1) {
        toast({
          title: `通知 ${index + 1}`,
          description: "同时触发 12 条，堆叠上限 5 条，其余排队。",
          duration: 4000,
        });
      }
    });
  };

  const runListStress = () => {
    setListVisible(true);
    meter.measure(1500);
  };

  return (
    <>
      <PageHeader
        kicker="Performance"
        title="性能"
        summary="体积预算与动效约束都在 npm run verify 里强制执行；下面的数字来自本机真实构建产物，不是估算。"
      />

      <Section title="体积预算" hint={hasReport ? `构建于 ${report.generatedAt}` : "还没有构建产物：先运行 npm run build。"}>
        <div className="budget">
          <Budget
            label="ESM JS（gzip，不含 react / motion / radix）"
            used={totals.jsGzip}
            budget={budgets.jsGzip}
            note="npm run size 校验，超预算直接失败"
          />
          <Budget
            label="CSS（gzip）"
            used={totals.cssGzip}
            budget={budgets.cssGzip}
            note="单文件、可整份替换，不依赖构建链"
          />
          <Budget
            label="运行时动画库"
            used={0}
            budget={0}
            note="只加载 LazyMotion(domAnimation)，不使用 layout 动画"
          />
        </div>
      </Section>

      <Section title="构建产物">
        {hasReport ? (
          <div className="props-table-wrap">
            <table className="sizes-table">
              <thead>
                <tr>
                  <th scope="col">文件</th>
                  <th scope="col">原始</th>
                  <th scope="col">gzip</th>
                </tr>
              </thead>
              <tbody>
                {report.entries.map((entry) => (
                  <tr key={entry.file}>
                    <td>
                      <code>{entry.file}</code>
                    </td>
                    <td>{kb(entry.raw)}</td>
                    <td>{kb(entry.gzip)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">
            还没有体积报告。在仓库根目录运行 <code>npm run build</code> 后会生成。
          </div>
        )}
      </Section>

      <Section title="帧采样" hint="在本机无头浏览器里采样真实 rAF 间隔；结果只代表这台机器的当前状态。">
        <div className="stress">
          <Button variant="outline" onClick={runToastStorm} disabled={meter.running}>
            同时触发 12 条 Toast
          </Button>
          <Button variant="outline" onClick={runListStress} disabled={meter.running}>
            渲染 500 行交错列表
          </Button>
          {listVisible ? (
            <Button variant="ghost" onClick={() => setListVisible(false)}>
              清除列表
            </Button>
          ) : null}
          {meter.running ? <span className="inline-note">采样中…</span> : null}
        </div>

        {meter.stats ? (
          <div className="meter" style={{ marginTop: 16 }}>
            <div className="meter__row">
              <span>采样帧数</span>
              <span className="meter__value">{meter.stats.frames}</span>
            </div>
            <div className="meter__row">
              <span>平均帧间隔</span>
              <span className="meter__value">{formatMs(meter.stats.avg)}</span>
            </div>
            <div className="meter__row">
              <span>p95 帧间隔</span>
              <span className="meter__value">{formatMs(meter.stats.p95)}</span>
            </div>
            <div className="meter__row">
              <span>最长帧</span>
              <span className="meter__value">{formatMs(meter.stats.max)}</span>
            </div>
            <p className="inline-note" style={{ marginTop: 4 }}>
              60Hz 显示器上理想帧间隔约 16.7ms；p95 明显高于它说明这一帧里有布局或绘制阻塞。
            </p>
          </div>
        ) : null}

        {listVisible ? (
          <div style={{ marginTop: 18 }}>
            <StaggerList
              items={STRESS_ROWS}
              getKey={(item) => item.id}
              stagger="tight"
              renderItem={(item) => (
                <div
                  style={{
                    padding: "6px 10px",
                    borderBottom: "1px solid var(--dl-color-border)",
                    fontSize: 13,
                    color: "var(--dl-color-ink-muted)",
                  }}
                >
                  {item.label}
                </div>
              )}
            />
          </div>
        ) : null}
      </Section>

      <Section title="被强制的规则" hint="scripts/check-motion-css.mjs 会扫描所有库样式，违反即让 npm run verify 失败。">
        <div className="contract">
          <div className="contract__item">
            <h3 className="contract__title">禁止布局动画</h3>
            <p className="contract__body">
              不允许过渡 width / height / margin / padding / top / left；唯一例外是单面板展开高度与测量型页签指示器，且需要在源码里写明原因。
            </p>
          </div>
          <div className="contract__item">
            <h3 className="contract__title">循环动画可降级</h3>
            <p className="contract__body">
              所有循环动画必须挂 dl-anim-loop，并在 prefers-reduced-motion 下替换为静态状态，而不是直接消失。
            </p>
          </div>
          <div className="contract__item">
            <h3 className="contract__title">体积回归</h3>
            <p className="contract__body">
              JS 与 CSS 的 gzip 体积写入预算表，构建后自动比较；超过就失败，不允许悄悄变大。
            </p>
          </div>
          <div className="contract__item">
            <h3 className="contract__title">阴影与例外须说明理由</h3>
            <p className="contract__body">
              过渡 box-shadow 只允许小控件，且必须在源码里写 dl-motion-allow 理由；Card 这类大面板只做 transform 与边框。
            </p>
          </div>
          <div className="contract__item">
            <h3 className="contract__title">高度与堆叠走单元素过渡</h3>
            <p className="contract__body">
              Tabs 容器高度用 WAAPI、Toast 堆叠用 FLIP，都只影响一个容器或一组 transform；任何情况下都不做列表级布局动画。
            </p>
          </div>
        </div>
      </Section>
    </>
  );
}
