import { Component, OnInit } from '@angular/core';

import Phaser from 'phaser';

import { Player } from './game-objects/player/player';
import { IMainScene } from './models/main-scene.model';
import { Enemy } from './game-objects/enemy/enemy';

class MainScene extends Phaser.Scene implements IMainScene {
  platforms: Phaser.Tilemaps.TilemapLayer;
  player: Player;
  enemies: Phaser.Physics.Arcade.Group;
  stars: Phaser.Physics.Arcade.Group;
  bombs:  Phaser.Physics.Arcade.Group;
  hitpointsText: Phaser.GameObjects.Text;
  isGameOver: boolean = false;
  gameOverText: Phaser.GameObjects.Text;
  tilemap: Phaser.Tilemaps.Tilemap;
  tileset: Phaser.Tilemaps.Tileset;


  constructor() {
    super({ key: 'main' });
  }

  preload(): void {
    this.load.setBaseURL('');

    this.load.image('sky', 'assets/images/Background.png');
    this.load.image('sight', 'assets/images/sight.png');
    this.load.atlas('Biker', 'assets/images/Biker/Biker.png', 'assets/images/Biker/Biker.json');
    this.load.atlas('Enemy', 'assets/images/Enemies/Enemy/Enemy.png', 'assets/images/Enemies/Enemy/Enemy.json');
    this.load.atlas('Biker_arms', 'assets/images/Biker/Biker_arms.png', 'assets/images/Biker/Biker_arms.json');
    this.load.atlas('Biker_rifle', 'assets/images/Biker/Biker_rifles.png', 'assets/images/Biker/Biker_rifles.json');
    this.load.atlas('Biker_rifle_bullet', 'assets/images/Biker/Biker_rifle_bullets.png', 'assets/images/Biker/Biker_rifle_bullets.json');

    this.load.image('tiles', 'assets/images/tilemaps/cyberpunk_tileset.png');
    this.load.tilemapTiledJSON('map', 'assets/images/tilemaps/level_1.json');
  }

  create(): void {
    this.createBackground();
    this.player = new Player(this, 100, 150);
    this.setupEnemies();
    this.createTilemap();
    this.createPlatforms();
    this.createHitpoints();

    this.cameras.main.setBounds(0, 0, 1920, 600);
    this.physics.world.setBounds(0, 0, 1920, window.innerHeight);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);
  }

  override update(time: number, delta: number): void {
    if (this.isGameOver && !this.gameOverText) {
      this.cameras.main.stopFollow();
      this.createGameOverText();
    }

    this.player.update(time, delta);
    this.hitpointsText.setText('LIFE: ' + this.player.hitpoints);
  }

  private setupEnemies() {
    this.enemies = this.physics.add.group({ classType: Enemy, runChildUpdate: true });
    (this.enemies.defaults as {}) = {}

    this.enemies = this.enemies
      .add(new Enemy(this, 300, 150))
      .add(new Enemy(this, 470, 150))
      .add(new Enemy(this, 500, 150))
      .add(new Enemy(this, 700, 150));
  }

  private createBackground(): void {
    const image = this.add.image(this.cameras.main.width / 2, this.cameras.main.height / 2, 'sky');
    const scaleX = this.cameras.main.width / image.width;
    const scaleY = this.cameras.main.height / image.height;
    const scale = Math.max(scaleX, scaleY);
    image.setScale(scale).setScrollFactor(0);
  }

  private createTilemap(): void {
    this.tilemap = this.make.tilemap({ key: 'map' });
    this.tileset = this.tilemap.addTilesetImage('cyberpunk_tileset', 'tiles');
  }

  private createPlatforms(): void {
    this.platforms = this.tilemap.createLayer('Tile Layer 1', this.tileset);

    this.platforms.setCollisionBetween(1, this.platforms.tilesTotal, true, false);
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);

    // Loop through all tiles and remove collisions between adjastent tiles
    this.platforms.forEachTile(tile => {
      if (tile.index !== -1) {
        if (this.tilemap.getTileAt(tile.x, tile.y + 1)) {
          tile.collideDown = false;
        }

        if (this.tilemap.getTileAt(tile.x, tile.y - 1)) {
          tile.collideUp = false;
        }

        if (this.tilemap.getTileAt(tile.x + 1, tile.y)) {
          tile.collideRight = false;
        }

        if (this.tilemap.getTileAt(tile.x - 1, tile.y)) {
          tile.collideLeft = false;
        }
      }
    });
  }

  private createHitpoints(): void {
    this.hitpointsText = this.add.text(16, 16, `LIFE: ${this.player.hitpoints}`, { fontSize: '32px', color: 'black', stroke: 'black', strokeThickness: 2 });
    this.hitpointsText.setScrollFactor(0);
  }

  private createGameOverText(): void {
    const screenCenterX = this.cameras.main.worldView.x + this.cameras.main.width / 2;
    const screenCenterY = this.cameras.main.worldView.y + this.cameras.main.height / 2;

    this.gameOverText = this.add.text(screenCenterX, screenCenterY, 'WASTED', { fontSize: '64px', color: 'red', stroke: 'red', strokeThickness: 2 }).setOrigin(0.5);
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
        height: 640,
        width: 800,
      },
      physics: {
        default: 'arcade',
        arcade: {
          gravity: { y: 600 },
          debug: false,
          tileBias: 32,
        }
      }
    });
  }
}
