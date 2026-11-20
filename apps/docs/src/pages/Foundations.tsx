import * as React from "react";
import { Button, useDeyloomTheme } from "@deyloom/react";
import { PageHeader, Section } from "../ui/blocks";

/* ------------------------------------------------------------------ colours */

type Rgb = [number, number, number];

const canvasRef: { ctx: CanvasRenderingContext2D | null | undefined } = { ctx: undefined };

function toRgb(color: string): Rgb | null {
  if (typeof document === "undefined") return null;
  if (canvasRef.ctx === undefined) {
    canvasRef.ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true });
  }
  const ctx = canvasRef.ctx;
  if (!ctx) return null;
  try {
    ctx.clearRect(0, 0, 1, 1);
    ctx.fillStyle = "#000000";
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, 1, 1);
    const data = ctx.getImageData(0, 0, 1, 1).data;
    return [data[0] ?? 0, data[1] ?? 0, data[2] ?? 0];
  } catch {
    return null;
  }
}

function resolveToken(token: string, property: "color" | "backgroundColor"): string {
  const el = document.createElement("div");
  el.style.position = "absolute";
  el.style.inset = "0 auto auto 0";
  el.style.opacity = "0";
  el.style.pointerEvents = "none";
  el.style[property] = `var(${token})`;
  document.body.appendChild(el);
  const value = getComputedStyle(el)[property];
  el.remove();
  return value;
}

function luminance([r, g, b]: Rgb): number {
  const channel = (value: number) => {
    const s = value / 255;
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

function contrastRatio(a: Rgb, b: Rgb): number {
  const l1 = luminance(a);
  const l2 = luminance(b);
  return (Math.max(l1, l2) + 0.05) / (Math.min(l1, l2) + 0.05);
}

function hex([r, g, b]: Rgb): string {
  return `#${[r, g, b].map((v) => Math.round(v).toString(16).padStart(2, "0")).join("")}`;
}

const SURFACE_TOKENS = [
  "--dl-color-bg",
  "--dl-color-bg-subtle",
  "--dl-color-surface",
  "--dl-color-surface-raised",
  "--dl-color-surface-sunken",
  "--dl-color-surface-inset",
  "--dl-color-border",
  "--dl-color-border-strong",
] as const;

const INK_TOKENS = [
  "--dl-color-ink",
  "--dl-color-ink-muted",
  "--dl-color-ink-subtle",
] as const;

const SEMANTIC_TOKENS = [
  "--dl-color-accent",
  "--dl-color-accent-soft",
  "--dl-color-danger",
  "--dl-color-success",
  "--dl-color-warning",
] as const;

interface ColorInfo {
  token: string;
  value: string;
  contrast: number | null;
}

function useColorInfo(tokens: readonly string[]): ColorInfo[] {
  const { resolvedTheme } = useDeyloomTheme();
  const [info, setInfo] = React.useState<ColorInfo[]>([]);

  React.useEffect(() => {
    const background = toRgb(resolveToken("--dl-color-bg", "backgroundColor"));
    setInfo(
      tokens.map((token) => {
        const resolved = resolveToken(token, "backgroundColor");
        const rgb = toRgb(resolved);
        return {
          token,
          value: rgb ? hex(rgb) : resolved,
          contrast: rgb && background ? contrastRatio(rgb, background) : null,
        };
      }),
    );
  }, [tokens, resolvedTheme]);

  return info;
}

function Swatches({ tokens, showContrast }: { tokens: readonly string[]; showContrast?: boolean }) {
  const info = useColorInfo(tokens);
  return (
    <div className="swatches">
      {info.map((item) => (
        <div className="swatch" key={item.token}>
          <div className="swatch__chip" style={{ background: `var(${item.token})` }} />
          <div className="swatch__meta">
            <div className="swatch__name">{item.value}</div>
            <div className="swatch__token">
              {item.token.replace("--dl-color-", "")}
              {showContrast && item.contrast !== null
                ? ` · ${item.contrast.toFixed(1)}:1`
                : ""}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ------------------------------------------------------------------- curves */

const EASINGS = [
  { name: "--dl-ease-out", points: [0.22, 1, 0.36, 1], usage: "进入 / 状态变化" },
  { name: "--dl-ease-in", points: [0.4, 0, 1, 1], usage: "退出" },
  { name: "--dl-ease-in-out", points: [0.65, 0, 0.35, 1], usage: "对称位移" },
  { name: "--dl-ease-spring", points: [0.34, 1.36, 0.64, 1], usage: "轻微回弹" },
] as const;

function CurveCard({ spec }: { spec: (typeof EASINGS)[number] }) {
  const [run, setRun] = React.useState(0);
  const [x1, y1, x2, y2] = spec.points;
  const svgPath = `M 0 100 C ${x1 * 100} ${100 - y1 * 100}, ${x2 * 100} ${100 - y2 * 100}, 100 0`;

  return (
    <div className="curve">
      <div className="curve__head">
        <span className="curve__name">{spec.usage}</span>
        <span className="curve__value">{spec.name.replace("--dl-", "")}</span>
      </div>
      <svg className="curve__svg" viewBox="-4 -4 108 108" role="img" aria-label={`${spec.usage} 的缓动曲线`}>
        <line className="curve__guide" x1="0" y1="100" x2="100" y2="100" />
        <line className="curve__guide" x1="0" y1="0" x2="0" y2="100" />
        <path className="curve__line" d={svgPath} />
      </svg>
      <div className="curve__track">
        <span
          key={run}
          className="curve__dot"
          style={{ "--curve-ease": `cubic-bezier(${spec.points.join(", ")})` } as React.CSSProperties}
        />
      </div>
      <div className="curve__footer">
        <code style={{ fontSize: 11, color: "var(--dl-color-ink-subtle)" }}>
          cubic-bezier({spec.points.join(", ")})
        </code>
        <Button size="sm" variant="ghost" onClick={() => setRun((n) => n + 1)}>
          播放
        </Button>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------- page */

const TYPE_RAMP = [
  { token: "--dl-text-3xl", label: "3xl · 28px", css: "var(--dl-text-3xl)", weight: 600 },
  { token: "--dl-text-2xl", label: "2xl · 22px", css: "var(--dl-text-2xl)", weight: 600 },
  { token: "--dl-text-xl", label: "xl · 18px", css: "var(--dl-text-xl)", weight: 500 },
  { token: "--dl-text-lg", label: "lg · 16px", css: "var(--dl-text-lg)", weight: 400 },
  { token: "--dl-text-md", label: "md · 14px", css: "var(--dl-text-md)", weight: 400 },
  { token: "--dl-text-sm", label: "sm · 13px", css: "var(--dl-text-sm)", weight: 400 },
  { token: "--dl-text-xs", label: "xs · 12px", css: "var(--dl-text-xs)", weight: 500 },
] as const;

const RADII = [
  { token: "--dl-radius-xs", label: "6" },
  { token: "--dl-radius-sm", label: "10" },
  { token: "--dl-radius-md", label: "14" },
  { token: "--dl-radius-lg", label: "20" },
  { token: "--dl-radius-xl", label: "28" },
] as const;

const DURATIONS = [
  { token: "--dl-dur-1", label: "90ms", use: "按压反馈" },
  { token: "--dl-dur-2", label: "160ms", use: "悬停 / 颜色" },
  { token: "--dl-dur-3", label: "240ms", use: "状态切换" },
  { token: "--dl-dur-4", label: "360ms", use: "浮层进入" },
  { token: "--dl-dur-5", label: "560ms", use: "整页编排" },
] as const;

export function FoundationsPage() {
  return (
    <>
      <PageHeader
        kicker="Foundations"
        title="设计变量"
        summary="颜色、材质、圆角、字体与动效都收敛成 CSS 变量。组件只引用变量，换肤与调参不需要改组件代码。"
      />

      <Section
        title="表面与文本"
        hint="括号内是相对页面背景的实测对比度（WCAG 2.1 算法，随主题实时重算）。"
      >
        <Swatches tokens={SURFACE_TOKENS} />
        <div style={{ height: 18 }} />
        <Swatches tokens={INK_TOKENS} showContrast />
      </Section>

      <Section title="强调色与语义色" hint="强调色可被 DeyloomProvider 的 accent 属性整体替换。">
        <Swatches tokens={SEMANTIC_TOKENS} />
      </Section>

      <Section
        title="材质与层级"
        hint="三层低透明阴影 + 1px 内高光构成深度；深色模式改用更紧的黑色阴影与更弱的内高光。"
      >
        <div className="elevation-row">
          <div className="elevation-card" data-level="1">
            shadow-1 · 卡片
          </div>
          <div className="elevation-card" data-level="2">
            shadow-2 · 浮层
          </div>
          <div className="elevation-card" data-level="3">
            shadow-3 · 对话框
          </div>
        </div>
      </Section>

      <Section title="圆角">
        <div className="radius-row">
          {RADII.map((radius) => (
            <div
              key={radius.token}
              className="radius-sample"
              style={{ borderRadius: `var(${radius.token})` }}
            >
              {radius.label}
            </div>
          ))}
        </div>
      </Section>

      <Section title="字阶" hint="控件统一使用 sm / md；正文 md；标题用 2xl / 3xl 并收紧字距。">
        <div className="type-ramp">
          {TYPE_RAMP.map((row) => (
            <div className="type-ramp__row" key={row.token}>
              <span
                className="type-ramp__sample"
                style={{ fontSize: row.css, fontWeight: row.weight, letterSpacing: "-0.02em" }}
              >
                动效应当解释变化，而不是装饰变化。
              </span>
              <span className="type-ramp__meta">{row.label}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="时长" hint="CSS 过渡使用这五档；弹簧动画的时长由物理参数决定，不在这里。">
        <div className="meter" style={{ gap: 14 }}>
          {DURATIONS.map((duration) => (
            <div className="meter__row" key={duration.token}>
              <span style={{ width: 96, fontSize: 12, color: "var(--dl-color-ink-subtle)" }}>
                {duration.label}
              </span>
              <span
                style={{
                  flex: 1,
                  height: 6,
                  borderRadius: 999,
                  background: "var(--dl-color-surface-sunken)",
                  position: "relative",
                  overflow: "hidden",
                }}
              >
                <span
                  style={{
                    position: "absolute",
                    inset: 0,
                    transformOrigin: "left center",
                    transform: `scaleX(${parseInt(duration.label, 10) / 560})`,
                    background: "var(--dl-color-accent)",
                    borderRadius: 999,
                  }}
                />
              </span>
              <span className="meter__value" style={{ width: 128, textAlign: "end", fontSize: 12 }}>
                {duration.use}
              </span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="缓动曲线" hint="点击播放看同一个位移在不同曲线下的手感差异。">
        <div className="curve-grid">
          {EASINGS.map((easing) => (
            <CurveCard key={easing.name} spec={easing} />
          ))}
        </div>
      </Section>

      <Section
        title="品牌资产"
        hint="主标有浅底与深底两个明度版本；单色版跟随当前文字颜色，用于必须单色的场景。"
      >
        <div className="brand-grid">
          <figure className="brand-tile">
            <div className="brand-tile__stage" data-tone="light">
              <img src="/deyloom-logo-ink.svg" alt="" style={{ width: 220 }} />
            </div>
            <figcaption className="brand-tile__meta">
              <span className="brand-tile__label">主标 · 浅色背景</span>
              <span className="brand-tile__note">透明底，深色字标</span>
              <a className="brand-tile__link" href="/deyloom-logo-ink.svg" download>
                下载 SVG
              </a>
            </figcaption>
          </figure>

          <figure className="brand-tile">
            <div className="brand-tile__stage" data-tone="dark">
              <img src="/deyloom-logo.svg" alt="" style={{ width: 220 }} />
            </div>
            <figcaption className="brand-tile__meta">
              <span className="brand-tile__label">主标 · 深色背景</span>
              <span className="brand-tile__note">透明底，浅色字标</span>
              <a className="brand-tile__link" href="/deyloom-logo.svg" download>
                下载 SVG
              </a>
            </figcaption>
          </figure>

          <figure className="brand-tile">
            <div className="brand-tile__stage" data-tone="dark">
              <img src="/deyloom-logo-dark.svg" alt="" style={{ width: 220 }} />
            </div>
            <figcaption className="brand-tile__meta">
              <span className="brand-tile__label">深色锁版</span>
              <span className="brand-tile__note">自带深色底，用于封面与横幅</span>
              <a className="brand-tile__link" href="/deyloom-logo-dark.svg" download>
                下载 SVG
              </a>
            </figcaption>
          </figure>

          <figure className="brand-tile">
            <div className="brand-tile__stage" data-tone="light">
              <span className="brand-mono" aria-hidden="true" />
            </div>
            <figcaption className="brand-tile__meta">
              <span className="brand-tile__label">单色版</span>
              <span className="brand-tile__note">跟随文字颜色，用于单色印刷</span>
              <a className="brand-tile__link" href="/deyloom-logo-monochrome.svg" download>
                下载 SVG
              </a>
            </figcaption>
          </figure>

          <figure className="brand-tile">
            <div className="brand-tile__stage" data-tone="light">
              <img src="/deyloom-icon.svg" alt="" style={{ width: 64 }} />
            </div>
            <figcaption className="brand-tile__meta">
              <span className="brand-tile__label">图标</span>
              <span className="brand-tile__note">最小 20px，用于 favicon 与头像位</span>
              <a className="brand-tile__link" href="/deyloom-icon.svg" download>
                下载 SVG
              </a>
            </figcaption>
          </figure>
        </div>

        <ul className="brand-rules">
          <li>留白：主标四周不小于图标高度的 1/4，不要贴边裁切。</li>
          <li>最小尺寸：图标 20px；横版主标宽度不小于 88px。</li>
          <li>按底色选版本：浅底用深色字标，深底用浅色字标；不要压在照片或彩色渐变上。</li>
          <li>不要改渐变、拉伸或旋转；必须单色时换用单色版，而不是给主标改色。</li>
        </ul>
      </Section>
    </>
  );
}
