import { afterEach, describe, expect, it, vi } from "vitest";
import * as React from "react";
import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Toaster, toast } from "./toaster";
import { DeyloomProvider } from "../../provider";

function renderWithProvider(ui: React.ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

afterEach(() => {
  act(() => {
    toast.dismiss();
  });
});

describe("Toaster", () => {
  it("shows a toast queued through the imperative API", async () => {
    renderWithProvider(<Toaster position="top-right" />);

    act(() => {
      toast({ title: "保存成功", description: "同步完成" });
    });

    expect(await screen.findByText("保存成功")).toBeInTheDocument();
    expect(screen.getByText("同步完成")).toBeInTheDocument();
    expect(document.querySelector(".dl-toaster--top-right")).not.toBeNull();
  });

  it("dismisses by id and drops the node after the exit tween", async () => {
    renderWithProvider(<Toaster />);

    let id = "";
    act(() => {
      id = toast({ title: "已删除" });
    });
    await screen.findByText("已删除");

    act(() => {
      toast.dismiss(id);
    });
    // AnimatePresence must hold the node while the exit tween plays…
    expect(screen.queryByText("已删除")).toBeInTheDocument();
    // …then drop it.
    await waitFor(() => expect(screen.queryByText("已删除")).not.toBeInTheDocument());
  });

  it("renders a named close button when requested", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Toaster closeButton />);

    act(() => {
      toast({ title: "关闭我" });
    });

    const close = await screen.findByRole("button", { name: "Close" });
    await user.click(close);
    await waitFor(() => expect(screen.queryByText("关闭我")).not.toBeInTheDocument());
  });

  it("runs the action handler and keeps variant data on the card", async () => {
    const user = userEvent.setup();
    const onClick = vi.fn();
    renderWithProvider(<Toaster />);

    act(() => {
      toast({ title: "发布失败", variant: "danger", action: { label: "重试", onClick } });
    });

    const action = await screen.findByRole("button", { name: "重试" });
    expect(document.querySelector(".dl-toast")).toHaveAttribute("data-variant", "danger");
    await user.click(action);
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("survives StrictMode double rendering (as used by the docs app)", async () => {
    render(
      <React.StrictMode>
        <DeyloomProvider reducedMotion="always">
          <Toaster />
        </DeyloomProvider>
      </React.StrictMode>,
    );

    act(() => {
      toast({ title: "严格模式" });
    });

    expect(await screen.findByText("严格模式")).toBeInTheDocument();
  });
});
