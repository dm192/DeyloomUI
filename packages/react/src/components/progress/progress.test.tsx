import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Progress } from "./progress";
import { DeyloomProvider } from "../../provider";

function renderWithProvider(ui: React.ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

describe("Progress", () => {
  it("exposes its value through the progressbar role", () => {
    renderWithProvider(<Progress value={42} />);
    const bar = screen.getByRole("progressbar");
    expect(bar).toHaveAttribute("aria-valuenow", "42");
    expect(bar).toHaveAttribute("aria-valuemin", "0");
    expect(bar).toHaveAttribute("aria-valuemax", "100");
  });

  it("clamps out-of-range values and supports custom max", () => {
    renderWithProvider(<Progress value={150} max={200} />);
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "150");

    renderWithProvider(<Progress value={-4} />);
    const clamped = screen.getAllByRole("progressbar")[1];
    expect(clamped).toHaveAttribute("aria-valuenow", "0");
  });

  it("renders a label and the rounded percentage", () => {
    renderWithProvider(<Progress value={37.4} label="上传中" showValue />);
    expect(screen.getByText("上传中")).toBeInTheDocument();
    expect(screen.getByText("37%")).toBeInTheDocument();
  });

  it("is indeterminate when value is omitted", () => {
    renderWithProvider(<Progress />);
    const bar = screen.getByRole("progressbar");
    expect(bar).not.toHaveAttribute("aria-valuenow");
    expect(bar).toHaveAttribute("data-state", "indeterminate");
    expect(bar.querySelector(".dl-anim-loop")).not.toBeNull();
  });

  it("exposes size and tone as data attributes on the wrapper", () => {
    const { container } = renderWithProvider(<Progress value={10} size="lg" tone="success" />);
    const wrapper = container.querySelector(".dl-progress");
    expect(wrapper).toHaveAttribute("data-size", "lg");
    expect(wrapper).toHaveAttribute("data-tone", "success");
  });
});
