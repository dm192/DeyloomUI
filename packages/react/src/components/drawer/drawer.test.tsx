import { describe, expect, it } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Drawer, DrawerClose, DrawerContent, DrawerDescription, DrawerTitle, DrawerTrigger } from "./drawer";
import { Button } from "../button";
import { DeyloomProvider } from "../../provider";
import type { DrawerSide } from "./drawer";

function renderWithProvider(ui: React.ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

function Fixture(props: { side?: DrawerSide }) {
  return (
    <Drawer>
      <DrawerTrigger asChild>
        <Button>打开抽屉</Button>
      </DrawerTrigger>
      <DrawerContent side={props.side}>
        <DrawerTitle>筛选</DrawerTitle>
        <DrawerDescription>选择要显示的任务。</DrawerDescription>
        <DrawerClose asChild>
          <Button variant="soft">取消</Button>
        </DrawerClose>
      </DrawerContent>
    </Drawer>
  );
}

describe("Drawer", () => {
  it("portals an edge panel and exposes its side", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Fixture />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "打开抽屉" }));

    const panel = await screen.findByRole("dialog", { name: "筛选" });
    expect(panel).toHaveClass("dl-drawer__panel");
    expect(panel).toHaveAttribute("data-side", "right");
    expect(document.querySelector(".dl-drawer__backdrop")).not.toBeNull();
  });

  it("renders on the requested edge", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Fixture side="bottom" />);
    await user.click(screen.getByRole("button", { name: "打开抽屉" }));
    expect(await screen.findByRole("dialog")).toHaveAttribute("data-side", "bottom");
  });

  it("closes on Escape and returns focus to the trigger", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Fixture side="left" />);

    const trigger = screen.getByRole("button", { name: "打开抽屉" });
    await user.click(trigger);
    await screen.findByRole("dialog");

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
  });
});
