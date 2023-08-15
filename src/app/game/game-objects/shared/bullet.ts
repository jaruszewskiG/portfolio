import { IMainScene } from "../../models/main-scene.model";
import { Enemy } from "../enemy/enemy";
import { Player } from "../player/player";

const KEY: string = 'Biker_rifle_bullet';

export class Bullet extends Phaser.Physics.Arcade.Sprite {
  private velocityX: number;
  private velocityY: number;
  private target: Player | Phaser.Physics.Arcade.Group;
  private textureFrame: string;
  private bouncesRemaining: number;

  constructor(
    public override scene: IMainScene,
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    rotation: number,
    target: Player | Phaser.Physics.Arcade.Group,
    textureFrame = 'Bullet_5',
    bounces = 0,
  ) {
    super(scene, x, y, KEY);

    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.rotation = rotation;
    this.target = target;
    this.textureFrame = textureFrame;
    this.bouncesRemaining = bounces;

    this.initialSetup();
  }

  private initialSetup(): void {
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.setFrame(this.textureFrame, true, false);
    this.setOrigin(0.5, 0.5);
    this.setVelocity(this.velocityX, this.velocityY);
    this.setGravityY(-this.scene.physics.config.gravity!.y!);

    if (this.scene.tilemap.getTileAtWorldXY(this.x, this.y)) {
      this.destroyBullet();
    }
    
    if (this.bouncesRemaining) {
      this.setBounce(1);
    }

    this.scene.physics.add.collider(this, this.scene.platforms, this.platformHit, undefined, this);
    this.scene.physics.add.overlap(this, this.target, this.targetHit, undefined, this);
  }

  private platformHit(): void {
    if (this.bouncesRemaining > 0) {
      this.bouncesRemaining -= 1;
    } else {
      this.destroyBullet();
    }
  }

  private destroyBullet(): void {
    this.disableBody(true, true);
  }

  private targetHit(bullet: Phaser.GameObjects.GameObject, target: Phaser.GameObjects.GameObject): void {
    (target as Player | Enemy).hit(1);
    this.disableBody(true, true);
  }
}