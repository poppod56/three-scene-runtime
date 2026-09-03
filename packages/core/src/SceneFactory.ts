import { Group, Mesh, BoxGeometry, MeshBasicMaterial, EdgesGeometry, LineSegments, LineBasicMaterial, Quaternion, Object3D } from "three";
import type { SceneDocument, ObjectDto } from "./types/scene";
import { AssetManager } from "./AssetManager";
import { ObjectRegistry } from "./ObjectRegistry";
import { ComponentRegistry } from "./ComponentRegistry";

/**
 * Builds an Object3D hierarchy from a SceneDocument. Objects without an
 * `asset` (or whose asset failed to preload) render as a wireframe box
 * placeholder — this is how Milestone 1-3 scenes look before GLB export
 * exists, and it's also a visible fallback for a missing/failed asset later.
 */
export class SceneFactory {
  constructor(
    private assetManager: AssetManager,
    private objectRegistry: ObjectRegistry,
    private componentRegistry: ComponentRegistry,
  ) {}

  create(document: SceneDocument): Group {
    const root = new Group();
    root.name = "SceneRoot";

    const nodesById = new Map<string, Object3D>();

    // Two passes: create every node first, then re-parent by id. Parents can
    // appear after their children in the objects array, so a single pass
    // that tries to attach to a not-yet-created parent would silently drop
    // objects onto the scene root.
    for (const dto of document.objects) {
      const node = this.createNode(dto);
      nodesById.set(dto.id, node);
      this.objectRegistry.register(dto.id, node);
    }

    for (const dto of document.objects) {
      const node = nodesById.get(dto.id)!;
      const parent = dto.parent ? nodesById.get(dto.parent) : undefined;
      (parent ?? root).add(node);
    }

    for (const dto of document.objects) {
      const node = nodesById.get(dto.id)!;
      for (const component of dto.components) {
        this.componentRegistry.attach(node, component);
      }
    }

    return root;
  }

  private createNode(dto: ObjectDto): Object3D {
    const node = dto.asset ? this.instantiateAsset(dto.asset) : this.createPlaceholder();
    node.name = dto.name;

    const [px, py, pz] = dto.transform.position;
    node.position.set(px, py, pz);

    const [rx, ry, rz, rw] = dto.transform.rotation;
    node.quaternion.copy(new Quaternion(rx, ry, rz, rw));

    const [sx, sy, sz] = dto.transform.scale;
    node.scale.set(sx, sy, sz);

    return node;
  }

  private instantiateAsset(assetId: string): Object3D {
    const gltf = this.assetManager.get(assetId);
    if (!gltf) {
      console.warn(`SceneFactory: asset "${assetId}" was not preloaded, using placeholder`);
      return this.createPlaceholder();
    }
    return gltf.scene.clone(true);
  }

  private createPlaceholder(): Object3D {
    const group = new Group();
    const box = new Mesh(new BoxGeometry(1, 1, 1), new MeshBasicMaterial({ color: 0x4a90d9, transparent: true, opacity: 0.25 }));
    const wireframe = new LineSegments(new EdgesGeometry(box.geometry), new LineBasicMaterial({ color: 0x4a90d9 }));
    group.add(box, wireframe);
    return group;
  }
}
