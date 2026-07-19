/**
 * DragHandlerManager.ts
 *
 * Manages a single drag handler for an object in the Doppler Effect simulation.
 */

import {
  type Bounds2,
  DerivedProperty,
  DragListener,
  KeyboardDragListener,
  type ModelViewTransform2,
  type Node,
  Property,
  type ReadOnlyProperty,
  Vector2,
} from "scenerystack";
import { PHYSICS } from "../../../doppler-effect/model/DopplerEffectConstants";

/**
 * Manager for creating and attaching a drag handler to a simulation object
 */
export class DragHandlerManager {
  private readonly modelViewTransform: ModelViewTransform2;
  private readonly dragBounds: Bounds2;
  private dragListener: DragListener | null = null;
  private keyboardDragListener: KeyboardDragListener | null = null;
  private dragOffset: Vector2 = new Vector2(0, 0);
  private readonly maxSpeedProperty: ReadOnlyProperty<number>;

  /**
   * Constructor for the DragHandlerManager
   *
   * @param modelViewTransform - Transform between model and view coordinates
   * @param layoutBounds - View bounds for constraining drag
   * @param soundSpeedProperty - Property containing the current sound speed
   */
  constructor(modelViewTransform: ModelViewTransform2, layoutBounds: Bounds2, soundSpeedProperty: Property<number>) {
    this.modelViewTransform = modelViewTransform;

    // drag bounds are the same as the layout bounds
    this.dragBounds = layoutBounds;

    // Create derived property for max speed based on sound speed
    this.maxSpeedProperty = new DerivedProperty(
      [soundSpeedProperty],
      (soundSpeed) => soundSpeed * PHYSICS.MAX_SPEED_FACTOR,
    );
  }

  /**
   * Add a drag handler to a node
   *
   * @param targetNode - The visual node to make draggable
   * @param positionProperty - Model property for object position
   * @param velocityProperty - Model property for object velocity
   * @param movingProperty - Model property for object moving state
   * @param onSelected - Callback for when object is selected
   */
  public attachDragHandler(
    targetNode: Node,
    positionProperty: Property<Vector2>,
    velocityProperty: Property<Vector2>,
    movingProperty: Property<boolean>,
    onSelected: () => void,
  ): void {
    // Create the drag listener
    this.dragListener = new DragListener({
      targetNode: targetNode,
      dragBoundsProperty: new Property(this.dragBounds),
      allowTouchSnag: true,
      start: (event) => {
        onSelected();

        // Store the initial offset between pointer and object position
        const viewPosition = this.modelViewTransform.modelToViewPosition(positionProperty.value);
        this.dragOffset = viewPosition.minus(event.pointer.point);
      },
      drag: (event) => {
        // Convert view coordinates to model coordinates, accounting for initial offset
        const viewPoint = event.pointer.point.plus(this.dragOffset);
        const modelPoint = this.modelViewTransform.viewToModelPosition(viewPoint);

        // Calculate position difference (direction to target)
        const positionDifference = modelPoint.minus(positionProperty.value);

        // Convert position difference to velocity using a scaling factor
        // This factor represents 1/time and converts distance to distance/time
        let desiredVelocity = positionDifference.timesScalar(PHYSICS.POSITION_TO_VELOCITY_FACTOR);

        // Limit velocity to maximum speed. normalize() mutates in place and timesScalar()
        // returns a new vector, so the clamped result must be reassigned (otherwise the
        // velocity collapses to a unit vector instead of being scaled to the max speed).
        if (desiredVelocity.magnitude > this.maxSpeedProperty.value) {
          desiredVelocity = desiredVelocity.normalized().timesScalar(this.maxSpeedProperty.value);
        }

        // Apply velocity
        velocityProperty.value = desiredVelocity;
        movingProperty.value = true;
      },
    });

    // Add the listener to the target node
    targetNode.addInputListener(this.dragListener);

    // Keyboard: nudge desired velocity from arrow keys (same clamp as pointer drag).
    this.keyboardDragListener = new KeyboardDragListener({
      transform: this.modelViewTransform,
      dragSpeed: 60,
      shiftDragSpeed: 20,
      start: () => {
        onSelected();
      },
      drag: (_event, listener) => {
        let desiredVelocity = listener.modelDelta.timesScalar(PHYSICS.POSITION_TO_VELOCITY_FACTOR);
        if (desiredVelocity.magnitude > this.maxSpeedProperty.value) {
          desiredVelocity = desiredVelocity.normalized().timesScalar(this.maxSpeedProperty.value);
        }
        velocityProperty.value = desiredVelocity;
        movingProperty.value = desiredVelocity.magnitude > 1e-6;
      },
      end: () => {
        velocityProperty.value = new Vector2(0, 0);
        movingProperty.value = false;
      },
    });
    targetNode.addInputListener(this.keyboardDragListener);
  }

  /**
   * Remove the drag handler from its target node
   */
  public detachDragHandler(): void {
    if (this.dragListener) {
      const targetNode = this.dragListener.targetNode;
      if (targetNode) {
        targetNode.removeInputListener(this.dragListener);
        if (this.keyboardDragListener) {
          targetNode.removeInputListener(this.keyboardDragListener);
          this.keyboardDragListener.dispose();
        }
      }
      this.dragListener = null;
      this.keyboardDragListener = null;
    }
  }
}
