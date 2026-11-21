import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Slider } from "./slider";
import { computeSliderFill } from "./slider-math";
import { Field } from "../field";
import { DeyloomProvider } from "../../../provider";

function renderWithProvider(ui: React.ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

describe("computeSliderFill", () => {
  it("fills from the start for a single thumb", () => {
    expect(computeSliderFill([42], 0, 100)).toEqual({ startPercent: 0, scale: 0.42 });
    expect(computeSliderFill([0], 0, 100)).toEqual({ startPercent: 0, scale: 0 });
    expect(computeSliderFill([100], 0, 100)).toEqual({ startPercent: 0, scale: 1 });
  });

  it("fills between both thumbs for a range", () => {
    expect(computeSliderFill([20, 80], 0, 100)).toEqual({
      startPercent: 20,
      scale: 0.75,
    });
    expect(computeSliderFill([40, 40], 0, 100)).toEqual({
      startPercent: 40,
      scale: 0,
    });
  });

  it("maps non-default min/max ranges", () => {
    expect(computeSliderFill([30], 20, 60)).toEqual({ startPercent: 0, scale: 0.25 });
    expect(computeSliderFill([30, 50], 20, 60)).toEqual({
      startPercent: 25,
      scale: 2 / 3,
    });
  });

  it("clamps values outside the range", () => {
    expect(computeSliderFill([-10], 0, 100).scale).toBe(0);
    expect(computeSliderFill([140], 0, 100).scale).toBe(1);
  });
});

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

  it("renders a visible fill for a single thumb and the range fill for two", () => {
    const { container, unmount } = renderWithProvider(<Slider aria-label="音量" defaultValue={[42]} />);
    const singleFill = container.querySelector<HTMLElement>(".dl-slider__fill");
    expect(singleFill?.style.transform).toBe("scaleX(0.42)");
    expect(singleFill?.style.getPropertyValue("inset-inline-start")).toBe("0%");
    unmount();

    const range = renderWithProvider(<Slider aria-label="价格" defaultValue={[20, 80]} />);
    const rangeFill = range.container.querySelector<HTMLElement>(".dl-slider__fill");
    expect(rangeFill?.style.transform).toBe("scaleX(0.75)");
    expect(rangeFill?.style.getPropertyValue("inset-inline-start")).toBe("20%");
  });

  it("renders a vertical fill on the block axis", () => {
    renderWithProvider(
      <Slider aria-label="高度" orientation="vertical" defaultValue={[25, 75]} />,
    );
    const slider = screen.getByRole("slider", { name: "高度 1" }).closest(".dl-slider");
    expect(slider).toHaveAttribute("data-orientation", "vertical");
    const fill = slider?.querySelector<HTMLElement>(".dl-slider__fill");
    expect(fill?.style.transform).toBe("scaleY(0.666667)");
    expect(fill?.style.getPropertyValue("inset-block-end")).toBe("25%");
  });

  it("merges consumer pointer handlers with the internal drag state", () => {
    const onPointerDown = vi.fn();
    renderWithProvider(<Slider aria-label="音量" defaultValue={[30]} onPointerDown={onPointerDown} />);

    const root = document.querySelector(".dl-slider__root");
    expect(root).not.toBeNull();
    fireEvent.pointerDown(root as Element);

    expect(onPointerDown).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("slider", { name: "音量" }).closest(".dl-slider")).toHaveAttribute(
      "data-dragging",
      "true",
    );
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
