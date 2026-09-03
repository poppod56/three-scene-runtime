import { MathUtils, Quaternion, Vector3, Object3D } from "three";
import type { ComponentBehavior } from "@poppod/three-scene-runtime";

/**
 * Runtime behavior for the "door" component type exported from Unity's
 * ThreeDoor authoring component ({ openAngle, speed }). Unity never decides
 * how a door *behaves* - it only supplies these two numbers; everything
 * about swinging the door open/closed lives here.
 */
export class DoorComponent implements ComponentBehavior {
  private object!: Object3D;
  private closedRotation!: Quaternion;
  private openRotation!: Quaternion;
  private angularSpeedDegPerSec = 45;
  private progress = 0; // 0 = closed, 1 = open
  private direction: 1 | -1 = 1;

  attach(object: Object3D, data: Record<string, unknown>): void {
    this.object = object;
    const openAngle = typeof data.openAngle === "number" ? data.openAngle : 90;
    const speed = typeof data.speed === "number" ? data.speed : 1;

    // "speed" from Unity has no fixed unit in the exported contract - this
    // runtime treats it as a multiplier on degrees/sec. A different Three.js
    // app is free to interpret the same exported value differently.
    this.angularSpeedDegPerSec = 45 * speed;

    this.closedRotation = object.quaternion.clone();
    this.openRotation = this.closedRotation
      .clone()
      .multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 1, 0), MathUtils.degToRad(openAngle)));
  }

  update(deltaSeconds: number): void {
    const step = (this.angularSpeedDegPerSec / 90) * deltaSeconds * this.direction;
    this.progress = MathUtils.clamp(this.progress + step, 0, 1);
    this.object.quaternion.slerpQuaternions(this.closedRotation, this.openRotation, this.progress);

    if (this.progress >= 1 || this.progress <= 0) {
      this.direction = this.direction === 1 ? -1 : 1;
    }
  }
}
