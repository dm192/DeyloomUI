import { defineDemos } from "../types";
import { dialogDemo } from "../dialog";
import { drawerDemo } from "../drawer";
import { toasterDemo } from "../toaster";
import { progressDemo } from "../progress";
import { skeletonDemo } from "../skeleton";

// Owned by the overlays workstream. Append one entry per component.
export const overlayDemos: ReturnType<typeof defineDemos> = defineDemos([
  dialogDemo,
  drawerDemo,
  toasterDemo,
  progressDemo,
  skeletonDemo,
]);
