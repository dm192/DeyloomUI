import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toggle, ToggleGroup } from "./toggle-group";
import { DeyloomProvider } from "../../../provider";

function renderUi(ui: ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

describe("Toggle", () => {
  it("toggles its pressed state and reports the change", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    renderUi(<Toggle onPressedChange={onPressedChange}>加粗</Toggle>);

    const toggle = screen.getByRole("button", { name: "加粗" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    expect(toggle).toHaveAttribute("data-state", "off");

    await user.click(toggle);
    expect(onPressedChange).toHaveBeenCalledWith(true);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(toggle).toHaveAttribute("data-state", "on");

    await user.click(toggle);
    expect(onPressedChange).toHaveBeenLastCalledWith(false);
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("exposes the variant and size as data hooks", () => {
    renderUi(
      <Toggle size="sm" variant="ghost">
        斜体
      </Toggle>,
    );

    const toggle = screen.getByRole("button", { name: "斜体" });
    expect(toggle).toHaveClass("dl-toggle", "dl-focusable");
    expect(toggle).toHaveAttribute("data-variant", "ghost");
    expect(toggle).toHaveAttribute("data-size", "sm");
    expect(toggle).toHaveAttribute("data-state", "off");
  });

  it("does not fire when disabled", async () => {
    const user = userEvent.setup();
    const onPressedChange = vi.fn();
    renderUi(
      <Toggle disabled onPressedChange={onPressedChange}>
        加粗
      </Toggle>,
    );

    const toggle = screen.getByRole("button", { name: "加粗" });
    expect(toggle).toBeDisabled();

    await user.click(toggle);
    expect(onPressedChange).not.toHaveBeenCalled();
    expect(toggle).toHaveAttribute("aria-pressed", "false");
  });

  it("toggles with Tab and Space", async () => {
    const user = userEvent.setup();
    renderUi(<Toggle>下划线</Toggle>);

    await user.tab();
    const toggle = screen.getByRole("button", { name: "下划线" });
    expect(toggle).toHaveFocus();

    await user.keyboard(" ");
    expect(toggle).toHaveAttribute("aria-pressed", "true");
  });
});

describe("ToggleGroup", () => {
  it("keeps a single group mutually exclusive", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <ToggleGroup
        type="single"
        defaultValue="left"
        aria-label="文本对齐"
        onValueChange={onValueChange}
      >
        <Toggle value="left">左</Toggle>
        <Toggle value="center">中</Toggle>
        <Toggle value="right">右</Toggle>
      </ToggleGroup>,
    );

    const group = screen.getByRole("radiogroup", { name: "文本对齐" });
    expect(group).toHaveClass("dl-toggle-group");
    expect(group).toHaveAttribute("data-orientation", "horizontal");
    expect(group).toHaveAttribute("data-variant", "outline");
    expect(group).toHaveAttribute("data-size", "md");

    const left = screen.getByRole("radio", { name: "左" });
    // Variant and size are inherited from the group context.
    expect(left).toHaveAttribute("data-variant", "outline");
    expect(left).toHaveAttribute("data-size", "md");
    expect(left).toHaveAttribute("aria-checked", "true");

    await user.click(screen.getByRole("radio", { name: "中" }));

    expect(onValueChange).toHaveBeenCalledWith("center");
    expect(screen.getByRole("radio", { name: "中" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(left).toHaveAttribute("aria-checked", "false");
  });

  it("supports several pressed values in a multiple group", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <ToggleGroup
        type="multiple"
        defaultValue={["bold"]}
        aria-label="文本样式"
        onValueChange={onValueChange}
      >
        <Toggle value="bold">加粗</Toggle>
        <Toggle value="italic">斜体</Toggle>
      </ToggleGroup>,
    );

    expect(screen.getByRole("toolbar", { name: "文本样式" })).toBeVisible();
    const bold = screen.getByRole("button", { name: "加粗" });
    const italic = screen.getByRole("button", { name: "斜体" });
    expect(bold).toHaveAttribute("aria-pressed", "true");
    expect(italic).toHaveAttribute("aria-pressed", "false");

    await user.click(italic);
    expect(onValueChange).toHaveBeenLastCalledWith(["bold", "italic"]);
    expect(italic).toHaveAttribute("aria-pressed", "true");

    await user.click(bold);
    expect(onValueChange).toHaveBeenLastCalledWith(["italic"]);
    expect(bold).toHaveAttribute("aria-pressed", "false");
    expect(italic).toHaveAttribute("aria-pressed", "true");
  });

  it("does not toggle a disabled item", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderUi(
      <ToggleGroup type="single" aria-label="尺寸" onValueChange={onValueChange}>
        <Toggle value="sm" disabled>
          sm
        </Toggle>
        <Toggle value="md">md</Toggle>
      </ToggleGroup>,
    );

    const disabled = screen.getByRole("radio", { name: "sm" });
    expect(disabled).toBeDisabled();

    await user.click(disabled);
    expect(onValueChange).not.toHaveBeenCalled();
    expect(disabled).toHaveAttribute("aria-checked", "false");
  });

  it("disables every item when the group is disabled", () => {
    renderUi(
      <ToggleGroup type="multiple" aria-label="格式" disabled>
        <Toggle value="bold">加粗</Toggle>
      </ToggleGroup>,
    );

    expect(screen.getByRole("button", { name: "加粗" })).toBeDisabled();
  });

  it("moves roving focus with the arrow keys", async () => {
    const user = userEvent.setup();
    renderUi(
      <ToggleGroup type="single" defaultValue="left" aria-label="对齐方式">
        <Toggle value="left">左</Toggle>
        <Toggle value="center">中</Toggle>
      </ToggleGroup>,
    );

    const first = screen.getByRole("radio", { name: "左" });
    act(() => first.focus());
    await user.keyboard("{ArrowRight}");

    expect(screen.getByRole("radio", { name: "中" })).toHaveFocus();
  });
});
