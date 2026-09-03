/**
 * Mirrors the C# DTOs in
 * Packages/com.poppodstudio.three-exporter/Editor/Serialization/*.cs
 * There is no shared codegen for v0.1 — keep the two in sync by hand.
 */

export interface TransformDto {
  position: [number, number, number];
  rotation: [number, number, number, number]; // quaternion x,y,z,w
  scale: [number, number, number];
}

export interface ComponentDto {
  type: string;
  data: Record<string, unknown>;
}

export interface AssetDto {
  type: "model";
  path: string;
}

export interface ObjectDto {
  id: string;
  name: string;
  asset: string | null;
  parent: string | null;
  transform: TransformDto;
  components: ComponentDto[];
}

export interface CameraDto {
  id: string;
  name: string;
  transform: TransformDto;
  fov: number;
  near: number;
  far: number;
}

export interface LightDto {
  id: string;
  name: string;
  lightType: "directional" | "point";
  transform: TransformDto;
  color: [number, number, number];
  intensity: number;
  range: number | null;
}

export interface SceneDocument {
  format: "unity-three-scene";
  version: string;
  scene: Record<string, unknown>;
  assets: Record<string, AssetDto>;
  objects: ObjectDto[];
  cameras: CameraDto[];
  lights: LightDto[];
}
