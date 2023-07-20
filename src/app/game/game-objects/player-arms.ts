import { EventEmitter } from "@angular/core";
import { capitalizeString } from "../helpers/string.helpers";
import { IMainScene } from "../models/main-scene.model";
import { PlayerAnimations, PlayerWieldingStates, PlayerActionStates } from "../models/player.model";
import { Player } from './player';

const KEY: string = 'Biker_arms';

export class PlayerArms extends Phaser.GameObjects.Sprite {

  private player: Player;
  private playerActionState: PlayerActionStates;

  private pointerAngle: number = 0;
  private playerActionStateOffsetX: number = 0;
  private playerActionStateOffsetY: number = 0;
  private frameOffsetX: number = 0;
  private frameOffsetY: number = 0;
  private playerFrameOffsetX: number = 0;
  private playerFrameOffsetY: number = 0;

  constructor(
    public override scene: IMainScene,
    x: number,
    y: number,
    player: Player,
    initialWieldingState: PlayerWieldingStates,
    playerActionStateChanged: EventEmitter<string>,
  ) {
    super(scene, x, y, KEY);

    this.player = player;

    this.initialSetup(initialWieldingState);
    this.setupPointer();
    playerActionStateChanged.subscribe((newState: PlayerActionStates) => {
      this.playerActionState = newState;
      this.updatePlayerActionStateOffsets();
    });
  }
  
  public override update() {
    if (this.flipX !== this.player.flipX) {
      this.flipX = this.player.flipX;
      this.adjustPositionBasedOnPointerAngle();
      this.updatePlayerActionStateOffsets();
    }

    this.updatePlayerFrameOffsets();

    if (this.flipX) {
      this.playerFrameOffsetX = -this.playerFrameOffsetX;
    }

    Phaser.Display.Bounds.SetCenterX(this, this.player.body.center.x);
    Phaser.Display.Bounds.SetBottom(this, this.player.body.top);

    this.x = this.x + this.playerActionStateOffsetX + this.frameOffsetX + this.playerFrameOffsetX;
    this.y = this.y + this.playerActionStateOffsetY + this.frameOffsetY + this.playerFrameOffsetY;
  }

  public playerWieldingStateChange(wieldingState: PlayerWieldingStates): void {
    if (wieldingState === PlayerWieldingStates.NOTHING) {
      this.setVisible(false);
    } else {
      this.setVisible(true);
    }
  }

  private updatePlayerActionStateOffsets(): void {
    switch(this.playerActionState) {
      case PlayerActionStates.IDLE:
        this.playerActionStateOffsetY = -5;

        if (this.flipX) {
          this.playerActionStateOffsetX = 16;
        } else {
          this.playerActionStateOffsetX = 4;
        }
        break;
      case PlayerActionStates.RUN:
        this.playerActionStateOffsetY = -4;

        if (this.flipX) {
          this.playerActionStateOffsetX = 17;
        } else {
          this.playerActionStateOffsetX = 4;
        }
        break;
      case PlayerActionStates.JUMP:
        this.playerActionStateOffsetY = -5;

        if (this.flipX) {
          this.playerActionStateOffsetX = 14;
        } else {
          this.playerActionStateOffsetX = 6;
        }
        break;
    }
  }

  private updatePlayerFrameOffsets(): void {
    switch(this.player.frame.name) {
      case `${capitalizeString(PlayerAnimations.RIFLE_IDLE)}_1`: 
        this.playerFrameOffsetX = 0;
        this.playerFrameOffsetY = 0;
        break;
      case `${capitalizeString(PlayerAnimations.RIFLE_IDLE)}_2`: 
        this.playerFrameOffsetX = -1;
        this.playerFrameOffsetY = 0;
        break;
      case `${capitalizeString(PlayerAnimations.RIFLE_IDLE)}_3`: 
        this.playerFrameOffsetX = -1;
        this.playerFrameOffsetY = 0;
        break;
      case `${capitalizeString(PlayerAnimations.RIFLE_IDLE)}_4`: 
        this.playerFrameOffsetX = 0;
        this.playerFrameOffsetY = 0;
        break;
      case `${capitalizeString(PlayerAnimations.RIFLE_RUN)}_1`:
        this.playerFrameOffsetX = 4;
        this.playerFrameOffsetY = 2;
        break;
      case `${capitalizeString(PlayerAnimations.RIFLE_RUN)}_2`:
        this.playerFrameOffsetX = 3;
        this.playerFrameOffsetY = 2;
        break;
      case `${capitalizeString(PlayerAnimations.RIFLE_RUN)}_3`:
        this.playerFrameOffsetX = 2;
        this.playerFrameOffsetY = 1;
        break;
      case `${capitalizeString(PlayerAnimations.RIFLE_RUN)}_4`:
        this.playerFrameOffsetX = 1;
        this.playerFrameOffsetY = 1;
        break;
      case `${capitalizeString(PlayerAnimations.RIFLE_RUN)}_5`:
        this.playerFrameOffsetX = 2;
        this.playerFrameOffsetY = 2;
        break;
      case `${capitalizeString(PlayerAnimations.RIFLE_RUN)}_6`:
        this.playerFrameOffsetX = 3;
        this.playerFrameOffsetY = 2;
        break;
      case `${capitalizeString(PlayerAnimations.RIFLE_JUMP)}_1`:
        this.playerFrameOffsetX = 2;
        this.playerFrameOffsetY = -3;
        break;
      case `${capitalizeString(PlayerAnimations.RIFLE_JUMP)}_2`:
        this.playerFrameOffsetX = 5;
        this.playerFrameOffsetY = -2;
        break;
      case `${capitalizeString(PlayerAnimations.RIFLE_JUMP)}_3`:
        this.playerFrameOffsetX = 3;
        this.playerFrameOffsetY = 0;
        break;
      case `${capitalizeString(PlayerAnimations.RIFLE_JUMP)}_4`:
        this.playerFrameOffsetX = 3;
        this.playerFrameOffsetY = 1;
        break;
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
    this.adjustPositionBasedOnPointerAngle();

    this.scene.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      const newPointerAngle = this.flipX ? this.pointerAngle + pointer.movementY / 200 : this.pointerAngle + pointer.movementY / 200;
      this.pointerAngle = newPointerAngle > 1.4 || newPointerAngle < -1.4 ? this.pointerAngle : newPointerAngle;

      this.adjustPositionBasedOnPointerAngle();
    });
  }

  private adjustPositionBasedOnPointerAngle(): void {
    if (0.75 < this.pointerAngle && this.pointerAngle <= 1.4) {
      this.setFrame('Arms_1', true, false);
      this.rotation = this.pointerAngle - 1.2;
      this.setOrigin(0.5, 0);
      this.frameOffsetX = -8;
      this.frameOffsetY = 29;
    } else if (0.3 < this.pointerAngle && this.pointerAngle <= 0.75) {
      this.setFrame('Arms_2', true, false);
      this.rotation = this.pointerAngle - 0.6;
      this.setOrigin(0.1, 0);
      this.frameOffsetX = -4;
      this.frameOffsetY = 31;
    } else if (-0.4 < this.pointerAngle && this.pointerAngle <= 0.3) {
      this.setFrame('Arms_3', true, false);
      this.rotation = this.pointerAngle;
      this.setOrigin(0.1, 0);
      this.frameOffsetX = -2;
      this.frameOffsetY = 25;
    } else if (-0.8 < this.pointerAngle && this.pointerAngle <= -0.4) {
      this.setFrame('Arms_4', true, false);
      this.rotation = this.pointerAngle + 0.6;
      this.setOrigin(0.1, 1);
      this.frameOffsetX = -1;
      this.frameOffsetY = 21;
    } else {
      this.setFrame('Arms_5', true, false);
      this.rotation = this.pointerAngle +  0.9;
      this.setOrigin(0.1, 1);
      this.frameOffsetX = -2;
      this.frameOffsetY = 20;
    }

    if (this.flipX) {
      this.rotation = -this.rotation;
      this.frameOffsetX = -this.frameOffsetX - 19;
      this.setOrigin(1 - this.originX, this.originY);
    }
  }
}