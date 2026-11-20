import type { ReactNode } from "react";
import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "./tooltip";
import { DeyloomProvider } from "../../../provider";

function renderTooltip(ui: ReactNode) {
  return render(
    <DeyloomProvider reducedMotion="always">
      <TooltipProvider>{ui}</TooltipProvider>
    </DeyloomProvider>,
  );
}

describe("Tooltip", () => {
  it("renders a focusable trigger with an accessible name", () => {
    renderTooltip(
      <Tooltip>
        <TooltipTrigger>重置</TooltipTrigger>
        <TooltipContent>恢复默认设置</TooltipContent>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "重置" });
    expect(trigger).toHaveClass("dl-tooltip__trigger");
    trigger.focus();
    expect(document.activeElement).toBe(trigger);
  });

  it("shows the label on focus and removes it again on blur", async () => {
    const user = userEvent.setup();
    renderTooltip(
      <Tooltip>
        <TooltipTrigger>重置</TooltipTrigger>
        <TooltipContent>恢复默认设置</TooltipContent>
      </Tooltip>,
    );

    const trigger = screen.getByRole("button", { name: "重置" });
    trigger.focus();

    const tooltip = await screen.findByRole("tooltip");
    expect(tooltip).toHaveTextContent("恢复默认设置");
    expect(tooltip).toHaveClass("dl-tooltip");
    expect(trigger).toHaveAttribute("aria-describedby", tooltip.id);

    await user.tab();
    await waitFor(() => expect(screen.queryByRole("tooltip")).not.toBeInTheDocument());
  });

  it("renders immediately with defaultOpen and honours side placement", () => {
    renderTooltip(
      <Tooltip defaultOpen>
        <TooltipTrigger asChild>
          <button type="button">更多</button>
        </TooltipTrigger>
        <TooltipContent side="right">右侧提示</TooltipContent>
      </Tooltip>,
    );

    const tooltip = screen.getByRole("tooltip");
    expect(tooltip).toHaveTextContent("右侧提示");
    expect(tooltip).toHaveAttribute("data-side", "right");
  });

  it("does not render content while closed", () => {
    renderTooltip(
      <Tooltip>
        <TooltipTrigger>提示</TooltipTrigger>
        <TooltipContent>隐藏内容</TooltipContent>
      </Tooltip>,
    );

    expect(screen.queryByRole("tooltip")).not.toBeInTheDocument();
  });
});
