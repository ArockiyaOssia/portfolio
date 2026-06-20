// Shared state read by the persistent 3D scene each frame.
// progress: 0 (top) -> 1 (bottom). pointer: NDC (-1..1), y up.
export const scrollState = {
  progress: 0,
  velocity: 0,
  pointer: { x: 0, y: 0 },
};
