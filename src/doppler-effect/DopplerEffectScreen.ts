import { Screen, type ScreenOptions } from "scenerystack/sim";
import type { DopplerEffectPreferencesModel } from "../preferences/DopplerEffectPreferencesModel.js";
import { DopplerEffectModel } from "./model/DopplerEffectModel.js";
import { DopplerEffectKeyboardHelpContent } from "./view/DopplerEffectKeyboardHelpContent.js";
import { DopplerEffectScreenView } from "./view/DopplerEffectScreenView.js";

export class DopplerEffectScreen extends Screen<DopplerEffectModel, DopplerEffectScreenView> {
  public constructor(options: ScreenOptions & { preferences: DopplerEffectPreferencesModel }) {
    super(
      () => new DopplerEffectModel(options.preferences),
      (model) => new DopplerEffectScreenView(model),
      {
        ...options,
        createKeyboardHelpNode: () => new DopplerEffectKeyboardHelpContent(),
      },
    );
  }
}
