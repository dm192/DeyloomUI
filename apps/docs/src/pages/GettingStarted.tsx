import { PageHeader, Section } from "../ui/blocks";

const INSTALL = `npm i @deyloom/react`;

const SETUP = `import { DeyloomProvider, Button } from "@deyloom/react";
import "@deyloom/react/styles.css";

export default function App() {
  return (
    <DeyloomProvider>
      <Button>保存</Button>
    </DeyloomProvider>
  );
}`;

const THEME = `<DeyloomProvider theme="dark" storageKey="app-theme" accent="oklch(0.62 0.12 250)">
  <App />
</DeyloomProvider>`;

const COMMANDS = `npm install        # 安装 workspace 依赖
npm run dev        # 文档站 http://127.0.0.1:5173
npm run build      # 构建库到 packages/react/dist
npm run verify     # 类型检查 + 单测 + 构建 + 动效守卫 + 体积预算 + 产物冒烟
npm run e2e        # Playwright（键盘、axe、响应式、减弱动效、帧采样）
npm run audit      # 视觉审计截图（先 build:docs + preview）`;

const STRUCTURE = `packages/react     @deyloom/react（可发布包：源码、样式、单测）
apps/docs          文档站（Vite 8 + React）
brand              品牌资产（不适用 MIT，见「许可」）
scripts            动效守卫 / 体积预算 / 产物冒烟 / 视觉审计
tests/e2e          Playwright 测试`;

export function GettingStartedPage() {
  return (
    <>
      <PageHeader
        kicker="Getting started"
        title="快速开始"
        summary="安装、包裹 Provider、引入一次样式，就可以开始使用。"
      />

      <Section title="安装">
        <pre className="codeblock dl-scrollbar">
          <code>{INSTALL}</code>
        </pre>
      </Section>

      <Section
        title="接入"
        hint="Provider 负责主题、LazyMotion(domAnimation)、MotionConfig 与 RTL 方向。"
      >
        <pre className="codeblock dl-scrollbar">
          <code>{SETUP}</code>
        </pre>
        <p className="inline-note">
          只需要设计变量时可以只引入 <code>@deyloom/react/tokens.css</code>。组件在 Provider
          之外仍可渲染，但动画不会运行，开发环境会给一次明确警告。
        </p>
      </Section>

      <Section title="主题与强调色" hint="颜色、圆角、字号、时长都是 --dl-* CSS 变量。">
        <pre className="codeblock dl-scrollbar">
          <code>{THEME}</code>
        </pre>
        <p className="inline-note">
          <code>[data-dl-theme="light" | "dark"]</code> 可挂在任意祖先做局部换肤；不写时跟随系统。
        </p>
      </Section>

      <Section title="本地开发" hint="仓库使用 npm workspaces，Node ≥ 22.12。">
        <pre className="codeblock dl-scrollbar">
          <code>{COMMANDS}</code>
        </pre>
      </Section>

      <Section title="仓库结构">
        <pre className="codeblock dl-scrollbar">
          <code>{STRUCTURE}</code>
        </pre>
      </Section>

      <Section title="浏览器与版本">
        <ul className="notes">
          <li>React <code>^19</code>：使用 ref-as-prop，不提供 React 18 兼容层。</li>
          <li>Chrome / Edge ≥ 120、Safari ≥ 17.4、Firefox ≥ 121（<code>@layer</code>、<code>oklch</code>、<code>color-mix</code>）。</li>
          <li>仅客户端组件：入口带 <code>"use client"</code>，可在 Next.js App Router 中直接使用。</li>
          <li>运行时只加载 <code>LazyMotion(domAnimation)</code>；需要拖拽/布局动画时向 Provider 传 <code>features={"{domMax}"}</code>。</li>
        </ul>
      </Section>

      <Section title="已知限制">
        <ul className="notes">
          <li>Drawer 无手势拖拽；Toast 堆叠重排与 Tabs 高度过渡用 WAAPI / FLIP 实现。</li>
          <li>Tabs 切换只挂载当前面板，用容器高度过渡替代退场动画。</li>
          <li>Select 隐藏视口原生滚动条，改用上下滚动按钮 + 滚轮/键盘。</li>
          <li>原生滚动条样式依赖 <code>scrollbar-color</code> / <code>::-webkit-scrollbar</code>。</li>
          <li>NumberFlow 只支持整数与常见 <code>Intl.NumberFormat</code> 选项；Table、DatePicker、Pagination 不在本版本范围。</li>
        </ul>
      </Section>
    </>
  );
}
