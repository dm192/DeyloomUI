import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "./select";
import { Field } from "../field";
import { DeyloomProvider } from "../../../provider";

function renderWithProvider(ui: React.ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

function BasicSelect(props: {
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  disabled?: boolean;
}) {
  return (
    <Select
      defaultValue={props.defaultValue}
      onValueChange={props.onValueChange}
      disabled={props.disabled}
    >
      <SelectTrigger aria-label="选项">
        <SelectValue placeholder="请选择" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>常用</SelectLabel>
          <SelectItem value="a">选项 A</SelectItem>
          <SelectItem value="b">选项 B</SelectItem>
          <SelectSeparator />
          <SelectItem value="c" disabled>
            选项 C
          </SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  );
}

describe("Select", () => {
  it("shows the placeholder, opens the listbox and commits a choice", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithProvider(<BasicSelect onValueChange={onValueChange} />);

    const trigger = screen.getByRole("combobox", { name: "选项" });
    expect(trigger).toHaveTextContent("请选择");

    await user.click(trigger);
    const listbox = await screen.findByRole("listbox");
    expect(listbox).toBeInTheDocument();
    expect(screen.getAllByRole("option")).toHaveLength(3);

    await user.click(screen.getByRole("option", { name: "选项 B" }));
    expect(onValueChange).toHaveBeenCalledWith("b");
    expect(trigger).toHaveTextContent("选项 B");
  });

  it("renders a default value's label through SelectValue", () => {
    renderWithProvider(<BasicSelect defaultValue="a" />);
    expect(screen.getByRole("combobox", { name: "选项" })).toHaveTextContent("选项 A");
  });

  it("does not commit a disabled option", async () => {
    const user = userEvent.setup();
    const onValueChange = vi.fn();
    renderWithProvider(<BasicSelect onValueChange={onValueChange} />);

    await user.click(screen.getByRole("combobox", { name: "选项" }));
    const option = await screen.findByRole("option", { name: "选项 C" });
    expect(option).toHaveAttribute("aria-disabled", "true");

    await user.click(option);
    expect(onValueChange).not.toHaveBeenCalled();
  });

  it("wires invalid and description state from a Field", async () => {
    const user = userEvent.setup();
    renderWithProvider(
      <Field label="城市" hint="用于配送" error="请选择城市">
        <Select>
          <SelectTrigger>
            <SelectValue placeholder="选择城市" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="sh">上海</SelectItem>
          </SelectContent>
        </Select>
      </Field>,
    );

    const trigger = screen.getByRole("combobox", { name: /城市/ });
    expect(trigger).toHaveAttribute("aria-invalid", "true");
    expect((trigger.getAttribute("aria-describedby") ?? "").split(" ")).toHaveLength(2);

    await user.click(trigger);
    expect(await screen.findByRole("listbox")).toBeInTheDocument();
  });

  it("reports disabled state on the trigger", () => {
    renderWithProvider(<BasicSelect disabled />);
    expect(screen.getByRole("combobox", { name: "选项" })).toBeDisabled();
  });
});
