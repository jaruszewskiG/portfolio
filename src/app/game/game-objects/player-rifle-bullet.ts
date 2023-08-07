import { IMainScene } from "../models/main-scene.model";
import { Enemy } from "./enemy";
import { Player } from "./player";

const KEY: string = 'Biker_rifle_bullet';

export class PlayerRifleBullet extends Phaser.Physics.Arcade.Sprite {
  private velocityX: number;
  private velocityY: number;
  private target: Player | Phaser.Physics.Arcade.Group;
  private targetCollider: Phaser.Physics.Arcade.Collider;

  constructor(
    public override scene: IMainScene,
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    rotation: number,
    target: Player | Phaser.Physics.Arcade.Group,
  ) {
    super(scene, x, y, KEY);

    this.velocityX = velocityX;
    this.velocityY = velocityY;
    this.rotation = rotation;
    this.target = target;

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
    this.targetCollider = this.scene.physics.add.overlap(this, this.target, this.targetHit, undefined, this);
  }

  private bulletHit(): void {
    this.disableBody(true, true);
  }

  private targetHit(bullet: Phaser.GameObjects.GameObject, target: Phaser.GameObjects.GameObject): void {
    console.log('jacie');
    (target as Player | Enemy).die();
    this.disableBody(true, true);
  }
}