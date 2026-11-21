import { describe, expect, it, vi } from "vitest";
import * as React from "react";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "./alert-dialog";
import { Button } from "../button";
import { DeyloomProvider } from "../../provider";

function renderWithProvider(ui: React.ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

function Fixture(props: { onConfirm?: () => void }) {
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" tone="danger">
          删除项目
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogTitle>删除项目？</AlertDialogTitle>
        <AlertDialogDescription>
          项目及其 24 个页面会被永久删除，此操作无法撤销。
        </AlertDialogDescription>
        <div className="dl-alert-dialog__actions">
          <AlertDialogCancel>保留项目</AlertDialogCancel>
          <AlertDialogAction onClick={props.onConfirm}>删除</AlertDialogAction>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}

describe("AlertDialog", () => {
  it("warns once in development when the panel has no title", async () => {
    const warn = vi.spyOn(console, "warn").mockImplementation(() => {});
    renderWithProvider(
      <AlertDialog defaultOpen>
        <AlertDialogContent>
          <AlertDialogDescription>没有标题的确认面板。</AlertDialogDescription>
        </AlertDialogContent>
      </AlertDialog>,
    );

    await screen.findByRole("alertdialog");
    await waitFor(() =>
      expect(
        warn.mock.calls.some(([message]) => String(message).includes("AlertDialogTitle")),
      ).toBe(true),
    );
  });

  it("opens as an alertdialog named and described by Title/Description", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Fixture />);

    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "删除项目" }));

    const dialog = await screen.findByRole("alertdialog", { name: "删除项目？" });
    expect(dialog).toHaveClass("dl-alert-dialog__panel");
    expect(dialog).toHaveAccessibleDescription(
      "项目及其 24 个页面会被永久删除，此操作无法撤销。",
    );

    const labelledBy = dialog.getAttribute("aria-labelledby");
    const describedBy = dialog.getAttribute("aria-describedby");
    expect(labelledBy).toBeTruthy();
    expect(describedBy).toBeTruthy();
    expect(document.getElementById(labelledBy ?? "")).toHaveTextContent("删除项目？");
    expect(document.getElementById(describedBy ?? "")).toHaveTextContent("此操作无法撤销");
    expect(document.querySelector(".dl-alert-dialog__backdrop")).not.toBeNull();
  });

  it("closes on Escape", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Fixture />);

    await user.click(screen.getByRole("button", { name: "删除项目" }));
    await screen.findByRole("alertdialog");

    await user.keyboard("{Escape}");
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });

  it("closes from Cancel without calling the confirm handler", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderWithProvider(<Fixture onConfirm={onConfirm} />);

    await user.click(screen.getByRole("button", { name: "删除项目" }));
    await screen.findByRole("alertdialog");

    await user.click(screen.getByRole("button", { name: "保留项目" }));
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    expect(onConfirm).not.toHaveBeenCalled();
  });

  it("runs the action onClick and then closes", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    renderWithProvider(<Fixture onConfirm={onConfirm} />);

    await user.click(screen.getByRole("button", { name: "删除项目" }));
    await screen.findByRole("alertdialog");

    const action = screen.getByRole("button", { name: "删除" });
    expect(action).toHaveAttribute("data-variant", "solid");
    expect(action).toHaveAttribute("data-tone", "danger");

    await user.click(action);
    expect(onConfirm).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
  });

  it("renders Cancel as an outline neutral button and supports an accent action", async () => {
    const user = userEvent.setup();
    renderWithProvider(<Fixture />);

    await user.click(screen.getByRole("button", { name: "删除项目" }));
    await screen.findByRole("alertdialog");

    const cancel = screen.getByRole("button", { name: "保留项目" });
    expect(cancel).toHaveAttribute("data-variant", "outline");
    expect(cancel).toHaveAttribute("data-tone", "neutral");
  });

  it("accepts tone=\"accent\" for non-destructive confirmations", async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <AlertDialog>
        <AlertDialogTrigger asChild>
          <Button variant="soft">覆盖版本</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogTitle>覆盖已发布的 0.1.8？</AlertDialogTitle>
          <AlertDialogDescription>旧版本仍可从版本历史里恢复。</AlertDialogDescription>
          <div className="dl-alert-dialog__actions">
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction tone="accent">覆盖</AlertDialogAction>
          </div>
        </AlertDialogContent>
      </AlertDialog>,
    );

    await user.click(screen.getByRole("button", { name: "覆盖版本" }));
    await screen.findByRole("alertdialog");

    const action = screen.getByRole("button", { name: "覆盖" });
    expect(action).toHaveAttribute("data-tone", "accent");
    expect(action).toHaveAttribute("data-variant", "solid");
  });
});
