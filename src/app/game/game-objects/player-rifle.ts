import { IMainScene } from "../models/main-scene.model";
import { PlayerArms } from "./player-arms";

const KEY: string = 'Biker_rifle';

export class PlayerRifle extends Phaser.GameObjects.Sprite {
  private arms: PlayerArms;

  private armsFrameOffsetX = 0;
  private armsFrameOffsetY = 0;

  constructor(
    public override scene: IMainScene,
    x: number,
    y: number,
    arms: PlayerArms,
  ) {
    super(scene, x, y, KEY);

    this.arms = arms;

    this.initialSetup()
  }
  
  public override update() {
    if (this.visible !== this.arms.visible) {
      this.setVisible(this.arms.visible);
    }

    if (!this.visible) {
      return;
    }
  
    if (this.flipX !== this.arms.flipX) {
      this.flipX = this.arms.flipX;
      
      if (this.flipX) {
        this.setOrigin(0.9, 0.5);
      } else {
        this.setOrigin(0.1, 0.5);
      }
    }

    this.updateArmsFrameOffset();

    if (this.flipX) {
      this.rotation = -this.arms.pointerAngle;
      this.armsFrameOffsetX = -this.armsFrameOffsetX;
    } else {
      this.rotation = this.arms.pointerAngle;
    }

    Phaser.Display.Bounds.SetCenterX(this, this.arms.x);
    Phaser.Display.Bounds.SetBottom(this, this.arms.y);

    this.x = this.arms.x + this.armsFrameOffsetX;
    this.y = this.arms.y + this.armsFrameOffsetY;
  }

  private updateArmsFrameOffset() {
    switch(this.arms.frame.name) {
      case 'Arms_1':
        this.armsFrameOffsetX = 4;
        this.armsFrameOffsetY = 2;
        break;
      case 'Arms_2':
        this.armsFrameOffsetX = 6;
        this.armsFrameOffsetY = 0;
        break;
      case 'Arms_3':
        this.armsFrameOffsetX = 4;
        this.armsFrameOffsetY = 1;
        break;
      case 'Arms_4':
        this.armsFrameOffsetX = 5;
        this.armsFrameOffsetY = -1;
        break;
      case 'Arms_5':
        this.armsFrameOffsetX = 6;
        this.armsFrameOffsetY = 0;
        break;
    }
  }

  private initialSetup(): void {
    this.scene.add.existing(this);
    this.setFrame('Rifle_4_1', true, false);
    this.setOrigin(0.1, 0.5);
    this.setDepth(this.arms.depth - 1);
  }
}