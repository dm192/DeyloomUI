import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "./button";
import { IconButton } from "../icon-button";
import { DeyloomProvider } from "../../provider";

function renderWithProvider(ui: React.ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

describe("Button", () => {
  it("renders its label and forwards clicks", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithProvider(<Button onClick={onClick}>保存</Button>);

    await user.click(screen.getByRole("button", { name: "保存" }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("marks itself busy and blocks clicks while loading", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithProvider(
      <Button loading onClick={onClick}>
        保存
      </Button>,
    );

    const button = screen.getByRole("button", { name: "保存" });
    expect(button).toHaveAttribute("aria-busy", "true");
    expect(button).toBeDisabled();

    await user.click(button);
    expect(onClick).not.toHaveBeenCalled();
  });

  it("exposes variant, tone and size as data attributes", () => {
    renderWithProvider(
      <Button variant="outline" tone="danger" size="sm">
        删除
      </Button>,
    );
    const button = screen.getByRole("button", { name: "删除" });
    expect(button).toHaveAttribute("data-variant", "outline");
    expect(button).toHaveAttribute("data-tone", "danger");
    expect(button).toHaveAttribute("data-size", "sm");
  });

  it("renders as the child element with asChild", () => {
    renderWithProvider(
      <Button asChild>
        <a href="/docs">文档</a>
      </Button>,
    );
    const link = screen.getByRole("link", { name: "文档" });
    expect(link).toHaveClass("dl-btn");
  });

  it("renders statically outside a provider instead of crashing", () => {
    render(<Button>独立</Button>);
    expect(screen.getByRole("button", { name: "独立" })).toBeInTheDocument();
  });
});

describe("IconButton", () => {
  it("requires and exposes an accessible name", () => {
    renderWithProvider(<IconButton label="关闭">×</IconButton>);
    expect(screen.getByRole("button", { name: "关闭" })).toHaveClass("dl-icon-btn");
  });
});
