import { IMainScene } from "../models/main-scene.model";

const KEY: string = 'Biker_rifle_bullet';

export class PlayerRifleBullet extends Phaser.Physics.Arcade.Sprite {
  private pointerAngle = 0;
  private velocityBase = 700;
  private rifleFlipX: boolean;

  constructor(
    public override scene: IMainScene,
    x: number,
    y: number,
    pointerAngle: number,
    rifleFlipX: boolean,
  ) {
    super(scene, x, y, KEY);

    this.rifleFlipX = rifleFlipX;

    if (this.rifleFlipX) {
      this.velocityBase = -this.velocityBase;
      this.pointerAngle = -pointerAngle;
      this.rotation = -pointerAngle;
    } else {
      this.pointerAngle = pointerAngle;
      this.rotation = pointerAngle;
    }

    this.initialSetup();
  }

  private initialSetup(): void {
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.setFrame('Bullet_4', true, false);
    this.setOrigin(0.5, 0.5);
    const velocityX = this.velocityBase * Math.cos(this.pointerAngle);
    const velocityY = this.velocityBase * Math.sin(this.pointerAngle);
    this.setVelocity(velocityX, velocityY);
    this.setGravityY(-this.scene.physics.config.gravity!.y!);

    this.scene.physics.add.collider(this, this.scene.platforms, this.bulletHit, undefined, this);
  }

  private bulletHit() {
    this.disableBody(true, true);
  }
}