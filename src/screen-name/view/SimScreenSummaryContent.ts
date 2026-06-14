/**
 * SimScreenSummaryContent.ts
 *
 * Accessible screen summary (SceneryStack Interactive Description) for the Doppler
 * Effect screen. Describes the play area and controls, gives an interaction hint,
 * and exposes a LIVE "current details" paragraph derived from the model (emitted
 * and observed frequencies and the play/pause state).
 *
 * Follows the OpenPhysics accessibility convention; see the canonical
 * TemplateSingleSim/SimScreenSummaryContent.ts.
 */
import { DerivedProperty } from "scenerystack/axon";
import { StringUtils } from "scenerystack/phetcommon";
import { ScreenSummaryContent } from "scenerystack/sim";
import { StringManager } from "../../i18n/StringManager";
import type { SimModel } from "../model/SimModel";

export class SimScreenSummaryContent extends ScreenSummaryContent {
  public constructor(model: SimModel) {
    const a11y = StringManager.getInstance().getA11yStrings();

    const currentDetailsProperty = new DerivedProperty(
      [
        a11y.currentDetailsStringProperty,
        a11y.playingLabelStringProperty,
        a11y.pausedLabelStringProperty,
        model.emittedFrequencyProperty,
        model.observedFrequencyProperty,
        model.playProperty,
      ],
      (template, playingLabel, pausedLabel, emitted, observed, playing) =>
        StringUtils.fillIn(template, {
          emitted: emitted.toFixed(1),
          observed: observed.toFixed(1),
          state: playing ? playingLabel : pausedLabel,
        }),
    );

    super({
      playAreaContent: a11y.screenSummary.playAreaStringProperty,
      controlAreaContent: a11y.screenSummary.controlAreaStringProperty,
      currentDetailsContent: currentDetailsProperty,
      interactionHintContent: a11y.screenSummary.interactionHintStringProperty,
    });
  }
}
