import { Component, OnInit } from '@angular/core';

import Phaser from 'phaser';

class MainScene extends Phaser.Scene {
  platforms: Phaser.Physics.Arcade.StaticGroup;
  player: Phaser.Types.Physics.Arcade.SpriteWithDynamicBody;
  cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  stars: Phaser.Physics.Arcade.Group;
  score: number = 0;
  scoreText: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'main' });
  }

  preload(): void {
    this.load.setBaseURL('');

    this.load.image('sky', 'assets/images/sky.png');
    this.load.image('ground', 'assets/images/platform.png');
    this.load.image('star', 'assets/images/star.png');
    this.load.image('bomb', 'assets/images/bomb.png');
    this.load.spritesheet('dude', 'assets/images/dude.png', { frameWidth: 32, frameHeight: 48 });
  }

  create(): void {
    this.createBackground();
    this.createPlatforms();
    this.createPlayer();
    this.createStars();
    this.createScore();

    this.setupControls();
  }

  override update(): void {
    if (this.cursors.left.isDown)
    {
      this.player.setVelocityX(-160);
    
      this.player.anims.play('left', true);
    }
    else if (this.cursors.right.isDown)
    {
      this.player.setVelocityX(160);
    
      this.player.anims.play('right', true);
    }
    else
    {
      this.player.setVelocityX(0);
    
      this.player.anims.play('turn');
    }
    
    if (this.cursors.up.isDown && this.player.body.touching.down)
    {
      this.player.setVelocityY(-330);
    }
  }

  private createBackground(): void {
    this.add.image(0, 0, 'sky').setOrigin(0, 0);
  }

  private createPlatforms(): void {
    this.platforms = this.physics.add.staticGroup();

    this.platforms.create(400, 568, 'ground').setScale(2).refreshBody();

    this.platforms.create(600, 400, 'ground');
    this.platforms.create(50, 250, 'ground');
    this.platforms.create(750, 220, 'ground');
  }

  private createPlayer(): void {
    this.player = this.physics.add.sprite(100, 450, 'dude');

    this.player.setBounce(0.2);
    this.player.setCollideWorldBounds(true);

    this.anims.create({
      key: 'left',
      frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1
    });
  
    this.anims.create({
      key: 'turn',
      frames: [ { key: 'dude', frame: 4 } ],
      frameRate: 20
    });
    
    this.anims.create({
      key: 'right',
      frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1
    });

    this.physics.add.collider(this.player, this.platforms);
  }

  private createStars(): void {
    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
    });
    
    this.stars.children.iterate(star => {
      (star as Phaser.Physics.Arcade.Sprite).setBounceY(Phaser.Math.FloatBetween(0.1, 0.4));
    });

    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(this.player, this.stars, this.collectStar, undefined, this);
  }

  private createScore(): void {
    this.scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', color: '#000' });
  }

  private collectStar(player: Phaser.GameObjects.GameObject, star: Phaser.GameObjects.GameObject): void {
    (star as Phaser.Physics.Arcade.Sprite).disableBody(true, true);

    this.score += 10;
    this.scoreText.setText('Score: ' + this.score);
  }

  private setupControls(): void {
    this.cursors = this.input.keyboard.createCursorKeys();
  }
}

@Component({
  selector: 'app-game',
  templateUrl: './game.component.html',
  styleUrls: ['./game.component.scss']
})
export class GameComponent implements OnInit {
  phaserGame: Phaser.Game;

  ngOnInit() {
    this.phaserGame = new Phaser.Game({
      type: Phaser.AUTO,
      scene: [ MainScene ],
      scale: {
        mode: Phaser.Scale.FIT,
        parent: 'gameContainer',
        height: 600,
        width: 800
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 300 },
          debug: false,
        }
      }
    });
  }
}
