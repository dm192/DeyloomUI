import { Accordion, AccordionContent, AccordionItem, AccordionTrigger, Badge } from "@deyloom/react";
import { defineDemos } from "./types";

export const accordionDemo = defineDemos([
  {
    slug: "accordion",
    title: "Accordion",
    group: "navigation",
    summary: "纵向折叠列表。单开或多开由 type 决定，展开高度取自 Radix 测量值。",
    examples: [
      {
        title: "基础用法",
        description: "single + collapsible：同一时间只展开一项，也可以全部收起。",
        layout: "stretch",
        render: () => (
          <Accordion type="single" collapsible defaultValue="shipping">
            <AccordionItem value="shipping">
              <AccordionTrigger>配送需要多久？</AccordionTrigger>
              <AccordionContent>通常 2–3 个工作日送达，偏远地区顺延 1 天。</AccordionContent>
            </AccordionItem>
            <AccordionItem value="returns">
              <AccordionTrigger>可以无理由退货吗？</AccordionTrigger>
              <AccordionContent>签收后 14 天内支持无理由退货，商品需保持完好。</AccordionContent>
            </AccordionItem>
            <AccordionItem value="invoice">
              <AccordionTrigger>如何开具发票？</AccordionTrigger>
              <AccordionContent>下单时勾选“需要发票”，电子发票会在发货后发送到邮箱。</AccordionContent>
            </AccordionItem>
          </Accordion>
        ),
      },
      {
        title: "多项同时展开",
        description: "type=\"multiple\" 时 defaultValue 是数组。",
        layout: "stretch",
        render: () => (
          <Accordion type="multiple" defaultValue={["motion", "a11y"]}>
            <AccordionItem value="motion">
              <AccordionTrigger>动效</AccordionTrigger>
              <AccordionContent>所有过渡都来自 motion/presets，不单独发明时长。</AccordionContent>
            </AccordionItem>
            <AccordionItem value="a11y">
              <AccordionTrigger>无障碍</AccordionTrigger>
              <AccordionContent>触发器与面板的 aria-expanded / aria-controls 由 Radix 维护。</AccordionContent>
            </AccordionItem>
            <AccordionItem value="tokens">
              <AccordionTrigger>设计变量</AccordionTrigger>
              <AccordionContent>颜色、间距、圆角、时长只引用 --dl-* 变量。</AccordionContent>
            </AccordionItem>
          </Accordion>
        ),
      },
      {
        title: "禁用与富内容",
        layout: "stretch",
        render: () => (
          <Accordion type="single" collapsible>
            <AccordionItem value="plan">
              <AccordionTrigger>当前套餐</AccordionTrigger>
              <AccordionContent>
                团队版，包含 20 个席位与无限项目。
                <br />
                剩余席位：<Badge tone="success" dot>12</Badge>
              </AccordionContent>
            </AccordionItem>
            <AccordionItem value="enterprise" disabled>
              <AccordionTrigger>企业采购</AccordionTrigger>
              <AccordionContent>请联系销售团队开通。</AccordionContent>
            </AccordionItem>
          </Accordion>
        ),
      },
    ],
    props: [
      {
        name: "type",
        type: '"single" | "multiple"',
        description: "必填：单开还是多开。",
      },
      { name: "collapsible", type: "boolean", description: "single 模式下是否允许全部收起。" },
      { name: "defaultValue", type: "string | string[]", description: "初始展开项。" },
      { name: "disabled", type: "boolean", description: "AccordionItem 上的禁用态。" },
    ],
    notes: [
      "展开/收起用 --radix-accordion-content-height 做高度过渡；这是全库唯一被允许的高度动画（单面板）。",
      "Enter / Space 展开，Up / Down 在触发器间移动，全部由 Radix 提供。",
    ],
  },
]);
