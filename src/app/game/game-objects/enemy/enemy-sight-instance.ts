import { IMainScene } from "../../models/main-scene.model";
import { Enemy } from "./enemy";

export class EnemySightInstance extends Phaser.Physics.Arcade.Sprite {
  private enemy: Enemy;
  private velocityX: number;
  private velocityY: number;

  constructor(
    public override scene: IMainScene,
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    enemy: Enemy,
  ) {
    super(scene, x, y, 'sight');

    this.enemy = enemy;
    this.velocityX = velocityX;
    this.velocityY = velocityY;

    this.initialSetup();
  }

  private initialSetup(): void {
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.setOrigin(0.5, 0.5);
    this.setVelocity(this.velocityX, this.velocityY);
    this.setGravityY(-this.scene.physics.config.gravity!.y!);

    // The ms parameter here is in fact a range of the sight
    setTimeout(() => this.destroy(), 360);

    this.scene.physics.add.collider(this, this.scene.platforms, () => this.destroy(), undefined, this);
    this.scene.physics.add.overlap(this, this.scene.player, this.playerDetected, undefined, this);
  }

  private playerDetected() {
    this.enemy.playerDetected();
    this.destroy();
  }
}