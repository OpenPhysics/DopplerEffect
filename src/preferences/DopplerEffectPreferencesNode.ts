/**
 * DopplerEffectPreferencesNode.ts
 *
 * Custom preferences UI shown in Preferences → Simulation. Controls are bound to
 * DopplerEffectPreferencesModel Properties (initial values from query parameters).
 */

import { Text, VBox } from "scenerystack/scenery";
import { PhetFont } from "scenerystack/scenery-phet";
import { Checkbox } from "scenerystack/sun";
import type { Tandem } from "scenerystack/tandem";
import DopplerEffectNamespace from "../DopplerEffectNamespace";
import { StringManager } from "../i18n/StringManager";
import type { DopplerEffectPreferencesModel } from "./DopplerEffectPreferencesModel";

export class DopplerEffectPreferencesNode extends VBox {
  public constructor(preferencesModel: DopplerEffectPreferencesModel, tandem?: Tandem) {
    const prefStrings = StringManager.getInstance().getPreferences();

    const header = new Text(prefStrings.titleStringProperty, {
      font: new PhetFont({ size: 18, weight: "bold" }),
    });

    const microphoneEnabledCheckbox = new Checkbox(
      preferencesModel.microphoneEnabledProperty,
      new Text(prefStrings.microphoneEnabledStringProperty, { font: new PhetFont(14) }),
      {
        spacing: 8,
        ...(tandem && { tandem: tandem.createTandem("microphoneEnabledCheckbox") }),
      },
    );

    super({
      align: "left",
      spacing: 12,
      children: [header, microphoneEnabledCheckbox],
    });
  }
}

DopplerEffectNamespace.register("DopplerEffectPreferencesNode", DopplerEffectPreferencesNode);
