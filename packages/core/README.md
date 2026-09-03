# @poppod/three-scene-runtime

TypeScript runtime that loads a `scene.json` (+ GLB assets) exported by the
Unity Three.js Scene Exporter Unity Editor package
(`com.poppodstudio.three-exporter`, not yet published as its own repo) and
builds a live Three.js scene from it — hierarchy, transforms, cameras,
lights, and an opt-in component system for custom per-object behavior.

Unity is the authoring tool here, not the runtime: it only ever exports
configuration data. Everything about how an object *behaves* in the browser
is written in TypeScript against this package.

## Install

```
npm install @poppod/three-scene-runtime three
```

`three` is a peer dependency — bring your own version (`>=0.150.0`).

## Usage

```ts
import {
  SceneLoader,
  AssetManager,
  ObjectRegistry,
  ComponentRegistry,
  SceneFactory,
} from "@poppod/three-scene-runtime";
import { Scene } from "three";

const sceneUrl = "/scenes/classroom/scene.json";

const loader = new SceneLoader();
const sceneDocument = await loader.load(sceneUrl);

const assetManager = new AssetManager();
await assetManager.preload(sceneDocument.assets, new URL(sceneUrl, location.href).toString());

const objectRegistry = new ObjectRegistry();
const componentRegistry = new ComponentRegistry();
// componentRegistry.register("door", DoorComponent) — your own behavior class

const factory = new SceneFactory(assetManager, objectRegistry, componentRegistry);

const threeScene = new Scene();
threeScene.add(factory.create(sceneDocument));

// in your render loop:
componentRegistry.updateAll(deltaSeconds);
```

Look up any exported object at runtime by the stable id Unity assigned it:

```ts
const door = objectRegistry.getById("2bb94f5e-...");
```

## What's included

- `SceneLoader` — fetches and validates `scene.json`'s `format`/`version`
- `AssetManager` — loads and caches each unique GLB once, even if it's
  instanced many times in the scene
- `SceneFactory` — builds the `Object3D` hierarchy, clones a cached GLTF per
  instance, applies transforms; renders a wireframe-box placeholder for any
  object with no (or unresolved) asset
- `ComponentRegistry` — maps an exported component `type` string to your own
  `ComponentBehavior` class; unknown types warn and are skipped, never throw
- `ObjectRegistry` — id → `Object3D` lookup
- Full TypeScript types for the `scene.json` contract (`SceneDocument`,
  `ObjectDto`, `AssetDto`, `CameraDto`, `LightDto`, `TransformDto`,
  `ComponentDto`)

## Multi-scene apps

Create a fresh `AssetManager` and `ObjectRegistry` per scene you load — asset
ids and object ids are only unique *within* one `scene.json`, not across
scenes. If you swap scenes without a full page reload, also make sure to stop
driving `ComponentRegistry.updateAll()` for behaviors from the previous scene
(create a fresh `ComponentRegistry` per scene load, or track and dispose of
old ones yourself) and remove/dispose the old `Object3D` tree before adding
the new one.

See the `example-vite` app in this monorepo for a complete, working example
including a custom `door` component.
