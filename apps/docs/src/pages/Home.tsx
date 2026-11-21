import * as React from "react";
import {
  Button,
  NumberFlow,
  SegmentedControl,
  Slider,
  Switch,
  toast,
} from "@deyloom/react";
import { PageHeader, Section } from "../ui/blocks";

const MOTION_CONTRACT = [
  {
    title: "一套弹簧",
    body: "press / snappy / soft / gentle 四个常量覆盖所有交互，组件不自己发明时长。",
  },
  {
    title: "只动合成属性",
    body: "transform 与 opacity 之外基本不动；列表与网格零布局动画。",
  },
  {
    title: "可降级",
    body: "prefers-reduced-motion 下时长折叠到 0.01ms，循环动画换成静态指示。",
  },
];

export function HomePage() {
  const [segment, setSegment] = React.useState("overview");
  const [syncEnabled, setSyncEnabled] = React.useState(true);
  const [level, setLevel] = React.useState(42);
  const [count, setCount] = React.useState(1284);

  return (
    <>
      <section className="hero">
        <p className="hero__kicker">One motion language. Every component.</p>
        <h1 className="hero__title">
          一套动效语言，<em>贯穿每个控件</em>。
        </h1>
        <p className="hero__lede">
          Deyloom 是 React 19 组件库：按钮、开关、页签与浮层共用同一条弹簧曲线、同一套材质层次和同一个聚焦光圈。
        </p>
        <div className="hero__actions">
          <Button asChild size="lg">
            <a href="#/components">浏览组件</a>
          </Button>
          <Button asChild size="lg" variant="outline">
            <a href="#/foundations">查看设计变量</a>
          </Button>
        </div>
      </section>

      <section className="study" aria-label="组件组合示例">
        <div className="study__row">
          <span className="study__meta-label">分段</span>
          <SegmentedControl
            items={[
              { value: "overview", label: "概览" },
              { value: "activity", label: "活动" },
              { value: "settings", label: "设置" },
            ]}
            value={segment}
            onValueChange={setSegment}
          />
          <label className="switch-label">
            <Switch checked={syncEnabled} onCheckedChange={setSyncEnabled} />
            同步
          </label>
        </div>

        <div className="study__row">
          <span className="study__meta-label">强度</span>
          <div className="study__fill">
            <Slider
              aria-label="强度"
              value={[level]}
              onValueChange={(next) => setLevel(next[0] ?? 0)}
            />
          </div>
          <span className="study__value">{level}</span>
        </div>

        <div className="study__row">
          <span className="study__meta-label">数字滚动</span>
          <span className="study__counter">
            <NumberFlow value={count} />
          </span>
          <Button variant="outline" onClick={() => setCount((value) => value + Math.ceil(Math.random() * 90))}>
            增加
          </Button>
          <Button variant="ghost" onClick={() => setCount(0)}>
            归零
          </Button>
          <div className="study__spacer" />
          <Button
            variant="soft"
            onClick={() =>
              toast({
                title: "已保存",
                description: "这是真实的 Toast：4.5 秒后自动关闭，悬停会暂停计时。",
              })
            }
          >
            触发 Toast
          </Button>
        </div>
      </section>

      <Section title="两条命令开始" hint="库本身零配置：一个 Provider、一份 CSS。">
        <pre className="codeblock dl-scrollbar">
          <code>
            <span className="tok-key">npm</span> i @deyloom/react{"\n\n"}
            <span className="tok-key">import</span> {"{ DeyloomProvider, Button }"} from
            {" \"@deyloom/react\";\n"}
            <span className="tok-key">import</span> {"\"@deyloom/react/styles.css\";\n\n"}
            <span className="tok-key">export default function</span> App() {"{\n"}
            {"  return (\n"}
            {"    <DeyloomProvider>\n"}
            {"      <Button>保存</Button>\n"}
            {"    </DeyloomProvider>\n"}
            {"  );\n"}
            {"}"}
          </code>
        </pre>
      </Section>

      <Section title="动效契约">
        <div className="contract">
          {MOTION_CONTRACT.map((item) => (
            <div className="contract__item" key={item.title}>
              <h3 className="contract__title">{item.title}</h3>
              <p className="contract__body">{item.body}</p>
            </div>
          ))}
        </div>
      </Section>
    </>
  );
}

export function NotFoundPage({ path }: { path: string }) {
  return (
    <>
      <PageHeader title="页面不存在" summary="地址可能已经变化。" />
      <p className="inline-note">
        <code>{path}</code> 没有对应页面。<a href="#/">回到总览</a>
      </p>
    </>
  );
}
