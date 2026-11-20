import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { Field } from "./field";
import { Input } from "../input";
import { DeyloomProvider } from "../../../provider";

function renderWithProvider(ui: React.ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

describe("Field", () => {
  it("associates its label with the control and exposes hint and error ids", () => {
    renderWithProvider(
      <Field label="邮箱" hint="用于接收通知。" error="邮箱格式不正确。">
        <Input />
      </Field>,
    );

    const input = screen.getByRole("textbox", { name: /邮箱/ });
    expect(input).toHaveAttribute("aria-invalid", "true");
    expect(input).toHaveAttribute("aria-describedby");

    const label = screen.getByText("邮箱").closest("label");
    expect(label).toHaveAttribute("for", input.getAttribute("id") ?? "");

    const describedBy = (input.getAttribute("aria-describedby") ?? "").split(" ");
    expect(describedBy).toHaveLength(2);
    describedBy.forEach((id) => expect(document.getElementById(id)).not.toBeNull());

    expect(screen.getByRole("alert")).toHaveTextContent("邮箱格式不正确。");
    expect(screen.getByText("用于接收通知。")).toBeInTheDocument();
  });

  it("collapses the error row when the error disappears", () => {
    const { rerender } = renderWithProvider(
      <Field label="用户名" error="不能为空。">
        <Input />
      </Field>,
    );

    const field = document.querySelector(".dl-field");
    expect(field).toHaveAttribute("data-invalid", "true");
    expect(document.querySelector(".dl-field__error-row")).toHaveAttribute(
      "data-expanded",
      "true",
    );

    rerender(
      <DeyloomProvider reducedMotion="always">
        <Field label="用户名">
          <Input />
        </Field>
      </DeyloomProvider>,
    );

    expect(screen.queryByRole("alert")).toBeNull();
    expect(document.querySelector(".dl-field")).not.toHaveAttribute("data-invalid");
    expect(document.querySelector(".dl-field__error-row")).toHaveAttribute(
      "data-expanded",
      "false",
    );
  });

  it("marks required fields without leaking the asterisk to screen readers", () => {
    renderWithProvider(
      <Field label="密码" required>
        <Input type="password" />
      </Field>,
    );

    const input = screen.getByLabelText(/密码/);
    expect(input).toBeRequired();

    const asterisk = document.querySelector(".dl-field__required");
    expect(asterisk).toHaveAttribute("aria-hidden", "true");
  });

  it("passes disabled down and honours an explicit htmlFor", () => {
    renderWithProvider(
      <Field label="租户" disabled htmlFor="tenant-input">
        <Input />
      </Field>,
    );

    const input = screen.getByRole("textbox", { name: /租户/ });
    expect(input).toHaveAttribute("id", "tenant-input");
    expect(input).toBeDisabled();
    expect(document.querySelector(".dl-field")).toHaveAttribute(
      "data-disabled",
      "true",
    );
  });
});
