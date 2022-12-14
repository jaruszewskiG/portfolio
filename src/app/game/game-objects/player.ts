import { capitalizeString } from "../helpers/string.helpers";
import { IMainScene } from "../models/main-scene.model";
import { PlayerActions } from "../models/player.model";
import StateMachine from "../state-machine";

const KEY: string = 'Biker';
const DIE_TINT = 0xff0000;
const DEFAULT_FRAME_RATE = 10;

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private stateMachine: StateMachine;

  constructor(
    public override scene: IMainScene,
    x: number,
    y: number,
  ) {
    super(scene, x, y, KEY);
  
    this.setupPlayer();
    this.setupColliders();
    this.setupAnimations();
    this.setupControls();
    this.setAcceleration(0, 800);
    this.setupStateMachine();
    this.setupAnimationListeners();
  }
  
  public override update(time: number, delta: number) {
    this.stateMachine.update(delta);
    
    if (this.cursors.up.isDown && this.body.touching.down) {
      this.setVelocityY(-750);
    }
  }
  
  public die(): void {
    this.setTint(DIE_TINT);
    this.anims.play(PlayerActions.DEATH);
    this.setDisplayOrigin(this.displayOriginX, this.displayOriginY - 40);
  }
  
  private setupPlayer(): void {
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.setBounce(0.2);
  }
  
  private setupAnimations(): void {
    this.anims.create({
      key: PlayerActions.RUN,
      frames: this.anims.generateFrameNames(KEY, { prefix: `${capitalizeString(PlayerActions.RUN)}_`, end: 6 }),
      frameRate: DEFAULT_FRAME_RATE,
      repeat: -1,
    });
  
    this.anims.create({
      key: PlayerActions.IDLE,
      frames: this.anims.generateFrameNames(KEY, { prefix: `${capitalizeString(PlayerActions.IDLE)}_`, end: 4 }),
      frameRate: DEFAULT_FRAME_RATE,
      repeat: -1,
    });

    this.anims.create({
      key: PlayerActions.DEATH,
      frames: this.anims.generateFrameNames(KEY, { prefix: `${capitalizeString(PlayerActions.DEATH)}_`, end: 6 }),
      frameRate: DEFAULT_FRAME_RATE,
    });

    this.anims.create({
      key: PlayerActions.KICK,
      frames: this.anims.generateFrameNames(KEY, { prefix: `${capitalizeString(PlayerActions.KICK)}_`, end: 6 }),
      frameRate: DEFAULT_FRAME_RATE,
    });
  }
  
  private setupColliders() {
    this.setCollideWorldBounds(true);
    this.scene.physics.add.collider(this, this.scene.platforms);
  }
  
  private setupControls(): void {
    this.cursors = this.scene.input.keyboard.createCursorKeys();
  }

  private setupStateMachine(): void {
    this.stateMachine = new StateMachine(this, 'player');
    this.stateMachine
      .addState(PlayerActions.IDLE, {
        onEnter: this.onIdleEnter,
        onUpdate: this.onIdleUpdate,
      })
      .addState(PlayerActions.RUN, {
        onEnter: this.onRunEnter,
        onUpdate: this.onRunUpdate
      })
      .addState(PlayerActions.KICK, {
        onEnter: this.onKickEnter,
      })

    this.stateMachine.setState(PlayerActions.IDLE);
  }

  private onIdleEnter(): void {
    this.setVelocityX(0);
    this.anims.play(PlayerActions.IDLE);
  }

  private onIdleUpdate(): void {
    if (this.cursors.left.isDown || this.cursors.right.isDown) {
			this.stateMachine.setState(PlayerActions.RUN);
		} else if (this.cursors.shift.isDown) {
			this.stateMachine.setState(PlayerActions.KICK);
		}
  }

  private onRunEnter(): void {
    this.anims.play(PlayerActions.RUN);
  }

  private onRunUpdate(): void {
    if (this.cursors.left.isDown) {
      this.setVelocityX(-300);
      this.flipX = true;
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(300);
      this.flipX = false;
    } else if (this.cursors.shift.isDown) {
      this.stateMachine.setState(PlayerActions.KICK);
    } else {
      this.stateMachine.setState(PlayerActions.IDLE);
    }
  }

  private onKickEnter(): void {
    this.setVelocityX(0);
    this.anims.play(PlayerActions.KICK);
  }

  private setupAnimationListeners(): void {
    this.on(`${Phaser.Animations.Events.ANIMATION_COMPLETE}-${PlayerActions.KICK}`, () => this.stateMachine.setState(PlayerActions.IDLE));
  }
}