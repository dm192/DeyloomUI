import * as React from "react";
import { Button, NumberFlow, Slider } from "@deyloom/react";
import type { DemoEntry } from "./types";

const bigNumber: React.CSSProperties = {
  fontSize: "var(--dl-text-3xl)",
  fontWeight: "var(--dl-weight-semibold)",
  letterSpacing: "-0.02em",
  color: "var(--dl-color-ink)",
};

function LiveValueDemo() {
  const [value, setValue] = React.useState(12800);

  return (
    <div style={{ display: "grid", gap: "var(--dl-space-4)", inlineSize: "100%" }}>
      <div style={bigNumber}>
        <NumberFlow
          value={value}
          locale="zh-CN"
          format={{ style: "currency", currency: "CNY", maximumFractionDigits: 0 }}
        />
      </div>
      <Slider
        aria-label="调整金额"
        min={0}
        max={50000}
        step={100}
        value={[value]}
        onValueChange={(next) => setValue(next[0] ?? value)}
      />
    </div>
  );
}

const FORMATS = [
  { id: "currency", label: "货币", options: { style: "currency", currency: "CNY" } },
  { id: "decimal", label: "两位小数", options: { minimumFractionDigits: 2, maximumFractionDigits: 2 } },
  { id: "compact", label: "紧凑", options: { notation: "compact", maximumFractionDigits: 1 } },
] as const satisfies ReadonlyArray<{
  id: string;
  label: string;
  options: Intl.NumberFormatOptions;
}>;

function FormatDemo() {
  const [selected, setSelected] = React.useState<(typeof FORMATS)[number]["id"]>("currency");
  const current = FORMATS.find((format) => format.id === selected) ?? FORMATS[0];

  return (
    <div style={{ display: "grid", gap: "var(--dl-space-4)", inlineSize: "100%" }}>
      <div style={bigNumber}>
        <NumberFlow value={1284567.891} locale="zh-CN" format={current.options} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--dl-space-3)" }}>
        {FORMATS.map((format) => (
          <Button
            key={format.id}
            size="sm"
            variant={format.id === selected ? "solid" : "outline"}
            onClick={() => setSelected(format.id)}
          >
            {format.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

const LOCALES = [
  { id: "zh-CN", label: "zh-CN" },
  { id: "en-US", label: "en-US" },
  { id: "de-DE", label: "de-DE" },
] as const;

function LocaleDemo() {
  const [locale, setLocale] = React.useState<(typeof LOCALES)[number]["id"]>("zh-CN");

  return (
    <div style={{ display: "grid", gap: "var(--dl-space-4)", inlineSize: "100%" }}>
      <div style={bigNumber}>
        <NumberFlow value={1234567.89} locale={locale} format={{ minimumFractionDigits: 2 }} suffix=" 元" />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "var(--dl-space-3)" }}>
        {LOCALES.map((item) => (
          <Button
            key={item.id}
            size="sm"
            variant={item.id === locale ? "solid" : "outline"}
            onClick={() => setLocale(item.id)}
          >
            {item.label}
          </Button>
        ))}
      </div>
    </div>
  );
}

export const numberFlowDemo: DemoEntry = {
  slug: "number-flow",
  title: "NumberFlow",
  group: "showcase",
  summary: "逐位滚动数字：每位数字一个定宽槽，只让发生变化的数位做 translateY 过渡。",
  examples: [
    {
      title: "实时数值",
      description: "拖动滑块时只有变化的数位在滚动，等宽数字保证整体宽度不抖动。",
      layout: "stretch",
      render: () => <LiveValueDemo />,
    },
    {
      title: "Intl 格式化",
      description: "format 直接透传给 Intl.NumberFormat；货币、小数位、紧凑记法共用一套滚动逻辑。",
      layout: "stretch",
      render: () => <FormatDemo />,
    },
    {
      title: "区域格式",
      description: "同一数值在 zh-CN / en-US / de-DE 下的分隔符与小数位由 Intl 决定。",
      layout: "stretch",
      render: () => <LocaleDemo />,
    },
  ],
  props: [
    { name: "value", type: "number", description: "要显示的数值。" },
    { name: "format", type: "Intl.NumberFormatOptions", description: "直接传给 Intl.NumberFormat。" },
    { name: "locale", type: "string", description: "BCP-47 区域；省略时使用运行环境默认值。" },
    { name: "prefix / suffix", type: "string", description: "前后缀，和数字一起构成完整的 aria-label。" },
    { name: "className", type: "string", description: "外部样式类名。" },
  ],
  notes: [
    "视觉数字整体 aria-hidden，读屏只读一次完整的 aria-label，不会逐位念数字。",
    "reduced-motion 下不渲染数字槽，直接切换为静态文本。",
  ],
};
