// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import "../../../test-setup";
import { StaggerList } from "./stagger-list";
import { DeyloomProvider } from "../../../provider";

afterEach(() => {
  cleanup();
});

function renderWithProvider(ui: React.ReactNode, reducedMotion: "user" | "always" | "never" = "never") {
  return render(<DeyloomProvider reducedMotion={reducedMotion}>{ui}</DeyloomProvider>);
}

const TASKS = ["收集参考", "梳理结构", "画第一版线框", "评审并收敛"];

function renderTasks(props: Partial<React.ComponentProps<typeof StaggerList<string>>> = {}) {
  return (
    <StaggerList
      items={TASKS}
      getKey={(task) => task}
      renderItem={(task) => <span>{task}</span>}
      {...props}
    />
  );
}

describe("StaggerList", () => {
  it("renders a semantic list of the given items", () => {
    renderWithProvider(renderTasks());

    const list = screen.getByRole("list");
    expect(list).toHaveClass("dl-stagger-list");
    expect(screen.getAllByRole("listitem")).toHaveLength(TASKS.length);
    for (const task of TASKS) {
      expect(screen.getByText(task)).toBeInTheDocument();
    }
  });

  it("exposes stagger density and keeps list semantics when rendered as divs", () => {
    const { container } = renderWithProvider(renderTasks({ stagger: "loose", as: "div" }));

    const list = screen.getByRole("list");
    expect(list.tagName).toBe("DIV");
    expect(list).toHaveAttribute("data-stagger", "loose");
    expect(screen.getAllByRole("listitem")[0]?.tagName).toBe("DIV");
    expect(container.querySelectorAll(".dl-stagger-list__item")).toHaveLength(TASKS.length);
  });

  it("drops staggered delays above 24 items and mentions it once in dev", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {});
    const items = Array.from({ length: 25 }, (_, index) => `任务 ${index + 1}`);
    const view = render(
      <DeyloomProvider reducedMotion="never">
        <StaggerList items={items} getKey={(item) => item} renderItem={(item) => <span>{item}</span>} />
      </DeyloomProvider>,
    );

    expect(screen.getByRole("list")).toHaveAttribute("data-stagger-off", "true");
    expect(screen.getAllByRole("listitem")).toHaveLength(25);
    expect(info).toHaveBeenCalledTimes(1);
    expect(info.mock.calls[0]?.[0]).toContain("StaggerList");

    // Re-rendering an already long list must not spam the console again.
    view.rerender(
      <DeyloomProvider reducedMotion="never">
        <StaggerList
          items={[...items, "任务 26"]}
          getKey={(item) => item}
          renderItem={(item) => <span>{item}</span>}
        />
      </DeyloomProvider>,
    );
    expect(info).toHaveBeenCalledTimes(1);
  });

  it("stays static under reduced motion while keeping every row in the list", () => {
    renderWithProvider(renderTasks({ stagger: "tight" }), "always");

    const list = screen.getByRole("list");
    expect(list).toHaveAttribute("data-stagger", "tight");
    expect(list).toHaveAttribute("data-stagger-off", "true");
    expect(screen.getAllByRole("listitem")).toHaveLength(TASKS.length);
  });
});
