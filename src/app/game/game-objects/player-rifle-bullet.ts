import { IMainScene } from "../models/main-scene.model";

const KEY: string = 'Biker_rifle_bullet';

export class PlayerRifleBullet extends Phaser.Physics.Arcade.Sprite {
  private velocityX: number;
  private velocityY: number;

  constructor(
    public override scene: IMainScene,
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    rotation: number,
  ) {
    super(scene, x, y, KEY);

    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.rotation = rotation;

    this.initialSetup();
  }

  private initialSetup(): void {
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.setFrame('Bullet_5', true, false);
    this.setOrigin(0.5, 0.5);
    this.setVelocity(this.velocityX, this.velocityY);
    this.setGravityY(-this.scene.physics.config.gravity!.y!);

    this.scene.physics.add.collider(this, this.scene.platforms, this.bulletHit, undefined, this);
  }

  private bulletHit() {
    this.disableBody(true, true);
  }
}