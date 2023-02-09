import { capitalizeString } from "../helpers/string.helpers";
import { IMainScene } from "../models/main-scene.model";
import { PlayerActionStates, PlayerAnimations, PlayerWieldingStates } from "../models/player.model";
import StateMachine from "../state-machine";
import { PlayerArms } from "./player-arms";

const KEY: string = 'Biker';
const DEFAULT_FRAME_RATE = 10;

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private wieldingToggleKey: Phaser.Input.Keyboard.Key;
  private stateMachine: StateMachine;
  private wieldingStateMachine: StateMachine;
  private rifleArms: Phaser.GameObjects.Sprite;

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
    this.setupWieldingStateMachine();
    this.setupAnimationListeners();

    this.setOrigin(0.5, 1);
  }
  
  public override update(time: number, delta: number) {
    this.stateMachine.update(delta);
    this.wieldingStateMachine.update(delta);
    this.setSize(this.width, this.height);
    this.rifleArms.update(time, delta);
  }
  
  public die(): void {
    this.anims.play(PlayerAnimations.DEATH);
    this.setVelocityY(200);
  }
  
  private setupPlayer(): void {
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.rifleArms = new PlayerArms(this.scene, this.x, this.y - this.height / 2, this);
    //this.rifleArms = this.scene.add.sprite(this.x, this.y - this.height / 2, 'Biker_arm').setOrigin(0.1, 0.15);
  }
  
  private setupAnimations(): void {
    this.anims.create({
      key: PlayerAnimations.RUN,
      frames: this.anims.generateFrameNames(KEY, { prefix: `${capitalizeString(PlayerAnimations.RUN)}_`, end: 6 }),
      frameRate: DEFAULT_FRAME_RATE,
      repeat: -1,
    });
  
    this.anims.create({
      key: PlayerAnimations.IDLE,
      frames: this.anims.generateFrameNames(KEY, { prefix: `${capitalizeString(PlayerAnimations.IDLE)}_`, end: 4 }),
      frameRate: DEFAULT_FRAME_RATE,
      repeat: -1,
    });

    this.anims.create({
      key: PlayerAnimations.DEATH,
      frames: this.anims.generateFrameNames(KEY, { prefix: `${capitalizeString(PlayerAnimations.DEATH)}_`, end: 6 }),
      frameRate: DEFAULT_FRAME_RATE,
    });

    this.anims.create({
      key: PlayerAnimations.KICK,
      frames: this.anims.generateFrameNames(KEY, { prefix: `${capitalizeString(PlayerAnimations.KICK)}_`, end: 6 }),
      frameRate: DEFAULT_FRAME_RATE,
    });

    // Animations with player holding a rifle
    this.anims.create({
      key: PlayerAnimations.RIFLE_RUN,
      frames: this.anims.generateFrameNames(KEY, { prefix: `${capitalizeString(PlayerAnimations.RIFLE_RUN)}_`, end: 6 }),
      frameRate: DEFAULT_FRAME_RATE,
      repeat: -1,
    });

    this.anims.create({
      key: PlayerAnimations.RIFLE_IDLE,
      frames: this.anims.generateFrameNames(KEY, { prefix: `${capitalizeString(PlayerAnimations.RIFLE_IDLE)}_`, end: 4 }),
      frameRate: DEFAULT_FRAME_RATE,
      repeat: -1,
    });
  }
  
  private setupColliders() {
    this.setCollideWorldBounds(true);
    this.scene.physics.add.collider(this, this.scene.platforms);
  }
  
  private setupControls(): void {
    this.cursors = this.scene.input.keyboard.createCursorKeys();
    this.wieldingToggleKey = this.scene.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q);
  }

  private setupStateMachine(): void {
    this.stateMachine = new StateMachine(this, 'player');
    this.stateMachine
      .addState({
        name: PlayerActionStates.IDLE,
        onEnter: this.onIdleEnter,
        onUpdate: this.onIdleUpdate,
      })
      .addState({
        name: PlayerActionStates.RUN,
        onEnter: this.onRunEnter,
        onUpdate: this.onRunUpdate
      })
      .addState({
        name: PlayerActionStates.KICK, 
        onEnter: this.onKickEnter,
      })
      .addState({
        name: PlayerActionStates.JUMP,
        onEnter: this.onJumpEnter,
        onUpdate: this.onJumpUpdate
      })
      .addState({
        name: PlayerActionStates.FALL,
        onUpdate: this.onFallUpdate
      })

    this.stateMachine.setState(PlayerActionStates.IDLE);
  }

  private setupWieldingStateMachine(): void {
    this.wieldingStateMachine = new StateMachine(this, 'player-wielding', 400);
    this.wieldingStateMachine
      .addState({
        name: PlayerWieldingStates.NOTHING,
        onEnter: this.onWieldingNothingEnter,
        onUpdate: this.onWieldingNothingUpdate
      })
      .addState({
        name: PlayerWieldingStates.RIFLE,
        onEnter: this.onWieldingRifleEnter,
        onUpdate: this.onWieldingRifleUpdate,
      });

      this.wieldingStateMachine.setState(PlayerWieldingStates.NOTHING);
  }

  private onWieldingNothingEnter(): void {
    switch (this.stateMachine.currentStateName) {
      case PlayerActionStates.IDLE:
        this.anims.play(PlayerAnimations.IDLE);
        break;
      case PlayerActionStates.RUN:
        this.anims.play(PlayerAnimations.RUN);
        break;
    }
  }

  private onWieldingNothingUpdate(): void {
    if (this.wieldingToggleKey.isDown) {
      this.wieldingStateMachine.setState(PlayerWieldingStates.RIFLE);
    }
  }

  private onWieldingRifleEnter(): void {
    switch (this.stateMachine.currentStateName) {
      case PlayerActionStates.IDLE:
        this.anims.play(PlayerAnimations.RIFLE_IDLE);
        break;
      case PlayerActionStates.RUN:
        this.anims.play(PlayerAnimations.RIFLE_RUN);
        break;
    }
  }

  private onWieldingRifleUpdate(): void {
    if (this.wieldingToggleKey.isDown) {
      this.wieldingStateMachine.setState(PlayerWieldingStates.NOTHING);
    }
  }

  private onIdleEnter(): void {
    this.setVelocityX(0);

    switch (this.wieldingStateMachine?.currentStateName) {
      case PlayerWieldingStates.NOTHING:
        this.anims.play(PlayerAnimations.IDLE);
        break;
      case PlayerWieldingStates.RIFLE:
        this.anims.play(PlayerAnimations.RIFLE_IDLE);
        break;
    }
  }

  private onIdleUpdate(): void {
    if (this.cursors.left.isDown || this.cursors.right.isDown) {
			this.stateMachine.setState(PlayerActionStates.RUN);
		} else if (this.cursors.shift.isDown) {
			this.stateMachine.setState(PlayerActionStates.KICK);
		}

    if (this.cursors.up.isDown && (this.body as Phaser.Physics.Arcade.Body).onFloor()) {
      this.stateMachine.setState(PlayerActionStates.JUMP);
    } else if (this.body.velocity.y > 100 && !(this.body as Phaser.Physics.Arcade.Body).onFloor()) {
      this.stateMachine.setState(PlayerActionStates.FALL);
    }
  }

  private onRunEnter(): void {
    switch (this.wieldingStateMachine?.currentStateName) {
      case PlayerWieldingStates.NOTHING:
        this.anims.play(PlayerAnimations.RUN);
        break;
      case PlayerWieldingStates.RIFLE:
        this.anims.play(PlayerAnimations.RIFLE_RUN);
        break;
    }
  }

  private onRunUpdate(): void {
    if (this.cursors.left.isDown) {
      this.setVelocityX(-300);
      this.flipX = true;
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(300);
      this.flipX = false;
    } else if (this.cursors.shift.isDown) {
      this.stateMachine.setState(PlayerActionStates.KICK);
    } else {
      this.stateMachine.setState(PlayerActionStates.IDLE);
    }

    if (this.cursors.up.isDown && (this.body as Phaser.Physics.Arcade.Body).onFloor()) {
      this.stateMachine.setState(PlayerActionStates.JUMP);
    } else if (this.body.velocity.y > 50 && !(this.body as Phaser.Physics.Arcade.Body).onFloor()) {
      this.stateMachine.setState(PlayerActionStates.FALL);
    }
  }

  private onKickEnter(): void {
    this.setVelocityX(0);
    this.anims.play(PlayerAnimations.KICK);
  }

  private setupAnimationListeners(): void {
    this.on(`${Phaser.Animations.Events.ANIMATION_COMPLETE}-${PlayerAnimations.KICK}`, () => this.stateMachine.setState(PlayerActionStates.IDLE));

    //this.on(Phaser.Animations.Events.ANIMATION_UPDATE, () => this.rifleArms// send info about current frame)
  }

  private onJumpEnter(): void {
    this.setVelocityY(-750);
  }

  private onJumpUpdate(): void {
    if ((this.body as Phaser.Physics.Arcade.Body).onFloor()) {
      if (this.cursors.left.isDown || this.cursors.right.isDown) {
        this.stateMachine.setState(PlayerActionStates.RUN);
      } else {
        this.stateMachine.setState(PlayerActionStates.IDLE);
      }
    }

    let jumpFramePrefix = `${capitalizeString(PlayerAnimations.JUMP)}_`;
    switch (this.wieldingStateMachine?.currentStateName) {
      case PlayerWieldingStates.RIFLE:
        jumpFramePrefix = `${capitalizeString(PlayerAnimations.RIFLE_JUMP)}_`;
        break;
    }

    if (this.body.velocity.y < 0) {
      this.setFrame(`${jumpFramePrefix}1`, true, false);
    } else if (this.body.velocity.y < 150) {
      this.setFrame(`${jumpFramePrefix}2`, true, false);
    } else if (this.body.velocity.y < 400) {
      this.setFrame(`${jumpFramePrefix}3`, true, false);
    } else {
      this.setFrame(`${jumpFramePrefix}4`, true, false);
    }

    if (this.cursors.left.isDown) {
      this.setVelocityX(-300);
      this.flipX = true;
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(300);
      this.flipX = false;
    } else {
      this.setVelocityX(0);
    }
  }

  private onFallUpdate(): void {
    if ((this.body as Phaser.Physics.Arcade.Body).onFloor()) {
      if (this.cursors.left.isDown || this.cursors.right.isDown) {
        this.stateMachine.setState(PlayerActionStates.RUN);
      } else {
        this.stateMachine.setState(PlayerActionStates.IDLE);
      }
    }

    let fallFramePrefix = `${capitalizeString(PlayerAnimations.JUMP)}_`;
    switch (this.wieldingStateMachine?.currentStateName) {
      case PlayerWieldingStates.RIFLE:
        fallFramePrefix = `${capitalizeString(PlayerAnimations.RIFLE_JUMP)}_`;
        break;
    }

    if (this.body.velocity.y < 400) {
      this.setFrame(`${fallFramePrefix}3`, false, false);
    } else {
      this.setFrame(`${fallFramePrefix}4`, false, false);
    }

    if (this.cursors.left.isDown) {
      this.setVelocityX(-300);
      this.flipX = true;
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(300);
      this.flipX = false;
    } else {
      this.setVelocityX(0);
    }
  }
}