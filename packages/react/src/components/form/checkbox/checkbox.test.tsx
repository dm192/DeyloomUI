import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Checkbox } from "./checkbox";
import { Field } from "../field";
import { DeyloomProvider } from "../../../provider";

function renderWithProvider(ui: React.ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

describe("Checkbox", () => {
  it("toggles on click and takes its accessible name from the label", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    renderWithProvider(<Checkbox label="接受条款" onCheckedChange={onCheckedChange} />);

    const checkbox = screen.getByRole("checkbox", { name: "接受条款" });
    expect(checkbox).toHaveAttribute("aria-checked", "false");

    await user.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(checkbox).toHaveAttribute("aria-checked", "true");
    expect(checkbox).toHaveAttribute("data-state", "checked");
  });

  it("renders the indeterminate state and clears it on click", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    renderWithProvider(
      <Checkbox label="全选" indeterminate onCheckedChange={onCheckedChange} />,
    );

    const checkbox = screen.getByRole("checkbox", { name: "全选" });
    expect(checkbox).toHaveAttribute("aria-checked", "mixed");
    expect(checkbox).toHaveAttribute("data-state", "indeterminate");

    await user.click(checkbox);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
  });

  it("respects the controlled checked prop", () => {
    renderWithProvider(<Checkbox label="已勾选" checked />);
    expect(screen.getByRole("checkbox", { name: "已勾选" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("blocks interaction while disabled, even through the Field", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    renderWithProvider(
      <Field label="邮件通知" disabled>
        <Checkbox onCheckedChange={onCheckedChange} />
      </Field>,
    );

    const checkbox = screen.getByRole("checkbox", { name: /邮件通知/ });
    expect(checkbox).toBeDisabled();
    await user.click(checkbox);
    expect(onCheckedChange).not.toHaveBeenCalled();
  });
});
