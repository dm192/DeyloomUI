import { describe, expect, it } from "vitest";
import { act, render, screen } from "@testing-library/react";
import { Avatar, AvatarFallback, AvatarGroup, AvatarImage } from "./avatar";

/**
 * Radix Avatar loads its source through a detached `new Image()`, which jsdom
 * never resolves. Swap in a controllable fake so the loaded path is testable.
 */
function stubImageLoading() {
  const OriginalImage = window.Image;
  let loadHandler: ((event: { currentTarget: unknown }) => void) | undefined;
  const image = {
    complete: false,
    naturalWidth: 0,
    referrerPolicy: "",
    crossOrigin: null as string | null,
    addEventListener(type: string, handler: (event: { currentTarget: unknown }) => void) {
      if (type === "load") loadHandler = handler;
    },
    removeEventListener() {},
  };

  window.Image = function FakeImage() {
    return image;
  } as unknown as typeof Image;

  return {
    finish() {
      image.complete = true;
      image.naturalWidth = 8;
      loadHandler?.({ currentTarget: image });
    },
    restore() {
      window.Image = OriginalImage;
    },
  };
}

describe("Avatar", () => {
  it("derives readable initials from a name for the fallback", () => {
    render(
      <Avatar size="sm">
        <AvatarFallback name="Ada Lovelace" />
      </Avatar>,
    );

    const fallback = screen.getByText("AL");
    expect(fallback).toHaveClass("dl-avatar__fallback");
    expect(fallback.closest(".dl-avatar")).toHaveAttribute("data-size", "sm");
  });

  it("swaps the fallback for a fading image once the source loads", async () => {
    const controller = stubImageLoading();
    try {
      render(
        <Avatar size="lg">
          <AvatarImage src="https://example.com/ada.png" alt="Ada Lovelace" />
          <AvatarFallback name="Ada Lovelace" />
        </Avatar>,
      );

      expect(screen.getByText("AL")).toBeInTheDocument();
      expect(screen.queryByRole("img", { name: "Ada Lovelace" })).not.toBeInTheDocument();

      await act(async () => {
        controller.finish();
      });

      const image = screen.getByRole("img", { name: "Ada Lovelace" });
      expect(image).toHaveClass("dl-avatar__image");
      expect(image).toHaveAttribute("data-status", "loaded");
      expect(screen.queryByText("AL")).not.toBeInTheDocument();
    } finally {
      controller.restore();
    }
  });

  it("collapses avatars past max into an accessible +N chip", () => {
    render(
      <AvatarGroup max={2} size="sm">
        <Avatar>
          <AvatarFallback>甲</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>乙</AvatarFallback>
        </Avatar>
        <Avatar>
          <AvatarFallback>丙</AvatarFallback>
        </Avatar>
      </AvatarGroup>,
    );

    const group = screen.getByText("甲").closest(".dl-avatar-group");
    expect(group).toHaveAttribute("data-size", "sm");
    expect(screen.getByText("乙")).toBeInTheDocument();
    expect(screen.queryByText("丙")).not.toBeInTheDocument();
    expect(screen.getByRole("img", { name: "还有 1 个头像" })).toHaveTextContent("+1");
  });
});
