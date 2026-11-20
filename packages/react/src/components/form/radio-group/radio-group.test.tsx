import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RadioGroup, RadioGroupItem } from "./radio-group";
import { Field } from "../field";
import { DeyloomProvider } from "../../../provider";

function renderWithProvider(ui: React.ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

describe("RadioGroup", () => {
  it("renders a radiogroup with checked state and forwards changes", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithProvider(
      <RadioGroup aria-label="套餐" onValueChange={onValueChange}>
        <RadioGroupItem value="basic" label="基础" />
        <RadioGroupItem value="pro" label="专业" />
      </RadioGroup>,
    );

    const group = screen.getByRole("radiogroup", { name: "套餐" });
    expect(group).toHaveAttribute("data-orientation", "vertical");

    const basic = screen.getByRole("radio", { name: "基础" });
    expect(basic).toHaveAttribute("aria-checked", "false");

    await user.click(basic);
    expect(onValueChange).toHaveBeenCalledWith("basic");
    expect(basic).toHaveAttribute("aria-checked", "true");
  });

  it("moves focus with arrow keys and selects with Space", async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <RadioGroup defaultValue="basic" aria-label="套餐">
        <RadioGroupItem value="basic" label="基础" />
        <RadioGroupItem value="pro" label="专业" />
        <RadioGroupItem value="team" label="团队" />
      </RadioGroup>,
    );

    const basic = screen.getByRole("radio", { name: "基础" });
    await user.click(basic);
    await user.keyboard("{ArrowDown}");

    const pro = screen.getByRole("radio", { name: "专业" });
    expect(pro).toHaveFocus();

    await user.keyboard(" ");
    expect(pro).toHaveAttribute("aria-checked", "true");
  });

  it("wires disabled and invalid state from a Field", () => {
    renderWithProvider(
      <Field label="结算方式" error="请选择一种方式" disabled>
        <RadioGroup>
          <RadioGroupItem value="card" label="银行卡" />
          <RadioGroupItem value="cash" label="现金" />
        </RadioGroup>
      </Field>,
    );

    const group = screen.getByRole("radiogroup", { name: /结算方式/ });
    expect(group).toHaveAttribute("aria-invalid", "true");
    expect(group).toHaveAttribute("data-invalid", "true");
    expect(screen.getByRole("radio", { name: "银行卡" })).toBeDisabled();
    expect(screen.getByRole("alert")).toHaveTextContent("请选择一种方式");
  });
});
