import {
  Scene,
  PerspectiveCamera,
  WebGLRenderer,
  DirectionalLight,
  PointLight,
  GridHelper,
  Color,
  Clock,
} from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { SceneLoader, AssetManager, ObjectRegistry, ComponentRegistry, SceneFactory } from "@poppod/three-scene-runtime";
import { DoorComponent } from "./components/DoorComponent";

async function main() {
  const sceneUrl = "/scenes/example/scene.json";

  const loader = new SceneLoader();
  const sceneDocument = await loader.load(sceneUrl);

  const assetManager = new AssetManager();
  await assetManager.preload(sceneDocument.assets, new URL(sceneUrl, window.location.href).toString());

  const objectRegistry = new ObjectRegistry();
  const componentRegistry = new ComponentRegistry();
  componentRegistry.register("door", DoorComponent);
  const factory = new SceneFactory(assetManager, objectRegistry, componentRegistry);

  const threeScene = new Scene();
  threeScene.background = new Color(0x202225);
  threeScene.add(new GridHelper(20, 20, 0x444444, 0x2f2f2f));
  threeScene.add(factory.create(sceneDocument));

  for (const lightDto of sceneDocument.lights) {
    const [lx, ly, lz] = lightDto.transform.position;
    const [r, g, b] = lightDto.color;
    const color = new Color(r, g, b);

    if (lightDto.lightType === "directional") {
      const light = new DirectionalLight(color, lightDto.intensity);
      light.position.set(lx, ly, lz);
      threeScene.add(light);
    } else {
      const light = new PointLight(color, lightDto.intensity, lightDto.range ?? 0);
      light.position.set(lx, ly, lz);
      threeScene.add(light);
    }
  }

  const cameraDto = sceneDocument.cameras[0];
  const camera = new PerspectiveCamera(
    cameraDto?.fov ?? 60,
    window.innerWidth / window.innerHeight,
    cameraDto?.near ?? 0.1,
    cameraDto?.far ?? 1000,
  );
  if (cameraDto) {
    const [cx, cy, cz] = cameraDto.transform.position;
    camera.position.set(cx, cy, cz);
  } else {
    camera.position.set(5, 5, 5);
  }

  const renderer = new WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0, 0);

  window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  const clock = new Clock();
  renderer.setAnimationLoop(() => {
    const delta = clock.getDelta();
    componentRegistry.updateAll(delta);
    controls.update();
    renderer.render(threeScene, camera);
  });
}

main().catch((error) => {
  console.error(error);
  document.body.innerHTML = `<pre style="color:#f66;padding:16px;font:12px monospace">${String(error)}</pre>`;
});
