import { Screen, type ScreenOptions } from "scenerystack/sim";
import type { DopplerEffectPreferencesModel } from "../preferences/DopplerEffectPreferencesModel.js";
import { SimModel } from "./model/SimModel.js";
import { DopplerEffectKeyboardHelpContent } from "./view/DopplerEffectKeyboardHelpContent.js";
import { SimScreenView } from "./view/SimScreenView.js";

export class SimScreen extends Screen<SimModel, SimScreenView> {
  public constructor(options: ScreenOptions & { preferences: DopplerEffectPreferencesModel }) {
    super(
      () => new SimModel(options.preferences),
      (model) => new SimScreenView(model),
      {
        ...options,
        createKeyboardHelpNode: () => new DopplerEffectKeyboardHelpContent(),
      },
    );
  }
}
