/**
 * KeyboardHandlerManager.ts
 *
 * Manages keyboard input handlers for the Doppler Effect simulation.
 */

import { type Node, type Property, type SceneryEvent, Vector2 } from "scenerystack";
import { Scenario } from "../../model/DopplerEffectModel";

/**
 * Callback type for keyboard handling events
 */
type KeyboardCallbacks = {
  onSourceSelected: () => void;
  onObserverSelected: () => void;
  onToggleTrails: () => void;
  onToggleHelp: () => void;
  onReset: () => void;
};

/**
 * Maps preset number keys to the scenario they load
 */
const SCENARIO_BY_KEY: Record<string, Scenario> = {
  "1": Scenario.SOURCE_APPROACHING,
  "2": Scenario.SOURCE_RECEDING,
  "3": Scenario.OBSERVER_APPROACHING,
  "4": Scenario.OBSERVER_RECEDING,
  "5": Scenario.SAME_DIRECTION,
  "6": Scenario.PERPENDICULAR,
  "0": Scenario.FREE_PLAY,
};

/**
 * Manager for handling keyboard input
 */
export class KeyboardHandlerManager {
  /**
   * Attach keyboard event handlers
   *
   * @param targetNode - Node to attach keyboard listeners to
   * @param callbacks - Callback functions for various keyboard actions
   * @param playProperty - Property for simulation play state
   * @param sourceVelocityProperty - Model property for source velocity
   * @param observerVelocityProperty - Model property for observer velocity
   * @param sourceMovingProperty - Model property for source moving state
   * @param observerMovingProperty - Model property for observer moving state
   * @param emittedFrequencyProperty - Model property for emitted frequency
   * @param soundSpeedProperty - Model property for sound speed
   * @param microphoneEnabledProperty - Model property for microphone state
   * @param selectedObjectProperty - Property indicating currently selected object
   * @param scenarioProperty - Property for the current scenario
   */
  public attachKeyboardHandlers(
    targetNode: Node,
    callbacks: KeyboardCallbacks,
    playProperty: Property<boolean>,
    sourceVelocityProperty: Property<Vector2>,
    observerVelocityProperty: Property<Vector2>,
    sourceMovingProperty: Property<boolean>,
    observerMovingProperty: Property<boolean>,
    emittedFrequencyProperty: Property<number>,
    soundSpeedProperty: Property<number>,
    microphoneEnabledProperty: Property<boolean>,
    selectedObjectProperty: Property<"source" | "observer">,
    scenarioProperty: Property<Scenario>,
  ): void {
    // Create a shared handler function for keydown events, dispatching to
    // focused helpers grouped by the kind of action each key triggers.
    const handleKeydown = (key: string) => {
      this.handleObjectSelection(key, selectedObjectProperty, callbacks);

      // Arrow key movement is only available while the simulation is playing
      if (playProperty.value) {
        this.handleMovement(
          key,
          selectedObjectProperty,
          sourceVelocityProperty,
          observerVelocityProperty,
          sourceMovingProperty,
          observerMovingProperty,
        );
      }

      this.handleActions(key, callbacks, playProperty, microphoneEnabledProperty);
      this.handleScenarioPresets(key, scenarioProperty);
      this.handleAdjustments(key, emittedFrequencyProperty, soundSpeedProperty);
    };

    // Add key listeners to the view
    const keydownListener = {
      listener: (event: SceneryEvent<KeyboardEvent>) => {
        if (!event.domEvent) {
          return;
        }
        const key = event.domEvent.key.toLowerCase();
        handleKeydown(key);
      },
    };

    // Add the keyboard listener to the view
    targetNode.addInputListener(keydownListener);

    // Also add a global keyboard listener to ensure we catch all keyboard events
    window.addEventListener("keydown", (event) => {
      const key = event.key.toLowerCase();
      handleKeydown(key);
    });
  }

  /**
   * Select the source or observer object
   */
  private handleObjectSelection(
    key: string,
    selectedObjectProperty: Property<"source" | "observer">,
    callbacks: KeyboardCallbacks,
  ): void {
    if (key === "s") {
      selectedObjectProperty.value = "source";
      callbacks.onSourceSelected();
    } else if (key === "o") {
      selectedObjectProperty.value = "observer";
      callbacks.onObserverSelected();
    }
  }

  /**
   * Apply arrow/WASD movement to the currently selected object
   */
  private handleMovement(
    key: string,
    selectedObjectProperty: Property<"source" | "observer">,
    sourceVelocityProperty: Property<Vector2>,
    observerVelocityProperty: Property<Vector2>,
    sourceMovingProperty: Property<boolean>,
    observerMovingProperty: Property<boolean>,
  ): void {
    // Determine which object to control
    const targetVelocity =
      selectedObjectProperty.value === "source" ? sourceVelocityProperty : observerVelocityProperty;
    const isMoving = selectedObjectProperty.value === "source" ? sourceMovingProperty : observerMovingProperty;

    // Set velocity based on key
    const velocity = new Vector2(0, 0);

    if (key === "arrowleft" || key === "a") {
      velocity.x = -100.0;
    } else if (key === "arrowright" || key === "d") {
      velocity.x = 100.0;
    }

    if (key === "arrowup" || key === "w") {
      velocity.y = 100.0;
    } else if (key === "arrowdown" || key === "s") {
      velocity.y = -100.0;
    }

    // Apply velocity if any keys were pressed
    if (velocity.magnitude > 0) {
      targetVelocity.value = velocity;
      isMoving.value = true;
    }
  }

  /**
   * Handle one-shot action keys: trail toggle, pause, reset, help, and microphone
   */
  private handleActions(
    key: string,
    callbacks: KeyboardCallbacks,
    playProperty: Property<boolean>,
    microphoneEnabledProperty: Property<boolean>,
  ): void {
    if (key === "t") {
      callbacks.onToggleTrails();
    }
    if (key === " ") {
      playProperty.value = !playProperty.value;
    }
    if (key === "r") {
      callbacks.onReset();
    }
    if (key === "h") {
      callbacks.onToggleHelp();
    }
    if (key === "m") {
      microphoneEnabledProperty.value = !microphoneEnabledProperty.value;
    }
  }

  /**
   * Load a preset scenario from a number key
   */
  private handleScenarioPresets(key: string, scenarioProperty: Property<Scenario>): void {
    const scenario = SCENARIO_BY_KEY[key];
    if (scenario !== undefined) {
      scenarioProperty.value = scenario;
    }
  }

  /**
   * Adjust emitted frequency and sound speed
   */
  private handleAdjustments(
    key: string,
    emittedFrequencyProperty: Property<number>,
    soundSpeedProperty: Property<number>,
  ): void {
    if (key === "+" || key === "=") {
      emittedFrequencyProperty.value += 0.1;
    } else if (key === "-" || key === "_") {
      emittedFrequencyProperty.value = Math.max(0.1, emittedFrequencyProperty.value - 0.1);
    }

    if (key === "." || key === ">") {
      soundSpeedProperty.value += 1.0;
    } else if (key === "," || key === "<") {
      soundSpeedProperty.value = Math.max(1.0, soundSpeedProperty.value - 1.0);
    }
  }
}
