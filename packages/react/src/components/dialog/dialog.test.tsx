import { describe, expect, it } from "vitest";
import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Dialog, DialogClose, DialogContent, DialogDescription, DialogTitle, DialogTrigger } from "./dialog";
import { Button } from "../button";
import { DeyloomProvider } from "../../provider";

function renderWithProvider(ui: React.ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

function Fixture(props: { size?: "sm" | "md" | "lg"; showCloseButton?: boolean }) {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button>打开</Button>
      </DialogTrigger>
      <DialogContent size={props.size} showCloseButton={props.showCloseButton}>
        <DialogTitle>设置</DialogTitle>
        <DialogDescription>调整工作区偏好。</DialogDescription>
        <DialogClose asChild>
          <Button variant="soft">完成</Button>
        </DialogClose>
      </DialogContent>
    </Dialog>
  );
}

describe("Dialog", () => {
  it("portals the content into the document when opened", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Fixture />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "打开" }));

    const dialog = await screen.findByRole("dialog");
    expect(dialog).toBeInTheDocument();
    expect(screen.getByText("设置")).toBeInTheDocument();
    expect(dialog).toHaveClass("dl-dialog__panel");
    expect(document.querySelector(".dl-dialog__backdrop")).not.toBeNull();
  });

  it("labels the dialog through DialogTitle and closes on Escape", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Fixture />);

    await user.click(screen.getByRole("button", { name: "打开" }));
    const dialog = await screen.findByRole("dialog", { name: "设置" });
    expect(dialog).toBeInTheDocument();

    await user.keyboard("{Escape}");
    // AnimatePresence keeps the portal mounted while the 140ms exit tween runs.
    expect(screen.queryByRole("dialog")).toBeInTheDocument();
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
  });

  it("returns focus to the trigger after closing", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Fixture />);

    const trigger = screen.getByRole("button", { name: "打开" });
    await user.click(trigger);
    await screen.findByRole("dialog");

    await user.keyboard("{Escape}");
    await waitFor(() => expect(trigger).toHaveFocus());
  });

  it("renders the standard close button and hides it on request", async () => {
    const user = userEvent.setup();
    const { unmount } = renderWithProvider(<Fixture showCloseButton />);

    await user.click(screen.getByRole("button", { name: "打开" }));
    const close = await screen.findByRole("button", { name: "Close" });
    await user.click(close);
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());

    unmount();
    renderWithProvider(<Fixture showCloseButton={false} />);
    await user.click(screen.getByRole("button", { name: "打开" }));
    await screen.findByRole("dialog");
    expect(screen.queryByRole("button", { name: "Close" })).not.toBeInTheDocument();
  });

  it("exposes its size as a data attribute", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Fixture size="lg" />);
    await user.click(screen.getByRole("button", { name: "打开" }));
    expect(await screen.findByRole("dialog")).toHaveAttribute("data-size", "lg");
  });

  it("opens under StrictMode (as used by the docs app)", async () => {
    const user = userEvent.setup();
    render(
      <React.StrictMode>
        <DeyloomProvider reducedMotion="always">
          <Fixture />
        </DeyloomProvider>
      </React.StrictMode>,
    );

    await user.click(screen.getByRole("button", { name: "打开" }));
    expect(await screen.findByRole("dialog")).toBeInTheDocument();
  });
});
