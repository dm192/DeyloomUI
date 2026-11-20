import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "./popover";
import { DeyloomProvider } from "../../../provider";

function renderWithProvider(ui: ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

function SettingsPopover() {
  return (
    <Popover>
      <PopoverTrigger>打开设置</PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>通知设置</PopoverTitle>
          <PopoverClose />
        </PopoverHeader>
        <p>选择你希望接收的通知。</p>
      </PopoverContent>
    </Popover>
  );
}

describe("Popover", () => {
  it("opens on trigger click and closes on Escape", async () => {
    const user = userEvent.setup();
    renderWithProvider(<SettingsPopover />);

    const trigger = screen.getByRole("button", { name: "打开设置" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    await user.click(trigger);
    const dialog = await screen.findByRole("dialog");
    expect(dialog).toHaveClass("dl-popover");
    expect(dialog).toHaveTextContent("通知设置");
    expect(screen.getByRole("heading", { name: "通知设置" })).toBeInTheDocument();
    expect(trigger).toHaveAttribute("aria-expanded", "true");

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("closes from the composed close button", async () => {
    const user = userEvent.setup();
    renderWithProvider(<SettingsPopover />);

    await user.click(screen.getByRole("button", { name: "打开设置" }));
    await screen.findByRole("dialog");

    await user.click(screen.getByRole("button", { name: "关闭" }));
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("renders controlled content with alignment and offset passed through", () => {
    renderWithProvider(
      <Popover open>
        <PopoverTrigger>触发</PopoverTrigger>
        <PopoverContent align="start" sideOffset={12}>
          受控内容
        </PopoverContent>
      </Popover>,
    );

    const dialog = screen.getByRole("dialog");
    expect(dialog).toHaveTextContent("受控内容");
    expect(dialog).toHaveAttribute("data-align", "start");
    expect(dialog).toHaveAttribute("data-side", "bottom");
  });

  it("reports open changes to the parent while controlled", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithProvider(
      <Popover open onOpenChange={onOpenChange}>
        <PopoverTrigger>触发</PopoverTrigger>
        <PopoverContent>受控内容</PopoverContent>
      </Popover>,
    );

    await user.click(screen.getByRole("button", { name: "触发" }));
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
