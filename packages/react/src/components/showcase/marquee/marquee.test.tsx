// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import "../../../test-setup";
import { Marquee } from "./marquee";
import { DeyloomProvider } from "../../../provider";

afterEach(() => {
  cleanup();
});

function renderMarquee(ui: React.ReactNode, reducedMotion: "always" | "never" = "never") {
  return render(<DeyloomProvider reducedMotion={reducedMotion}>{ui}</DeyloomProvider>);
}

const ITEMS = ["React", "TypeScript", "Motion"];

function items() {
  return ITEMS.map((item) => <span key={item}>{item}</span>);
}

describe("Marquee", () => {
  it("duplicates the track and hides the copy from assistive tech", () => {
    const { container } = renderMarquee(<Marquee>{items()}</Marquee>);

    expect(screen.getAllByText("React")).toHaveLength(2);
    const groups = container.querySelectorAll(".dl-marquee__group");
    expect(groups).toHaveLength(2);
    expect(groups[0]).not.toHaveAttribute("aria-hidden");
    expect(groups[1]).toHaveAttribute("aria-hidden", "true");

    // A marquee only moves through the shared loop class.
    const track = container.querySelector(".dl-marquee__track");
    expect(track).toHaveClass("dl-anim-loop");
  });

  it("exposes direction, hover pause and the item gap", () => {
    const { container } = renderMarquee(
      <Marquee direction="right" pauseOnHover={false} gap={32}>
        {items()}
      </Marquee>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-direction", "right");
    expect(root).toHaveAttribute("data-pause", "none");
    expect(root.style.getPropertyValue("--dl-marquee-gap")).toBe("32px");
  });

  it("accepts a CSS length for the gap and a string gap is passed through", () => {
    const { container } = renderMarquee(<Marquee gap="3rem">{items()}</Marquee>);
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--dl-marquee-gap")).toBe("3rem");
  });

  it("switches to the static scrollable fallback under reduced motion", () => {
    const { container } = renderMarquee(<Marquee fade>{items()}</Marquee>, "always");
    const root = container.firstElementChild as HTMLElement;

    expect(root).toHaveAttribute("data-motion", "static");
    // Duration stays unset until the copy has actually been measured.
    expect(root).not.toHaveAttribute("data-ready");
    expect(container.querySelectorAll(".dl-marquee__group")).toHaveLength(2);
  });
});
