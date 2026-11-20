// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import "../../../test-setup";
import { NumberFlow } from "./number-flow";
import { DeyloomProvider } from "../../../provider";

afterEach(() => {
  cleanup();
});

function renderFlow(ui: React.ReactNode, reducedMotion: "always" | "never" = "never") {
  return render(<DeyloomProvider reducedMotion={reducedMotion}>{ui}</DeyloomProvider>);
}

function stripTransforms(): string[] {
  return Array.from(
    document.querySelectorAll<HTMLElement>(".dl-number-flow__slot > .dl-number-flow__strip"),
  ).map((strip) => strip.style.transform);
}

describe("NumberFlow", () => {
  it("exposes the complete formatted value as one accessible name", () => {
    const { container } = renderFlow(
      <NumberFlow value={1234.5} locale="en-US" format={{ minimumFractionDigits: 1 }} prefix="¥" suffix="起" />,
    );

    const flow = screen.getByLabelText("¥1,234.5起");
    expect(flow).toHaveClass("dl-number-flow");
    // One slot per digit; separators and affixes stay static.
    expect(container.querySelectorAll(".dl-number-flow__slot")).toHaveLength(5);
    expect(container.querySelectorAll(".dl-number-flow__static")).toHaveLength(2); // comma + decimal point
    expect(screen.getByText("¥")).toBeInTheDocument();
    expect(screen.getByText("起")).toBeInTheDocument();
  });

  it("rolls only the digit slots whose value changed", () => {
    const view = renderFlow(<NumberFlow value={1234} locale="en-US" />);
    expect(stripTransforms()).toEqual([
      "translateY(-10%)",
      "translateY(-20%)",
      "translateY(-30%)",
      "translateY(-40%)",
    ]);

    view.rerender(
      <DeyloomProvider reducedMotion="never">
        <NumberFlow value={1239} locale="en-US" />
      </DeyloomProvider>,
    );

    const after = stripTransforms();
    expect(after.slice(0, 3)).toEqual(["translateY(-10%)", "translateY(-20%)", "translateY(-30%)"]);
    expect(after[3]).toBe("translateY(-90%)");
  });

  it("switches to plain text under reduced motion", () => {
    const { container } = renderFlow(<NumberFlow value={1234.5} locale="en-US" />, "always");

    const flow = screen.getByLabelText("1,234.5");
    expect(flow).toHaveAttribute("data-motion", "static");
    expect(flow).toHaveTextContent("1,234.5");
    expect(container.querySelectorAll(".dl-number-flow__slot")).toHaveLength(0);
  });

  it("keeps working when the digit count changes", () => {
    const view = renderFlow(<NumberFlow value={99} locale="en-US" />);
    expect(stripTransforms()).toHaveLength(2);

    view.rerender(
      <DeyloomProvider reducedMotion="never">
        <NumberFlow value={100} locale="en-US" />
      </DeyloomProvider>,
    );

    expect(screen.getByLabelText("100")).toBeInTheDocument();
    expect(stripTransforms()).toEqual([
      "translateY(-10%)",
      "translateY(0%)",
      "translateY(0%)",
    ]);
  });
});
