# unity-three-scene-runtime (monorepo)

pnpm workspace for the Three.js side of the Unity → Three.js scene export
pipeline (see the `UnityToThreeJS` Unity project for the exporter side).

- **`packages/core`** — [`@poppod/three-scene-runtime`](packages/core/README.md),
  the published npm package: `SceneLoader`, `AssetManager`, `SceneFactory`,
  `ComponentRegistry`, `ObjectRegistry`, and the `scene.json` TypeScript types.
- **`packages/example-vite`** — a runnable demo app built on the package
  above, showing a real exported scene (Unity `Classroom` sample: a Cube,
  two static meshes, a camera, a directional light) plus a working `door`
  component.

## Develop

```
pnpm install
pnpm build:core      # build @poppod/three-scene-runtime once before running the demo
pnpm dev             # runs packages/example-vite
```

## Publish `@poppod/three-scene-runtime` to npm

```
pnpm build:core
cd packages/core
npm publish --access public
```

Bump `packages/core/package.json`'s `version` first (semver). The package is
scoped (`@poppod/...`) but published public, so anyone can `npm install` it.
