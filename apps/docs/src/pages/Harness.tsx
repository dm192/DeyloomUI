import {
  Button,
  Dialog,
  DialogClose,
  DialogCloseButton,
  DialogContent,
  DialogDescription,
  DialogTitle,
  DialogTrigger,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Field,
  Input,
  SegmentedControl,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  Switch,
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
  toast,
} from "@deyloom/react";
import * as React from "react";
import { PageHeader, Section } from "../ui/blocks";

/**
 * Stable fixtures for end-to-end tests. Not linked from the navigation: the
 * demos on component pages are free to change copy, this page must not.
 */
export function HarnessPage() {
  const [tab, setTab] = React.useState("one");
  const [segment, setSegment] = React.useState("day");
  const [email, setEmail] = React.useState("");

  return (
    <div data-testid="harness">
      <PageHeader
        kicker="Internal"
        title="测试夹具"
        summary="键盘、焦点与无障碍 e2e 使用的固定场景。"
      />

      <Section title="浮层">
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12 }}>
          <Dialog>
            <DialogTrigger asChild>
              <Button>打开对话框</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogTitle>对话框标题</DialogTitle>
              <DialogDescription>对话框说明文本。</DialogDescription>
              <p style={{ marginTop: 12 }}>内容区域。</p>
              <DialogClose asChild>
                <Button variant="outline">取消</Button>
              </DialogClose>
              <DialogCloseButton />
            </DialogContent>
          </Dialog>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline">更多操作</Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent aria-label="操作菜单">
              <DropdownMenuLabel>操作</DropdownMenuLabel>
              <DropdownMenuItem>复制</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>删除</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost">悬停触发器</Button>
              </TooltipTrigger>
              <TooltipContent>提示内容</TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <Button
            variant="soft"
            onClick={() => toast({ title: "测试通知", description: "来自夹具页。" })}
          >
            触发通知
          </Button>
        </div>
      </Section>

      <Section title="键盘与选择">
        <div style={{ display: "grid", gap: 18 }}>
          <div data-testid="tabs-height">
            <Tabs defaultValue="small">
              <TabsList aria-label="高度过渡示例">
                <TabsTrigger value="small">短面板</TabsTrigger>
                <TabsTrigger value="tall">高面板</TabsTrigger>
              </TabsList>
              <TabsContent value="small">
                <div style={{ height: 24 }}>短面板内容</div>
              </TabsContent>
              <TabsContent value="tall">
                <div style={{ height: 160 }}>高面板内容</div>
              </TabsContent>
            </Tabs>
          </div>

          <Tabs value={tab} onValueChange={setTab}>
            <TabsList aria-label="示例页签">
              <TabsTrigger value="one">第一页</TabsTrigger>
              <TabsTrigger value="two">第二页</TabsTrigger>
              <TabsTrigger value="three">第三页</TabsTrigger>
            </TabsList>
            <TabsContent value="one">第一页内容</TabsContent>
            <TabsContent value="two">第二页内容</TabsContent>
            <TabsContent value="three">第三页内容</TabsContent>
          </Tabs>

          <SegmentedControl
            aria-label="周期"
            items={[
              { value: "day", label: "日" },
              { value: "week", label: "周" },
              { value: "month", label: "月" },
            ]}
            value={segment}
            onValueChange={setSegment}
          />

          <Select defaultValue="a">
            <SelectTrigger aria-label="选择示例">
              <SelectValue placeholder="请选择" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="a">选项 A</SelectItem>
              <SelectItem value="b">选项 B</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Section>

      <Section title="表单">
        <div style={{ display: "grid", gap: 16, maxWidth: 380 }}>
          <Field label="邮箱" hint="用于接收通知。" required>
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.currentTarget.value)}
              placeholder="you@example.com"
            />
          </Field>
          <Field label="有错误的字段" error="这个值不符合要求。">
            <Input invalid defaultValue="x" />
          </Field>
          <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Switch aria-label="启用通知" defaultChecked />
            启用通知
          </label>
        </div>
      </Section>
    </div>
  );
}
