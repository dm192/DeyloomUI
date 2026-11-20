import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./card";
import { DeyloomProvider } from "../../../provider";

function renderWithProvider(ui: ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

describe("Card", () => {
  it("renders the composed header, content and footer structure", () => {
    renderWithProvider(
      <Card>
        <CardHeader>
          <CardTitle>项目状态</CardTitle>
          <CardDescription>最近一次同步在 2 分钟前。</CardDescription>
        </CardHeader>
        <CardContent>全部 12 个任务已通过检查。</CardContent>
        <CardFooter>查看详情</CardFooter>
      </Card>,
    );

    expect(screen.getByRole("heading", { name: "项目状态" })).toBeInTheDocument();
    expect(screen.getByText("最近一次同步在 2 分钟前。")).toBeInTheDocument();
    expect(screen.getByText("全部 12 个任务已通过检查。")).toBeInTheDocument();
    expect(screen.getByText("查看详情")).toBeInTheDocument();
  });

  it("marks interactive cards and forwards clicks", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    const { container } = renderWithProvider(
      <Card interactive onClick={onClick}>
        可点击内容
      </Card>,
    );

    const card = container.querySelector(".dl-card");
    expect(card).not.toBeNull();
    expect(card).toHaveAttribute("data-interactive", "true");
    expect(card).toHaveAttribute("data-elevation", "1");

    await user.click(screen.getByText("可点击内容"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("maps elevation to a data attribute and omits interaction for static cards", () => {
    const { container } = renderWithProvider(
      <>
        <Card elevation={3}>高</Card>
        <Card>低</Card>
      </>,
    );

    const cards = Array.from(container.querySelectorAll(".dl-card"));
    expect(cards).toHaveLength(2);
    expect(cards[0]).toHaveAttribute("data-elevation", "3");
    expect(cards[0]).not.toHaveAttribute("data-interactive");
    expect(cards[1]).toHaveAttribute("data-elevation", "1");
    expect(cards[1]).not.toHaveAttribute("data-interactive");
  });
});
