import type { DemoEntry } from "./types";
import { foundationDemos } from "./groups/foundation";
import { formDemos } from "./groups/form";
import { navigationDemos } from "./groups/navigation";
import { overlayDemos } from "./groups/overlay";
import { showcaseDemos } from "./groups/showcase";

export const demoGroups: { id: DemoEntry["group"]; label: string; demos: DemoEntry[] }[] = [
  { id: "foundation", label: "基础", demos: foundationDemos },
  { id: "form", label: "表单", demos: formDemos },
  { id: "navigation", label: "导航与容器", demos: navigationDemos },
  { id: "overlay", label: "覆盖层与反馈", demos: overlayDemos },
  { id: "showcase", label: "动效组件", demos: showcaseDemos },
];

export const allDemos: DemoEntry[] = demoGroups.flatMap((group) => group.demos);

export const demoBySlug: ReadonlyMap<string, DemoEntry> = new Map(
  allDemos.map((demo) => [demo.slug, demo]),
);
