import { describe, expect, it, vi } from "vitest";
import type { ReactNode } from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./hover-card";
import { Button } from "../button";
import { DeyloomProvider } from "../../provider";

function renderWithProvider(ui: ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

function ProfileCard(props: { open?: boolean; className?: string; arrow?: boolean }) {
  return (
    <HoverCard open={props.open} openDelay={0} closeDelay={0}>
      <HoverCardTrigger>Ada Lovelace</HoverCardTrigger>
      <HoverCardContent className={props.className} arrow={props.arrow}>
        <p>第一位程序员，1843 年为分析机写下算法。</p>
      </HoverCardContent>
    </HoverCard>
  );
}

describe("HoverCard", () => {
  it("opens on hover after the configured delay", async () => {
    const user = userEvent.setup();
    renderWithProvider(<ProfileCard />);

    expect(document.querySelector(".dl-hover-card")).toBeNull();
    await user.hover(screen.getByRole("button", { name: "Ada Lovelace" }));

    await waitFor(() => expect(document.querySelector(".dl-hover-card")).not.toBeNull());
    expect(screen.getByText(/第一位程序员/)).toBeInTheDocument();
  });

  it("opens when the trigger receives keyboard focus", async () => {
    const user = userEvent.setup();
    renderWithProvider(<ProfileCard />);

    await user.tab();
    expect(document.activeElement).toBe(screen.getByRole("button", { name: "Ada Lovelace" }));

    await waitFor(() => expect(document.querySelector(".dl-hover-card")).not.toBeNull());
    expect(screen.getByText(/第一位程序员/)).toBeInTheDocument();
  });

  it("closes on Escape without moving focus", async () => {
    const user = userEvent.setup();
    renderWithProvider(<ProfileCard />);

    await user.tab();
    await waitFor(() => expect(document.querySelector(".dl-hover-card")).not.toBeNull());

    await user.keyboard("{Escape}");
    await waitFor(() => expect(document.querySelector(".dl-hover-card")).toBeNull());
    expect(screen.getByRole("button", { name: "Ada Lovelace" })).toHaveFocus();
  });

  it("renders a real button trigger and reports its state", async () => {
    const user = userEvent.setup();
    renderWithProvider(<ProfileCard />);

    const trigger = screen.getByRole("button", { name: "Ada Lovelace" });
    expect(trigger.tagName).toBe("BUTTON");
    expect(trigger).toHaveAttribute("type", "button");
    expect(trigger).toHaveClass("dl-hover-card__trigger", "dl-focusable");
    expect(trigger).toHaveAttribute("data-state", "closed");

    await user.tab();
    await waitFor(() => expect(trigger).toHaveAttribute("data-state", "open"));
  });

  it("slots onto a custom trigger with asChild", () => {
    renderWithProvider(
      <HoverCard openDelay={0}>
        <HoverCardTrigger asChild>
          <Button variant="link">Grace Hopper</Button>
        </HoverCardTrigger>
        <HoverCardContent>COBOL 的发明者。</HoverCardContent>
      </HoverCard>,
    );

    const triggers = screen.getAllByRole("button", { name: "Grace Hopper" });
    expect(triggers).toHaveLength(1);
    expect(triggers[0]).toHaveClass("dl-btn");
  });

  it("passes className through and renders the optional arrow", () => {
    renderWithProvider(<ProfileCard open className="custom-card" arrow />);

    const card = document.querySelector(".dl-hover-card");
    expect(card).toHaveClass("custom-card");
    expect(document.querySelector(".dl-hover-card__arrow")).not.toBeNull();
    expect(screen.getByText(/第一位程序员/)).toBeInTheDocument();
  });

  it("reports close requests while controlled", async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    renderWithProvider(
      <HoverCard open openDelay={0} closeDelay={0} onOpenChange={onOpenChange}>
        <HoverCardTrigger>Ada Lovelace</HoverCardTrigger>
        <HoverCardContent>受控内容</HoverCardContent>
      </HoverCard>,
    );

    await waitFor(() => expect(document.querySelector(".dl-hover-card")).not.toBeNull());
    await user.keyboard("{Escape}");
    expect(onOpenChange).toHaveBeenCalledWith(false);
  });
});
