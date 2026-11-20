// @vitest-environment jsdom
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import "../../../test-setup";
import { BorderBeam } from "./border-beam";
import { DeyloomProvider } from "../../../provider";

afterEach(() => {
  cleanup();
});

function renderBeam(ui: React.ReactNode, reducedMotion: "always" | "never" = "never") {
  return render(<DeyloomProvider reducedMotion={reducedMotion}>{ui}</DeyloomProvider>);
}

describe("BorderBeam", () => {
  it("renders the content and a decorative, non-interactive beam ring", () => {
    const { container } = renderBeam(
      <BorderBeam>
        <strong>发光边框</strong>
      </BorderBeam>,
    );

    expect(screen.getByText("发光边框")).toBeInTheDocument();
    const ring = container.querySelector(".dl-border-beam__ring");
    const beam = container.querySelector(".dl-border-beam__beam");
    expect(ring).toHaveAttribute("aria-hidden", "true");
    // The rotation must be marked as a loop so reduced motion can stop it.
    expect(beam).toHaveClass("dl-anim-loop");
  });

  it("tunes duration, spot size and color through custom properties", () => {
    const { container } = renderBeam(
      <BorderBeam duration={3} size={25} color="var(--dl-color-danger)">
        卡片
      </BorderBeam>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--dl-beam-duration")).toBe("3s");
    expect(root.style.getPropertyValue("--dl-beam-size")).toBe("25");
    expect(root.style.getPropertyValue("--dl-beam-color")).toBe("var(--dl-color-danger)");
  });

  it("clamps invalid tuning instead of producing a broken animation", () => {
    const { container } = renderBeam(
      <BorderBeam duration={0} size={140}>
        卡片
      </BorderBeam>,
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root.style.getPropertyValue("--dl-beam-duration")).toBe("6s");
    expect(root.style.getPropertyValue("--dl-beam-size")).toBe("100");
  });

  it("marks itself static under reduced motion", () => {
    const { container } = renderBeam(
      <BorderBeam>
        <span>低动态</span>
      </BorderBeam>,
      "always",
    );
    const root = container.firstElementChild as HTMLElement;
    expect(root).toHaveAttribute("data-motion", "static");
    expect(screen.getByText("低动态")).toBeInTheDocument();
  });
});
