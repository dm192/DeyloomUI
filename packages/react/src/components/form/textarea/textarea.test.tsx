import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Textarea } from "./textarea";
import { Field } from "../field";
import { DeyloomProvider } from "../../../provider";

function renderWithProvider(ui: React.ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

describe("Textarea", () => {
  it("renders a multiline textbox and forwards typing", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProvider(<Textarea aria-label="备注" placeholder="写点什么" onChange={onChange} />);

    const textarea = screen.getByRole("textbox", { name: "备注" });
    expect(textarea.tagName).toBe("TEXTAREA");
    expect(textarea).toHaveAttribute("rows", "3");

    await user.type(textarea, "第一行");
    expect(onChange).toHaveBeenCalledTimes(3);
    expect(textarea).toHaveValue("第一行");
  });

  it("survives autoResize measurement in jsdom instead of collapsing", () => {
    renderWithProvider(<Textarea aria-label="自动高度" autoResize minRows={2} maxRows={6} />);

    const textarea = screen.getByRole("textbox", { name: "自动高度" });
    expect(textarea).toHaveAttribute("data-autoresize", "true");
    expect(textarea.getAttribute("rows")).toBeNull();
    expect(textarea.style.height).not.toBe("");
    expect(Number.parseFloat(textarea.style.height)).toBeGreaterThan(0);
  });

  it("wires id, description and invalid state from a Field", () => {
    renderWithProvider(
      <Field label="简介" hint="最多 60 字" error="内容太短" htmlFor="bio">
        <Textarea />
      </Field>,
    );

    const textarea = screen.getByRole("textbox", { name: /简介/ });
    expect(textarea).toHaveAttribute("id", "bio");
    expect(textarea).toHaveAttribute("aria-invalid", "true");
    const describedBy = textarea.getAttribute("aria-describedby") ?? "";
    expect(describedBy.split(" ")).toHaveLength(2);
    expect(screen.getByRole("alert")).toHaveTextContent("内容太短");
  });

  it("keeps explicit rows when not auto-resizing and reports disabled", () => {
    renderWithProvider(<Textarea aria-label="固定" rows={5} disabled />);

    const textarea = screen.getByRole("textbox", { name: "固定" });
    expect(textarea).toHaveAttribute("rows", "5");
    expect(textarea).toBeDisabled();
    expect(textarea).toHaveAttribute("data-disabled", "true");
  });
});
