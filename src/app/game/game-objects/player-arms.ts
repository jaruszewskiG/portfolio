import { capitalizeString } from "../helpers/string.helpers";
import { IMainScene } from "../models/main-scene.model";
import { PlayerAnimations, PlayerWieldingStates } from "../models/player.model";

const KEY: string = 'Biker_arms';

export class PlayerArms extends Phaser.GameObjects.Sprite {
  private player: Phaser.Physics.Arcade.Sprite;

  private pointerAngle: number = 0;
  private baseOffsetX: number = 4;
  private baseOffsetY: number = -5;
  private frameOffsetX: number = 0;
  private frameOffsetY: number = 0;
  private playerFrameOffsetX: number = 0;
  private playerframeOffsetY: number = 0;

  constructor(
    public override scene: IMainScene,
    x: number,
    y: number,
    player: Phaser.Physics.Arcade.Sprite,
    initialWieldingState: PlayerWieldingStates,
  ) {
    super(scene, x, y, KEY);

    this.player = player;

    this.initialSetup(initialWieldingState);
    this.setupPointer();
  }
  
  public override update() {
    if (this.flipX !== this.player.flipX) {
      this.flipX = this.player.flipX;
      this.adjustPositionBasedOnPointerAngle();
    }

    switch(this.player.anims.currentFrame.textureFrame) {
      case `${capitalizeString(PlayerAnimations.RIFLE_IDLE)}_1`: 
        this.playerFrameOffsetX = 0;
        break;
      case `${capitalizeString(PlayerAnimations.RIFLE_IDLE)}_2`: 
        this.playerFrameOffsetX = -1;
        break;
      case `${capitalizeString(PlayerAnimations.RIFLE_IDLE)}_3`: 
        this.playerFrameOffsetX = -1;
        break;
      case `${capitalizeString(PlayerAnimations.RIFLE_IDLE)}_4`: 
        this.playerFrameOffsetX = 0;
        break;
    }

    if (this.flipX) {
      this.playerFrameOffsetX = -this.playerFrameOffsetX;
    }

    this.x = this.player.x - this.player.width / 2 + this.baseOffsetX + this.frameOffsetX + this.playerFrameOffsetX + (this.flipX ? 12 : 0);
    this.y = this.player.y - this.player.height / 2 + this.baseOffsetY + this.frameOffsetY + this.playerframeOffsetY;
  }

  public playerWieldingStateChange(wieldingState: PlayerWieldingStates): void {
    console.log(wieldingState);
    if (wieldingState === PlayerWieldingStates.NOTHING) {
      this.setVisible(false);
    } else {
      this.setVisible(true);
    }
  }

  private initialSetup(initialWieldingState: PlayerWieldingStates): void {
    this.scene.add.existing(this);
    this.setFrame('Arms_1', true, false);
    this.setOrigin(0.5, 0);
    this.scene.input.on('pointerdown', () => this.scene.input.mouse.requestPointerLock(), this);
    this.playerWieldingStateChange(initialWieldingState);
  }

  private setupPointer(): void {
    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const newPointerAngle = this.flipX ? this.pointerAngle + pointer.movementY / 200 : this.pointerAngle + pointer.movementY / 200;
      this.pointerAngle = newPointerAngle > 1.4 || newPointerAngle < -1.4 ? this.pointerAngle : newPointerAngle;

      this.adjustPositionBasedOnPointerAngle();
    });
  }

  private adjustPositionBasedOnPointerAngle(): void {
    if (0.85 < this.pointerAngle && this.pointerAngle <= 1.4) {
      this.setFrame('Arms_1', true, false);
      this.rotation = this.pointerAngle - 1.2;
      this.setOrigin(0.5, 0);
      this.frameOffsetX = 1;
      this.frameOffsetY = 0;
    } else if (0.3 < this.pointerAngle && this.pointerAngle <= 0.85) {
      this.setFrame('Arms_2', true, false);
      this.rotation = this.pointerAngle - 0.6;
      this.setOrigin(0.1, 0);
      this.frameOffsetX = -1;
      this.frameOffsetY = 0;
    } else if (-0.25 < this.pointerAngle && this.pointerAngle <= 0.3) {
      this.setFrame('Arms_3', true, false);
      this.rotation = this.pointerAngle;
      this.setOrigin(0.1, 0);
      this.frameOffsetX = 1;
      this.frameOffsetY = 0;
    } else if (-0.8 < this.pointerAngle && this.pointerAngle <= -0.25) {
      this.setFrame('Arms_4', true, false);
      this.rotation = this.pointerAngle + 0.6;
      this.setOrigin(0.1, 1);
      this.frameOffsetX = 1;
      this.frameOffsetY = 4;
    } else {
      this.setFrame('Arms_5', true, false);
      this.rotation = this.pointerAngle +  0.9;
      this.setOrigin(0.1, 1);
      this.frameOffsetX = 1;
      this.frameOffsetY = 3;
    }

    if (this.flipX) {
      this.rotation = -this.rotation;
      this.frameOffsetX = -this.frameOffsetX;
      this.setOrigin(1 - this.originX, this.originY);
    }
  }
}