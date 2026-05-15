"use client";

import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useRef } from "react";
import { Vector3 } from "three";

import { HALL_CAMERA, ROOM_CAMERA } from "./galleryLayout";
import type { MuseumView } from "./galleryLayout";

interface GalleryCameraProps {
  view: MuseumView;
}

export function GalleryCamera({ view }: GalleryCameraProps) {
  const { camera } = useThree();
  const targetPos = useRef(new Vector3());
  const targetLook = useRef(new Vector3());
  const currentLook = useRef(new Vector3());

  useEffect(() => {
    const cfg = view === "hall" ? HALL_CAMERA : ROOM_CAMERA;
    targetPos.current.set(...cfg.position);
    targetLook.current.set(...cfg.lookAt);
  }, [view]);

  useFrame((_, delta) => {
    camera.position.lerp(targetPos.current, Math.min(1, delta * 3.5));
    currentLook.current.lerp(targetLook.current, Math.min(1, delta * 3.5));
    camera.lookAt(currentLook.current);
  });

  return null;
}

export default GalleryCamera;
