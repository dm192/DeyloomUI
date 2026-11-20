import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
  Drawer,
  DrawerContent,
  DrawerTitle,
  DrawerTrigger,
  Progress,
  Skeleton,
  Toaster,
  toast,
} from ".";
import { Button } from "../button";
import { DeyloomProvider } from "../../provider";

function renderWithProvider(ui: React.ReactNode) {
  return render(<DeyloomProvider reducedMotion="always">{ui}</DeyloomProvider>);
}

/**
 * Barrel smoke test: every overlay component must be importable from the group
 * entry point without naming collisions.
 */
describe("overlay barrel", () => {
  it("exports the five overlay components", () => {
    expect(typeof Dialog).toBe("function");
    expect(typeof DialogContent).toBe("function");
    expect(typeof DialogTitle).toBe("function");
    expect(typeof DialogTrigger).toBe("object");
    expect(typeof Drawer).toBe("function");
    expect(typeof DrawerContent).toBe("function");
    expect(typeof DrawerTitle).toBe("function");
    expect(typeof DrawerTrigger).toBe("object");
    expect(typeof Progress).toBe("function");
    expect(typeof Skeleton).toBe("function");
    expect(typeof Toaster).toBe("function");
    expect(typeof toast).toBe("function");
    expect(typeof toast.dismiss).toBe("function");
  });

  it("renders the passive pieces together", () => {
    renderWithProvider(
      <>
        <Progress value={50} label="同步" showValue />
        <Skeleton lines={2} />
      </>,
    );
    expect(screen.getByRole("progressbar")).toHaveAttribute("aria-valuenow", "50");
    expect(screen.getByText("同步")).toBeInTheDocument();
  });

  it("wires a trigger through the group barrel", () => {
    renderWithProvider(
      <Drawer>
        <DrawerTrigger asChild>
          <Button>打开</Button>
        </DrawerTrigger>
        <DrawerContent>
          <DrawerTitle>筛选</DrawerTitle>
        </DrawerContent>
      </Drawer>,
    );
    expect(screen.getByRole("button", { name: "打开" })).toBeInTheDocument();
  });
});
