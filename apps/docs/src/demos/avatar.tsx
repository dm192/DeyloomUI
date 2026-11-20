import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "@deyloom/react";
import { defineDemos } from "./types";

const PORTRAIT_A =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%23c8704d'/%3E%3Ccircle cx='32' cy='25' r='11' fill='%23fdf6ee'/%3E%3Cpath d='M10 64c3-13 11-19 22-19s19 6 22 19' fill='%23fdf6ee'/%3E%3C/svg%3E";
const PORTRAIT_B =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%236f8f7a'/%3E%3Ccircle cx='32' cy='25' r='11' fill='%23fdf6ee'/%3E%3Cpath d='M10 64c3-13 11-19 22-19s19 6 22 19' fill='%23fdf6ee'/%3E%3C/svg%3E";
const PORTRAIT_C =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 64 64'%3E%3Crect width='64' height='64' fill='%237d7ca8'/%3E%3Ccircle cx='32' cy='25' r='11' fill='%23fdf6ee'/%3E%3Cpath d='M10 64c3-13 11-19 22-19s19 6 22 19' fill='%23fdf6ee'/%3E%3C/svg%3E";

export const avatarDemo = defineDemos([
  {
    slug: "avatar",
    title: "Avatar",
    group: "navigation",
    summary: "身份标识。图片加载完成前始终显示可读的回退首字母。",
    examples: [
      {
        title: "尺寸与回退",
        layout: "row",
        render: () => (
          <>
            <Avatar size="xs">
              <AvatarFallback>甲</AvatarFallback>
            </Avatar>
            <Avatar size="sm">
              <AvatarFallback>乙</AvatarFallback>
            </Avatar>
            <Avatar size="md">
              <AvatarFallback>L</AvatarFallback>
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback>林</AvatarFallback>
            </Avatar>
          </>
        ),
      },
      {
        title: "图片与首字母",
        description: "图片就绪后淡入覆盖回退；回退内容可从 name 自动推导。",
        layout: "row",
        render: () => (
          <>
            <Avatar size="lg">
              <AvatarImage src={PORTRAIT_A} alt="Ada Lovelace" />
              <AvatarFallback name="Ada Lovelace" />
            </Avatar>
            <Avatar size="lg">
              <AvatarImage src={PORTRAIT_B} alt="Grace Hopper" />
              <AvatarFallback name="Grace Hopper" />
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback name="Alan Turing" />
            </Avatar>
            <Avatar size="lg">
              <AvatarFallback name="林未" />
            </Avatar>
          </>
        ),
      },
      {
        title: "头像组",
        description: "max 之后的成员折叠为 +N；hover 时当前头像抬升。",
        layout: "row",
        render: () => (
          <>
            <AvatarGroup max={4} size="md">
              <Avatar>
                <AvatarImage src={PORTRAIT_A} alt="Ada Lovelace" />
                <AvatarFallback name="Ada Lovelace" />
              </Avatar>
              <Avatar>
                <AvatarImage src={PORTRAIT_B} alt="Grace Hopper" />
                <AvatarFallback name="Grace Hopper" />
              </Avatar>
              <Avatar>
                <AvatarImage src={PORTRAIT_C} alt="Alan Turing" />
                <AvatarFallback name="Alan Turing" />
              </Avatar>
              <Avatar>
                <AvatarFallback name="Katherine Johnson" />
              </Avatar>
              <Avatar>
                <AvatarFallback name="Margaret Hamilton" />
              </Avatar>
              <Avatar>
                <AvatarFallback name="Barbara Liskov" />
              </Avatar>
            </AvatarGroup>
          </>
        ),
      },
    ],
    props: [
      { name: "size", type: '"xs" | "sm" | "md" | "lg"', default: '"md"', description: "圆形尺寸，对应控件高度变量。" },
      { name: "AvatarImage", type: "组件", description: "Radix 图片层；加载完成前不渲染，成功后淡入。" },
      { name: "AvatarFallback", type: "组件", description: "name 可自动推导首字母；delayMs 可延迟显示。" },
      { name: "AvatarGroup max", type: "number", description: "最多展示多少个，其余折叠为 +N。" },
    ],
    notes: ["回退首字母对 CJK 名字取单字、拉丁名字取前两个字母首字母。"],
  },
]);
