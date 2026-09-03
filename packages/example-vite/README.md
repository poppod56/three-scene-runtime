# Unity → Three.js runtime example

Demo app built on [`@poppod/three-scene-runtime`](../core/README.md),
consuming a real `scene.json` (+ GLB assets) exported by the
`com.poppodstudio.three-exporter` Unity package (see the `UnityToThreeJS`
Unity project).

## What's here

- `src/main.ts` — loads the scene, preloads assets, builds the Three.js
  scene, wires up camera/lights/orbit controls/render loop, all using
  `@poppod/three-scene-runtime`'s `SceneLoader`/`AssetManager`/
  `SceneFactory`/`ObjectRegistry`/`ComponentRegistry`
- `src/components/DoorComponent.ts` — a `ComponentBehavior` implementation
  for the `door` component type (backed by Unity's `ThreeDoor` authoring
  component: `{ openAngle, speed }`). This is app-specific runtime behavior,
  which is why it lives here rather than in the shared package.
- `public/scenes/example/scene.json` + `assets/*.glb` — a real scene exported
  from the Unity project's `Classroom` sample (Cube, two static meshes, a
  camera, a directional light).

## Run

From the repo root (this is a pnpm workspace):

```
pnpm install
pnpm build:core   # @poppod/three-scene-runtime must be built once first
pnpm dev
```

Or from this folder directly once the core package has been built at least once:

```
npm run dev
```

Then open the printed local URL.

## Using your own exported scene

1. In Unity: `Tools → Three.js Exporter` → set output folder → `Validate
   Scene` → `Export Scene`.
2. Copy the output into `public/scenes/<name>/` here (or point `sceneUrl` in
   `src/main.ts` at wherever you copied it).
3. If you add your own component types in Unity, implement a matching
   `ComponentBehavior` (see `DoorComponent.ts` for the pattern) and
   `componentRegistry.register("your-type", YourComponent)` in `main.ts`.
