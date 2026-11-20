// @vitest-environment jsdom
import { afterEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react";
import "../../../test-setup";
import { SpotlightCard } from "./spotlight-card";
import { DeyloomProvider } from "../../../provider";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

function renderCard(
  ui: React.ReactNode,
  reducedMotion: "always" | "never" = "never",
) {
  return render(<DeyloomProvider reducedMotion={reducedMotion}>{ui}</DeyloomProvider>);
}

afterEach(() => {
  vi.restoreAllMocks();
});

describe("SpotlightCard", () => {
  it("renders a raised surface with its content", () => {
    const { container } = renderCard(
      <SpotlightCard>
        <h3>弹簧材质</h3>
        <p>内容在光斑之上。</p>
      </SpotlightCard>,
    );

    const card = container.firstElementChild as HTMLElement;
    expect(card).toHaveClass("dl-surface-raised");
    expect(card).toHaveClass("dl-spotlight-card");
    expect(screen.getByText("弹簧材质")).toBeInTheDocument();
    expect(card).toHaveAttribute("data-spotlight", "off");
  });

  it("writes the pointer position into CSS variables after entering", async () => {
    const { container } = renderCard(
      <SpotlightCard>
        <span>光斑</span>
      </SpotlightCard>,
    );
    const card = container.firstElementChild as HTMLElement;

    fireEvent.pointerEnter(card);
    fireEvent.pointerMove(card, { clientX: 40, clientY: 30 });

    await waitFor(() => {
      expect(card.style.getPropertyValue("--dl-mx")).toBe("40px");
    });
    expect(card.style.getPropertyValue("--dl-my")).toBe("30px");
    expect(card).toHaveAttribute("data-spotlight", "on");

    fireEvent.pointerLeave(card);
    expect(card).toHaveAttribute("data-spotlight", "off");
  });

  it("exposes the spot radius as a custom property", () => {
    const { container } = renderCard(<SpotlightCard radius={240}>卡片</SpotlightCard>);
    const card = container.firstElementChild as HTMLElement;
    expect(card.style.getPropertyValue("--dl-spotlight-radius")).toBe("240px");
  });

  it("attaches no pointer listeners when motion is reduced", async () => {
    const { container } = renderCard(
      <SpotlightCard>
        <span>静态</span>
      </SpotlightCard>,
      "always",
    );
    const card = container.firstElementChild as HTMLElement;

    fireEvent.pointerEnter(card);
    fireEvent.pointerMove(card, { clientX: 40, clientY: 30 });
    await new Promise((resolve) => setTimeout(resolve, 30));

    expect(card.style.getPropertyValue("--dl-mx")).toBe("");
    expect(card).not.toHaveAttribute("data-spotlight");
    expect(card).toHaveAttribute("data-spotlight-disabled", "true");
  });

  it("skips the effect on coarse pointers", () => {
    const matchMedia = window.matchMedia;
    vi.spyOn(window, "matchMedia").mockImplementation(
      (query: string) =>
        ({
          matches: query === "(pointer: coarse)",
          media: query,
          onchange: null,
          addListener: () => {},
          removeListener: () => {},
          addEventListener: () => {},
          removeEventListener: () => {},
          dispatchEvent: () => false,
        }) as unknown as MediaQueryList,
    );

    const { container } = renderCard(
      <SpotlightCard>
        <span>触屏</span>
      </SpotlightCard>,
    );
    const card = container.firstElementChild as HTMLElement;

    expect(card).toHaveAttribute("data-spotlight-disabled", "true");
    fireEvent.pointerEnter(card);
    fireEvent.pointerMove(card, { clientX: 10, clientY: 10 });
    expect(card.style.getPropertyValue("--dl-mx")).toBe("");

    window.matchMedia = matchMedia;
  });
});
