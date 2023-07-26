import { IMainScene } from "../models/main-scene.model";

const KEY: string = 'Biker_rifle_bullet';

export class PlayerRifleBullet extends Phaser.Physics.Arcade.Sprite {
  private velocityX = 0;
  private velocityY = 0;

  constructor(
    public override scene: IMainScene,
    x: number,
    y: number,
    velocityX: number,
    velocityY: number,
    /*
    rotation: number,
    velocity: number,
    */
  ) {
    super(scene, x, y, KEY);

    this.velocityX = velocityX;
    this.velocityY = velocityY;

    this.initialSetup();
  }
  
  public override update() {
  }

  private initialSetup(): void {
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.setFrame('Bullet_4', true, false);
    this.setOrigin(0.5, 0.5);
    this.setVelocity(this.velocityX, this.velocityY);
    this.setGravityY(-600)
  }
}