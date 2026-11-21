import { defineDemos } from "../types";
import { accordionDemo } from "../accordion";
import { avatarDemo } from "../avatar";
import { badgeDemo } from "../badge";
import { cardDemo } from "../card";
import { dropdownMenuDemo } from "../dropdown-menu";
import { popoverDemo } from "../popover";
import { scrollAreaDemo } from "../scroll-area";
import { separatorDemo } from "../separator";
import { tabsDemo } from "../tabs";
import { tooltipDemo } from "../tooltip";

export const navigationDemos: ReturnType<typeof defineDemos> = defineDemos([
  ...accordionDemo,
  ...avatarDemo,
  ...badgeDemo,
  ...cardDemo,
  ...tabsDemo,
  ...tooltipDemo,
  ...popoverDemo,
  ...dropdownMenuDemo,
  ...scrollAreaDemo,
  ...separatorDemo,
]);
