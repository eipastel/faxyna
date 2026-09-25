/** Room colors derived from the `hue` provided by the gateway (same formulas as the design). */
export const roomColors = (hue: number) => ({
  dot: `oklch(0.66 0.14 ${hue})`,
  ink: `oklch(0.52 0.13 ${hue})`,
  chipInk: `oklch(0.55 0.13 ${hue})`,
  tint: `oklch(0.95 0.035 ${hue})`,
});
