import * as React from "react";
import {
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@deyloom/react";
import { defineDemos } from "./types";

function ClickableCard() {
  const [clicks, setClicks] = React.useState(0);
  return (
    <Card interactive onClick={() => setClicks((value) => value + 1)}>
      <CardHeader>
        <CardTitle>可点击卡片</CardTitle>
        <CardDescription>hover 抬升 1px，按下有弹簧反馈。</CardDescription>
      </CardHeader>
      <CardContent>已点击 {clicks} 次。</CardContent>
    </Card>
  );
}

export const cardDemo = defineDemos([
  {
    slug: "card",
    title: "Card",
    group: "navigation",
    summary: "材质层次的最小单元。三级高度、一个可选的交互态。",
    examples: [
      {
        title: "基础卡片",
        layout: "grid",
        render: () => (
          <Card>
            <CardHeader>
              <CardTitle>每周构建健康度</CardTitle>
              <CardDescription>最近一次同步在 2 分钟前。</CardDescription>
            </CardHeader>
            <CardContent>全部 12 个任务通过，覆盖率 92%。</CardContent>
            <CardFooter>
              <Button size="sm" variant="soft">
                查看报告
              </Button>
              <Button size="sm" variant="ghost">
                忽略
              </Button>
            </CardFooter>
          </Card>
        ),
      },
      {
        title: "交互与高度",
        description: "interactive 用来表达整张卡片可点击；elevation 表达信息层级。",
        layout: "grid",
        render: () => (
          <>
            <ClickableCard />
            <Card elevation={2}>
              <CardHeader>
                <CardTitle>二级高度</CardTitle>
                <CardDescription>用于浮在内容之上的面板。</CardDescription>
              </CardHeader>
              <CardContent>
                <Badge tone="accent" variant="soft">
                  推荐
                </Badge>
              </CardContent>
            </Card>
            <Card elevation={3}>
              <CardHeader>
                <CardTitle>三级高度</CardTitle>
                <CardDescription>用于临时浮层或重点卡片。</CardDescription>
              </CardHeader>
              <CardContent>阴影随主题自动切换。</CardContent>
            </Card>
          </>
        ),
      },
    ],
    props: [
      { name: "interactive", type: "boolean", default: "false", description: "hover 抬升 + 阴影升级；有 onClick 时按下缩放。" },
      { name: "elevation", type: "1 | 2 | 3", default: "1", description: "静止阴影层级。" },
      { name: "CardHeader / CardTitle / CardDescription / CardContent / CardFooter", type: "组件", description: "稳定的内边距与排版组合。" },
    ],
    notes: ["卡片只动画 transform / box-shadow / border-color，尺寸从不参与动画。"],
  },
]);
