import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SegmentedControl } from "./segmented-control";
import { DeyloomProvider } from "../../../provider";

const ITEMS = [
  { value: "day", label: "日" },
  { value: "week", label: "周" },
  { value: "month", label: "月" },
];

function renderWithProvider(ui: React.ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

describe("SegmentedControl", () => {
  it("renders a labelled radiogroup with one checked radio", () => {
    renderWithProvider(
      <SegmentedControl aria-label="周期" items={ITEMS} defaultValue="week" />,
    );

    const group = screen.getByRole("radiogroup", { name: "周期" });
    expect(group).toBeVisible();
    expect(screen.getAllByRole("radio")).toHaveLength(3);
    expect(screen.getByRole("radio", { name: "周" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
    expect(screen.getByRole("radio", { name: "日" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("commits a click as a single-choice change", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithProvider(
      <SegmentedControl
        aria-label="周期"
        items={ITEMS}
        defaultValue="day"
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("radio", { name: "月" }));
    expect(onValueChange).toHaveBeenCalledWith("month");
    expect(screen.getByRole("radio", { name: "月" })).toHaveAttribute(
      "aria-checked",
      "true",
    );
  });

  it("moves the selection with arrow keys and skips disabled items", async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <SegmentedControl
        aria-label="周期"
        defaultValue="day"
        items={[
          { value: "day", label: "日" },
          { value: "week", label: "周", disabled: true },
          { value: "month", label: "月" },
        ]}
      />,
    );

    const day = screen.getByRole("radio", { name: "日" });
    day.focus();
    await user.keyboard("{ArrowRight}");
    const month = screen.getByRole("radio", { name: "月" });
    expect(month).toHaveAttribute("aria-checked", "true");
    expect(month).toHaveFocus();

    await user.keyboard("{ArrowRight}");
    expect(day).toHaveAttribute("aria-checked", "true");

    await user.keyboard("{End}");
    expect(month).toHaveAttribute("aria-checked", "true");
  });

  it("respects the controlled value and the disabled group", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    const { rerender } = renderWithProvider(
      <SegmentedControl
        aria-label="周期"
        items={ITEMS}
        value="day"
        onValueChange={onValueChange}
      />,
    );

    await user.click(screen.getByRole("radio", { name: "周" }));
    expect(onValueChange).toHaveBeenCalledWith("week");
    expect(screen.getByRole("radio", { name: "日" })).toHaveAttribute(
      "aria-checked",
      "true",
    );

    rerender(
      <DeyloomProvider reducedMotion="always">
        <SegmentedControl aria-label="周期" items={ITEMS} value="week" disabled />
      </DeyloomProvider>,
    );
    const group = screen.getByRole("radiogroup", { name: "周期" });
    expect(group).toHaveAttribute("data-disabled", "true");
    expect(screen.getByRole("radio", { name: "周" })).toBeDisabled();
  });
});
