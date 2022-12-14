import { Component, OnInit } from '@angular/core';

import Phaser from 'phaser';

import { Player } from './game-objects/player';
import { IMainScene } from './models/main-scene.model';

class MainScene extends Phaser.Scene implements IMainScene {
  platforms: Phaser.Physics.Arcade.StaticGroup;
  player: Player;
  stars: Phaser.Physics.Arcade.Group;
  bombs:  Phaser.Physics.Arcade.Group;
  score: number = 0;
  scoreText: Phaser.GameObjects.Text;
  isGameOver: boolean = false;
  gameOverText: Phaser.GameObjects.Text;

  constructor() {
    super({ key: 'main' });
  }

  preload(): void {
    this.load.setBaseURL('');

    this.load.image('sky', 'assets/images/sky.png');
    this.load.image('ground', 'assets/images/platform.png');
    this.load.image('star', 'assets/images/star.png');
    this.load.image('bomb', 'assets/images/bomb.png');
    this.load.atlas('Biker', 'assets/images/Biker/Biker.png', 'assets/images/Biker/Biker.json');
  }

  create(): void {
    this.createBackground();
    this.createPlatforms();
    this.player = new Player(this, 100, 150);
    this.createStars();
    this.createScore();
    this.createBombs();
  }

  override update(time: number, delta: number): void {
    if (this.isGameOver) {
      this.createGameOverText();
      return;
    }

    this.player.update(time, delta);
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

  private createStars(): void {
    const collectStar = (player: Phaser.GameObjects.GameObject, star: Phaser.GameObjects.GameObject): void => {
      (star as Phaser.Physics.Arcade.Sprite).disableBody(true, true);
  
      this.score += 10;
      this.scoreText.setText('SCORE: ' + this.score);

      if (this.stars.countActive(true) === 0) {
        this.stars.children.iterate(star => {
          (star as Phaser.Physics.Arcade.Sprite).enableBody(true, (star as Phaser.Physics.Arcade.Sprite).x, 0, true, true);
        });

        this.createBomb();
      }
    }

    this.stars = this.physics.add.group({
      key: 'star',
      repeat: 11,
      setXY: { x: 12, y: 0, stepX: 70 }
    });
    
    this.stars.children.iterate(star => {
      (star as Phaser.Physics.Arcade.Sprite).setBounceY(Phaser.Math.FloatBetween(0.1, 0.4));
    });

    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.overlap(this.player, this.stars, collectStar, undefined, this);
  }

  private createScore(): void {
    this.scoreText = this.add.text(16, 16, 'SCORE: 0', { fontSize: '32px', color: 'black', stroke: 'black', strokeThickness: 2 });
  }

  private createGameOverText(): void {
    this.gameOverText = this.add.text(220, 270, 'GAME OVER', { fontSize: '64px', color: 'red', stroke: 'red', strokeThickness: 3 });
  }

  private createBombs(): void {
    const hitBomb = (): void => {
      this.physics.pause();
      this.player.die();
      this.isGameOver = true;
    }

    this.bombs = this.physics.add.group();
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.collider(this.player, this.bombs, hitBomb, undefined, this);
  }

  private createBomb(): void {
    const x = (this.player.x < 400) ? Phaser.Math.Between(400, 800) : Phaser.Math.Between(0, 400);

    const bomb = this.bombs.create(x, 16, 'bomb');
    bomb.setBounce(1);
    bomb.setCollideWorldBounds(true);
    bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
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
          gravity: { y: 600 },
          debug: false,
        }
      }
    });
  }
}
