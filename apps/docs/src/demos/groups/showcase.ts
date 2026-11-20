import { defineDemos } from "../types";
import { staggerListDemo } from "../stagger-list";
import { numberFlowDemo } from "../number-flow";
import { spotlightCardDemo } from "../spotlight-card";
import { borderBeamDemo } from "../border-beam";
import { marqueeDemo } from "../marquee";

// Owned by the showcase-motion workstream. Append one entry per component.
export const showcaseDemos: ReturnType<typeof defineDemos> = defineDemos([
  staggerListDemo,
  numberFlowDemo,
  spotlightCardDemo,
  borderBeamDemo,
  marqueeDemo,
]);
