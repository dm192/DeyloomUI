import type { DemoEntry } from "./types";
import {
  Field,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@deyloom/react";

export const selectDemo: DemoEntry = {
  slug: "select",
  title: "Select",
  group: "form",
  summary: "下拉选择器。浮层用共享的 popoverPanel 变体进场与退场，支持键盘选择。",
  examples: [
    {
      title: "基础用法",
      layout: "stretch",
      render: () => (
        <Select>
          <SelectTrigger aria-label="运行环境">
            <SelectValue placeholder="选择环境" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="dev">开发环境</SelectItem>
            <SelectItem value="staging">预发布</SelectItem>
            <SelectItem value="production">生产环境</SelectItem>
          </SelectContent>
        </Select>
      ),
    },
    {
      title: "分组与分隔线",
      layout: "stretch",
      render: () => (
        <Select defaultValue="hkg">
          <SelectTrigger aria-label="部署区域">
            <SelectValue placeholder="选择区域" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>亚太</SelectLabel>
              <SelectItem value="hkg">香港</SelectItem>
              <SelectItem value="sin">新加坡</SelectItem>
            </SelectGroup>
            <SelectSeparator />
            <SelectGroup>
              <SelectLabel>欧洲</SelectLabel>
              <SelectItem value="fra">法兰克福</SelectItem>
              <SelectItem value="ams">阿姆斯特丹</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      ),
    },
    {
      title: "尺寸与禁用项",
      layout: "stretch",
      render: () => (
        <div style={{ display: "grid", gap: 12 }}>
          <Select>
            <SelectTrigger size="sm" aria-label="小号选择器">
              <SelectValue placeholder="小号 · 30px" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">选项 A</SelectItem>
              <SelectItem value="b">选项 B</SelectItem>
            </SelectContent>
          </Select>
          <Select>
            <SelectTrigger aria-label="禁用项演示">
              <SelectValue placeholder="含禁用项" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="free">免费版</SelectItem>
              <SelectItem value="pro">专业版</SelectItem>
              <SelectItem value="enterprise" disabled>
                企业版（联系销售）
              </SelectItem>
            </SelectContent>
          </Select>
          <Select disabled>
            <SelectTrigger aria-label="禁用的选择器">
              <SelectValue placeholder="整个选择器禁用" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="x">不可见内容</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ),
    },
    {
      title: "长列表滚动",
      description: "选项超出可用高度时出现滚动条与上下滚动按钮。",
      layout: "stretch",
      render: () => (
        <Select>
          <SelectTrigger aria-label="选择时区">
            <SelectValue placeholder="选择时区" />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: 40 }, (_, index) => (
              <SelectItem key={index} value={`zone-${index}`}>
                UTC{index % 12 === 0 ? "" : `+${index}`} · 时区 {index + 1}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ),
    },
    {
      title: "Field 内自动接线",
      layout: "stretch",
      render: () => (
        <Field label="凭证" hint="凭证只保存在本地。" error="请选择一个凭证。">
          <Select>
            <SelectTrigger>
              <SelectValue placeholder="选择凭证" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="deploy">deploy-key</SelectItem>
              <SelectItem value="release">release-key</SelectItem>
            </SelectContent>
          </Select>
        </Field>
      ),
    },
  ],
  props: [
    { name: "open / onOpenChange", type: "boolean / (open) => void", description: "控制下拉层打开状态。" },
    { name: "value / defaultValue", type: "string", description: "受控或非受控的选中值。" },
    { name: "onValueChange", type: "(value: string) => void", description: "选中值变化回调。" },
    { name: "size", type: '"sm" | "md" | "lg"', default: '"md"', description: "SelectTrigger 的高度。" },
    { name: "disabled", type: "boolean", description: "禁用整个选择器或单个选项。" },
  ],
  notes: [
    "组合式导出：Select / SelectTrigger / SelectValue / SelectContent / SelectItem / SelectGroup / SelectLabel / SelectSeparator。",
    "下拉面板通过 portal 渲染到 body，token 定义在 :root 上，所以主题与局部换肤都能正确继承。",
  ],
};
