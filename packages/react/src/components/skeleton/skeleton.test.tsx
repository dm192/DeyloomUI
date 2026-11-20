import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { Skeleton } from "./skeleton";
import { DeyloomProvider } from "../../provider";

function renderWithProvider(ui: React.ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

describe("Skeleton", () => {
  it("is hidden from assistive tech and marked as a loop-safe placeholder", () => {
    const { container } = renderWithProvider(<Skeleton />);
    const node = container.querySelector(".dl-skeleton");
    expect(node).not.toBeNull();
    expect(node).toHaveAttribute("aria-hidden", "true");
    expect(node).toHaveClass("dl-anim-loop");
    expect(node).toHaveAttribute("data-variant", "text");
  });

  it("renders multiple text lines with a short last line", () => {
    const { container } = renderWithProvider(<Skeleton variant="text" lines={3} height={12} />);
    const wrap = container.querySelector(".dl-skeleton__group");
    expect(wrap).toHaveAttribute("aria-hidden", "true");

    const lines = container.querySelectorAll(".dl-skeleton");
    expect(lines).toHaveLength(3);
    expect(lines[0]).toHaveStyle({ width: "100%", height: "12px" });
    expect(lines[2]).toHaveStyle({ width: "60%" });
  });

  it("supports rect and circle variants", () => {
    const { container } = renderWithProvider(
      <>
        <Skeleton variant="rect" width={240} height={80} />
        <Skeleton variant="circle" width="48px" height="48px" />
      </>,
    );
    const rect = container.querySelector(".dl-skeleton--rect");
    const circle = container.querySelector(".dl-skeleton--circle");
    expect(rect).toHaveStyle({ width: "240px", height: "80px" });
    expect(circle).toHaveStyle({ width: "48px", height: "48px" });
    expect(circle?.getAttribute("aria-hidden")).toBe("true");
  });
});
