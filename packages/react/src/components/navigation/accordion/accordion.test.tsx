import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "./accordion";
import { DeyloomProvider } from "../../../provider";

function renderWithProvider(ui: ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

function BasicAccordion(props: { collapsible?: boolean }) {
  return (
    <Accordion type="single" collapsible={props.collapsible ?? true}>
      <AccordionItem value="shipping">
        <AccordionTrigger>配送需要多久？</AccordionTrigger>
        <AccordionContent>通常 2–3 个工作日送达。</AccordionContent>
      </AccordionItem>
      <AccordionItem value="returns">
        <AccordionTrigger>可以退货吗？</AccordionTrigger>
        <AccordionContent>签收后 14 天内支持无理由退货。</AccordionContent>
      </AccordionItem>
      <AccordionItem value="disabled" disabled>
        <AccordionTrigger>企业采购</AccordionTrigger>
        <AccordionContent>请联系统一采购渠道。</AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

describe("Accordion", () => {
  it("renders collapsed rows with the ARIA expanded state", () => {
    renderWithProvider(<BasicAccordion />);

    const trigger = screen.getByRole("button", { name: "配送需要多久？" });
    expect(trigger).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByText("通常 2–3 个工作日送达。")).not.toBeInTheDocument();
  });

  it("opens a panel on click and toggles it closed again", async () => {
    const user = userEvent.setup();
    renderWithProvider(<BasicAccordion />);

    const trigger = screen.getByRole("button", { name: "配送需要多久？" });
    await user.click(trigger);

    expect(trigger).toHaveAttribute("aria-expanded", "true");
    expect(trigger).toHaveAttribute("aria-controls");
    expect(await screen.findByText("通常 2–3 个工作日送达。")).toBeInTheDocument();

    await user.click(trigger);
    await waitFor(() => expect(trigger).toHaveAttribute("aria-expanded", "false"));
    await waitFor(() =>
      expect(screen.queryByText("通常 2–3 个工作日送达。")).not.toBeInTheDocument(),
    );
  });

  it("keeps only one panel open in single mode", async () => {
    const user = userEvent.setup();
    renderWithProvider(<BasicAccordion />);

    await user.click(screen.getByRole("button", { name: "配送需要多久？" }));
    await screen.findByText("通常 2–3 个工作日送达。");

    await user.click(screen.getByRole("button", { name: "可以退货吗？" }));

    expect(screen.getByRole("button", { name: "可以退货吗？" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", { name: "配送需要多久？" }),
      ).toHaveAttribute("aria-expanded", "false"),
    );
  });

  it("ignores disabled items", async () => {
    const user = userEvent.setup();
    renderWithProvider(<BasicAccordion />);

    const disabled = screen.getByRole("button", { name: "企业采购" });
    expect(disabled).toBeDisabled();
    await user.click(disabled);
    expect(disabled).toHaveAttribute("aria-expanded", "false");
  });

  it("opens several panels when type is multiple", async () => {
    renderWithProvider(
      <Accordion type="multiple" defaultValue={["a", "b"]}>
        <AccordionItem value="a">
          <AccordionTrigger>第一项</AccordionTrigger>
          <AccordionContent>第一段内容</AccordionContent>
        </AccordionItem>
        <AccordionItem value="b">
          <AccordionTrigger>第二项</AccordionTrigger>
          <AccordionContent>第二段内容</AccordionContent>
        </AccordionItem>
      </Accordion>,
    );

    expect(screen.getByText("第一段内容")).toBeInTheDocument();
    expect(screen.getByText("第二段内容")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "第一项" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
  });
});
