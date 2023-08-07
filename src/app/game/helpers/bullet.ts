export const getBulletVelocity = (baseVelocity: number, angle: number) => {
  return {
    x: baseVelocity * Math.cos(angle),
    y: baseVelocity * Math.sin(angle),
  };
}