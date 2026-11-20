import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Input } from "./input";
import { Field } from "../field";
import { DeyloomProvider } from "../../../provider";
import { PlusIcon } from "../../../lib/icons";

function renderWithProvider(ui: React.ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

describe("Input", () => {
  it("renders a native text input and forwards typing to onChange", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();
    renderWithProvider(<Input aria-label="邮箱" placeholder="you@example.com" onChange={onChange} />);

    const input = screen.getByRole("textbox", { name: "邮箱" });
    expect(input).toHaveAttribute("placeholder", "you@example.com");
    expect(input).toHaveClass("dl-input__control");

    await user.type(input, "a@b.co");
    expect(onChange).toHaveBeenCalledTimes(6);
    expect(input).toHaveValue("a@b.co");
  });

  it("exposes size and invalid as data attributes while keeping aria-invalid on the input", () => {
    renderWithProvider(<Input aria-label="名称" size="lg" invalid />);

    const input = screen.getByRole("textbox", { name: "名称" });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input.closest(".dl-input")).toHaveAttribute("data-size", "lg");
    expect(input.closest(".dl-input")).toHaveAttribute("data-invalid", "true");
  });

  it("hides decorative icons from assistive technology", () => {
    renderWithProvider(<Input aria-label="搜索" startIcon={<PlusIcon />} endIcon={<span>⌘</span>} />);

    const input = screen.getByRole("textbox", { name: "搜索" });
    const icons = input.parentElement!.querySelectorAll(".dl-input__icon");
    expect(icons).toHaveLength(2);
    icons.forEach((icon) => expect(icon).toHaveAttribute("aria-hidden", "true"));
  });

  it("is disabled when it sits inside a disabled Field", () => {
    renderWithProvider(
      <Field label="账号" disabled>
        <Input />
      </Field>,
    );

    const input = screen.getByRole("textbox", { name: /账号/ });
    expect(input).toBeDisabled();
  });
});
