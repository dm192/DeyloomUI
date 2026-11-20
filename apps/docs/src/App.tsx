import * as React from "react";
import { IconButton, Toaster, useDeyloomTheme, useDeyloom } from "@deyloom/react";
import { demoGroups } from "./demos";
import { useRoute, type Route } from "./router";

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

function themeIcon(dark: boolean) {
  return dark ? (
    <svg viewBox="0 0 16 16" width={14} height={14} fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="3.25" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 1.5v1.6M8 12.9v1.6M1.5 8h1.6M12.9 8h1.6M3.4 3.4l1.1 1.1M11.5 11.5l1.1 1.1M12.6 3.4l-1.1 1.1M4.5 11.5l-1.1 1.1"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  ) : (
    <svg viewBox="0 0 16 16" width={14} height={14} fill="none" aria-hidden="true">
      <path
        d="M13.2 9.6A5.6 5.6 0 0 1 6.4 2.8a5.6 5.6 0 1 0 6.8 6.8Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function TopBar(props: { route: Route; navOpen: boolean; onToggleNav: () => void }) {
  const { resolvedTheme, setTheme } = useDeyloomTheme();
  const { reducedMotion, setReducedMotion } = useDeyloom();
  const isDark = resolvedTheme === "dark";
  const motionReduced = reducedMotion === "always";

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
        <button
          type="button"
          className="motion-toggle dl-focusable"
          aria-pressed={motionReduced}
          data-testid="motion-toggle"
          onClick={() => setReducedMotion(motionReduced ? "user" : "always")}
        >
          {motionReduced ? "动效已减弱" : "减弱动效"}
        </button>
        <IconButton
          label={isDark ? "切换到浅色主题" : "切换到深色主题"}
          variant="outline"
          size="sm"
          onClick={() => setTheme(isDark ? "light" : "dark")}
        >
          {themeIcon(isDark)}
        </IconButton>
        <IconButton
          className="nav-toggle"
          label={props.navOpen ? "关闭目录" : "打开目录"}
          variant="outline"
          size="sm"
          aria-expanded={props.navOpen}
          onClick={props.onToggleNav}
        >
          <svg viewBox="0 0 16 16" width={14} height={14} fill="none" aria-hidden="true">
            <path d="M2.5 4.5h11M2.5 8h11M2.5 11.5h11" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
          </svg>
        </IconButton>
      </div>
    </header>
  );
}

function Sidebar(props: { route: Route }) {
  const pages: { path: string; label: string; match: Route["name"][] }[] = [
    { path: "#/", label: "总览", match: ["home"] },
    { path: "#/foundations", label: "设计变量", match: ["foundations"] },
    { path: "#/motion", label: "动效实验室", match: ["motion"] },
    { path: "#/performance", label: "性能", match: ["performance"] },
  ];

  return (
    <aside className="sidebar" aria-label="文档目录">
      <nav>
        <div className="sidebar__group">
          <p className="sidebar__label">文档</p>
          {pages.map((page) => (
            <a
              key={page.path}
              className="sidebar__link"
              href={page.path}
              aria-current={page.match.includes(props.route.name) ? "page" : undefined}
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
                >
                  {demo.title}
                </a>
              ))}
            </div>
          ),
        )}
      </nav>
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
    <div className="shell" data-nav-open={navOpen ? "true" : "false"}>
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
      <Toaster position="bottom-right" closeButton />
    </div>
  );
}
