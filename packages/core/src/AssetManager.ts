import { GLTFLoader, type GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import type { AssetDto } from "./types/scene";

/**
 * Loads and caches each unique GLB once, keyed by the asset id from
 * scene.json's `assets` map. SceneFactory clones the cached scene per
 * instance instead of re-fetching/re-parsing the file.
 */
export class AssetManager {
  private loader = new GLTFLoader();
  private cache = new Map<string, GLTF>();

  async preload(assets: Record<string, AssetDto>, baseUrl: string): Promise<void> {
    const entries = Object.entries(assets);
    await Promise.all(
      entries.map(async ([id, asset]) => {
        if (this.cache.has(id)) return;
        const gltf = await this.loader.loadAsync(new URL(asset.path, baseUrl).toString());
        this.cache.set(id, gltf);
      }),
    );
  }

  get(assetId: string): GLTF | undefined {
    return this.cache.get(assetId);
  }
}
