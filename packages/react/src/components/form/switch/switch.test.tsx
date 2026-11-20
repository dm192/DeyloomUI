import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Switch } from "./switch";
import { Field } from "../field";
import { DeyloomProvider } from "../../../provider";

function renderWithProvider(ui: React.ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

describe("Switch", () => {
  it("toggles on click and reports the next value", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    renderWithProvider(<Switch aria-label="通知" onCheckedChange={onCheckedChange} />);

    const control = screen.getByRole("switch", { name: "通知" });
    expect(control).toHaveAttribute("aria-checked", "false");
    expect(control).toHaveAttribute("data-state", "unchecked");

    await user.click(control);
    expect(onCheckedChange).toHaveBeenCalledWith(true);
    expect(control).toHaveAttribute("aria-checked", "true");
  });

  it("honours the controlled checked prop and Space", async () => {
    const user = userEvent.setup();
    const onCheckedChange = vi.fn();
    renderWithProvider(<Switch aria-label="同步" checked onCheckedChange={onCheckedChange} />);

    const control = screen.getByRole("switch", { name: "同步" });
    expect(control).toHaveAttribute("aria-checked", "true");

    control.focus();
    await user.keyboard(" ");
    expect(onCheckedChange).toHaveBeenCalledWith(false);
    // Controlled: the parent did not update, so the visual state stays.
    expect(control).toHaveAttribute("aria-checked", "true");
  });

  it("exposes size and invalid state as data attributes", () => {
    renderWithProvider(<Switch aria-label="小开关" size="sm" invalid />);
    const control = screen.getByRole("switch", { name: "小开关" });
    expect(control).toHaveAttribute("data-size", "sm");
    expect(control).toHaveAttribute("data-invalid", "true");
    expect(control).toHaveAttribute("aria-invalid", "true");
  });

  it("takes its accessible name and disabled state from a Field", () => {
    renderWithProvider(
      <Field label="自动同步" disabled>
        <Switch />
      </Field>,
    );

    const control = screen.getByRole("switch", { name: /自动同步/ });
    expect(control).toBeDisabled();
  });
});
