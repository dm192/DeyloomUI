import { defineDemos } from "../types";
import { checkboxDemo } from "../checkbox";
import { fieldDemo } from "../field";
import { inputDemo } from "../input";
import { radioGroupDemo } from "../radio-group";
import { segmentedControlDemo } from "../segmented-control";
import { selectDemo } from "../select";
import { sliderDemo } from "../slider";
import { switchDemo } from "../switch";
import { textareaDemo } from "../textarea";

// Owned by the form-controls workstream. Append one entry per component.
export const formDemos: ReturnType<typeof defineDemos> = defineDemos([
  fieldDemo,
  inputDemo,
  textareaDemo,
  checkboxDemo,
  radioGroupDemo,
  switchDemo,
  sliderDemo,
  selectDemo,
  segmentedControlDemo,
]);
