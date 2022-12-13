import { IMainScene } from "../models/main-scene.model";

enum Animations {
  LEFT = 'left',
  RIGHT = 'right',
  IDLE = 'idle',
  DEATH = 'death',
  KICK = 'kick',
}

const KEY: string = 'Biker';
const DIE_TINT = 0xff0000;

export class Player extends Phaser.Physics.Arcade.Sprite {
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;

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
  }
  
  public override update() {
    if (this.cursors.left.isDown) {
      this.setVelocityX(-300);
      this.anims.play(Animations.LEFT, true);
      this.flipX = true;
    } else if (this.cursors.right.isDown) {
      this.setVelocityX(300);
      this.anims.play(Animations.RIGHT, true);
      this.flipX = false;
    } else if (this.cursors.shift.isDown) {
      this.setVelocityX(0);
      this.anims.play(Animations.KICK, true);
    } else {
      this.setVelocityX(0);
      this.anims.play(Animations.IDLE, true);
    }
    
    if (this.cursors.up.isDown && this.body.touching.down) {
      this.setVelocityY(-750);
    }
  }
  
  public die(): void {
    this.setTint(DIE_TINT);
    this.anims.play(Animations.DEATH);
    this.setDisplayOrigin(this.displayOriginX, this.displayOriginY - 40);
  }
  
  private setupPlayer(): void {
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);
    this.setBounce(0.2);
  }
  
  private setupAnimations(): void {
    this.anims.create({
      key: Animations.LEFT,
      frames: this.anims.generateFrameNames(KEY, { prefix: 'Run_', end: 6 }),
      frameRate: 10,
      repeat: -1,
    });
  
    this.anims.create({
      key: Animations.IDLE,
      frames: this.anims.generateFrameNames(KEY, { prefix: 'Idle_', end: 4 }),
      frameRate: 10,
      repeat: -1,
    });
    
    this.anims.create({
      key: Animations.RIGHT,
      frames: this.anims.generateFrameNames(KEY, { prefix: 'Run_', end: 6 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: Animations.DEATH,
      frames: this.anims.generateFrameNames(KEY, { prefix: 'Death_', end: 6 }),
      frameRate: 10,
    });

    this.anims.create({
      key: Animations.KICK,
      frames: this.anims.generateFrameNames(KEY, { prefix: 'Kick_', end: 6 }),
      frameRate: 10,
    });
  }
  
  private setupColliders() {
    this.setCollideWorldBounds(true);
    this.scene.physics.add.collider(this, this.scene.platforms);
  }
  
  private setupControls(): void {
    this.cursors = this.scene.input.keyboard.createCursorKeys();
  }
}