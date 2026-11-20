import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Badge } from "./badge";

describe("Badge", () => {
  it("renders its label and exposes variant, tone and size as data attributes", () => {
    render(
      <Badge variant="solid" tone="danger" size="sm">
        失败
      </Badge>,
    );

    const badge = screen.getByText("失败").closest(".dl-badge");
    expect(badge).not.toBeNull();
    expect(badge).toHaveAttribute("data-variant", "solid");
    expect(badge).toHaveAttribute("data-tone", "danger");
    expect(badge).toHaveAttribute("data-size", "sm");
  });

  it("renders a decorative dot only when the dot prop is set", () => {
    const { container, rerender } = render(<Badge>默认</Badge>);
    expect(container.querySelector(".dl-badge__dot")).toBeNull();

    rerender(
      <Badge dot tone="success">
        在线
      </Badge>,
    );
    const dot = container.querySelector(".dl-badge__dot");
    expect(dot).not.toBeNull();
    expect(dot).toHaveAttribute("aria-hidden", "true");
  });

  it("forwards className and native span props", () => {
    render(
      <Badge className="extra" data-testid="status" title="状态">
        草稿
      </Badge>,
    );

    const badge = screen.getByTestId("status");
    expect(badge).toHaveClass("dl-badge", "extra");
    expect(badge).toHaveAttribute("title", "状态");
  });
});
