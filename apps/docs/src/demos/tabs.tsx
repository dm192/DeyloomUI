import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@deyloom/react";
import { defineDemos } from "./types";

function ControlledTabs() {
  const [value, setValue] = React.useState("overview");
  return (
    <Tabs value={value} onValueChange={setValue}>
      <TabsList>
        <TabsTrigger value="overview">概览</TabsTrigger>
        <TabsTrigger value="activity">活动</TabsTrigger>
        <TabsTrigger value="settings" disabled>
          设置
        </TabsTrigger>
      </TabsList>
      <TabsContent value="overview">当前面板：概览。</TabsContent>
      <TabsContent value="activity">当前面板：活动。</TabsContent>
      <TabsContent value="settings">当前面板：设置。</TabsContent>
    </Tabs>
  );
}

export const tabsDemo = defineDemos([
  {
    slug: "tabs",
    title: "Tabs",
    group: "navigation",
    summary: "在同一区域切换视图。指示块用测量宽度滑动，面板切换只做短促淡入淡出。",
    examples: [
      {
        title: "基础用法",
        layout: "stretch",
        render: () => (
          <Tabs defaultValue="overview">
            <TabsList>
              <TabsTrigger value="overview">概览</TabsTrigger>
              <TabsTrigger value="activity">活动</TabsTrigger>
              <TabsTrigger value="settings">设置</TabsTrigger>
            </TabsList>
            <TabsContent value="overview">
              本周新增 3 个组件，动效与无障碍检查全部通过。方向键可以直接在标签间移动。
            </TabsContent>
            <TabsContent value="activity">过去 7 天共合入 18 个提交，2 个来自社区。</TabsContent>
            <TabsContent value="settings">通知、主题与动效偏好在这里统一配置。</TabsContent>
          </Tabs>
        ),
      },
      {
        title: "受控与禁用",
        description: "受控时由父级决定当前值；禁用的标签无法获得焦点。",
        layout: "stretch",
        render: () => <ControlledTabs />,
      },
      {
        title: "垂直方向",
        description: "orientation=\"vertical\" 时方向键改为上下移动。",
        layout: "stretch",
        render: () => (
          <Tabs defaultValue="profile" orientation="vertical">
            <TabsList>
              <TabsTrigger value="profile">资料</TabsTrigger>
              <TabsTrigger value="security">安全</TabsTrigger>
              <TabsTrigger value="billing">账单</TabsTrigger>
            </TabsList>
            <TabsContent value="profile">头像、昵称与联系方式。</TabsContent>
            <TabsContent value="security">两步验证与登录设备管理。</TabsContent>
            <TabsContent value="billing">付款方式与历史账单。</TabsContent>
          </Tabs>
        ),
      },
    ],
    props: [
      {
        name: "value / defaultValue",
        type: "string",
        description: "当前标签；受控时传 value，非受控时传 defaultValue。",
      },
      {
        name: "onValueChange",
        type: "(value: string) => void",
        description: "标签切换时触发。",
      },
      {
        name: "orientation",
        type: '"horizontal" | "vertical"',
        default: '"horizontal"',
        description: "决定方向键的移动轴。",
      },
      {
        name: "TabsList / TabsTrigger / TabsContent",
        type: "组件",
        description: "组合使用；TabsContent 必须以 value 对应某个 trigger。",
      },
    ],
    notes: [
      "指示块通过 ResizeObserver 测量，切换标签时用 snappy 弹簧滑动；测量不可用时自动退化为纯文字状态。",
      "切换面板使用 AnimatePresence mode=\"wait\"，旧面板先做 140ms 淡出，避免内容叠在一起跳动。",
    ],
  },
]);
