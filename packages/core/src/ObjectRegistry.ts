import type { Object3D } from "three";

/** Lookup by the stable id exported from Unity's ThreeObject component. */
export class ObjectRegistry {
  private byId = new Map<string, Object3D>();

  register(id: string, object: Object3D): void {
    this.byId.set(id, object);
  }

  getById(id: string): Object3D | undefined {
    return this.byId.get(id);
  }
}
