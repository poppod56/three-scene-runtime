import type { SceneDocument } from "./types/scene";

const SUPPORTED_FORMAT = "unity-three-scene";

export class SceneLoader {
  async load(url: string): Promise<SceneDocument> {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`SceneLoader: failed to fetch ${url} (${response.status})`);
    }

    const document = (await response.json()) as SceneDocument;

    if (document.format !== SUPPORTED_FORMAT) {
      throw new Error(
        `SceneLoader: unsupported scene format "${document.format}", expected "${SUPPORTED_FORMAT}"`,
      );
    }

    return document;
  }
}
