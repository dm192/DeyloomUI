<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="brand/deyloom-logo.svg" />
    <img alt="Deyloom" src="brand/deyloom-logo-ink.svg" height="52" />
  </picture>
</p>

<p align="center">One motion language. Every component.</p>

React 19 组件库，围绕**一套统一的动效语言**构建：同一个按压弹簧、同一套材质层次、同一条聚焦光圈、同一组进出场编排。性能约束不是口头承诺，而是由脚本强制执行的构建门禁。

- 柔和触感视觉：暖石色表面 + 单一柿橙强调色 + 三层低透明阴影与 1px 内高光
- 统一动效：`press / snappy / soft / gentle` 四条弹簧 + 两个 tween，组件不自造时长
- 性能契约：只动合成属性、列表与网格零布局动画、循环动画可降级、体积预算可回归
- 无障碍：焦点管理、键盘与 ARIA 交给 Radix 基元；`prefers-reduced-motion` 全量支持

## 快速开始

```bash
npm i @deyloom/react
```

```tsx
import { DeyloomProvider, Button } from "@deyloom/react";
import "@deyloom/react/styles.css";

export default function App() {
  return (
    <DeyloomProvider>
      <Button>保存</Button>
    </DeyloomProvider>
  );
}
```

`DeyloomProvider` 负责主题、`LazyMotion`（`domAnimation`，不是全量 motion）、`MotionConfig` 与 RTL 方向。组件在 Provider 之外仍能渲染（静态），但动画不会运行，开发环境下会给出一次明确警告。

只需要设计变量（例如自己写组件）时可以只引入 `@deyloom/react/tokens.css`。

## 动效系统

```ts
import { springs, tweens, scales, distances, stagger } from "@deyloom/react";

springs.press;  // { stiffness: 700, damping: 40, mass: 0.5 } 按压反馈
springs.snappy; // 小元素换位：开关滑块、页签指示、Toast 堆叠
springs.soft;   // 默认：卡片与浮层进场（也是 MotionConfig 的默认 transition）
springs.gentle; // 大面板与整页编排
tweens.exit;    // 140ms，退场一律不回弹
```

约定：

| 场景 | 动效 | 时长 |
| --- | --- | --- |
| 悬停 / 颜色 / 边框 | CSS transition | 160ms `--dl-ease-out` |
| 按压 | `whileTap={{ scale: 0.97 }}` | `springs.press` |
| 小元素换位 | 弹簧位移 | `springs.snappy` |
| 浮层进入 | `opacity + scale(.96) + y(8)` | `springs.snappy` |
| 浮层退出 | 只回 `scale(.98) + y(4)` | 140ms tween |
| 列表交错 | 每项 35ms，最多 8 项 | `stagger.base` |
| Tabs 面板换高 | 容器高度过渡（WAAPI，单元素） | 220ms `--dl-ease-out` |
| Toast 堆栈重排 | FLIP，只动 transform | 200ms `--dl-ease-out` |

`prefers-reduced-motion: reduce` 时 CSS 时长折叠到 `0.01ms`（保留非零值，`transitionend` 仍会触发），循环动画替换为静态状态，Motion 侧关闭位移类动画、保留透明度；高度过渡与堆栈 FLIP 直接跳过。

## 主题

```tsx
<DeyloomProvider theme="dark" storageKey="app-theme" accent="oklch(0.62 0.12 250)">
```

- `[data-dl-theme="light" | "dark"]` 可挂在任意祖先做局部换肤；不写时跟随系统。
- 所有颜色、间距、圆角、字号、时长都是 `--dl-*` 变量，见 `packages/react/src/styles/tokens.css`。
- 滚动条同样走 token：`--dl-scrollbar-size` / `-thumb` / `-thumb-hover` / `-radius`。原生滚动容器加 `.dl-scrollbar` 类即可；需要自绘滚动条时用 `ScrollArea`。
- Portal 内容（对话框、菜单、Toast）渲染到 `document.body`，因此 token 定义在 `:root`；局部换肤不会自动作用于 Portal，这是有意的取舍。

## 组件

| 分组 | 组件 |
| --- | --- |
| 基础 | `Button` `IconButton` |
| 表单 | `Field` `Input` `Textarea` `Checkbox` `RadioGroup` `Switch` `Slider` `Select` `SegmentedControl` `Toggle` `ToggleGroup` |
| 导航与容器 | `Tabs` `Accordion` `Card` `Badge` `Avatar` `Tooltip` `Popover` `DropdownMenu` `ScrollArea` `Separator` |
| 覆盖层与反馈 | `Dialog` `AlertDialog` `Drawer` `HoverCard` `Toaster` / `toast()` `Progress` `Skeleton` |
| 动效组件 | `StaggerList` `NumberFlow` `SpotlightCard` `BorderBeam` `Marquee` |
| 动效变量 | `springs` `tweens` `scales` `distances` `stagger` `easings` + 共享 variants |

完整 API 与实时示例见文档站（`npm run dev`）。

## 性能契约

`npm run verify` 会强制执行以下检查，任何一条不满足就失败：

1. **动效守卫** `scripts/check-motion-css.mjs`
   - 禁止过渡 `width / height / margin / padding / top / left` 等布局属性；例外必须在源码里写 `/* dl-motion-allow: 原因 */`
   - 过渡 `box-shadow` 必须写明理由（默认只允许小控件，Card 不再动画阴影）
   - `@keyframes` 同样禁止布局属性
   - `animation: … infinite` 必须挂在 `.dl-anim-loop` 上，保证 reduced-motion 能关掉
   - `will-change` 必须逐条说明理由
2. **体积预算** `scripts/check-size.mjs`
   - ESM JS ≤ 24KB gzip（不含 react / motion / radix），CSS ≤ 11KB gzip；超预算失败
   - 同时生成 `apps/docs/src/generated/sizes.json`，文档站的性能页展示的是实测数字
3. **产物冒烟** `scripts/smoke-package.mjs`
   - exports map 指向的文件必须存在、入口能被 Node 导入、`"use client"` 指令必须存活

运行时动画库只加载 `LazyMotion(features=domAnimation)`，不使用 layout animation（因此 Drawer 不支持拖拽；需要拖拽/布局动画时向 `DeyloomProvider` 传 `features={domMax}`）。

## 浏览器与版本

- React `^19`（使用 ref-as-prop，不提供 React 18 兼容层）
- Chrome / Edge ≥ 120、Safari ≥ 17.4、Firefox ≥ 121（`@layer`、`oklch`、`color-mix`）
- 仅客户端组件：入口带 `"use client"`，可在 Next.js App Router 中直接使用

## 仓库

```
packages/react      @deyloom/react —— 可发布包（源码、样式、单测）
apps/docs           文档站（Vite 8 + React，源码别名直连，无需先构建）
brand               品牌资源（主标浅底/深底、深色锁版、单色版、图标）
scripts             动效守卫 / 体积预算 / 产物冒烟
tests/e2e           Playwright：键盘、焦点、axe、响应式、减弱动效、帧采样、截图
```

常用命令（仓库根目录）：

```bash
npm install          # 安装 workspace 依赖
npm run dev          # 文档站 http://127.0.0.1:5173
npm run build        # 构建库到 packages/react/dist
npm run verify       # typecheck + 单测 + 构建 + 动效守卫 + 体积预算 + 产物冒烟 + 文档构建
npm run e2e          # 构建后用 Playwright 跑全部 e2e（需本机 Chrome）
npm run audit        # 视觉审计（先 build:docs + preview）：全部页面 × 明暗 × 桌面/移动截图 + 溢出/报错检查
```

## 品牌

品牌资源位于 `brand/`，文档站的“设计变量 → 品牌资产”展示全部版本与用法。

- `deyloom-logo-ink.svg` 主标 · 浅色背景｜`deyloom-logo.svg` 主标 · 深色背景
- `deyloom-logo-dark.svg` 深色锁版（自带底色）｜`deyloom-logo-monochrome.svg` 单色版（`currentColor`）
- `deyloom-icon.svg` 图标（favicon、头像位）
- 横版主标宽度不小于 88px，图标不小于 20px；不要改渐变、拉伸或旋转，必须单色时使用单色版。

## 已知限制

- Drawer 无手势拖拽（需要 `domMax`，核心包保持 `domAnimation`）；Toast 堆叠重排与 Tabs 高度过渡用 WAAPI/FLIP 实现，同样不需要 `domMax`。
- Tabs 切换只挂载当前面板，不再保留退场动画；换来的是容器高度平滑过渡，旧面板不会与新面板叠加撑高。
- Select 隐藏视口原生滚动条（Radix 行为），改用上下渐隐滚动按钮 + 滚轮/键盘滚动；如需可见滚动条请套 `ScrollArea`。
- 原生滚动条样式依赖 `scrollbar-color` / `::-webkit-scrollbar`，旧版 Firefox（<64）与 Safari（<18.2）会退回系统默认。
- `NumberFlow` 只支持整数与常见 `Intl.NumberFormat` 选项；小数位滚动按格式串处理。
- Breadcrumb、DatePicker、虚拟化表格不在本版本范围内。
- 文档站是内部验证界面，不随包发布。
