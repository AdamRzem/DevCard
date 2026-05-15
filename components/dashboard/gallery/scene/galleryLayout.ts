import type { MuseumRoom } from "@/components/dashboard/gallery/data/galleryProjects";

export type { MuseumRoom };

export type MuseumView = "hall" | MuseumRoom;

// Door positions in main hall (x offset, z = back wall)
export const DOOR_POSITIONS: Record<MuseumRoom, [number, number, number]> = {
  web: [-5.5, 0, -8],
  mobile: [0, 0, -8],
  "github-stats": [5.5, 0, -8],
};

// Camera config per view
export const HALL_CAMERA = {
  position: [0, 2.4, 8] as [number, number, number],
  lookAt: [0, 2.0, 0] as [number, number, number],
};

export const ROOM_CAMERA = {
  position: [0, 2.8, 8] as [number, number, number],
  lookAt: [0, 1.5, -1] as [number, number, number],
};

// Pedestal positions — flanking the side walls, exit door stays clear at z=-6
export function getRoomPedestalPositions(count: number): [number, number, number][] {
  if (count === 1) return [[0, 0, 0]];
  if (count === 2) return [[-5.5, 0, 0], [5.5, 0, 0]];
  return [[-6, 0, 0], [6, 0, 0], [0, 0, -2.5]];
}
