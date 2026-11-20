import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Slider } from "./slider";
import { Field } from "../field";
import { DeyloomProvider } from "../../../provider";

function renderWithProvider(ui: React.ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

describe("Slider", () => {
  it("renders a single thumb, moves with the keyboard and updates the readout", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithProvider(
      <Slider
        aria-label="音量"
        defaultValue={[30]}
        showValue
        onValueChange={onValueChange}
      />,
    );

    const thumb = screen.getByRole("slider", { name: "音量" });
    expect(thumb).toHaveAttribute("aria-valuenow", "30");
    expect(screen.getByText("30")).toBeInTheDocument();

    thumb.focus();
    await user.keyboard("{ArrowRight}");
    expect(onValueChange).toHaveBeenCalledWith([31]);
    expect(screen.getByText("31")).toBeInTheDocument();
  });

  it("renders two thumbs for a range and labels both", () => {
    renderWithProvider(
      <Slider aria-label="价格" defaultValue={[20, 80]} showValue />,
    );

    const thumbs = screen.getAllByRole("slider");
    expect(thumbs).toHaveLength(2);
    expect(thumbs[0]).toHaveAttribute("aria-valuenow", "20");
    expect(thumbs[1]).toHaveAttribute("aria-valuenow", "80");
    expect(thumbs[0]).toHaveAccessibleName("价格 1");
    expect(thumbs[1]).toHaveAccessibleName("价格 2");
    expect(screen.getByText("20 – 80")).toBeInTheDocument();
  });

  it("wires the Field label, description and invalid state to the thumb", () => {
    renderWithProvider(
      <Field label="强度" hint="0 到 100" error="强度过低">
        <Slider defaultValue={[5]} />
      </Field>,
    );

    const thumb = screen.getByRole("slider");
    expect(thumb).toHaveAccessibleName(/强度/);
    expect(thumb).toHaveAttribute("aria-invalid", "true");
    const describedBy = thumb.getAttribute("aria-describedby") ?? "";
    expect(describedBy.split(" ")).toHaveLength(2);
  });

  it("marks itself disabled and ignores the keyboard", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithProvider(
      <Slider aria-label="禁用" defaultValue={[10]} disabled onValueChange={onValueChange} />,
    );

    const thumb = screen.getByRole("slider", { name: "禁用" });
    expect(thumb.closest(".dl-slider")).toHaveAttribute("data-disabled", "true");
    thumb.focus();
    await user.keyboard("{ArrowRight}");
    expect(onValueChange).not.toHaveBeenCalled();
  });
});
