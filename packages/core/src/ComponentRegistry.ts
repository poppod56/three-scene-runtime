import type { Object3D } from "three";
import type { ComponentDto } from "./types/scene";

export interface ComponentBehavior {
  attach(object: Object3D, data: Record<string, unknown>): void;
  /** Optional: called once per frame with the elapsed time in seconds. */
  update?(deltaSeconds: number): void;
}

type ComponentCtor = new () => ComponentBehavior;

/**
 * Maps an exported component `type` string to a runtime behavior
 * implementation. Runtime behavior lives entirely here in TypeScript —
 * Unity only ever supplies authoring configuration via ComponentDto.
 */
export class ComponentRegistry {
  private ctors = new Map<string, ComponentCtor>();
  private attached: ComponentBehavior[] = [];

  register(type: string, ctor: ComponentCtor): void {
    this.ctors.set(type, ctor);
  }

  attach(object: Object3D, component: ComponentDto): void {
    const ctor = this.ctors.get(component.type);
    if (!ctor) {
      console.warn(`ComponentRegistry: unknown component type "${component.type}" on "${object.name}", skipping`);
      return;
    }
    const behavior = new ctor();
    behavior.attach(object, component.data);
    this.attached.push(behavior);
  }

  updateAll(deltaSeconds: number): void {
    for (const behavior of this.attached) {
      behavior.update?.(deltaSeconds);
    }
  }
}
