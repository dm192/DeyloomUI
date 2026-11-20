import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";
import { DeyloomProvider } from "../../../provider";

function renderTabs(
  options: { onValueChange?: (value: string) => void; value?: string } = {},
) {
  const { onValueChange, value } = options;
  return render(
    <DeyloomProvider reducedMotion="always">
      <Tabs defaultValue="overview" value={value} onValueChange={onValueChange}>
        <TabsList>
          <TabsTrigger value="overview">概览</TabsTrigger>
          <TabsTrigger value="activity">活动</TabsTrigger>
          <TabsTrigger value="settings" disabled>
            设置
          </TabsTrigger>
        </TabsList>
        <TabsContent value="overview">概览面板</TabsContent>
        <TabsContent value="activity">活动面板</TabsContent>
        <TabsContent value="settings">设置面板</TabsContent>
      </Tabs>
    </DeyloomProvider>,
  );
}

describe("Tabs", () => {
  it("wires tablist, triggers and the active panel together", () => {
    const { container } = renderTabs();

    const tabs = screen.getAllByRole("tab");
    expect(tabs).toHaveLength(3);
    expect(tabs[0]).toHaveAttribute("aria-selected", "true");
    expect(tabs[1]).toHaveAttribute("aria-selected", "false");
    expect(tabs[2]).toBeDisabled();

    const panel = screen.getByRole("tabpanel");
    expect(panel).toHaveTextContent("概览面板");
    expect(panel).toHaveAttribute("aria-labelledby", tabs[0]?.id);
    expect(tabs[0]).toHaveAttribute("aria-controls", panel.id);

    // jsdom reports zero sizes, so the measured indicator degrades to nothing.
    expect(container.querySelector(".dl-tabs__indicator")).toBeNull();
  });

  it("switches panels on click and reports the new value", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderTabs({ onValueChange });

    await user.click(screen.getByRole("tab", { name: "活动" }));

    await waitFor(() =>
      expect(screen.getByRole("tab", { name: "活动" })).toHaveAttribute(
        "aria-selected",
        "true",
      ),
    );
    await waitFor(() => expect(screen.getByRole("tabpanel")).toHaveTextContent("活动面板"));
    await waitFor(() => expect(screen.queryByText("概览面板")).not.toBeInTheDocument());
    expect(onValueChange).toHaveBeenCalledWith("activity");
  });

  it("moves selection with the arrow keys", async () => {
    const user = userEvent.setup();
    renderTabs();

    const overview = screen.getByRole("tab", { name: "概览" });
    overview.focus();
    await user.keyboard("{ArrowRight}");

    const activity = screen.getByRole("tab", { name: "活动" });
    await waitFor(() => expect(activity).toHaveAttribute("aria-selected", "true"));
    expect(document.activeElement).toBe(activity);
  });

  it("stays on the controlled value until the parent updates it", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderTabs({ value: "overview", onValueChange });

    await user.click(screen.getByRole("tab", { name: "活动" }));

    expect(onValueChange).toHaveBeenCalledWith("activity");
    expect(screen.getByRole("tab", { name: "概览" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    expect(screen.getByRole("tabpanel")).toHaveTextContent("概览面板");
  });

  it("does not select a disabled tab", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderTabs({ onValueChange });

    const disabled = screen.getByRole("tab", { name: "设置" });
    await user.click(disabled);

    expect(onValueChange).not.toHaveBeenCalled();
    expect(disabled).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("tabpanel")).toHaveTextContent("概览面板");
  });
});
