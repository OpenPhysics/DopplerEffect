/**
 * DopplerEffectPanel.ts
 *
 * A pre-themed Panel that automatically uses DopplerEffectColors for background and
 * border. Use this for all control panels and info boxes in the sim so that
 * default / projector mode switching is handled automatically.
 *
 * ── Basic usage ───────────────────────────────────────────────────────────────
 *
 *   import { DopplerEffectPanel } from "../../common/DopplerEffectPanel.js";
 *   import { VBox, Text } from "scenerystack/scenery";
 *
 *   const content = new VBox({
 *     children: [ new Text("label"), slider ],
 *     spacing: 8,
 *   });
 *   const panel = new DopplerEffectPanel(content);
 *
 * ── Overriding defaults ───────────────────────────────────────────────────────
 *
 *   // Wider margins, sharper corners, custom stroke
 *   const panel = new DopplerEffectPanel(content, { xMargin: 20, cornerRadius: 0 });
 *
 *   // Transparent background (decorative border only)
 *   const panel = new DopplerEffectPanel(content, { fill: "transparent" });
 */

import { type EmptySelfOptions, optionize } from "scenerystack/phet-core";
import type { Node } from "scenerystack/scenery";
import { Panel, type PanelOptions } from "scenerystack/sun";
import DopplerEffectColors from "../DopplerEffectColors.js";
import { PANEL_CORNER_RADIUS } from "../DopplerEffectConstants.js";

export type DopplerEffectPanelOptions = PanelOptions;

export class DopplerEffectPanel extends Panel {
  public constructor(content: Node, providedOptions?: DopplerEffectPanelOptions) {
    const options = optionize<DopplerEffectPanelOptions, EmptySelfOptions, PanelOptions>()(
      {
        fill: DopplerEffectColors.panelBackgroundColorProperty,
        stroke: DopplerEffectColors.panelBorderColorProperty,
        cornerRadius: PANEL_CORNER_RADIUS,
        xMargin: 12,
        yMargin: 10,
      },
      providedOptions,
    );
    super(content, options);
  }
}
