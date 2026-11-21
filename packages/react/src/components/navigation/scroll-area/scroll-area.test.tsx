import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ScrollArea } from "./scroll-area";

/**
 * jsdom has no layout, so Radix never mounts the measured scrollbars here — the
 * visual thumb behaviour is covered by the Playwright regression suite. These
 * tests cover the wiring the DOM can prove.
 */
describe("ScrollArea", () => {
  it("wires a focusable named region around the content", () => {
    render(
      <ScrollArea label="变更记录" maxHeight={200}>
        <p>长内容</p>
      </ScrollArea>,
    );

    const region = screen.getByRole("region", { name: "变更记录" });
    expect(region).toHaveAttribute("tabindex", "0");
    expect(region).toHaveTextContent("长内容");

    const root = region.closest(".dl-scroll-area");
    expect(root).toHaveAttribute("data-orientation", "vertical");
  });

  it("applies the max height to the viewport", () => {
    const { container } = render(
      <ScrollArea label="列表" maxHeight="12rem">
        <div>内容</div>
      </ScrollArea>,
    );

    const viewport = container.querySelector<HTMLElement>(".dl-scroll-area__viewport");
    expect(viewport?.style.maxBlockSize).toBe("12rem");
    expect(viewport?.className).toContain("dl-scrollbar");
  });

  it("reflects the chosen orientation on the root", () => {
    const { container, unmount } = render(
      <ScrollArea orientation="both" label="表格">
        <div>宽内容</div>
      </ScrollArea>,
    );
    expect(container.querySelector(".dl-scroll-area")).toHaveAttribute(
      "data-orientation",
      "both",
    );
    unmount();

    const horizontal = render(
      <ScrollArea orientation="horizontal" label="横向">
        <div>宽内容</div>
      </ScrollArea>,
    );
    expect(horizontal.container.querySelector(".dl-scroll-area")).toHaveAttribute(
      "data-orientation",
      "horizontal",
    );
  });

  it("keeps consumer viewport props and merges the className", () => {
    const { container } = render(
      <ScrollArea
        label="列表"
        viewportClassName="custom-viewport"
        viewportProps={{ "data-testid": "viewport" }}
      >
        <div>内容</div>
      </ScrollArea>,
    );

    const viewport = container.querySelector<HTMLElement>(".dl-scroll-area__viewport");
    expect(viewport).toHaveAttribute("data-testid", "viewport");
    expect(viewport?.className).toContain("custom-viewport");
    expect(viewport?.className).toContain("dl-scrollbar");
  });
});
