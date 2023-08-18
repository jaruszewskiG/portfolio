import { getBulletVelocity } from "../../helpers/bullet";
import { EnemyActionStates, EnemyAnimations, EnemyIdleActionStates } from "../../models/enemy.model";
import { IMainScene } from "../../models/main-scene.model";
import StateMachine from "../../state-machine";
import { Bullet } from "../shared/bullet";
import { EnemySightInstance } from "./enemy-sight-instance";

const KEY: string = 'Enemy';
const DEFAULT_FRAME_RATE = 10;

export class Enemy extends Phaser.Physics.Arcade.Sprite {
  private stateMachine: StateMachine;
  private didTouchWallRecently = false;
  private angleBetweenEnemyAndPlayer: number;
  private isTargetDetected = false;
  private lastTimeTargetWasVisible = 0;
  private isAlive = true;
  private runningIntervals: NodeJS.Timer[] = [];
  public hitpoints: number = 3;

  private get timeSinceTargetWasVisible(): number {
    return performance.now() - this.lastTimeTargetWasVisible;
  }

  constructor(
    public override scene: IMainScene,
    x: number,
    y: number,
  ) {
    super(scene, x, y, KEY);
  
    this.init();
  }

  // PUBLIC FUNCTIONS
  
  public override update(time: number, delta: number) {
    if (this.isAlive) {
      this.stateMachine.update(delta);
      this.setSize(this.width, this.height);
    }
  }

  public playerDetected() {
    if (this.isAlive) {
      this.isTargetDetected = true;
      this.lastTimeTargetWasVisible = performance.now();
  
      this.stateMachine.setState(EnemyActionStates.FIRE);
    }
  }

  public hit(damage: number): void {
    this.hitpoints -= damage;
    
    if (this.hitpoints < 1) {
      this.die();
    } else {
      this.tint = 0xff0000;
      
      setTimeout(() => this.clearTint(), 50);
    }
  }

  public die() {
    this.stateMachine.setState(EnemyActionStates.DEATH);
    this.disableBody();
  }

  // INIT FUNCTIONS
  
  private init(): void {
    this.scene.physics.world.enable(this);
    this.scene.add.existing(this);

    this.setupRunningIntervals();
    this.setCollideWorldBounds(true);
    this.setupAnimations();
    this.setAcceleration(0, 800);
    this.setupStateMachine();

    this.setOrigin(0.5, 1);
    this.flipX = true;
  }

  private setupRunningIntervals(): void {
    console.log('setup intervals')
    this.runningIntervals.push(setInterval(() => {
      if (!this.isTargetDetected) {
        this.setRandomState();
      }
    }, 2000));

    this.runningIntervals.push(setInterval(() => {
      // Top sight instance
      this.createSightInstanceAtTarget(this.scene.player.x, this.scene.player.y - this.scene.player.height + 1);

      // Bottom sight instance
      this.createSightInstanceAtTarget(this.scene.player.x, this.scene.player.y - 1);
    }, 100))
  }

  private createSightInstanceAtTarget(targetX: number, targetY: number) {
    const angle = Phaser.Math.Angle.Between(this.x, this.y - this.height * 0.8, targetX, targetY);
    const velocityX = 1000 * Math.cos(angle);
    const velocityY = 1000 * Math.sin(angle);

    // Only create EnemySightInstance if Enemy is facing the player
    if (
      (this.flipX && velocityX <= 0) ||
      (!this.flipX && velocityX >= 0)
    ) {
      new EnemySightInstance(this.scene, this.x, this.y - this.height * 0.8, velocityX, velocityY, this);
    }
  }

  private setRandomState(): void {
    if (this.stateMachine.currentStateName !== EnemyIdleActionStates.WALK) {
      this.setRandomFlipX();
    }

    const enumValues = Object.values(EnemyIdleActionStates);
    const randomIndex = Math.floor(Math.random() * enumValues.length);
    this.stateMachine.setState(enumValues[randomIndex]);
  }

  private setRandomFlipX(): void {
    if (this.didTouchWallRecently) {
        return;
    }

    if (Math.random() < .5) {
      this.flipX = !this.flipX;
    }
  }

  private setupAnimations(): void {
    this.anims.create({
      key: EnemyAnimations.WALK,
      frames: this.anims.generateFrameNames(KEY, { prefix: `${EnemyAnimations.WALK}_`, end: 6 }),
      frameRate: DEFAULT_FRAME_RATE,
      repeat: -1,
    });
  
    this.anims.create({
      key: EnemyAnimations.IDLE,
      frames: this.anims.generateFrameNames(KEY, { prefix: `${EnemyAnimations.IDLE}_`, end: 4 }),
      frameRate: DEFAULT_FRAME_RATE,
      repeat: -1,
    });

    this.anims.create({
      key: EnemyAnimations.DEATH,
      frames: this.anims.generateFrameNames(KEY, { prefix: `${EnemyAnimations.DEATH}_`, end: 6 }),
      frameRate: DEFAULT_FRAME_RATE,
    });

    this.anims.create({
      key: EnemyAnimations.FIRE_MIDDLE,
      frames: this.anims.generateFrameNames(KEY, { prefix: `${EnemyAnimations.FIRE_MIDDLE}_`, end: 2 }),
      frameRate: DEFAULT_FRAME_RATE,
    });
  }

  // STATE MACHINE SETUP

  private setupStateMachine(): void {
    this.stateMachine = new StateMachine(this, 'enemy');
    this.stateMachine
      .addState({
        name: EnemyActionStates.IDLE,
        onEnter: this.onIdleEnter,
      })
      .addState({
        name: EnemyActionStates.WALK,
        onEnter: this.onWalkEnter,
        onUpdate: this.onWalkUpdate
      })
      .addState({
        name: EnemyActionStates.FIRE, 
        onEnter: this.onFireEnter,
        onUpdate: this.onFireUpdate
      })
      .addState({
        name: EnemyActionStates.DEATH,
        onEnter: this.onDeathEnter,
      })

    this.stateMachine.setState(EnemyActionStates.IDLE);
  }

  private onIdleEnter(): void {
    this.setVelocity(0);

    this.anims.play(EnemyAnimations.IDLE);
  }

  private onWalkEnter(): void {
    this.anims.play(EnemyAnimations.WALK);
    this.didTouchWallRecently = false;
  }

  private onWalkUpdate(): void {
    if (this.flipX) {
        this.setVelocityX(-80);
    } else {
        this.setVelocityX(80);
    }

    if (this.body.blocked.left) {
        this.flipX = false;
        this.stateMachine.setState(EnemyActionStates.IDLE);
        this.didTouchWallRecently = true;
    } else if (this.body.blocked.right) {
        this.flipX = true;
        this.stateMachine.setState(EnemyActionStates.IDLE)
        this.didTouchWallRecently = true;
    }

    this.preventFromFalling();
  }

  private onFireEnter(): void {
    this.setVelocity(0);
    this.anims.play(EnemyAnimations.FIRE_MIDDLE);
  }

  private onFireUpdate(): void {
    if (!this.anims.isPlaying && this.isTargetDetected) {
      this.anims.play(EnemyAnimations.FIRE_MIDDLE);
      this.fireAtTarget();
    }

    if (this.timeSinceTargetWasVisible > 1000) {
      this.isTargetDetected = false;
      this.setRandomState();
    }
  }

  private onDeathEnter(): void {
    this.anims.play(EnemyAnimations.DEATH);
    this.isAlive = false;
    this.destroyRunningIntervals();
  }

  // PRIVATE FUNCTIONS

  private preventFromFalling(): void {
    if (
        !this.scene.tilemap.getTileAtWorldXY(this.x - this.width / 2 - 2, this.y) && this.flipX ||
        !this.scene.tilemap.getTileAtWorldXY(this.x + this.width / 2 + 2, this.y) && !this.flipX
    ) {
        this.stateMachine.setState(EnemyActionStates.IDLE);
    }
  }

  private fireAtTarget(): void {
    this.angleBetweenEnemyAndPlayer = Phaser.Math.Angle.Between(this.x, this.y - this.height * 0.8, this.scene.player.x, this.scene.player.y - this.scene.player.height / 2 - 8);

    const bulletVelocity = getBulletVelocity(300, this.angleBetweenEnemyAndPlayer);

    if (this.flipX) {
      new Bullet(this.scene, this.x, this.y - this.height / 2 - 4, bulletVelocity.x, bulletVelocity.y, this.angleBetweenEnemyAndPlayer, this.scene.player, 'Bullet_11', 2);
    } else {
      new Bullet(this.scene, this.x, this.y - this.height / 2 - 4, bulletVelocity.x, bulletVelocity.y, this.angleBetweenEnemyAndPlayer, this.scene.player, 'Bullet_11', 2);
    }
  }

  private destroyRunningIntervals(): void {
    this.runningIntervals.map(runningInterval => clearInterval(runningInterval));
    this.runningIntervals = [];
    console.log('destroyed intervals');
  }
}