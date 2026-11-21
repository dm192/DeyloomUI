import * as React from "react";
import { Bars3Icon, MoonIcon, SunIcon, XMarkIcon } from "@heroicons/react/24/outline";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerTitle,
  IconButton,
  ScrollArea,
  Toaster,
  Toggle,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
  useDeyloom,
  useDeyloomTheme,
} from "@deyloom/react";
import { demoGroups } from "./demos";
import { useRoute, type Route } from "./router";
import { GitHubLink } from "./ui/GitHubLink";

// Route-level code splitting keeps the first paint small: the home page ships
// immediately, every other page is fetched on first visit.
const ComponentsPages = React.lazy(() =>
  import("./pages/Components").then((module) => ({
    default: module.ComponentsIndexPage,
  })),
);
const ComponentDetailPage = React.lazy(() =>
  import("./pages/Components").then((module) => ({ default: module.ComponentPage })),
);
const FoundationsPage = React.lazy(() =>
  import("./pages/Foundations").then((module) => ({ default: module.FoundationsPage })),
);
const HarnessPage = React.lazy(() =>
  import("./pages/Harness").then((module) => ({ default: module.HarnessPage })),
);
const HomePage = React.lazy(() =>
  import("./pages/Home").then((module) => ({ default: module.HomePage })),
);
const MotionPage = React.lazy(() =>
  import("./pages/Motion").then((module) => ({ default: module.MotionPage })),
);
const PerformancePage = React.lazy(() =>
  import("./pages/Performance").then((module) => ({ default: module.PerformancePage })),
);

function TopBar(props: { route: Route; navOpen: boolean; onToggleNav: () => void }) {
  const { resolvedTheme, setTheme } = useDeyloomTheme();
  const { reducedMotion, setReducedMotion } = useDeyloom();
  const isDark = resolvedTheme === "dark";
  const motionReduced = reducedMotion === "always";
  const themeLabel = isDark ? "切换到浅色主题" : "切换到深色主题";

  const link = (path: string, label: string) => {
    const active =
      (path === "#/foundations" && props.route.name === "foundations") ||
      (path === "#/motion" && props.route.name === "motion") ||
      (path === "#/performance" && props.route.name === "performance") ||
      (path === "#/components" &&
        (props.route.name === "components" || props.route.name === "component"));
    return (
      <a
        className="topnav__link"
        href={path}
        aria-current={active ? "page" : undefined}
      >
        {label}
      </a>
    );
  };

  return (
    <header className="topbar">
      <a className="brand" href="#/">
        <img className="brand__icon" src="/deyloom-icon.svg" alt="" width={26} height={26} />
        Deyloom
        <span className="brand__version">0.1.0</span>
      </a>
      <nav className="topnav" aria-label="主导航">
        {link("#/components", "组件")}
        {link("#/foundations", "设计变量")}
        {link("#/motion", "动效实验室")}
        {link("#/performance", "性能")}
      </nav>
      <div className="topbar__spacer" />
      <div className="topbar__actions">
        <Toggle
          pressed={motionReduced}
          onPressedChange={(pressed) => setReducedMotion(pressed ? "always" : "user")}
          variant="outline"
          size="sm"
          aria-label="减弱动效"
          className="motion-toggle"
        >
          {motionReduced ? "动效已减弱" : "减弱动效"}
        </Toggle>
        <Tooltip>
          <TooltipTrigger asChild>
            <IconButton
              label={themeLabel}
              variant="outline"
              size="sm"
              onClick={() => setTheme(isDark ? "light" : "dark")}
            >
              {isDark ? (
                <SunIcon className="docs-icon" />
              ) : (
                <MoonIcon className="docs-icon" />
              )}
            </IconButton>
          </TooltipTrigger>
          <TooltipContent>{themeLabel}</TooltipContent>
        </Tooltip>
        <GitHubLink />
        <Tooltip>
          <TooltipTrigger asChild>
            <IconButton
              className="nav-toggle"
              label={props.navOpen ? "关闭目录" : "打开目录"}
              variant="outline"
              size="sm"
              aria-expanded={props.navOpen}
              onClick={props.onToggleNav}
            >
              <Bars3Icon className="docs-icon" />
            </IconButton>
          </TooltipTrigger>
          <TooltipContent>{props.navOpen ? "关闭目录" : "打开目录"}</TooltipContent>
        </Tooltip>
      </div>
    </header>
  );
}

const DOC_PAGES: { path: string; label: string; match: Route["name"][] }[] = [
  { path: "#/", label: "总览", match: ["home"] },
  { path: "#/foundations", label: "设计变量", match: ["foundations"] },
  { path: "#/motion", label: "动效实验室", match: ["motion"] },
  { path: "#/performance", label: "性能", match: ["performance"] },
];

/** One navigation tree, shared by the sticky sidebar and the mobile drawer. */
function SidebarNav(props: { route: Route; onNavigate?: () => void }) {
  return (
    <nav className="sidebar__nav">
      <div className="sidebar__group">
        <p className="sidebar__label">文档</p>
        {DOC_PAGES.map((page) => (
          <a
            key={page.path}
            className="sidebar__link"
            href={page.path}
            aria-current={page.match.includes(props.route.name) ? "page" : undefined}
            onClick={props.onNavigate}
          >
            {page.label}
          </a>
        ))}
      </div>
      {demoGroups.map((group) =>
        group.demos.length === 0 ? null : (
          <div className="sidebar__group" key={group.id}>
            <p className="sidebar__label">{group.label}</p>
            {group.demos.map((demo) => (
              <a
                key={demo.slug}
                className="sidebar__link"
                href={`#/components/${demo.slug}`}
                aria-current={
                  props.route.name === "component" && props.route.slug === demo.slug
                    ? "page"
                    : undefined
                }
                onClick={props.onNavigate}
              >
                {demo.title}
              </a>
            ))}
          </div>
        ),
      )}
    </nav>
  );
}

function Sidebar(props: { route: Route }) {
  return (
    <aside className="sidebar" aria-label="文档目录">
      <ScrollArea className="sidebar__scroll" type="hover">
        <SidebarNav route={props.route} />
      </ScrollArea>
    </aside>
  );
}

function renderPage(route: Route) {
  switch (route.name) {
    case "home":
      return <HomePage />;
    case "foundations":
      return <FoundationsPage />;
    case "motion":
      return <MotionPage />;
    case "performance":
      return <PerformancePage />;
    case "harness":
      return <HarnessPage />;
    case "components":
      return <ComponentsPages />;
    case "component":
      return <ComponentDetailPage slug={route.slug} />;
    default:
      return (
        <div className="empty-state">
          没有这个页面：<code>{route.path}</code>
        </div>
      );
  }
}

export function App() {
  const route = useRoute();
  const [navOpen, setNavOpen] = React.useState(false);

  React.useEffect(() => {
    setNavOpen(false);
    window.scrollTo({ top: 0 });
  }, [route]);

  const content = renderPage(route);

  return (
    <div className="shell">
      <a className="skip-link" href="#main">
        跳到内容
      </a>
      <TopBar route={route} navOpen={navOpen} onToggleNav={() => setNavOpen((open) => !open)} />
      <div className="body">
        <Sidebar route={route} />
        <main className="main" id="main" tabIndex={-1}>
          <div className="page">
            <React.Suspense fallback={<div className="empty-state">加载中…</div>}>{content}</React.Suspense>
            <footer className="page-footer">
              Deyloom 0.1.0 · React 19 ·{" "}
              <a href="#/foundations">设计变量</a> · <a href="#/motion">动效实验室</a>
            </footer>
          </div>
        </main>
      </div>

      <Drawer open={navOpen} onOpenChange={setNavOpen}>
        <DrawerContent side="left" className="docs-nav-drawer">
          <DrawerTitle className="dl-visually-hidden">文档目录</DrawerTitle>
          <div className="docs-nav-drawer__header">
            <span className="docs-nav-drawer__title">目录</span>
            <DrawerClose asChild>
              <IconButton label="关闭目录" variant="ghost" size="sm">
                <XMarkIcon className="docs-icon" />
              </IconButton>
            </DrawerClose>
          </div>
          <ScrollArea className="docs-nav-drawer__scroll" type="hover">
            <SidebarNav route={route} onNavigate={() => setNavOpen(false)} />
          </ScrollArea>
        </DrawerContent>
      </Drawer>

      <Toaster position="bottom-right" closeButton />
    </div>
  );
}
