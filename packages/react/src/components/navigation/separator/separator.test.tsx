import * as React from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Separator } from "./separator";

describe("Separator", () => {
  it("defaults to a decorative horizontal rule", () => {
    const { container } = render(<Separator />);
    const separator = container.querySelector<HTMLElement>(".dl-separator");

    expect(separator).not.toBeNull();
    expect(separator).toHaveAttribute("data-orientation", "horizontal");
    // Radix maps `decorative` to role="none"; we make the removal explicit.
    expect(separator).toHaveAttribute("role", "none");
    expect(separator).toHaveAttribute("aria-hidden", "true");
  });

  it("is exposed as a separator when decorative={false}", () => {
    render(<Separator decorative={false} orientation="vertical" />);

    const separator = screen.getByRole("separator");
    expect(separator).toHaveAttribute("data-orientation", "vertical");
    expect(separator).toHaveAttribute("aria-orientation", "vertical");
    expect(separator).not.toHaveAttribute("aria-hidden");
  });

  it("keeps horizontal separators horizontal by default when semantic", () => {
    render(<Separator decorative={false} id="rule" />);
    const separator = screen.getByRole("separator");

    expect(separator).toHaveAttribute("id", "rule");
    expect(separator).toHaveAttribute("data-orientation", "horizontal");
    // Horizontal is the implicit orientation, so Radix omits the attribute.
    expect(separator).not.toHaveAttribute("aria-orientation");
  });

  it("forwards className and ref", () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Separator ref={ref} className="custom-rule" />);

    const separator = ref.current;
    expect(separator).toBeInstanceOf(HTMLDivElement);
    expect(separator).toHaveClass("dl-separator");
    expect(separator).toHaveClass("custom-rule");
  });
});
