import type { ReactNode } from "react";
import * as React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "./dropdown-menu";
import { DeyloomProvider } from "../../../provider";

function renderWithProvider(ui: ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

function FileMenu(props: { onSelect?: (event: Event) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>文件操作</DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuLabel>文件</DropdownMenuLabel>
        <DropdownMenuItem onSelect={props.onSelect}>
          重命名
          <DropdownMenuShortcut>⌘R</DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem inset disabled>
          删除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

describe("DropdownMenu", () => {
  it("opens on click with the expected menu semantics", async () => {
    const user = userEvent.setup();
    renderWithProvider(<FileMenu />);

    const trigger = screen.getByRole("button", { name: "文件操作" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");

    await user.click(trigger);
    const menu = await screen.findByRole("menu");
    expect(menu).toHaveClass("dl-dropdown-menu");
    expect(screen.getByText("文件")).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: /重命名/ })).toBeInTheDocument();
    expect(screen.getByRole("menuitem", { name: "删除" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    expect(screen.getByText("⌘R")).toHaveAttribute("aria-hidden", "true");
  });

  it("selects the highlighted item with the keyboard and closes", async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithProvider(<FileMenu onSelect={onSelect} />);

    await user.click(screen.getByRole("button", { name: "文件操作" }));
    await screen.findByRole("menu");

    await user.keyboard("{ArrowDown}");
    const item = screen.getByRole("menuitem", { name: /重命名/ });
    expect(item).toHaveAttribute("data-highlighted");

    await user.keyboard("{Enter}");
    expect(onSelect).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
  });

  it("ignores disabled items", async () => {
    const user = userEvent.setup();
    renderWithProvider(<FileMenu />);

    await user.click(screen.getByRole("button", { name: "文件操作" }));
    await screen.findByRole("menu");

    await user.click(screen.getByRole("menuitem", { name: "删除" }));
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });

  it("toggles checkbox items without closing the menu", async () => {
    const user = userEvent.setup();
    function CheckboxMenu() {
      const [checked, setChecked] = React.useState(true);
      return (
        <DropdownMenu>
          <DropdownMenuTrigger>显示选项</DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuCheckboxItem checked={checked} onCheckedChange={setChecked}>
              显示网格
            </DropdownMenuCheckboxItem>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }
    renderWithProvider(<CheckboxMenu />);

    await user.click(screen.getByRole("button", { name: "显示选项" }));
    const item = await screen.findByRole("menuitemcheckbox", { name: "显示网格" });
    expect(item).toHaveAttribute("aria-checked", "true");

    await user.click(item);
    await waitFor(() =>
      expect(screen.getByRole("menuitemcheckbox")).toHaveAttribute("aria-checked", "false"),
    );
    expect(screen.getByRole("menu")).toBeInTheDocument();
  });
});
